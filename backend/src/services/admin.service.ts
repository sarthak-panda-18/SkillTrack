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
import { Achievement } from '../models/achievement.model';
import { ReadinessSnapshot } from '../models/readinessSnapshot.model';
import { SkillGrowthSnapshot } from '../models/skillGrowthSnapshot.model';
import { CommunicationLog } from '../models/communicationLog.model';
import { College } from '../models/college.model';
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

  async getTrainerDashboardStats(filters?: {
    cohort?: string;
    course?: string;
    district?: string;
    provider?: string;
  }) {
    const userMatch: any = { role: 'STUDENT' };
    if (filters?.cohort && filters.cohort !== 'ALL') userMatch.cohort = filters.cohort;
    if (filters?.course && filters.course !== 'ALL') userMatch.branch = filters.course;
    if (filters?.district && filters.district !== 'ALL') userMatch.district = filters.district;
    if (filters?.provider && filters.provider !== 'ALL') userMatch.college = filters.provider;

    const filteredUsers = await User.find(userMatch).select('_id cohort branch district college');
    const totalStudents = filteredUsers.length;

    return {
      totalStudents,
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
      readinessSnapshot,
      communicationLogs,
    ] = await Promise.all([
      UserSkill.find({ userId }).populate('skillId'),
      Goal.find({ userId }).sort({ createdAt: -1 }),
      AssessmentAttempt.find({ userId }).sort({ createdAt: -1 }).limit(20),
      SkillGapAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      StudyPlan.findOne({ userId }),
      LearningRoadmap.findOne({ userId }),
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
      readinessSnapshot,
      communicationLogs,
    };
  }

  async getCohortAnalytics(query?: { district?: string; course?: string }) {
    const filter: any = { role: 'STUDENT' };
    if (query?.district && query.district !== 'ALL') filter.district = query.district;
    if (query?.course && query.course !== 'ALL') filter.branch = query.course;

    const students = await User.find(filter).select('_id cohort branch district college graduationYear');
    const cohortGroups: Record<string, any> = {};

    students.forEach((s) => {
      const cohortKey = s.cohort || (s.graduationYear ? `Batch ${s.graduationYear}` : '2026 Cohort');
      if (!cohortGroups[cohortKey]) {
        cohortGroups[cohortKey] = {
          cohort: cohortKey,
          totalTrainees: 0,
        };
      }
      cohortGroups[cohortKey].totalTrainees++;
    });

    return Object.values(cohortGroups);
  }

  async getCourseAnalytics() {
    const students = await User.find({ role: 'STUDENT' }).select('_id branch degree');
    const courseGroups: Record<string, any> = {};

    students.forEach((s) => {
      const courseKey = s.branch || s.degree || 'Computer Science & Engineering';
      if (!courseGroups[courseKey]) {
        courseGroups[courseKey] = {
          course: courseKey,
          totalTrainees: 0,
        };
      }
      courseGroups[courseKey].totalTrainees++;
    });

    return Object.values(courseGroups);
  }

  async getProviderAnalytics() {
    const colleges = await College.find({ isActive: true }).limit(20);
    const result = await Promise.all(
      colleges.map(async (c) => {
        const studentCount = await User.countDocuments({ role: 'STUDENT', collegeId: c._id });
        return {
          providerId: c._id,
          name: c.name,
          city: c.city,
          state: c.state,
          type: c.type,
          totalTrainees: studentCount,
        };
      })
    );

    return result.filter((r) => r.totalTrainees > 0);
  }

  async getDistrictAnalytics() {
    const districtAgg = await User.aggregate([
      { $match: { role: 'STUDENT', district: { $ne: '' } } },
      {
        $group: {
          _id: '$district',
          totalTrainees: { $sum: 1 },
          state: { $first: '$state' },
        },
      },
      { $sort: { totalTrainees: -1 } },
    ]);

    return districtAgg.map((d) => ({
      district: d._id,
      state: d.state || 'State',
      totalTrainees: d.totalTrainees,
    }));
  }

  async getDemographicAnalytics() {
    const [byGraduationYear, byDegree, byExperience] = await Promise.all([
      User.aggregate([
        { $match: { role: 'STUDENT' } },
        { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { role: 'STUDENT' } },
        { $group: { _id: '$degree', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: 'STUDENT' } },
        { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      byGraduationYear: byGraduationYear.map((g) => ({ year: g._id || 2026, count: g.count })),
      byDegree: byDegree.map((d) => ({ degree: d._id || 'B.Tech', count: d.count })),
      byExperience: byExperience.map((e) => ({ level: e._id || 'Beginner', count: e.count })),
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
