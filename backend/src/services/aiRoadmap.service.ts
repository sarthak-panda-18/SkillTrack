import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env';
import { ISkillGapAnalysis } from '../models/skillGapAnalysis.model';
import { IRoadmapStage, IRoadmapTopic } from '../models/learningRoadmap.model';

const aiTopicSchema = z.object({
  topicId: z.string(),
  skillId: z.string().optional(),
  skillName: z.string().min(2),
  title: z.string().min(3),
  description: z.string(),
  order: z.number(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.number().min(1).max(30),
  prerequisites: z.array(z.string()),
  importance: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  reason: z.string(),
});

const aiStageSchema = z.object({
  stageId: z.string(),
  title: z.string().min(3),
  description: z.string(),
  order: z.number(),
  estimatedHours: z.number().min(1).max(100),
  topics: z.array(aiTopicSchema).min(1),
});

const aiRoadmapSchema = z.object({
  title: z.string().min(5),
  description: z.string(),
  aiSummary: z.string(),
  stages: z.array(aiStageSchema).min(3),
});

export class AiRoadmapService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateRoadmapStructure(
    gapAnalysis: ISkillGapAnalysis
  ): Promise<{ title: string; description: string; aiSummary: string; stages: IRoadmapStage[] }> {
    const roleName = gapAnalysis.careerRoleName || 'Engineering Role';
    const topPriorities = gapAnalysis.topPriorities || [];
    const criticalGaps = gapAnalysis.criticalGaps || [];
    const needsImprovement = gapAnalysis.needsImprovement || [];
    const strongSkills = gapAnalysis.strongSkills || [];

    if (!this.genAI) {
      console.warn('[AiRoadmapService] Gemini API key not configured. Using rule-based fallback roadmap.');
      return this.generateFallbackRoadmap(roleName, criticalGaps, needsImprovement, strongSkills, topPriorities);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const promptData = {
        targetRole: roleName,
        overallReadiness: gapAnalysis.overallReadiness,
        criticalGaps: criticalGaps.map((s) => ({
          skillId: s.skillId.toString(),
          name: s.name,
          current: s.currentProficiency,
          target: s.recommendedProficiency,
          importance: s.importance,
        })),
        needsImprovement: needsImprovement.map((s) => ({
          skillId: s.skillId.toString(),
          name: s.name,
          current: s.currentProficiency,
          target: s.recommendedProficiency,
          importance: s.importance,
        })),
        strongSkills: strongSkills.map((s) => s.name),
        topPriorities: topPriorities.map((s) => ({
          skillId: s.skillId.toString(),
          name: s.name,
          gap: s.gap,
        })),
      };

      const prompt = `You are a principal engineering lead and curriculum architect.
Create a personalized 4-stage learning roadmap for a student aiming for the target role "${roleName}".

Student Analysis Input:
${JSON.stringify(promptData, null, 2)}

RULES FOR PERSONALIZATION:
1. Stage 1 must focus on Prerequisite Foundations or Critical Skill Gaps with largest gaps.
2. DO NOT waste time re-teaching basic concepts for strong skills (${strongSkills.map((s) => s.name).join(', ') || 'None'}).
3. Provide 4 distinct stages. Each stage must contain 3 to 6 actionable topics.
4. Each topic MUST reference a valid 'skillId' from the input where applicable.
5. 'prerequisites': Array of topic titles or topicIds that MUST be completed before this topic.
6. 'reason': Data-driven explanation referencing their current proficiency vs target.
7. Return raw JSON without markdown code blocks or backticks in this structure:
{
  "title": "Personalized ${roleName} Mastery Pathway",
  "description": "Customized learning sequence targeting your specific skill gaps.",
  "aiSummary": "Your roadmap prioritizes ${topPriorities[0]?.name || 'core fundamentals'} because it represents your highest impact gap.",
  "stages": [
    {
      "stageId": "stage_1",
      "title": "Stage 1: Foundational Gaps & Core Principles",
      "description": "Focus on immediate critical skill gaps.",
      "order": 1,
      "estimatedHours": 15,
      "topics": [
        {
          "topicId": "topic_1_1",
          "skillId": "${topPriorities[0]?.skillId?.toString() || ''}",
          "skillName": "${topPriorities[0]?.name || 'Core Fundamentals'}",
          "title": "Specific Topic Title",
          "description": "Detailed explanation of what to practice.",
          "order": 1,
          "difficulty": "BEGINNER",
          "estimatedHours": 3,
          "prerequisites": [],
          "importance": "CRITICAL",
          "reason": "Current score is ${topPriorities[0]?.currentProficiency || 35}% vs target ${topPriorities[0]?.recommendedProficiency || 80}%."
        }
      ]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      const validated = aiRoadmapSchema.parse(parsed);

      const processedStages = this.evaluateInitialStatuses(validated.stages as any);

      return {
        title: validated.title,
        description: validated.description,
        aiSummary: validated.aiSummary,
        stages: processedStages,
      };
    } catch (error) {
      console.warn('[AiRoadmapService] Gemini roadmap generation failed. Using rule-based fallback.', error);
      return this.generateFallbackRoadmap(roleName, criticalGaps, needsImprovement, strongSkills, topPriorities);
    }
  }

  // Evaluates initial status (AVAILABLE vs LOCKED) based on prerequisites
  evaluateInitialStatuses(stages: IRoadmapStage[]): IRoadmapStage[] {
    const completedTopicTitles = new Set<string>();

    return stages.map((stage, stageIdx) => {
      let stageCompletedCount = 0;

      const topics = stage.topics.map((topic, topicIdx) => {
        const isPrereqsMet =
          !topic.prerequisites ||
          topic.prerequisites.length === 0 ||
          topic.prerequisites.every(
            (p) =>
              completedTopicTitles.has(p.toLowerCase()) ||
              completedTopicTitles.has(p) ||
              stageIdx === 0
          );

        let status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = topic.status || 'LOCKED';
        if (topic.progress === 100) {
          status = 'COMPLETED';
          completedTopicTitles.add(topic.title.toLowerCase());
          completedTopicTitles.add(topic.topicId);
          stageCompletedCount++;
        } else if (topic.progress > 0) {
          status = 'IN_PROGRESS';
        } else if (isPrereqsMet || (stageIdx === 0 && topicIdx === 0)) {
          status = 'AVAILABLE';
        } else {
          status = 'LOCKED';
        }

        return {
          ...topic,
          status,
        };
      });

      const stageProgress = Math.round((stageCompletedCount / (topics.length || 1)) * 100);
      let stageStatus: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = 'LOCKED';
      if (stageProgress === 100) stageStatus = 'COMPLETED';
      else if (stageProgress > 0) stageStatus = 'IN_PROGRESS';
      else if (stageIdx === 0 || topics.some((t) => t.status === 'AVAILABLE' || t.status === 'IN_PROGRESS')) {
        stageStatus = 'AVAILABLE';
      }

      return {
        ...stage,
        progress: stageProgress,
        status: stageStatus,
        topics,
      };
    });
  }

  private generateFallbackRoadmap(
    roleName: string,
    criticalGaps: any[],
    needsImprovement: any[],
    strongSkills: any[],
    topPriorities: any[]
  ): { title: string; description: string; aiSummary: string; stages: IRoadmapStage[] } {
    const primaryGap = topPriorities[0] || criticalGaps[0] || { name: 'Core Foundations', currentProficiency: 40, recommendedProficiency: 80 };
    const secondaryGap = topPriorities[1] || needsImprovement[0] || { name: 'Applied Architecture', currentProficiency: 55, recommendedProficiency: 75 };

    const stages: IRoadmapStage[] = [
      {
        stageId: 'stage_1',
        title: 'Stage 1: Core Critical Gaps',
        description: `Bridge primary gaps in ${primaryGap.name}.`,
        order: 1,
        status: 'AVAILABLE',
        progress: 0,
        estimatedHours: 12,
        topics: [
          {
            topicId: 'topic_1_1',
            skillId: primaryGap.skillId,
            skillName: primaryGap.name,
            title: `${primaryGap.name} — Fundamental Principles`,
            description: `Master core concepts and syntax required for ${roleName}.`,
            order: 1,
            difficulty: 'BEGINNER',
            estimatedHours: 4,
            status: 'AVAILABLE',
            progress: 0,
            prerequisites: [],
            importance: 'CRITICAL',
            reason: `Current proficiency is ${primaryGap.currentProficiency || 35}% vs target ${primaryGap.recommendedProficiency || 80}%.`,
          },
          {
            topicId: 'topic_1_2',
            skillId: primaryGap.skillId,
            skillName: primaryGap.name,
            title: `${primaryGap.name} — Problem Solving & Patterns`,
            description: `Practice standard algorithms and engineering patterns.`,
            order: 2,
            difficulty: 'INTERMEDIATE',
            estimatedHours: 5,
            status: 'LOCKED',
            progress: 0,
            prerequisites: [`${primaryGap.name} — Fundamental Principles`],
            importance: 'CRITICAL',
            reason: `Build execution speed and conceptual accuracy.`,
          },
        ],
      },
      {
        stageId: 'stage_2',
        title: 'Stage 2: Secondary Skill Refinement',
        description: `Elevate ${secondaryGap.name} to target proficiency.`,
        order: 2,
        status: 'LOCKED',
        progress: 0,
        estimatedHours: 15,
        topics: [
          {
            topicId: 'topic_2_1',
            skillId: secondaryGap.skillId,
            skillName: secondaryGap.name,
            title: `${secondaryGap.name} — Architecture & Best Practices`,
            description: `Design principles and modular code organization.`,
            order: 1,
            difficulty: 'INTERMEDIATE',
            estimatedHours: 6,
            status: 'LOCKED',
            progress: 0,
            prerequisites: [`${primaryGap.name} — Problem Solving & Patterns`],
            importance: 'HIGH',
            reason: `Target proficiency is ${secondaryGap.recommendedProficiency || 80}%.`,
          },
        ],
      },
      {
        stageId: 'stage_3',
        title: 'Stage 3: Role Readiness & Applied Projects',
        description: `Integrate skills into industry-grade engineering scenarios.`,
        order: 3,
        status: 'LOCKED',
        progress: 0,
        estimatedHours: 20,
        topics: [
          {
            topicId: 'topic_3_1',
            skillName: 'System Architecture',
            title: `End-to-End ${roleName} Placement Capstone`,
            description: `Build a complete production-grade application for your portfolio.`,
            order: 1,
            difficulty: 'ADVANCED',
            estimatedHours: 10,
            status: 'LOCKED',
            progress: 0,
            prerequisites: [`${secondaryGap.name} — Architecture & Best Practices`],
            importance: 'HIGH',
            reason: `Demonstrate complete engineering readiness for target role.`,
          },
        ],
      },
    ];

    return {
      title: `Personalized ${roleName} Learning Roadmap`,
      description: `Structured learning sequence designed around your verified skill gaps.`,
      aiSummary: `Your roadmap prioritizes ${primaryGap.name} because it is your largest impact gap for ${roleName}.`,
      stages,
    };
  }
}

export const aiRoadmapService = new AiRoadmapService();
