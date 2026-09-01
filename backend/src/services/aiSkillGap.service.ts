import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { CareerRole } from '../models/careerRole.model';
import { CareerRoleSkill } from '../models/careerRoleSkill.model';
import { UserSkill } from '../models/userSkill.model';
import { AssessmentAttempt } from '../models/assessmentAttempt.model';
import { SkillGapAnalysis, ISkillGapAnalysis, IEvaluatedSkill } from '../models/skillGapAnalysis.model';
import { ApiError } from '../utils/apiError';

const aiGapSchema = z.object({
  summary: z.string().min(10),
  priorityInsights: z.array(z.string()).min(1),
  recommendations: z.array(
    z.object({
      skillId: z.string(),
      reason: z.string(),
      priority: z.string(),
    })
  ),
});

export class AiSkillGapService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async calculateAndSaveSkillGap(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    let careerRole: any = null;
    if (user.targetCareerRoleId) {
      careerRole = await CareerRole.findById(user.targetCareerRoleId);
    }

    if (!careerRole && user.targetRole) {
      careerRole = await CareerRole.findOne({ name: new RegExp(`^${user.targetRole.trim()}$`, 'i') });
      if (!careerRole) {
        careerRole = await CareerRole.findOne({ name: new RegExp(user.targetRole.trim(), 'i') });
      }
      if (careerRole) {
        user.targetCareerRoleId = careerRole._id;
        await user.save();
      }
    }

    if (!careerRole) {
      careerRole = await CareerRole.findOne({ isActive: true });
      if (careerRole) {
        user.targetCareerRoleId = careerRole._id;
        user.targetRole = careerRole.name;
        await user.save();
      }
    }

    if (!careerRole || !careerRole.isActive) {
      throw new ApiError(400, 'Selected target career role is currently unavailable or inactive.');
    }

    // Fetch required skills for target career role
    const roleRequirements = await CareerRoleSkill.find({ careerRoleId: careerRole._id }).populate(
      'skillId',
      'name category description'
    );

    if (roleRequirements.length === 0) {
      throw new ApiError(404, 'Skill requirements are not configured for this career role yet.');
    }

    // Fetch user self-reported profile skills
    const userSkills = await UserSkill.find({ userId });
    const userSkillMap = new Map<string, number>();
    userSkills.forEach((us) => userSkillMap.set(us.skillId.toString(), us.proficiency));

    // Fetch user completed assessment attempts sorted by latest
    const completedAttempts = await AssessmentAttempt.find({ userId, status: 'COMPLETED' })
      .sort({ createdAt: -1 });

    const latestAttemptMap = new Map<string, any>();
    const bestAttemptMap = new Map<string, any>();
    const previousAttemptMap = new Map<string, any>();

    completedAttempts.forEach((att) => {
      const sId = att.skillId.toString();
      if (!latestAttemptMap.has(sId)) {
        latestAttemptMap.set(sId, att);
      } else if (!previousAttemptMap.has(sId)) {
        previousAttemptMap.set(sId, att);
      }

      const existingBest = bestAttemptMap.get(sId);
      if (!existingBest || att.percentage > existingBest.percentage) {
        bestAttemptMap.set(sId, att);
      }
    });

    const evaluatedSkills: IEvaluatedSkill[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    const weightMap: { [key: string]: number } = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    for (const req of roleRequirements) {
      const skillDoc = req.skillId as any;
      if (!skillDoc) continue;

      const sId = skillDoc._id.toString();
      const latestAttempt = latestAttemptMap.get(sId);
      const bestAttempt = bestAttemptMap.get(sId);
      const previousAttempt = previousAttemptMap.get(sId);

      let currentProficiency = 0;
      let source: 'ASSESSED' | 'SELF_REPORTED' | 'UNASSESSED' = 'UNASSESSED';
      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

      if (latestAttempt) {
        currentProficiency = latestAttempt.percentage;
        source = 'ASSESSED';
        confidence = 'HIGH';
      } else if (userSkillMap.has(sId)) {
        currentProficiency = userSkillMap.get(sId)!;
        source = 'SELF_REPORTED';
        confidence = 'MEDIUM';
      }

      const recommendedProficiency = req.recommendedProficiency || 80;
      const minimumProficiency = req.minimumProficiency || 50;
      const gap = Math.max(0, recommendedProficiency - currentProficiency);

      let status: 'STRONG' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_GAP' | 'UNASSESSED' = 'UNASSESSED';
      if (source === 'UNASSESSED') {
        status = 'UNASSESSED';
      } else if (currentProficiency >= recommendedProficiency) {
        status = 'STRONG';
      } else if (currentProficiency >= minimumProficiency) {
        status = 'NEEDS_IMPROVEMENT';
      } else {
        status = 'CRITICAL_GAP';
      }

      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      if (req.importance === 'CRITICAL' && (gap > 20 || status === 'UNASSESSED')) {
        priority = 'CRITICAL';
      } else if (gap >= 35 || (req.importance === 'HIGH' && gap > 15)) {
        priority = 'HIGH';
      } else if (gap > 0) {
        priority = 'MEDIUM';
      } else {
        priority = 'LOW';
      }

      let trendImprovement = 0;
      if (latestAttempt && previousAttempt) {
        trendImprovement = latestAttempt.percentage - previousAttempt.percentage;
      }

      const topicPerformance = latestAttempt?.topicPerformance
        ? latestAttempt.topicPerformance.map((tp: any) => ({
            topic: tp.topic,
            percentage: tp.percentage,
          }))
        : [];

      evaluatedSkills.push({
        skillId: skillDoc._id,
        name: skillDoc.name,
        category: skillDoc.category || 'General',
        importance: req.importance || 'HIGH',
        minimumProficiency,
        recommendedProficiency,
        currentProficiency,
        gap,
        status,
        priority,
        source,
        confidence,
        latestAssessmentId: latestAttempt?._id,
        latestAssessmentScore: latestAttempt?.percentage,
        bestAssessmentScore: bestAttempt?.percentage,
        topicPerformance,
        trendImprovement,
      });

      const weight = weightMap[req.importance] || 2;
      const achievementRatio = Math.min(currentProficiency / (recommendedProficiency || 1), 1);
      totalWeightedScore += achievementRatio * weight;
      totalWeight += weight;
    }

    const overallReadiness = Math.round((totalWeightedScore / (totalWeight || 1)) * 100);

    let readinessLabel: 'READY' | 'NEARLY_READY' | 'DEVELOPING' | 'EARLY_STAGE' = 'EARLY_STAGE';
    if (overallReadiness >= 80) readinessLabel = 'READY';
    else if (overallReadiness >= 65) readinessLabel = 'NEARLY_READY';
    else if (overallReadiness >= 40) readinessLabel = 'DEVELOPING';

    const criticalGaps = evaluatedSkills.filter(
      (s) => s.status === 'CRITICAL_GAP' || (s.status === 'UNASSESSED' && s.importance === 'CRITICAL')
    );
    const needsImprovement = evaluatedSkills.filter((s) => s.status === 'NEEDS_IMPROVEMENT');
    const strongSkills = evaluatedSkills.filter((s) => s.status === 'STRONG');
    const unassessedSkills = evaluatedSkills.filter((s) => s.status === 'UNASSESSED');

    // Rank top priorities by importance & gap size
    const topPriorities = [...evaluatedSkills]
      .filter((s) => s.gap > 0 || s.status === 'UNASSESSED')
      .sort((a, b) => {
        const pOrder: { [key: string]: number } = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (pOrder[b.priority] !== pOrder[a.priority]) {
          return pOrder[b.priority] - pOrder[a.priority];
        }
        return b.gap - a.gap;
      })
      .slice(0, 5);

    // Call Gemini AI for natural-language reasoning & insights
    const aiResults = await this.generateAiInsights(careerRole.name, overallReadiness, readinessLabel, evaluatedSkills, topPriorities);

    // Upsert analysis document in MongoDB
    const analysis = await SkillGapAnalysis.findOneAndUpdate(
      { userId, careerRoleId: careerRole._id },
      {
        $set: {
          userId,
          careerRoleId: careerRole._id,
          careerRoleName: careerRole.name,
          overallReadiness,
          readinessLabel,
          analyzedAt: new Date(),
          analysisVersion: '3.3.0',
          skills: evaluatedSkills,
          criticalGaps,
          needsImprovement,
          strongSkills,
          unassessedSkills,
          topPriorities,
          aiSummary: aiResults.summary,
          aiInsights: aiResults.priorityInsights,
          aiRecommendations: aiResults.recommendations,
        },
      },
      { upsert: true, new: true }
    );

    return analysis;
  }

  private async generateAiInsights(
    careerRoleName: string,
    overallReadiness: number,
    readinessLabel: string,
    skills: IEvaluatedSkill[],
    topPriorities: IEvaluatedSkill[]
  ): Promise<{ summary: string; priorityInsights: string[]; recommendations: Array<{ skillId: string; reason: string; priority: string }> }> {
    const fallbackSummary = `Skill Gap Analysis completed for target role "${careerRoleName}". Overall readiness is ${overallReadiness}% (${readinessLabel.replace('_', ' ')}). Focus on closing priority gaps in ${topPriorities.slice(0, 3).map((s) => s.name).join(', ') || 'required skills'}.`;
    
    const fallbackInsights = [
      `Prioritize ${topPriorities[0]?.name || 'core technical skills'} to raise your readiness score above target thresholds.`,
      `Complete formal skill assessments for unassessed requirements to validate your proficiency level.`,
      `Consistently review topic performance metrics to address sub-topic weaknesses.`,
    ];

    const fallbackRecommendations = topPriorities.map((s) => ({
      skillId: s.skillId.toString(),
      reason: `Current proficiency is ${s.currentProficiency}% against a recommended target of ${s.recommendedProficiency}%.`,
      priority: s.priority,
    }));

    if (!this.genAI) {
      return { summary: fallbackSummary, priorityInsights: fallbackInsights, recommendations: fallbackRecommendations };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const promptData = {
        careerRole: careerRoleName,
        overallReadiness,
        readinessLabel,
        topPriorities: topPriorities.map((s) => ({
          skillId: s.skillId.toString(),
          name: s.name,
          importance: s.importance,
          current: s.currentProficiency,
          target: s.recommendedProficiency,
          gap: s.gap,
          status: s.status,
          source: s.source,
        })),
        strongSkillsCount: skills.filter((s) => s.status === 'STRONG').length,
        unassessedCount: skills.filter((s) => s.status === 'UNASSESSED').length,
      };

      const prompt = `You are a senior tech career advisor analyzing a student's technical skill gap report.
Analyze this structured student readiness data:
${JSON.stringify(promptData, null, 2)}

Provide clear, encouraging, action-oriented insights in strict JSON format:
1. 'summary': A concise 2-sentence executive summary of their readiness for the target role.
2. 'priorityInsights': An array of 3 bullet points highlighting key observations and focus areas.
3. 'recommendations': An array of objects with 'skillId', 'reason' (why they must focus on it), and 'priority' ('CRITICAL'|'HIGH'|'MEDIUM').

CRITICAL RULE: Return ONLY valid raw JSON without markdown code fences or backticks.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      const validated = aiGapSchema.parse(parsed);

      return {
        summary: validated.summary,
        priorityInsights: validated.priorityInsights,
        recommendations: validated.recommendations,
      };
    } catch (error) {
      console.warn('[AiSkillGapService] Gemini API call failed or timed out. Using fallback insights.', error);
      return { summary: fallbackSummary, priorityInsights: fallbackInsights, recommendations: fallbackRecommendations };
    }
  }
}

export const aiSkillGapService = new AiSkillGapService();
