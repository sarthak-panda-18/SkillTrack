import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../config/env';
import { ILearningRoadmap } from '../models/learningRoadmap.model';
import { ISkillGapAnalysis } from '../models/skillGapAnalysis.model';
import { IStudyPlanDay, IStudyTask } from '../models/studyPlan.model';

const aiTaskSchema = z.object({
  taskId: z.string(),
  roadmapTopicId: z.string().optional(),
  skillName: z.string(),
  type: z.enum(['LEARN', 'PRACTICE', 'REVISE', 'ASSESS', 'PROJECT', 'REVIEW']),
  title: z.string().min(3),
  description: z.string(),
  durationMinutes: z.number().min(5).max(240),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  reason: z.string(),
  order: z.number(),
});

const aiDaySchema = z.object({
  dayId: z.string(),
  date: z.string(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  isRestDay: z.boolean(),
  totalPlannedMinutes: z.number(),
  tasks: z.array(aiTaskSchema),
});

const aiStudyPlanSchema = z.object({
  title: z.string().min(5),
  summary: z.string(),
  aiSummary: z.string(),
  days: z.array(aiDaySchema).min(7),
});

export interface StudyPlanPreferences {
  dailyStudyMinutes: number; // 30, 60, 90, 120, 180, 240
  studyDays: string[]; // ['MONDAY', 'TUESDAY', ...]
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  studyIntensity: 'LIGHT' | 'BALANCED' | 'INTENSIVE';
  planDurationWeeks: number; // 1, 2, 4
}

export class AiStudyPlanService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateStudyPlanStructure(
    roadmap: ILearningRoadmap,
    gapAnalysis: ISkillGapAnalysis,
    prefs: StudyPlanPreferences
  ): Promise<{ title: string; summary: string; aiSummary: string; days: IStudyPlanDay[] }> {
    const roleName = roadmap.careerRoleName || 'Engineering Role';
    const activeDays = prefs.studyDays.map((d) => d.toUpperCase());
    const dailyCap = prefs.dailyStudyMinutes || 120;

    // Collect available/in-progress roadmap topics
    const candidateTopics: any[] = [];
    roadmap.stages.forEach((stage) => {
      stage.topics.forEach((topic) => {
        if (topic.status !== 'COMPLETED') {
          candidateTopics.push({
            topicId: topic.topicId,
            skillId: topic.skillId?.toString() || '',
            skillName: topic.skillName,
            title: topic.title,
            description: topic.description,
            difficulty: topic.difficulty,
            estimatedHours: topic.estimatedHours,
            status: topic.status,
            progress: topic.progress,
            importance: topic.importance,
            reason: topic.reason,
            hasResource: !!(topic.learningResource && topic.learningResource.url),
          });
        }
      });
    });

    if (!this.genAI) {
      console.warn('[AiStudyPlanService] Gemini API key not configured. Using rule-based fallback study plan.');
      return this.generateFallbackStudyPlan(roleName, candidateTopics, prefs);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Generate 7 dates starting from today
      const startDate = new Date();
      const dayNames: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ];

      const datesInfo = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayOfWeek = dayNames[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];
        const isRestDay = !activeDays.includes(dayOfWeek);
        return { dateStr, dayOfWeek, isRestDay };
      });

      const promptData = {
        targetRole: roleName,
        dailyCapMinutes: dailyCap,
        preferredStudyTime: prefs.preferredStudyTime,
        intensity: prefs.studyIntensity,
        datesInfo,
        candidateTopics: candidateTopics.slice(0, 12),
        topSkillGaps: (gapAnalysis.topPriorities || []).map((p) => p.name),
      };

      const prompt = `You are a master engineering mentor and study schedule optimizer.
Create a 7-day personalized study schedule for a student aiming to become a ${roleName}.

Student Preferences & Requirements Input:
${JSON.stringify(promptData, null, 2)}

STRICT RULES:
1. 'isRestDay' = true for dates where isRestDay is true in datesInfo. Rest days must have 0 planned minutes and NO 'LEARN' tasks.
2. For study days, total planned minutes MUST NOT EXCEED ${dailyCap} minutes per day.
3. Balance task types: LEARN (35-50%), PRACTICE (30-40%), REVISE (15-25%), ASSESS/REVIEW (10%).
4. 'roadmapTopicId': MUST use exact 'topicId' strings from candidateTopics input for LEARN/PRACTICE tasks.
5. Prioritize CRITICAL/IN_PROGRESS topics first.
6. Return raw JSON without markdown formatting:
{
  "title": "Personalized 7-Day ${roleName} Study Plan",
  "summary": "Weekly schedule designed around your ${dailyCap} min/day capacity.",
  "aiSummary": "Your plan prioritizes ${candidateTopics[0]?.skillName || 'core fundamentals'} learning and practice during your active study days.",
  "days": [
    {
      "dayId": "day_1",
      "date": "${datesInfo[0].dateStr}",
      "dayOfWeek": "${datesInfo[0].dayOfWeek}",
      "isRestDay": ${datesInfo[0].isRestDay},
      "totalPlannedMinutes": ${datesInfo[0].isRestDay ? 0 : Math.min(120, dailyCap)},
      "tasks": [
        {
          "taskId": "task_1_1",
          "roadmapTopicId": "${candidateTopics[0]?.topicId || ''}",
          "skillName": "${candidateTopics[0]?.skillName || 'Core Fundamentals'}",
          "type": "LEARN",
          "title": "${candidateTopics[0]?.title || 'Core Foundations'}",
          "description": "Watch video tutorial and practice core principles.",
          "durationMinutes": ${Math.min(60, dailyCap)},
          "priority": "HIGH",
          "reason": "Top gap item for your target role.",
          "order": 1
        }
      ]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      const validated = aiStudyPlanSchema.parse(parsed);

      const processedDays: IStudyPlanDay[] = validated.days.map((day, idx) => {
        const isRest = day.isRestDay;
        let dayMinutes = 0;
        const tasks: IStudyTask[] = isRest
          ? []
          : day.tasks.map((t, tIdx) => {
              const dur = Math.min(t.durationMinutes || 45, dailyCap);
              dayMinutes += dur;
              return {
                taskId: t.taskId || `task_${idx + 1}_${tIdx + 1}`,
                roadmapTopicId: t.roadmapTopicId,
                skillName: t.skillName || 'Engineering Skill',
                type: t.type as any,
                title: t.title,
                description: t.description || '',
                durationMinutes: dur,
                priority: t.priority as any,
                reason: t.reason || '',
                status: 'NOT_STARTED',
                order: tIdx + 1,
              };
            });

        return {
          dayId: day.dayId || `day_${idx + 1}`,
          date: day.date,
          dayOfWeek: day.dayOfWeek as any,
          isRestDay: isRest,
          totalPlannedMinutes: isRest ? 0 : Math.min(dayMinutes, dailyCap),
          completedMinutes: 0,
          status: isRest ? 'REST' : idx === 0 ? 'TODAY' : 'UPCOMING',
          tasks,
        };
      });

      return {
        title: validated.title,
        summary: validated.summary,
        aiSummary: validated.aiSummary,
        days: processedDays,
      };
    } catch (error) {
      console.warn('[AiStudyPlanService] Gemini study plan generation failed. Using rule-based fallback.', error);
      return this.generateFallbackStudyPlan(roleName, candidateTopics, prefs);
    }
  }

  private generateFallbackStudyPlan(
    roleName: string,
    candidateTopics: any[],
    prefs: StudyPlanPreferences
  ): { title: string; summary: string; aiSummary: string; days: IStudyPlanDay[] } {
    const activeDays = prefs.studyDays.map((d) => d.toUpperCase());
    const dailyCap = prefs.dailyStudyMinutes || 120;
    const startDate = new Date();
    const dayNames: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    let topicIdx = 0;
    const days: IStudyPlanDay[] = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + idx);
      const dayOfWeek = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const isRestDay = !activeDays.includes(dayOfWeek);

      if (isRestDay) {
        return {
          dayId: `day_${idx + 1}`,
          date: dateStr,
          dayOfWeek,
          isRestDay: true,
          totalPlannedMinutes: 0,
          completedMinutes: 0,
          status: 'REST',
          tasks: [],
        };
      }

      // Distribute candidate topics across active study days
      const currentTopic = candidateTopics[topicIdx % (candidateTopics.length || 1)] || {
        topicId: `fallback_topic_${idx}`,
        skillName: 'Core Principles',
        title: 'Core Fundamentals & Practice',
      };
      topicIdx++;

      const learnDuration = Math.min(60, dailyCap);
      const practiceDuration = Math.max(0, dailyCap - learnDuration);

      const tasks: IStudyTask[] = [
        {
          taskId: `task_${idx + 1}_1`,
          roadmapTopicId: currentTopic.topicId,
          skillName: currentTopic.skillName,
          type: 'LEARN',
          title: `Learn — ${currentTopic.title}`,
          description: `Watch recommended tutorial and understand core principles.`,
          durationMinutes: learnDuration,
          priority: 'CRITICAL',
          reason: `High impact topic for your ${roleName} target.`,
          status: 'NOT_STARTED',
          order: 1,
        },
      ];

      if (practiceDuration > 15) {
        tasks.push({
          taskId: `task_${idx + 1}_2`,
          roadmapTopicId: currentTopic.topicId,
          skillName: currentTopic.skillName,
          type: 'PRACTICE',
          title: `Practice — ${currentTopic.title}`,
          description: `Solve 2-3 code exercises to reinforce concept mastery.`,
          durationMinutes: practiceDuration,
          priority: 'HIGH',
          reason: `Consolidate conceptual understanding into practical problem solving.`,
          status: 'NOT_STARTED',
          order: 2,
        });
      }

      return {
        dayId: `day_${idx + 1}`,
        date: dateStr,
        dayOfWeek,
        isRestDay: false,
        totalPlannedMinutes: learnDuration + (practiceDuration > 15 ? practiceDuration : 0),
        completedMinutes: 0,
        status: idx === 0 ? 'TODAY' : 'UPCOMING',
        tasks,
      };
    });

    const primarySkill = candidateTopics[0]?.skillName || 'Core Fundamentals';

    return {
      title: `Personalized ${roleName} Study Plan`,
      summary: `Structured 7-day schedule calibrated to ${dailyCap} mins/day.`,
      aiSummary: `Your schedule prioritizes ${primarySkill} learning and practice during your active study days.`,
      days,
    };
  }
}

export const aiStudyPlanService = new AiStudyPlanService();
