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

  async getTrainerDashboardStats() {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const activeOutcomes = await CareerOutcome.find({ status: 'ACTIVE' });

    let employedCount = 0;
    let unemployedCount = 0;
    let inProgressCount = 0;
    let higherStudiesCount = 0;
    let selfEmployedCount = 0;
    let apprenticeshipCount = 0;

    let totalEmployedSalary = 0;
    let employedSalaryCount = 0;

    let totalSalaryGrowthPct = 0;
    let salaryGrowthCount = 0;

    let totalJobRelevance = 0;
    let totalJobSatisfaction = 0;
    let feedbackCount = 0;

    const salaryBins: Record<string, number> = {
      '< ₹3 LPA': 0,
      '₹3-6 LPA': 0,
      '₹6-10 LPA': 0,
      '₹10-15 LPA': 0,
      '₹15+ LPA': 0,
    };

    activeOutcomes.forEach((o) => {
      if (o.outcomeType === 'EMPLOYED') {
        employedCount++;
        if (o.employment?.compensationAmount) {
          const sal = o.employment.compensationAmount;
          totalEmployedSalary += sal;
          employedSalaryCount++;

          if (sal < 300000) salaryBins['< ₹3 LPA']++;
          else if (sal < 600000) salaryBins['₹3-6 LPA']++;
          else if (sal < 1000000) salaryBins['₹6-10 LPA']++;
          else if (sal < 1500000) salaryBins['₹10-15 LPA']++;
          else salaryBins['₹15+ LPA']++;
        }
        if (o.employment?.salaryGrowthPercentage && o.employment.salaryGrowthPercentage > 0) {
          totalSalaryGrowthPct += o.employment.salaryGrowthPercentage;
          salaryGrowthCount++;
        }
        if (o.employment?.jobRelevance || o.employment?.jobSatisfaction) {
          if (o.employment.jobRelevance) totalJobRelevance += o.employment.jobRelevance;
          if (o.employment.jobSatisfaction) totalJobSatisfaction += o.employment.jobSatisfaction;
          feedbackCount++;
        }
      } else if (o.outcomeType === 'UNEMPLOYED' || o.outcomeType === 'SEEKING_EMPLOYMENT') {
        unemployedCount++;
      } else if (o.outcomeType === 'LOOKING_FOR_EMPLOYMENT' || o.outcomeType === 'INTERNSHIP') {
        inProgressCount++;
      } else if (o.outcomeType === 'HIGHER_STUDIES') {
        higherStudiesCount++;
      } else if (o.outcomeType === 'SELF_EMPLOYED') {
        selfEmployedCount++;
      } else if (o.outcomeType === 'APPRENTICESHIP') {
        apprenticeshipCount++;
      }
    });

    const employmentRate = totalStudents > 0 ? Number(((employedCount / totalStudents) * 100).toFixed(1)) : 0;
    const avgSalary = employedSalaryCount > 0 ? Math.round(totalEmployedSalary / employedSalaryCount) : 0;
    const avgSalaryGrowth = salaryGrowthCount > 0 ? Number((totalSalaryGrowthPct / salaryGrowthCount).toFixed(1)) : 0;
    const avgJobRelevance = feedbackCount > 0 ? Number((totalJobRelevance / feedbackCount).toFixed(1)) : 0;
    const avgJobSatisfaction = feedbackCount > 0 ? Number((totalJobSatisfaction / feedbackCount).toFixed(1)) : 0;

    const statusDistribution = [
      { name: 'Employed', count: employedCount, fill: '#10B981' },
      { name: 'Unemployed', count: unemployedCount, fill: '#EF4444' },
      { name: 'Placement In Progress', count: inProgressCount, fill: '#F59E0B' },
      { name: 'Higher Studies', count: higherStudiesCount, fill: '#3B82F6' },
      { name: 'Self-Employed', count: selfEmployedCount, fill: '#8B5CF6' },
      { name: 'Apprenticeship', count: apprenticeshipCount, fill: '#6366F1' },
    ];

    const pipeline = [
      { stage: 'Total Trainees', count: totalStudents },
      { stage: 'Placement In Progress', count: inProgressCount },
      { stage: 'Offers / Employed', count: employedCount },
      { stage: 'Higher Studies / Other', count: higherStudiesCount + selfEmployedCount + apprenticeshipCount },
    ];

    const salaryDistributionChart = Object.entries(salaryBins).map(([range, count]) => ({ range, count }));

    return {
      totalStudents,
      employedStudents: employedCount,
      unemployedStudents: unemployedCount,
      placementInProgressStudents: inProgressCount,
      higherStudiesStudents: higherStudiesCount,
      selfEmployedStudents: selfEmployedCount,
      apprenticeshipStudents: apprenticeshipCount,
      employmentRate,
      averageCurrentSalary: avgSalary,
      averageSalaryGrowth: avgSalaryGrowth,
      averageJobRelevance: avgJobRelevance,
      averageJobSatisfaction: avgJobSatisfaction,
      statusDistribution,
      pipeline,
      salaryDistributionChart,
    };
  }

  async getUsersList(query: {
    search?: string;
    role?: 'STUDENT' | 'ADMIN' | 'TRAINER';
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
    const user = await User.findById(userId)
      .populate('targetCareerRoleId')
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) throw new ApiError(404, 'User not found');

    const [
      skills,
      goals,
      assessmentAttempts,
      skillGap,
      studyPlan,
      learningRoadmap,
      careerOutcome,
      outcomeHistory,
      careerOutcomeEvidence,
      readinessSnapshot,
      communicationLogs,
    ] = await Promise.all([
      UserSkill.find({ userId }).populate('skillId'),
      Goal.find({ userId }).sort({ createdAt: -1 }),
      AssessmentAttempt.find({ userId }).sort({ createdAt: -1 }).limit(20),
      SkillGapAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      StudyPlan.findOne({ userId }),
      LearningRoadmap.findOne({ userId }),
      CareerOutcome.findOne({ userId, status: 'ACTIVE' }),
      CareerOutcome.find({ userId }).sort({ createdAt: -1 }),
      CareerOutcomeEvidence.find({ userId }).sort({ createdAt: -1 }),
      ReadinessSnapshot.findOne({ userId }).sort({ createdAt: -1 }),
      CommunicationLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    return {
      user,
      skills,
      goals,
      assessmentAttempts,
      skillGap,
      studyPlan,
      learningRoadmap,
      careerOutcome,
      outcomeHistory,
      careerOutcomeEvidence,
      readinessSnapshot,
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
