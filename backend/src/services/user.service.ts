import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { UserSkill } from '../models/userSkill.model';
import { ApiError } from '../utils/apiError';

export class UserService {
  private calculateProfileCompletion(user: IUser, userSkillsCount: number): number {
    let score = 0;
    if (user.name) score += 15;
    if (user.email) score += 15;
    if (user.college) score += 15;
    if (user.degree && user.branch) score += 15;
    if (user.targetRole) score += 20;
    if (userSkillsCount > 0) score += 20;
    return Math.min(100, score);
  }

  async ensureTargetCareerRoleId(user: any): Promise<any> {
    if (!user) return user;
    if (user.targetCareerRoleId) {
      const { CareerRole } = await import('../models/careerRole.model');
      const roleExists = await CareerRole.findById(user.targetCareerRoleId);
      if (roleExists && roleExists.isActive) {
        return user;
      }
    }

    const { CareerRole } = await import('../models/careerRole.model');
    let role: any = null;
    if (user.targetRole) {
      role = await CareerRole.findOne({ name: new RegExp(`^${user.targetRole.trim()}$`, 'i'), isActive: true });
      if (!role) {
        role = await CareerRole.findOne({ name: new RegExp(user.targetRole.trim(), 'i'), isActive: true });
      }
    }

    if (!role) {
      role = await CareerRole.findOne({ isActive: true });
    }

    if (role) {
      user.targetCareerRoleId = role._id;
      user.targetRole = role.name;
      if (role.category && !user.targetDomain) {
        user.targetDomain = role.category;
      }
      await user.save();
    }
    return user;
  }

  async getProfile(userId: string) {
    let user: any = await User.findById(userId).select('-password');
    if (!user) throw new ApiError(404, 'User not found');

    user = await this.ensureTargetCareerRoleId(user);

    const userSkills = await UserSkill.find({ userId }).populate('skillId');
    const completion = this.calculateProfileCompletion(user, userSkills.length);

    if (user.profileCompletion !== completion) {
      user.profileCompletion = completion;
      await user.save();
    }

    return {
      user: user.toObject(),
      skills: userSkills,
    };
  }

  async updateProfile(userId: string, data: Partial<IUser> & { targetCareerRoleId?: string }) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const oldRoleId = user.targetCareerRoleId ? user.targetCareerRoleId.toString() : null;

    Object.assign(user, data);

    // Auto-sync targetCareerRoleId and targetRole if either is updated
    if (data.targetCareerRoleId) {
      const { CareerRole } = await import('../models/careerRole.model');
      const role = await CareerRole.findById(data.targetCareerRoleId);
      if (role) {
        user.targetCareerRoleId = role._id;
        user.targetRole = role.name;
        if (role.category && !user.targetDomain) {
          user.targetDomain = role.category;
        }
      }
    } else if (data.targetRole) {
      const { CareerRole } = await import('../models/careerRole.model');
      const role = await CareerRole.findOne({ name: new RegExp(`^${data.targetRole.trim()}$`, 'i') });
      if (role) {
        user.targetCareerRoleId = role._id;
        user.targetRole = role.name;
      }
    }

    const newRoleId = user.targetCareerRoleId ? user.targetCareerRoleId.toString() : null;

    // Controlled Role Transition Event: Archive old role dependent data if role changed
    if (oldRoleId && newRoleId && oldRoleId !== newRoleId) {
      const { LearningRoadmap } = await import('../models/learningRoadmap.model');
      const { StudyPlan } = await import('../models/studyPlan.model');
      const { AdaptiveRecommendation } = await import('../models/adaptiveLearning.model');

      await LearningRoadmap.updateMany({ userId, status: 'ACTIVE' }, { $set: { status: 'ARCHIVED' } });
      await StudyPlan.updateMany({ userId, status: 'ACTIVE' }, { $set: { status: 'ARCHIVED' } });
      await AdaptiveRecommendation.updateMany({ userId, status: 'NEW' }, { $set: { status: 'STALE' } });
    }

    const userSkillsCount = await UserSkill.countDocuments({ userId });
    user.profileCompletion = this.calculateProfileCompletion(user, userSkillsCount);

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    return updated;
  }

  async completeOnboarding(userId: string, data: {
    college: string;
    degree: string;
    branch: string;
    graduationYear: number;
    targetRole: string;
    targetDomain: string;
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    targetCareerRoleId?: string;
    skills?: { skillId: string; proficiency: number; level?: 'Beginner' | 'Intermediate' | 'Advanced' }[];
  }) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.college = data.college;
    user.degree = data.degree;
    user.branch = data.branch;
    user.graduationYear = data.graduationYear;
    user.targetRole = data.targetRole;
    user.targetDomain = data.targetDomain;
    user.experienceLevel = data.experienceLevel;

    if (data.targetCareerRoleId) {
      const { CareerRole } = await import('../models/careerRole.model');
      const role = await CareerRole.findById(data.targetCareerRoleId);
      if (role) {
        user.targetCareerRoleId = role._id;
        user.targetRole = role.name;
      }
    } else if (data.targetRole) {
      const { CareerRole } = await import('../models/careerRole.model');
      const role = await CareerRole.findOne({ name: new RegExp(`^${data.targetRole.trim()}$`, 'i') });
      if (role) {
        user.targetCareerRoleId = role._id;
      }
    }

    user.onboardingCompleted = true;

    if (data.skills && data.skills.length > 0) {
      for (const item of data.skills) {
        let level: 'Beginner' | 'Intermediate' | 'Advanced' = item.level || 'Intermediate';
        if (!item.level) {
          if (item.proficiency < 40) level = 'Beginner';
          else if (item.proficiency >= 75) level = 'Advanced';
        }

        await UserSkill.findOneAndUpdate(
          { userId: user._id, skillId: item.skillId },
          { proficiency: item.proficiency, level },
          { upsert: true, new: true }
        );
      }
    }

    const userSkillsCount = await UserSkill.countDocuments({ userId });
    user.profileCompletion = this.calculateProfileCompletion(user, userSkillsCount);

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    return updated;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+password');
    if (!user || !user.password) throw new ApiError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPass, salt);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async deleteAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    await UserSkill.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return { message: 'Account deleted successfully' };
  }
}

export const userService = new UserService();
