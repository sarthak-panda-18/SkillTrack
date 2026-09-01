import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../config/env';

const aiReadinessSchema = z.object({
  summary: z.string().min(10),
  insight: z.string().min(10),
  nextActionExplanation: z.string().min(10),
});

export interface ReadinessInputData {
  careerRoleName: string;
  readinessScore: number;
  readinessCategory: string;
  skillReadinessScore: number;
  assessmentReadinessScore: number;
  roadmapProgressScore: number;
  studyConsistencyScore: number;
  topGapSkillName?: string;
  topGapSize?: number;
  topStrongSkillName?: string;
}

export class AiReadinessService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateReadinessSummary(data: ReadinessInputData): Promise<{
    summary: string;
    insight: string;
    nextActionExplanation: string;
    isAiGenerated: boolean;
  }> {
    const fallbackSummary = `Your Career Readiness for ${data.careerRoleName} is ${data.readinessScore}% (${data.readinessCategory.replace('_', ' ')}). You've made solid progress across technical skills and learning goals.`;
    const fallbackInsight = data.topGapSkillName
      ? `Primary area for growth: ${data.topGapSkillName} (Gap: ${data.topGapSize}%). Closing this key requirement will significantly boost your placement readiness score.`
      : `Continue completing roadmap topics and assessments to increase your overall readiness index.`;
    const fallbackNextAction = data.topGapSkillName
      ? `Focus on improving ${data.topGapSkillName} towards target proficiency.`
      : `Continue your active study plan tasks.`;

    if (!this.genAI) {
      return {
        summary: fallbackSummary,
        insight: fallbackInsight,
        nextActionExplanation: fallbackNextAction,
        isAiGenerated: false,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a senior technical career coach evaluating a student's placement readiness metrics.
Student Readiness Snapshot:
- Target Career Role: ${data.careerRoleName}
- Overall Readiness Score: ${data.readinessScore}% (${data.readinessCategory})
- Skill Readiness Dimension: ${data.skillReadinessScore}%
- Assessment Performance Dimension: ${data.assessmentReadinessScore}%
- Roadmap Progress Dimension: ${data.roadmapProgressScore}%
- Study Plan Consistency Dimension: ${data.studyConsistencyScore}%
- Primary Skill Gap: ${data.topGapSkillName || 'None'} (Gap: ${data.topGapSize || 0}%)
- Top Strong Skill: ${data.topStrongSkillName || 'None'}

Provide concise, objective, encouraging natural-language feedback in strict raw JSON:
1. 'summary': A 2-sentence executive summary explaining why the student reached a score of ${data.readinessScore}%.
2. 'insight': A 1-sentence analytical observation highlighting key strengths or key focus areas.
3. 'nextActionExplanation': A 1-sentence concrete recommendation on what single step to take next.

CRITICAL RULE: Return ONLY valid raw JSON without markdown formatting or code blocks.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      const validated = aiReadinessSchema.parse(parsed);

      return {
        summary: validated.summary,
        insight: validated.insight,
        nextActionExplanation: validated.nextActionExplanation,
        isAiGenerated: true,
      };
    } catch (err) {
      console.warn('[AiReadinessService] Gemini API call failed or timed out. Using fallback summary.', err);
      return {
        summary: fallbackSummary,
        insight: fallbackInsight,
        nextActionExplanation: fallbackNextAction,
        isAiGenerated: false,
      };
    }
  }
}

export const aiReadinessService = new AiReadinessService();
