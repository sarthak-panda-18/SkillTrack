import { StudyPlan, IStudyPlan, IStudyPlanDay, IStudyTask } from '../models/studyPlan.model';
import { User } from '../models/user.model';
import { roadmapService } from './roadmap.service';
import { skillGapService } from './skillGap.service';
import { aiStudyPlanService, StudyPlanPreferences } from './aiStudyPlan.service';
import { ApiError } from '../utils/apiError';

export class StudyPlanService {
  async getStudentStudyPlan(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    if (!user.targetCareerRoleId && !user.targetRole) {
      throw new ApiError(400, 'Please select a target career role in your profile before generating your study plan.', 'TARGET_ROLE_REQUIRED');
    }

    let plan: any = await StudyPlan.findOne({
      userId,
      ...(user.targetCareerRoleId ? { careerRoleId: user.targetCareerRoleId } : {}),
      status: 'ACTIVE',
    }).sort({ createdAt: -1 });

    if (!plan) {
      // Use user default preferences if never configured
      const defaultPrefs: StudyPlanPreferences = {
        dailyStudyMinutes: 120,
        studyDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
        preferredStudyTime: 'EVENING',
        studyIntensity: 'BALANCED',
        planDurationWeeks: 1,
      };
      plan = await this.generateStudyPlan(userId, defaultPrefs);
    }

    return plan;
  }

  async generateStudyPlan(userId: string, prefs: StudyPlanPreferences): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    // Fetch active roadmap and skill gap
    const roadmap = await roadmapService.getStudentRoadmap(userId);
    if (!roadmap) {
      throw new ApiError(400, 'Please generate your learning roadmap before building a study plan.');
    }

    const gapAnalysis = await skillGapService.getStudentSkillGap(userId);
    if (!gapAnalysis) {
      throw new ApiError(400, 'Skill gap analysis not found.');
    }

    // Archive previous active study plans for this user
    await StudyPlan.updateMany({ userId, status: 'ACTIVE' }, { $set: { status: 'ARCHIVED' } });

    // Generate study plan structure via AiStudyPlanService
    const structure = await aiStudyPlanService.generateStudyPlanStructure(roadmap, gapAnalysis, prefs);

    let totalPlannedMins = 0;
    let totalTasksCount = 0;

    structure.days.forEach((day) => {
      totalPlannedMins += day.totalPlannedMinutes || 0;
      totalTasksCount += day.tasks.length;
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (prefs.planDurationWeeks || 1) * 7);

    const plan = await StudyPlan.create({
      userId,
      roadmapId: roadmap._id,
      careerRoleId: roadmap.careerRoleId,
      careerRoleName: roadmap.careerRoleName,
      title: structure.title,
      summary: structure.summary,
      status: 'ACTIVE',
      startDate,
      endDate,
      dailyStudyMinutes: prefs.dailyStudyMinutes || 120,
      studyDays: prefs.studyDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      preferredStudyTime: prefs.preferredStudyTime || 'EVENING',
      studyIntensity: prefs.studyIntensity || 'BALANCED',
      planDurationWeeks: prefs.planDurationWeeks || 1,
      overallProgress: 0,
      completedMinutes: 0,
      totalPlannedMinutes: totalPlannedMins,
      completedTasksCount: 0,
      totalTasksCount: totalTasksCount,
      streakDays: 1,
      studyPlanVersion: '3.5.0',
      aiSummary: structure.aiSummary,
      days: structure.days,
    });

    return plan;
  }

  async regenerateStudyPlan(userId: string): Promise<any> {
    const existingActive = await StudyPlan.findOne({ userId, status: 'ACTIVE' });
    const prefs: StudyPlanPreferences = {
      dailyStudyMinutes: existingActive?.dailyStudyMinutes || 120,
      studyDays: existingActive?.studyDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      preferredStudyTime: existingActive?.preferredStudyTime || 'EVENING',
      studyIntensity: existingActive?.studyIntensity || 'BALANCED',
      planDurationWeeks: existingActive?.planDurationWeeks || 1,
    };

    return this.generateStudyPlan(userId, prefs);
  }

  async updateTaskStatus(userId: string, taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'): Promise<any> {
    const plan = await StudyPlan.findOne({ userId, status: 'ACTIVE' });
    if (!plan) throw new ApiError(404, 'Active study plan not found.');

    let taskFound: IStudyTask | null = null;
    let targetDay: IStudyPlanDay | null = null;

    for (const day of plan.days) {
      for (const task of day.tasks) {
        if (task.taskId === taskId) {
          taskFound = task;
          targetDay = day;
          break;
        }
      }
      if (taskFound) break;
    }

    if (!taskFound || !targetDay) {
      throw new ApiError(404, 'Study task not found in active plan.');
    }

    taskFound.status = status;
    if (status === 'COMPLETED') {
      taskFound.completedAt = new Date();
    } else if (status === 'NOT_STARTED') {
      taskFound.completedAt = undefined;
    }

    // Sync task completion with Phase 3.4 Roadmap topic progress where applicable
    if (status === 'COMPLETED' && taskFound.roadmapTopicId) {
      try {
        if (taskFound.type === 'LEARN') {
          await roadmapService.updateTopicProgress(userId, taskFound.roadmapTopicId, 75);
        } else if (taskFound.type === 'PRACTICE' || taskFound.type === 'PROJECT') {
          await roadmapService.completeTopic(userId, taskFound.roadmapTopicId);
        }
      } catch (err) {
        console.warn('[StudyPlanService] Roadmap topic progress sync skipped:', err);
      }
    }

    // Recalculate day & overall study plan progress
    this.recalculatePlanProgress(plan);
    await plan.save();

    return plan;
  }

  async rescheduleTask(userId: string, taskId: string, targetDateStr: string): Promise<any> {
    const plan = await StudyPlan.findOne({ userId, status: 'ACTIVE' });
    if (!plan) throw new ApiError(404, 'Active study plan not found.');

    let taskToMove: IStudyTask | null = null;
    let sourceDay: IStudyPlanDay | null = null;

    // Find and extract task from source day
    for (const day of plan.days) {
      const idx = day.tasks.findIndex((t) => t.taskId === taskId);
      if (idx !== -1) {
        taskToMove = day.tasks[idx];
        sourceDay = day;
        day.tasks.splice(idx, 1);
        break;
      }
    }

    if (!taskToMove || !sourceDay) {
      throw new ApiError(404, 'Task not found in active study plan.');
    }

    // Find target day in plan by date string
    let targetDay = plan.days.find((d) => d.date === targetDateStr);
    if (!targetDay) {
      // Append target date if within plan timeframe
      targetDay = {
        dayId: `day_custom_${Date.now()}`,
        date: targetDateStr,
        dayOfWeek: 'MONDAY',
        isRestDay: false,
        totalPlannedMinutes: 0,
        completedMinutes: 0,
        status: 'UPCOMING',
        tasks: [],
      };
      plan.days.push(targetDay);
    }

    taskToMove.status = 'NOT_STARTED';
    taskToMove.rescheduledFrom = new Date();
    taskToMove.order = targetDay.tasks.length + 1;
    targetDay.tasks.push(taskToMove);
    targetDay.isRestDay = false;

    this.recalculatePlanProgress(plan);
    await plan.save();

    return plan;
  }

  private recalculatePlanProgress(plan: IStudyPlan): void {
    let completedMins = 0;
    let totalMins = 0;
    let completedTasks = 0;
    let totalTasks = 0;

    plan.days.forEach((day) => {
      let dayCompletedMins = 0;
      let dayTotalMins = 0;

      day.tasks.forEach((task) => {
        totalTasks++;
        const duration = task.durationMinutes || 30;
        dayTotalMins += duration;

        if (task.status === 'COMPLETED') {
          completedTasks++;
          dayCompletedMins += duration;
        }
      });

      day.totalPlannedMinutes = day.isRestDay ? 0 : dayTotalMins;
      day.completedMinutes = dayCompletedMins;

      if (!day.isRestDay) {
        if (dayCompletedMins >= dayTotalMins && dayTotalMins > 0) {
          day.status = 'COMPLETED';
        }
      }
      completedMins += dayCompletedMins;
      totalMins += dayTotalMins;
    });

    plan.completedMinutes = completedMins;
    plan.totalPlannedMinutes = totalMins;
    plan.completedTasksCount = completedTasks;
    plan.totalTasksCount = totalTasks;
    plan.overallProgress = Math.round((completedMins / (totalMins || 1)) * 100);

    if (plan.overallProgress === 100) {
      plan.status = 'COMPLETED';
    }
  }
}

export const studyPlanService = new StudyPlanService();
