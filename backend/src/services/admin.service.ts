import { User } from '../models/user.model';
import { Skill } from '../models/skill.model';
import { UserSkill } from '../models/userSkill.model';
import { Goal } from '../models/goal.model';
import { AssessmentAttempt } from '../models/assessmentAttempt.model';
import { SkillGapAnalysis } from '../models/skillGapAnalysis.model';
import { StudyPlan } from '../models/studyPlan.model';
import { LearningRoadmap } from '../models/learningRoadmap.model';
import { Notification } from '../models/notification.model';
import { UserNotificationPreference } from '../models/userNotificationPreference.model';
import { CareerOutcome } from '../models/careerOutcome.model';
import { CareerOutcomeEvidence } from '../models/careerOutcomeEvidence.model';
import { CareerOutcomeVerification } from '../models/careerOutcomeVerification.model';
import { Achievement } from '../models/achievement.model';
import { ReadinessSnapshot } from '../models/readinessSnapshot.model';
import { SkillGrowthSnapshot } from '../models/skillGrowthSnapshot.model';
import { CommunicationLog } from '../models/communicationLog.model';
import { ApiError } from '../utils/apiError';
import { authService } from './auth.service';

export class AdminService {
  async getDashboardStats() {
    const [totalStudents, activeStudents, suspendedStudents, totalSkills, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', status: 'ACTIVE' }),
      User.countDocuments({ role: 'STUDENT', status: 'SUSPENDED' }),
      Skill.countDocuments({ isActive: true }),
      User.find({ role: 'STUDENT' }).sort({ createdAt: -1 }).limit(5).select('-password -resetPasswordToken -resetPasswordExpires'),
    ]);

    return {
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalSkills,
      recentUsers,
    };
  }

  async getUsersList(query: {
    search?: string;
    role?: 'STUDENT' | 'ADMIN';
    status?: 'ACTIVE' | 'SUSPENDED';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    if (query.search && query.search.trim() !== '') {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { branch: searchRegex },
        { targetRole: searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -resetPasswordToken -resetPasswordExpires'),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) throw new ApiError(404, 'User not found');

    const [
      skills,
      goals,
      assessmentAttempts,
      skillGap,
      studyPlan,
      careerOutcome,
      careerOutcomeEvidence,
      communicationLogs,
    ] = await Promise.all([
      UserSkill.find({ userId }).populate('skillId'),
      Goal.find({ userId }).sort({ createdAt: -1 }),
      AssessmentAttempt.find({ userId }).sort({ createdAt: -1 }).limit(20),
      SkillGapAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      StudyPlan.findOne({ userId }),
      CareerOutcome.findOne({ userId }),
      CareerOutcomeEvidence.find({ userId }).sort({ createdAt: -1 }),
      CommunicationLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    return {
      user,
      skills,
      goals,
      assessmentAttempts,
      skillGap,
      studyPlan,
      careerOutcome,
      careerOutcomeEvidence,
      communicationLogs,
    };
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (user.role === 'ADMIN') {
      throw new ApiError(400, 'Administrator accounts cannot be suspended');
    }

    user.status = status;
    await user.save();

    const updated = user.toObject();
    delete updated.password;
    delete updated.resetPasswordToken;
    delete updated.resetPasswordExpires;
    return updated;
  }

  async deleteUser(userId: string, requestingAdminId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (user.role === 'ADMIN') {
      throw new ApiError(400, 'Administrator accounts cannot be deleted');
    }

    if (user._id.toString() === requestingAdminId) {
      throw new ApiError(400, 'You cannot remove your own administrator account');
    }

    const email = user.email;

    // Safely delete student-owned data records only (never delete global catalog skills, colleges, assessments, questions)
    await Promise.all([
      UserSkill.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      AssessmentAttempt.deleteMany({ userId }),
      SkillGapAnalysis.deleteMany({ userId }),
      LearningRoadmap.deleteMany({ userId }),
      StudyPlan.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      UserNotificationPreference.deleteMany({ userId }),
      CareerOutcome.deleteMany({ userId }),
      CareerOutcomeEvidence.deleteMany({ userId }),
      CareerOutcomeVerification.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      ReadinessSnapshot.deleteMany({ userId }),
      SkillGrowthSnapshot.deleteMany({ userId }),
      CommunicationLog.deleteMany({ userId }),
    ]);

    // Finally delete the user document itself
    await User.deleteOne({ _id: userId });

    console.log(`[Admin Audit Log] Admin ${requestingAdminId} permanently removed student ${email} (${userId}).`);

    return {
      message: `Student account (${email}) permanently removed along with associated student data.`,
      email,
    };
  }

  async forcePasswordReset(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const resultMessage = await authService.forgotPassword(user.email);
    console.log(`[Admin Audit Log] Admin initiated password reset for student ${user.email}.`);

    return {
      message: `Password reset email dispatched to ${user.email}.`,
      email: user.email,
    };
  }
}

export const adminService = new AdminService();
