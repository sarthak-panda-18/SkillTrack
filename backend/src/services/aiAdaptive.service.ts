import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../config/env';
import { ISkillTrendItem } from '../models/adaptiveLearning.model';

const aiRecommendationSchema = z.object({
  type: z.enum([
    'FOCUS_MORE',
    'FOCUS_LESS',
    'REVISE',
    'PRACTICE_MORE',
    'REASSESS',
    'CONTINUE',
    'ADVANCE',
    'RESCHEDULE',
    'REDUCE_WORKLOAD',
    'GENERATE_NEW_PLAN',
  ]),
  skillName: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  title: z.string().min(5),
  reason: z.string().min(10),
  actionLabel: z.string(),
  actionRoute: z.string(),
});

const aiAdaptiveResponseSchema = z.object({
  aiSummary: z.string().min(10),
  recommendations: z.array(aiRecommendationSchema).min(1),
});

export interface AdaptiveAnalysisInput {
  careerRoleName: string;
  trends: ISkillTrendItem[];
  overallRoadmapProgress: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  studyConsistencyPercentage: number;
  completedStudyMins: number;
  totalPlannedStudyMins: number;
}

export class AiAdaptiveService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateAdaptiveInsights(
    input: AdaptiveAnalysisInput
  ): Promise<{ aiSummary: string; recommendations: any[] }> {
    if (!this.genAI) {
      console.warn('[AiAdaptiveService] Gemini API key not configured. Using rule-based adaptive analysis.');
      return this.generateFallbackAdaptiveInsights(input);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a senior AI engineering mentor optimizing learning pathways for a student targeting ${input.careerRoleName}.

Student Learning Signals Input:
- Target Role: ${input.careerRoleName}
- Overall Roadmap Progress: ${input.overallRoadmapProgress}% (${input.completedTopicsCount}/${input.totalTopicsCount} topics)
- Study Plan Execution Consistency: ${input.studyConsistencyPercentage}% (${input.completedStudyMins}/${input.totalPlannedStudyMins} mins)
- Skill Trends:
${JSON.stringify(input.trends, null, 2)}

STRICT RULES:
1. Provide a concise, supportive executive summary of the student's learning trajectory.
2. Recommend 2 to 4 high-value adaptive actions matching these types:
   - FOCUS_MORE: Critical skill gap with weak performance
   - FOCUS_LESS: Strong skill with stable high scores (proficient >= target)
   - REVISE: Completed topic with recent assessment drop
   - PRACTICE_MORE: Good concept knowledge but needs problem-solving practice
   - REASSESS: Topic practice completed, ready to re-verify score
   - CONTINUE: Normal steady progress
   - REDUCE_WORKLOAD: If study consistency < 50%
3. Action routes MUST be valid frontend routes: '/learning', '/skill-gap', '/assessment', '/study-plan', or '/profile'.
4. Return raw JSON without markdown formatting:
{
  "aiSummary": "Your progress towards ${input.careerRoleName} shows steady improvement in core areas.",
  "recommendations": [
    {
      "type": "FOCUS_MORE",
      "skillName": "${input.trends[0]?.skillName || 'Core Fundamentals'}",
      "priority": "HIGH",
      "title": "Focus More on ${input.trends[0]?.skillName || 'Core Fundamentals'}",
      "reason": "This is currently your largest remaining career skill gap.",
      "actionLabel": "Open Learning Roadmap",
      "actionRoute": "/learning"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      const validated = aiAdaptiveResponseSchema.parse(parsed);

      return {
        aiSummary: validated.aiSummary,
        recommendations: validated.recommendations,
      };
    } catch (error) {
      console.warn('[AiAdaptiveService] Gemini adaptive analysis failed. Using rule-based fallback.', error);
      return this.generateFallbackAdaptiveInsights(input);
    }
  }

  private generateFallbackAdaptiveInsights(
    input: AdaptiveAnalysisInput
  ): { aiSummary: string; recommendations: any[] } {
    const recommendations: any[] = [];
    const improvingSkills = input.trends.filter((t) => t.trend === 'IMPROVING');
    const decliningSkills = input.trends.filter((t) => t.trend === 'DECLINING');
    const largestGapSkill = [...input.trends].sort((a, b) => b.gap - a.gap)[0];
    const strongSkill = input.trends.find((t) => t.currentProficiency >= t.targetProficiency);

    let summary = `You are tracking towards ${input.careerRoleName} with ${input.overallRoadmapProgress}% roadmap completion.`;

    if (improvingSkills.length > 0) {
      summary += ` Great job improving in ${improvingSkills.map((s) => s.skillName).join(', ')}.`;
    }

    // 1. Focus More on Largest Gap
    if (largestGapSkill && largestGapSkill.gap > 15) {
      recommendations.push({
        type: 'FOCUS_MORE',
        skillName: largestGapSkill.skillName,
        priority: 'CRITICAL',
        title: `Prioritize ${largestGapSkill.skillName}`,
        reason: `Your current proficiency (${largestGapSkill.currentProficiency}%) is below target (${largestGapSkill.targetProficiency}%).`,
        actionLabel: 'Go to Learning Roadmap',
        actionRoute: '/learning',
      });
    }

    // 2. Revise Declining Skill
    if (decliningSkills.length > 0) {
      const decl = decliningSkills[0];
      recommendations.push({
        type: 'REVISE',
        skillName: decl.skillName,
        priority: 'HIGH',
        title: `Revise ${decl.skillName} Fundamentals`,
        reason: `Your latest assessment score dropped by ${Math.abs(decl.changePoints)} points. A quick revision will restore mastery.`,
        actionLabel: 'Review Weak Topics',
        actionRoute: '/learning',
      });
    }

    // 3. Focus Less on Strong Skill
    if (strongSkill) {
      recommendations.push({
        type: 'FOCUS_LESS',
        skillName: strongSkill.skillName,
        priority: 'LOW',
        title: `Maintain ${strongSkill.skillName} Mastery`,
        reason: `You have reached target proficiency (${strongSkill.currentProficiency}%). Allocate more time to remaining gaps.`,
        actionLabel: 'View Skill Gaps',
        actionRoute: '/skill-gap',
      });
    }

    // 4. Reduce Workload if study consistency is low
    if (input.studyConsistencyPercentage > 0 && input.studyConsistencyPercentage < 50) {
      recommendations.push({
        type: 'REDUCE_WORKLOAD',
        priority: 'HIGH',
        title: 'Calibrate Study Pace',
        reason: `Your recent study completion (${input.studyConsistencyPercentage}%) suggests your daily limit may be too high. Consider adjusting to a lighter schedule.`,
        actionLabel: 'Adjust Study Plan',
        actionRoute: '/study-plan',
      });
    }

    // 5. Default Reassess Recommendation
    if (recommendations.length < 2) {
      recommendations.push({
        type: 'REASSESS',
        priority: 'MEDIUM',
        title: 'Verify Skill Mastery via Assessment',
        reason: 'Take an assessment to measure your latest skill growth and update placement readiness.',
        actionLabel: 'Take Skill Assessment',
        actionRoute: '/assessment',
      });
    }

    return {
      aiSummary: summary,
      recommendations,
    };
  }
}

export const aiAdaptiveService = new AiAdaptiveService();
