import { SkillGapAnalysis, ISkillGapAnalysis } from '../models/skillGapAnalysis.model';
import { User } from '../models/user.model';
import { aiSkillGapService } from './aiSkillGap.service';
import { ApiError } from '../utils/apiError';

export class SkillGapService {
  async getStudentSkillGap(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    if (!user.targetCareerRoleId && !user.targetRole) {
      throw new ApiError(400, 'Please select a target career role in your profile to run Skill Gap Analysis.', 'TARGET_ROLE_REQUIRED');
    }

    // Find existing analysis for user's target career role
    let analysis = await SkillGapAnalysis.findOne({
      userId,
      careerRoleId: user.targetCareerRoleId,
    });

    // If no analysis exists, calculate it now
    if (!analysis) {
      analysis = await aiSkillGapService.calculateAndSaveSkillGap(userId);
    }

    return analysis;
  }

  async recalculateSkillGap(userId: string): Promise<any> {
    return await aiSkillGapService.calculateAndSaveSkillGap(userId);
  }
}

export const skillGapService = new SkillGapService();
