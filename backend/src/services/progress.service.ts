import { ReadinessSnapshot, IReadinessSnapshot } from '../models/readinessSnapshot.model';
import { Achievement, IAchievement } from '../models/achievement.model';
import { User } from '../models/user.model';
import { CareerRole } from '../models/careerRole.model';
import { CareerRoleSkill } from '../models/careerRoleSkill.model';
import { UserSkill } from '../models/userSkill.model';
import { AssessmentAttempt } from '../models/assessmentAttempt.model';
import { userService } from './user.service';
import { skillGapService } from './skillGap.service';
import { roadmapService } from './roadmap.service';
import { studyPlanService } from './studyPlan.service';
import { adaptiveService } from './adaptive.service';
import { aiReadinessService } from './aiReadiness.service';
import { ApiError } from '../utils/apiError';

export interface SkillImprovementDelta {
  skillId: string;
  skillName: string;
  initialProficiency: number;
  currentProficiency: number;
  changePoints: number;
  source: string;
}

export interface TimelineQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  dateFilter?: string;
  sort?: 'DESC' | 'ASC';
}

export class ProgressService {
  async getStudentProgress(userId: string): Promise<any> {
    let user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    user = await userService.ensureTargetCareerRoleId(user);

    if (!user || !user.targetCareerRoleId) {
      throw new ApiError(
        400,
        'Please select a target career role in your profile to view progress and readiness metrics.',
        'TARGET_ROLE_REQUIRED'
      );
    }

    const careerRole = await CareerRole.findById(user.targetCareerRoleId);
    if (!careerRole || !careerRole.isActive) {
      throw new ApiError(
        400,
        'Selected target career role is currently inactive or unavailable.',
        'TARGET_ROLE_REQUIRED'
      );
    }

    // Load prerequisites safely
    let gapAnalysis: any = null;
    try {
      gapAnalysis = await skillGapService.getStudentSkillGap(userId);
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'TARGET_ROLE_REQUIRED') throw err;
      throw new ApiError(400, 'Skill gap analysis required. Please calculate your Skill Gap first.', 'SKILL_GAP_REQUIRED');
    }

    if (!gapAnalysis) {
      throw new ApiError(400, 'Skill gap analysis required. Please calculate your Skill Gap first.', 'SKILL_GAP_REQUIRED');
    }

    let roadmap: any = null;
    try {
      roadmap = await roadmapService.getStudentRoadmap(userId);
    } catch (err: any) {
      // Optional roadmap
    }

    let studyPlan: any = null;
    try {
      studyPlan = await studyPlanService.getStudentStudyPlan(userId);
    } catch (err: any) {
      // Optional study plan
    }

    let adaptiveData: any = null;
    try {
      adaptiveData = await adaptiveService.getAdaptiveState(userId);
    } catch (err: any) {
      // Optional adaptive data
    }

    // 1. Calculate Skill Readiness (Weight: 35%)
    const skillList = gapAnalysis.skills || gapAnalysis.skillMatrix || [];
    let totalSkillRatio = 0;
    let skillCount = 0;

    const evaluatedSkillDetails = skillList.map((item: any) => {
      const current = item.currentProficiency || 0;
      const target = item.recommendedProficiency || item.requiredProficiency || 80;
      const ratio = Math.min(1, current / (target || 1));
      totalSkillRatio += ratio;
      skillCount++;

      return {
        skillId: item.skillId,
        name: item.name,
        category: item.category || 'General',
        importance: item.importance || 'HIGH',
        currentProficiency: current,
        targetProficiency: target,
        gap: Math.max(0, target - current),
        status: item.status || 'UNASSESSED',
        source: item.source || 'UNASSESSED',
      };
    });

    const skillReadinessScore = skillCount > 0 ? Math.round((totalSkillRatio / skillCount) * 100) : 0;

    // 2. Calculate Assessment Performance (Weight: 25%)
    const completedAttempts = await AssessmentAttempt.find({ userId, status: 'COMPLETED' }).sort({ createdAt: -1 });
    let assessmentReadinessScore = 0;
    if (completedAttempts.length > 0) {
      const avgScore = completedAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / completedAttempts.length;
      assessmentReadinessScore = Math.round(avgScore);
    } else {
      // Fallback if no assessments taken yet
      assessmentReadinessScore = Math.round(skillReadinessScore * 0.7);
    }

    // 3. Roadmap Progress (Weight: 25%)
    const roadmapProgressScore = roadmap?.overallProgress || 0;

    // 4. Study Consistency (Weight: 15%)
    const studyConsistencyScore = studyPlan?.overallProgress || 0;

    // Overall Deterministic Readiness Score (0 - 100)
    const overallReadinessScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          skillReadinessScore * 0.35 +
            assessmentReadinessScore * 0.25 +
            roadmapProgressScore * 0.25 +
            studyConsistencyScore * 0.15
        )
      )
    );

    // Readiness Category Mapping
    let readinessCategory: 'GETTING_STARTED' | 'DEVELOPING' | 'PROGRESSING' | 'NEARLY_READY' | 'PLACEMENT_READY' = 'GETTING_STARTED';
    if (overallReadinessScore >= 90) readinessCategory = 'PLACEMENT_READY';
    else if (overallReadinessScore >= 75) readinessCategory = 'NEARLY_READY';
    else if (overallReadinessScore >= 60) readinessCategory = 'PROGRESSING';
    else if (overallReadinessScore >= 40) readinessCategory = 'DEVELOPING';

    // Extract Biggest Gaps & Strongest Skills
    const biggestGaps = [...evaluatedSkillDetails]
      .filter((s) => s.gap > 0 || s.status === 'UNASSESSED')
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);

    const strongestSkills = [...evaluatedSkillDetails]
      .filter((s) => s.currentProficiency >= 65)
      .sort((a, b) => b.currentProficiency - a.currentProficiency)
      .slice(0, 5);

    const unassessedSkills = evaluatedSkillDetails.filter((s: any) => s.source === 'UNASSESSED' || s.status === 'UNASSESSED');

    // Extract Before vs After Skill Gains (Historical Assessment Deltas)
    const skillAttemptsMap = new Map<string, { first: number; latest: number; name: string }>();
    completedAttempts.forEach((att) => {
      const sId = att.skillId?.toString();
      if (!sId) return;
      if (!skillAttemptsMap.has(sId)) {
        const matchingSkill = evaluatedSkillDetails.find((s: any) => s.skillId?.toString() === sId);
        skillAttemptsMap.set(sId, {
          first: att.percentage || 0,
          latest: att.percentage || 0,
          name: matchingSkill?.name || 'Skill',
        });
      } else {
        const data = skillAttemptsMap.get(sId)!;
        data.first = att.percentage || 0; // oldest because attempts are sorted createdAt: -1
      }
    });

    const skillImprovements: SkillImprovementDelta[] = [];
    skillAttemptsMap.forEach((val, sId) => {
      const delta = val.latest - val.first;
      if (delta > 0) {
        skillImprovements.push({
          skillId: sId,
          skillName: val.name,
          initialProficiency: val.first,
          currentProficiency: val.latest,
          changePoints: delta,
          source: 'ASSESSMENT',
        });
      }
    });

    // Evaluate & unlock achievements
    await this.evaluateAchievements(userId, {
      completedAssessmentsCount: completedAttempts.length,
      roadmapProgress: roadmapProgressScore,
      studyStreakDays: studyPlan?.streakDays || 0,
      readinessScore: overallReadinessScore,
    });

    const unlockedAchievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    // AI Progress Insights
    const aiInsightInput = {
      careerRoleName: careerRole.name,
      readinessScore: overallReadinessScore,
      readinessCategory,
      skillReadinessScore,
      assessmentReadinessScore,
      roadmapProgressScore,
      studyConsistencyScore,
      topGapSkillName: biggestGaps[0]?.name,
      topGapSize: biggestGaps[0]?.gap,
      topStrongSkillName: strongestSkills[0]?.name,
    };

    const aiInsights = await aiReadinessService.generateReadinessSummary(aiInsightInput);

    // Save snapshot if not taken today
    await this.recordSnapshotIfDue(userId, user.targetCareerRoleId, careerRole.name, {
      readinessScore: overallReadinessScore,
      readinessCategory,
      skillReadinessScore,
      assessmentReadinessScore,
      roadmapProgressScore,
      studyConsistencyScore,
    });

    const historySnapshots = await ReadinessSnapshot.find({
      userId,
      targetCareerRoleId: user.targetCareerRoleId,
    })
      .sort({ snapshotDate: 1 })
      .limit(30);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: careerRole.name,
        targetCareerRoleId: careerRole._id,
      },
      careerRole: {
        id: careerRole._id,
        name: careerRole.name,
        category: careerRole.category,
      },
      readinessScore: overallReadinessScore,
      readinessCategory,
      dimensions: {
        skillReadiness: skillReadinessScore,
        assessmentPerformance: assessmentReadinessScore,
        roadmapProgress: roadmapProgressScore,
        studyConsistency: studyConsistencyScore,
      },
      biggestGaps,
      strongestSkills,
      unassessedSkills,
      skillImprovements,
      achievements: unlockedAchievements,
      history: historySnapshots,
      aiSummary: aiInsights.summary,
      aiInsight: aiInsights.insight,
      nextActionExplanation: aiInsights.nextActionExplanation,
      isAiGenerated: aiInsights.isAiGenerated,
      adaptiveRecommendations: adaptiveData?.recommendations || [],
    };
  }

  async getReadinessHistory(userId: string): Promise<any[]> {
    const user: any = await User.findById(userId);
    if (!user || !user.targetCareerRoleId) return [];

    return ReadinessSnapshot.find({
      userId,
      targetCareerRoleId: user.targetCareerRoleId,
    })
      .sort({ snapshotDate: 1 })
      .limit(30);
  }

  async getAchievements(userId: string): Promise<any[]> {
    return Achievement.find({ userId }).sort({ unlockedAt: -1 });
  }

  async refreshProgress(userId: string): Promise<any> {
    return this.getStudentProgress(userId);
  }

  private async evaluateAchievements(
    userId: string,
    metrics: {
      completedAssessmentsCount: number;
      roadmapProgress: number;
      studyStreakDays: number;
      readinessScore: number;
    }
  ): Promise<void> {
    const toUnlock: Array<{
      achievementType: string;
      title: string;
      description: string;
      icon: string;
      category: 'ASSESSMENT' | 'ROADMAP' | 'STUDY' | 'SKILL' | 'READINESS';
    }> = [];

    if (metrics.completedAssessmentsCount >= 1) {
      toUnlock.push({
        achievementType: 'FIRST_ASSESSMENT',
        title: 'First Skill Verified',
        description: 'Completed your first technical skill assessment.',
        icon: 'Award',
        category: 'ASSESSMENT',
      });
    }

    if (metrics.completedAssessmentsCount >= 5) {
      toUnlock.push({
        achievementType: 'ASSESSMENT_MASTER',
        title: 'Assessment Veteran',
        description: 'Completed 5+ technical skill assessments.',
        icon: 'Brain',
        category: 'ASSESSMENT',
      });
    }

    if (metrics.roadmapProgress >= 25) {
      toUnlock.push({
        achievementType: 'ROADMAP_25',
        title: 'Quarter Milestone',
        description: 'Completed 25% of your career learning roadmap.',
        icon: 'Compass',
        category: 'ROADMAP',
      });
    }

    if (metrics.roadmapProgress >= 50) {
      toUnlock.push({
        achievementType: 'ROADMAP_50',
        title: 'Halfway There',
        description: 'Completed 50% of your career learning roadmap.',
        icon: 'Layers',
        category: 'ROADMAP',
      });
    }

    if (metrics.roadmapProgress >= 75) {
      toUnlock.push({
        achievementType: 'ROADMAP_75',
        title: 'Advanced Scholar',
        description: 'Completed 75% of your career learning roadmap.',
        icon: 'Sparkles',
        category: 'ROADMAP',
      });
    }

    if (metrics.roadmapProgress >= 100) {
      toUnlock.push({
        achievementType: 'ROADMAP_100',
        title: 'Roadmap Mastered',
        description: 'Completed 100% of your career learning roadmap!',
        icon: 'CheckCircle2',
        category: 'ROADMAP',
      });
    }

    if (metrics.studyStreakDays >= 7) {
      toUnlock.push({
        achievementType: 'STUDY_STREAK_7',
        title: '7-Day Study Streak',
        description: 'Maintained active daily study consistency for a full week.',
        icon: 'Flame',
        category: 'STUDY',
      });
    }

    if (metrics.readinessScore >= 75) {
      toUnlock.push({
        achievementType: 'READINESS_75',
        title: 'Nearly Placement Ready',
        description: 'Achieved 75%+ overall career readiness index.',
        icon: 'TrendingUp',
        category: 'READINESS',
      });
    }

    if (metrics.readinessScore >= 90) {
      toUnlock.push({
        achievementType: 'READINESS_90',
        title: 'Placement Ready Champion',
        description: 'Achieved 90%+ career readiness score for your target role!',
        icon: 'Trophy',
        category: 'READINESS',
      });
    }

    for (const item of toUnlock) {
      await Achievement.updateOne(
        { userId, achievementType: item.achievementType },
        { $setOnInsert: { ...item, userId, unlockedAt: new Date() } },
        { upsert: true }
      );
    }
  }

  private async recordSnapshotIfDue(
    userId: string,
    targetCareerRoleId: any,
    careerRoleName: string,
    metrics: {
      readinessScore: number;
      readinessCategory: any;
      skillReadinessScore: number;
      assessmentReadinessScore: number;
      roadmapProgressScore: number;
      studyConsistencyScore: number;
    }
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await ReadinessSnapshot.findOne({
      userId,
      targetCareerRoleId,
      snapshotDate: { $gte: today },
    });

    if (existingToday) {
      existingToday.readinessScore = metrics.readinessScore;
      existingToday.readinessCategory = metrics.readinessCategory;
      existingToday.skillReadinessScore = metrics.skillReadinessScore;
      existingToday.assessmentReadinessScore = metrics.assessmentReadinessScore;
      existingToday.roadmapProgressScore = metrics.roadmapProgressScore;
      existingToday.studyConsistencyScore = metrics.studyConsistencyScore;
      await existingToday.save();
    } else {
      await ReadinessSnapshot.create({
        userId,
        targetCareerRoleId,
        careerRoleName,
        readinessScore: metrics.readinessScore,
        readinessCategory: metrics.readinessCategory,
        skillReadinessScore: metrics.skillReadinessScore,
        assessmentReadinessScore: metrics.assessmentReadinessScore,
        roadmapProgressScore: metrics.roadmapProgressScore,
        studyConsistencyScore: metrics.studyConsistencyScore,
        snapshotDate: new Date(),
      });
    }
  }

  async getStudentTimeline(userId: string, options: TimelineQueryOptions = {}): Promise<any> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const category = (options.category || 'ALL').toUpperCase();
    const dateFilter = (options.dateFilter || 'ALL_TIME').toUpperCase();
    const sort = (options.sort || 'DESC').toUpperCase() as 'DESC' | 'ASC';

    const user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    const events: any[] = [];

    // 1. Profile Events
    if (user.createdAt) {
      events.push({
        id: `profile-${user._id}`,
        eventType: 'PROFILE_COMPLETED',
        category: 'CAREER',
        title: 'Profile Completed',
        description: 'Completed initial SkillTrack profile setup.',
        timestamp: user.createdAt,
        sourceId: user._id.toString(),
        metadata: {
          completion: user.profileCompletion || 100,
        },
      });
    }

    if (user.targetRole) {
      events.push({
        id: `goal-set-${user._id}`,
        eventType: 'CAREER_GOAL_SET',
        category: 'CAREER',
        title: 'Career Goal Set',
        description: `Set target career goal to ${user.targetRole}.`,
        timestamp: user.createdAt || user.updatedAt,
        sourceId: user._id.toString(),
        metadata: {
          roleName: user.targetRole,
        },
      });
    }

    // 2. Assessment & Skill Improved Events
    const attempts = await AssessmentAttempt.find({ userId, status: 'COMPLETED' })
      .populate('skillId', 'name category')
      .sort({ createdAt: 1 });

    const skillScoreHistory = new Map<string, number>();

    attempts.forEach((attempt: any) => {
      const skillName = attempt.skillId?.name || 'Technical Skill';
      const skillIdStr = attempt.skillId?._id?.toString() || attempt.skillId?.toString() || 'unknown';
      const score = attempt.percentage || 0;
      const accuracy = attempt.totalQuestions > 0
        ? Math.round(((attempt.correctAnswers || 0) / attempt.totalQuestions) * 100)
        : score;
      const timestamp = attempt.submittedAt || attempt.createdAt;

      // Assessment Completed Event
      events.push({
        id: `assessment-${attempt._id}`,
        eventType: 'ASSESSMENT_COMPLETED',
        category: 'ASSESSMENT',
        title: `${skillName} Assessment Completed`,
        description: `Scored ${score}% with ${accuracy}% accuracy.`,
        timestamp,
        sourceId: attempt._id.toString(),
        metadata: {
          score,
          accuracy,
          proficiency: attempt.proficiency,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          skillName,
        },
      });

      // Check for Skill Improvement
      if (skillScoreHistory.has(skillIdStr)) {
        const previousScore = skillScoreHistory.get(skillIdStr)!;
        if (score > previousScore) {
          events.push({
            id: `skill-improved-${attempt._id}`,
            eventType: 'SKILL_IMPROVED',
            category: 'SKILL',
            title: `${skillName} Skill Improved`,
            description: `Proficiency increased from ${previousScore}% to ${score}%.`,
            timestamp,
            sourceId: attempt._id.toString(),
            metadata: {
              previousScore,
              newScore: score,
              skillName,
            },
          });
        }
      }
      skillScoreHistory.set(skillIdStr, score);
    });

    // 3. Learning Roadmap Topic Events
    const { LearningRoadmap } = await import('../models/learningRoadmap.model');
    const roadmaps = await LearningRoadmap.find({ userId });

    roadmaps.forEach((roadmap: any) => {
      roadmap.stages?.forEach((stage: any) => {
        stage.topics?.forEach((topic: any) => {
          if (topic.status === 'COMPLETED') {
            events.push({
              id: `topic-completed-${roadmap._id}-${topic.topicId}`,
              eventType: 'TOPIC_COMPLETED',
              category: 'LEARNING',
              title: 'Topic Completed',
              description: `Completed topic "${topic.title}" in ${topic.skillName || 'Roadmap'}.`,
              timestamp: topic.completedAt || roadmap.updatedAt || roadmap.createdAt,
              sourceId: `${roadmap._id}-${topic.topicId}`,
              metadata: {
                topicName: topic.title,
                skillName: topic.skillName,
                stageTitle: stage.title,
              },
            });
          } else if (topic.status === 'IN_PROGRESS') {
            events.push({
              id: `topic-started-${roadmap._id}-${topic.topicId}`,
              eventType: 'TOPIC_STARTED',
              category: 'LEARNING',
              title: 'Topic Started',
              description: `Began studying topic "${topic.title}" in ${topic.skillName || 'Roadmap'}.`,
              timestamp: roadmap.createdAt,
              sourceId: `${roadmap._id}-${topic.topicId}`,
              metadata: {
                topicName: topic.title,
                skillName: topic.skillName,
                stageTitle: stage.title,
              },
            });
          }
        });
      });
    });

    // 4. Study Plan Task Events
    const { StudyPlan } = await import('../models/studyPlan.model');
    const studyPlans = await StudyPlan.find({ userId });

    studyPlans.forEach((plan: any) => {
      plan.days?.forEach((day: any) => {
        day.tasks?.forEach((task: any) => {
          if (task.status === 'COMPLETED') {
            events.push({
              id: `study-task-${plan._id}-${task.taskId}`,
              eventType: 'STUDY_PLAN_COMPLETED',
              category: 'LEARNING',
              title: 'Study Plan Task Completed',
              description: `Completed task "${task.title}" (${task.skillName}).`,
              timestamp: task.completedAt || plan.updatedAt || plan.createdAt,
              sourceId: `${plan._id}-${task.taskId}`,
              metadata: {
                taskTitle: task.title,
                skillName: task.skillName,
                durationMinutes: task.durationMinutes,
              },
            });
          }
        });
      });
    });

    // 5. Achievements Events
    const achievements = await Achievement.find({ userId });
    achievements.forEach((ach: any) => {
      events.push({
        id: `achievement-${ach._id}`,
        eventType: 'ACHIEVEMENT_UNLOCKED',
        category: 'ACHIEVEMENT',
        title: 'Achievement Unlocked',
        description: `🏆 ${ach.title}: ${ach.description}`,
        timestamp: ach.unlockedAt || ach.createdAt,
        sourceId: ach._id.toString(),
        metadata: {
          achievementType: ach.achievementType,
          category: ach.category,
          icon: ach.icon,
        },
      });
    });

    // 7. Goal & Milestone Events
    try {
      const { Goal } = await import('../models/goal.model');
      const userGoals = await Goal.find({ userId });
      userGoals.forEach((goal: any) => {
        events.push({
          id: `goal-created-${goal._id}`,
          eventType: 'GOAL_CREATED',
          category: 'CAREER',
          title: 'Preparation Goal Created',
          description: `Set goal: "${goal.title}"`,
          timestamp: goal.createdAt,
          sourceId: goal._id.toString(),
          metadata: {
            goalTitle: goal.title,
            category: goal.category,
          },
        });

        if (goal.status === 'COMPLETED') {
          events.push({
            id: `goal-completed-${goal._id}`,
            eventType: 'GOAL_COMPLETED',
            category: 'CAREER',
            title: 'Goal Milestone Achieved',
            description: `Successfully completed goal: "${goal.title}"`,
            timestamp: goal.completedAt || goal.updatedAt,
            sourceId: goal._id.toString(),
            metadata: {
              goalTitle: goal.title,
            },
          });
        }

        goal.milestones?.forEach((ms: any) => {
          if (ms.status === 'COMPLETED') {
            events.push({
              id: `milestone-${goal._id}-${ms.milestoneId}`,
              eventType: 'MILESTONE_COMPLETED',
              category: 'CAREER',
              title: 'Milestone Completed',
              description: `Completed "${ms.title}" in goal "${goal.title}"`,
              timestamp: ms.completedAt || goal.updatedAt,
              sourceId: `${goal._id}-${ms.milestoneId}`,
              metadata: {
                milestoneTitle: ms.title,
                goalTitle: goal.title,
              },
            });
          }
        });
      });
    } catch (e) {
      // Goal integration fallback
    }

    // Compute Hero Summary (from baseline all-events)
    const heroSummary = {
      totalActivities: events.length,
      assessmentsCompleted: events.filter(e => e.eventType === 'ASSESSMENT_COMPLETED').length,
      topicsCompleted: events.filter(e => e.eventType === 'TOPIC_COMPLETED').length,
      skillsImproved: events.filter(e => e.eventType === 'SKILL_IMPROVED').length,
      careerMilestones: events.filter(e =>
        ['CAREER_GOAL_SET', 'CAREER_GOAL_CHANGED', 'CAREER_OUTCOME_CREATED', 'CAREER_OUTCOME_SUBMITTED', 'CAREER_OUTCOME_VERIFIED'].includes(e.eventType)
      ).length,
    };

    // Filter by Category
    let filteredEvents = events;
    if (category !== 'ALL') {
      filteredEvents = filteredEvents.filter(e => e.category === category);
    }

    // Filter by Date
    const now = new Date();
    if (dateFilter === 'THIS_WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= weekAgo);
    } else if (dateFilter === 'THIS_MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= monthAgo);
    } else if (dateFilter === 'LAST_3_MONTHS') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= threeMonthsAgo);
    }

    // Sort Events
    filteredEvents.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sort === 'ASC' ? timeA - timeB : timeB - timeA;
    });

    // Server-side Pagination
    const totalEvents = filteredEvents.length;
    const totalPages = Math.ceil(totalEvents / limit) || 1;
    const validPage = Math.min(page, totalPages);
    const startIndex = (validPage - 1) * limit;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + limit);

    return {
      events: paginatedEvents,
      pagination: {
        totalEvents,
        page: validPage,
        limit,
        totalPages,
        hasMore: validPage < totalPages,
      },
      heroSummary,
    };
  }
}

export const progressService = new ProgressService();
