import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('[AIService] Failed to initialize Google Generative AI SDK:', err);
      }
    } else {
      console.log('[AIService] Running in fallback mode (GEMINI_API_KEY not configured).');
    }
  }

  public async generateSkillRecommendations(targetRole: string, currentSkills: string[]): Promise<string[]> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Suggest top 5 essential technical skills for an engineering student targeting the role of "${targetRole}". Current skills are: ${currentSkills.join(', ')}. Return ONLY a raw JSON array of strings.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text() || '[]';
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('[AIService Error]', error);
      }
    }

    // Default fallback recommendations based on target role
    const lowerRole = targetRole.toLowerCase();
    if (lowerRole.includes('frontend') || lowerRole.includes('web')) {
      return ['TypeScript', 'Next.js', 'Tailwind CSS', 'State Management', 'Web Vitals'];
    } else if (lowerRole.includes('backend') || lowerRole.includes('node')) {
      return ['Node.js', 'System Design', 'PostgreSQL', 'Docker', 'REST APIs'];
    } else if (lowerRole.includes('data') || lowerRole.includes('machine') || lowerRole.includes('ai')) {
      return ['Python', 'PyTorch', 'SQL', 'Data Pipelines', 'Scikit-Learn'];
    }
    return ['Data Structures & Algorithms', 'Git & GitHub', 'System Design', 'SQL', 'Problem Solving'];
  }
}

export const aiService = new AIService();
