import { Goal, IGoal, IMilestone, GoalCategory, GoalStatus } from '../models/goal.model';
import { User } from '../models/user.model';
import { CareerRole } from '../models/careerRole.model';
import { CareerRoleSkill } from '../models/careerRoleSkill.model';
import { AssessmentAttempt } from '../models/assessmentAttempt.model';
import { ApiError } from '../utils/apiError';
import { notificationService } from './notification.service';

export interface GoalQueryOptions {
  category?: string;
  status?: string; // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'
  sort?: string;   // 'deadline' | 'progress' | 'recently_updated' | 'created_date'
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  type?: 'AUTOMATIC' | 'MANUAL';
  autoSource?: 'ASSESSMENT_COUNT' | 'LEARNING_TOPIC_COUNT' | 'STUDY_TASK_COUNT' | 'SKILL_PROFICIENCY' | 'MANUAL';
  skillId?: string;
  skillName?: string;
  targetValue?: number;
  unit?: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  milestones?: CreateMilestoneInput[];
  isSystemRecommended?: boolean;
  templateId?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  status?: GoalStatus;
}

export class GoalService {
  async getStudentGoals(userId: string, options: GoalQueryOptions = {}): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    // Fetch user's goals
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    // Sync automatic progress from real DB collections
    const completedAssessmentsCount = await AssessmentAttempt.countDocuments({ userId, status: 'COMPLETED' });

    let completedTopicsCount = 0;
    try {
      const { LearningRoadmap } = await import('../models/learningRoadmap.model');
      const roadmaps = await LearningRoadmap.find({ userId });
      roadmaps.forEach((r: any) => {
        r.stages?.forEach((s: any) => {
          s.topics?.forEach((t: any) => {
            if (t.status === 'COMPLETED') completedTopicsCount++;
          });
        });
      });
    } catch (e) {
      // Optional roadmap
    }

    let completedStudyTasksCount = 0;
    try {
      const { StudyPlan } = await import('../models/studyPlan.model');
      const studyPlans = await StudyPlan.find({ userId });
      studyPlans.forEach((sp: any) => {
        sp.days?.forEach((d: any) => {
          d.tasks?.forEach((t: any) => {
            if (t.status === 'COMPLETED') completedStudyTasksCount++;
          });
        });
      });
    } catch (e) {
      // Optional study plan
    }

    const now = new Date();

    for (const goal of goals) {
      let modified = false;

      // Update milestones with autoSource
      if (goal.milestones && goal.milestones.length > 0) {
        let completedCount = 0;

        for (const ms of goal.milestones) {
          if (ms.type === 'AUTOMATIC' || ms.autoSource !== 'MANUAL') {
            let newValue = ms.currentValue;

            if (ms.autoSource === 'ASSESSMENT_COUNT') {
              newValue = completedAssessmentsCount;
            } else if (ms.autoSource === 'LEARNING_TOPIC_COUNT') {
              newValue = completedTopicsCount;
            } else if (ms.autoSource === 'STUDY_TASK_COUNT') {
              newValue = completedStudyTasksCount;
            } else if (ms.autoSource === 'SKILL_PROFICIENCY' && ms.skillId) {
              const latestAttempt = await AssessmentAttempt.findOne({
                userId,
                skillId: ms.skillId,
                status: 'COMPLETED',
              }).sort({ createdAt: -1 });
              if (latestAttempt) {
                newValue = latestAttempt.percentage || 0;
              }
            }

            if (newValue !== ms.currentValue) {
              ms.currentValue = newValue;
              modified = true;
            }

            if (ms.currentValue >= ms.targetValue && ms.status !== 'COMPLETED') {
              ms.status = 'COMPLETED';
              ms.completedAt = ms.completedAt || new Date();
              modified = true;
            }
          }

          if (ms.status === 'COMPLETED') completedCount++;
        }

        const newProgress = Math.round((completedCount / goal.milestones.length) * 100);
        if (goal.progress !== newProgress) {
          goal.progress = newProgress;
          modified = true;
        }
      } else if (goal.targetValue && goal.targetValue > 0) {
        const newProgress = Math.round(Math.min(100, ((goal.currentValue || 0) / goal.targetValue) * 100));
        if (goal.progress !== newProgress) {
          goal.progress = newProgress;
          modified = true;
        }
      }

      // Check status & deadline
      if (goal.progress >= 100 && goal.status !== 'COMPLETED') {
        goal.status = 'COMPLETED';
        goal.completedAt = goal.completedAt || new Date();
        modified = true;

        notificationService.createNotification({
          userId,
          type: 'GOAL_COMPLETED',
          title: 'Goal Achieved! 🎯',
          message: `Congratulations! You completed your goal "${goal.title}".`,
          link: '/goals',
          entityId: goal._id.toString(),
          emailData: {
            goalTitle: goal.title,
            category: goal.category,
          },
        });
      } else if (goal.deadline && new Date(goal.deadline) < now && goal.status !== 'COMPLETED') {
        if (goal.status !== 'OVERDUE') {
          goal.status = 'OVERDUE';
          modified = true;
        }
      } else if (goal.progress > 0 && goal.progress < 100 && goal.status === 'NOT_STARTED') {
        goal.status = 'IN_PROGRESS';
        modified = true;
      }

      if (modified) {
        await goal.save();
      }
    }

    // Counts summary
    const totalGoals = goals.length;
    const activeCount = goals.filter((g) => g.status === 'NOT_STARTED' || g.status === 'IN_PROGRESS').length;
    const completedCount = goals.filter((g) => g.status === 'COMPLETED').length;
    const overdueCount = goals.filter((g) => g.status === 'OVERDUE').length;

    // Apply Filter & Sorting
    let filtered = [...goals];

    const category = (options.category || 'ALL').toUpperCase();
    if (category !== 'ALL') {
      filtered = filtered.filter((g) => g.category === category);
    }

    const statusOpt = (options.status || 'ALL').toUpperCase();
    if (statusOpt === 'ACTIVE') {
      filtered = filtered.filter((g) => g.status === 'NOT_STARTED' || g.status === 'IN_PROGRESS');
    } else if (statusOpt === 'COMPLETED') {
      filtered = filtered.filter((g) => g.status === 'COMPLETED');
    } else if (statusOpt === 'OVERDUE') {
      filtered = filtered.filter((g) => g.status === 'OVERDUE');
    }

    const sortOpt = (options.sort || 'active_first').toLowerCase();
    filtered.sort((a, b) => {
      if (sortOpt === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortOpt === 'progress') {
        return b.progress - a.progress;
      }
      if (sortOpt === 'recently_updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortOpt === 'created_date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      // Default active first
      const statusWeight = (s: string) => (s === 'IN_PROGRESS' ? 0 : s === 'NOT_STARTED' ? 1 : s === 'OVERDUE' ? 2 : 3);
      return statusWeight(a.status) - statusWeight(b.status);
    });

    return {
      goals: filtered,
      summary: {
        totalGoals,
        activeCount,
        completedCount,
        overdueCount,
      },
      currentCareerGoal: {
        targetRole: user.targetRole || null,
        targetCareerRoleId: user.targetCareerRoleId || null,
      },
    };
  }

  async createGoal(userId: string, data: CreateGoalInput): Promise<IGoal> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    if (!data.title || !data.title.trim()) {
      throw new ApiError(400, 'Goal title is required.');
    }

    // Duplicate Protection: If templateId is provided and goal already exists for user, return existing goal
    if (data.templateId) {
      const existing = await Goal.findOne({ userId, templateId: data.templateId });
      if (existing) {
        return existing;
      }
    }

    const milestones: IMilestone[] = (data.milestones || []).map((m, idx) => ({
      milestoneId: `ms-${Date.now()}-${idx}`,
      title: m.title,
      description: m.description || '',
      category: m.category || data.category || 'SKILL',
      type: m.type || (m.autoSource && m.autoSource !== 'MANUAL' ? 'AUTOMATIC' : 'MANUAL'),
      autoSource: m.autoSource || 'MANUAL',
      skillId: m.skillId as any,
      skillName: m.skillName || '',
      status: 'NOT_STARTED',
      currentValue: 0,
      targetValue: m.targetValue || 1,
      unit: m.unit || 'item',
      order: idx + 1,
    }));

    let initialProgress = 0;
    if (milestones.length === 0 && data.targetValue && data.targetValue > 0) {
      initialProgress = 0;
    }

    const goal = await Goal.create({
      userId,
      careerRoleId: user.targetCareerRoleId,
      careerRoleName: user.targetRole || '',
      templateId: data.templateId || undefined,
      title: data.title.trim(),
      description: data.description || '',
      category: data.category || 'SKILL',
      status: 'NOT_STARTED',
      isSystemRecommended: data.isSystemRecommended || false,
      progress: initialProgress,
      currentValue: 0,
      targetValue: data.targetValue || (milestones.length > 0 ? milestones.length : 1),
      unit: data.unit || (milestones.length > 0 ? 'milestones' : 'item'),
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      milestones,
    });

    return goal;
  }

  async updateGoal(userId: string, goalId: string, data: UpdateGoalInput): Promise<IGoal> {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) throw new ApiError(404, 'Goal not found or permission denied.');

    if (data.title !== undefined) goal.title = data.title.trim();
    if (data.description !== undefined) goal.description = data.description;
    if (data.category !== undefined) goal.category = data.category;
    if (data.targetValue !== undefined) goal.targetValue = data.targetValue;
    if (data.unit !== undefined) goal.unit = data.unit;
    if (data.deadline !== undefined) goal.deadline = data.deadline ? new Date(data.deadline) : undefined;
    if (data.status !== undefined) goal.status = data.status;

    await goal.save();
    return goal;
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) throw new ApiError(404, 'Goal not found or permission denied.');
  }

  async updateMilestoneStatus(
    userId: string,
    goalId: string,
    milestoneId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<IGoal> {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) throw new ApiError(404, 'Goal not found or permission denied.');

    const ms = goal.milestones.find((m) => m.milestoneId === milestoneId);
    if (!ms) throw new ApiError(404, 'Milestone not found in this goal.');

    ms.status = status;
    if (status === 'COMPLETED') {
      ms.currentValue = ms.targetValue;
      ms.completedAt = new Date();
    } else if (status === 'NOT_STARTED') {
      ms.currentValue = 0;
      ms.completedAt = undefined;
    }

    // Recalculate Goal Progress
    const completedCount = goal.milestones.filter((m) => m.status === 'COMPLETED').length;
    goal.progress = Math.round((completedCount / goal.milestones.length) * 100);

    if (goal.progress >= 100) {
      goal.status = 'COMPLETED';
      goal.completedAt = new Date();
    } else if (goal.progress > 0) {
      goal.status = 'IN_PROGRESS';
    }

    await goal.save();
    return goal;
  }

  async getGoalRecommendations(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user || !user.targetCareerRoleId) return [];

    const careerRole = await CareerRole.findById(user.targetCareerRoleId);
    if (!careerRole) return [];

    const roleSkills = await CareerRoleSkill.find({ careerRoleId: careerRole._id }).populate('skillId');

    const topSkills = roleSkills.slice(0, 3).map((rs: any) => ({
      skillId: rs.skillId?._id?.toString() || rs.skillId?.toString(),
      skillName: rs.skillId?.name || 'Technical Skill',
    }));

    // Find existing goals for user that have a templateId
    const existingGoals = await Goal.find({ userId, templateId: { $exists: true } });
    const addedTemplateIds = new Set(existingGoals.map((g) => g.templateId));

    const roleIdStr = careerRole._id.toString();

    const recommendations = [
      {
        templateId: `tpl-${roleIdStr}-core-skills`,
        title: `Master ${careerRole.name} Core Skills`,
        description: `Achieve 80%+ proficiency across key technical requirements for ${careerRole.name}.`,
        category: 'SKILL',
        milestones: topSkills.map((s) => ({
          title: `Reach 80% proficiency in ${s.skillName}`,
          category: 'SKILL',
          type: 'AUTOMATIC',
          autoSource: 'SKILL_PROFICIENCY',
          skillId: s.skillId,
          skillName: s.skillName,
          targetValue: 80,
          unit: '%',
        })),
        isAdded: addedTemplateIds.has(`tpl-${roleIdStr}-core-skills`),
      },
      {
        templateId: `tpl-${roleIdStr}-assessments`,
        title: 'Verify Skills via Technical Assessments',
        description: 'Complete 5 technical skill assessments to demonstrate placement readiness.',
        category: 'ASSESSMENT',
        milestones: [
          {
            title: 'Complete 5 Skill Assessments',
            category: 'ASSESSMENT',
            type: 'AUTOMATIC',
            autoSource: 'ASSESSMENT_COUNT',
            targetValue: 5,
            unit: 'assessments',
          },
        ],
        isAdded: addedTemplateIds.has(`tpl-${roleIdStr}-assessments`),
      },
      {
        templateId: `tpl-${roleIdStr}-pathway`,
        title: 'Complete Career Learning Pathway',
        description: 'Finish 10 essential learning roadmap topics tailored for your target role.',
        category: 'LEARNING',
        milestones: [
          {
            title: 'Complete 10 Learning Topics',
            category: 'LEARNING',
            type: 'AUTOMATIC',
            autoSource: 'LEARNING_TOPIC_COUNT',
            targetValue: 10,
            unit: 'topics',
          },
        ],
        isAdded: addedTemplateIds.has(`tpl-${roleIdStr}-pathway`),
      },
      {
        templateId: `tpl-${roleIdStr}-project`,
        title: 'Build Portfolio Project',
        description: 'Design and deploy a full-stack project demonstrating role competence.',
        category: 'PROJECT',
        milestones: [
          {
            title: 'Complete Project Architecture & Codebase',
            category: 'PROJECT',
            type: 'MANUAL',
            targetValue: 1,
            unit: 'project',
          },
        ],
        isAdded: addedTemplateIds.has(`tpl-${roleIdStr}-project`),
      },
    ];

    return recommendations;
  }
}

export const goalService = new GoalService();
