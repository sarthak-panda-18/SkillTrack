import {
  AdaptiveLearningState,
  AdaptiveRecommendation,
  IAdaptiveLearningState,
  IAdaptiveRecommendation,
  ISkillTrendItem,
} from '../models/adaptiveLearning.model';
import { AssessmentAttempt } from '../models/assessmentAttempt.model';
import { User } from '../models/user.model';
import { userService } from './user.service';
import { roadmapService } from './roadmap.service';
import { skillGapService } from './skillGap.service';
import { studyPlanService } from './studyPlan.service';
import { aiAdaptiveService, AdaptiveAnalysisInput } from './aiAdaptive.service';
import { ApiError } from '../utils/apiError';

export class AdaptiveService {
  async getAdaptiveState(userId: string): Promise<{
    state: any;
    recommendations: any[];
  }> {
    let user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    // Ensure targetCareerRoleId is resolved
    user = await userService.ensureTargetCareerRoleId(user);

    if (!user || !user.targetCareerRoleId) {
      throw new ApiError(
        400,
        'Please select a target career role in your profile to activate Adaptive Intelligence.',
        'TARGET_ROLE_REQUIRED'
      );
    }

    let state: any = await AdaptiveLearningState.findOne({
      userId,
      careerRoleId: user.targetCareerRoleId,
    });

    if (!state) {
      state = await this.analyzeProgress(userId);
    }

    const recommendations = await AdaptiveRecommendation.find({
      userId,
      careerRoleId: user.targetCareerRoleId,
      status: { $in: ['NEW', 'VIEWED', 'ACCEPTED'] },
    }).sort({ priority: 1, createdAt: -1 });

    return { state, recommendations };
  }

  async analyzeProgress(userId: string): Promise<any> {
    let user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    // Ensure targetCareerRoleId is resolved
    user = await userService.ensureTargetCareerRoleId(user);

    if (!user || !user.targetCareerRoleId) {
      throw new ApiError(
        400,
        'Please select a target career role in your profile before running adaptive analysis.',
        'TARGET_ROLE_REQUIRED'
      );
    }

    let gapAnalysis: any = null;
    try {
      gapAnalysis = await skillGapService.getStudentSkillGap(userId);
    } catch (err: any) {
      console.warn('[AdaptiveService] Skill gap analysis missing or failed:', err?.message);
      if (err instanceof ApiError && err.code === 'TARGET_ROLE_REQUIRED') {
        throw err;
      }
      throw new ApiError(
        400,
        'Skill gap analysis required. Please calculate your Skill Gap first.',
        'SKILL_GAP_REQUIRED'
      );
    }

    if (!gapAnalysis) {
      throw new ApiError(
        400,
        'Skill gap analysis not found. Please calculate your Skill Gap first.',
        'SKILL_GAP_REQUIRED'
      );
    }

    let roadmap: any = null;
    try {
      roadmap = await roadmapService.getStudentRoadmap(userId);
    } catch (err: any) {
      console.warn('[AdaptiveService] Learning roadmap missing or optional:', err?.message);
    }

    let studyPlan: any = null;
    try {
      studyPlan = await studyPlanService.getStudentStudyPlan(userId);
    } catch (err: any) {
      console.warn('[AdaptiveService] Study plan missing or optional:', err?.message);
    }

    // Aggregate completed assessment attempts by skill
    const attempts = await AssessmentAttempt.find({ userId, status: 'COMPLETED' }).sort({ createdAt: 1 });

    const skillAttemptsMap = new Map<string, { scores: number[] }>();
    attempts.forEach((att) => {
      if (att.skillId) {
        const sId = att.skillId.toString();
        if (!skillAttemptsMap.has(sId)) {
          skillAttemptsMap.set(sId, { scores: [] });
        }
        skillAttemptsMap.get(sId)!.scores.push(att.percentage || 0);
      }
    });

    let improvingCount = 0;
    let stableCount = 0;
    let decliningCount = 0;
    let insufficientCount = 0;
    let totalVelocity = 0;
    let velocityCount = 0;

    // Process skill trends matching gap analysis skills safely
    const skillList = gapAnalysis.skills || gapAnalysis.skillMatrix || [];
    const trends: ISkillTrendItem[] = skillList.map((item: any) => {
      const sId = item.skillId ? item.skillId.toString() : '';
      const attData = sId ? skillAttemptsMap.get(sId) : undefined;
      const scores = attData?.scores || [];
      const count = scores.length;
      let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
      let changePoints = 0;
      let latestScore: number | undefined = undefined;

      if (count >= 2) {
        latestScore = scores[scores.length - 1];
        const prevScore = scores[scores.length - 2];
        changePoints = latestScore - prevScore;

        if (changePoints >= 5) {
          trend = 'IMPROVING';
          improvingCount++;
          totalVelocity += changePoints;
          velocityCount++;
        } else if (changePoints <= -5) {
          trend = 'DECLINING';
          decliningCount++;
        } else {
          trend = 'STABLE';
          stableCount++;
        }
      } else if (count === 1) {
        latestScore = scores[0];
        trend = 'INSUFFICIENT_DATA';
        insufficientCount++;
      } else {
        trend = 'INSUFFICIENT_DATA';
        insufficientCount++;
      }

      return {
        skillId: item.skillId as any,
        skillName: item.name || 'Skill',
        currentProficiency: item.currentProficiency || 0,
        targetProficiency: item.recommendedProficiency || item.requiredProficiency || 80,
        gap: item.gap || 0,
        trend,
        assessmentCount: count,
        scoreHistory: scores,
        latestScore,
        changePoints,
      };
    });

    const roadmapProgress = roadmap?.overallProgress || 0;
    const completedTopics = roadmap?.completedTopicsCount || 0;
    const totalTopics = roadmap?.totalTopicsCount || 0;

    const studyConsistency = studyPlan?.overallProgress || 0;
    const completedMins = studyPlan?.completedMinutes || 0;
    const plannedMins = studyPlan?.totalPlannedMinutes || 0;

    const estimatedVelocity = velocityCount > 0 ? parseFloat((totalVelocity / velocityCount).toFixed(1)) : 0;

    // Call AiAdaptiveService for summary and recommendations
    const analysisInput: AdaptiveAnalysisInput = {
      careerRoleName: gapAnalysis.careerRoleName || user.targetRole || 'Software Engineering Role',
      trends,
      overallRoadmapProgress: roadmapProgress,
      completedTopicsCount: completedTopics,
      totalTopicsCount: totalTopics,
      studyConsistencyPercentage: studyConsistency,
      completedStudyMins: completedMins,
      totalPlannedStudyMins: plannedMins,
    };

    const aiResult = await aiAdaptiveService.generateAdaptiveInsights(analysisInput);

    // Save or update AdaptiveLearningState
    let state: any = await AdaptiveLearningState.findOne({
      userId,
      careerRoleId: gapAnalysis.careerRoleId,
    });

    if (!state) {
      state = new AdaptiveLearningState({
        userId,
        careerRoleId: gapAnalysis.careerRoleId,
        careerRoleName: gapAnalysis.careerRoleName || user.targetRole,
      });
    }

    state.careerRoleId = gapAnalysis.careerRoleId;
    state.careerRoleName = gapAnalysis.careerRoleName || user.targetRole;
    state.lastAnalyzedAt = new Date();
    state.skillsAnalyzedCount = trends.length;
    state.improvingCount = improvingCount;
    state.stableCount = stableCount;
    state.decliningCount = decliningCount;
    state.insufficientDataCount = insufficientCount;
    state.estimatedLearningVelocity = estimatedVelocity;
    state.studyConsistencyPercentage = studyConsistency;
    state.aiSummary = aiResult.aiSummary;
    state.trends = trends;
    state.lastAssessmentCount = attempts.length;
    state.lastCompletedTopicsCount = completedTopics;
    state.lastCompletedStudyMins = completedMins;
    await state.save();

    // Mark previous NEW recommendations for different career roles as STALE
    await AdaptiveRecommendation.updateMany(
      { userId, careerRoleId: { $ne: gapAnalysis.careerRoleId }, status: 'NEW' },
      { $set: { status: 'STALE' } }
    );

    // Insert new recommendations
    for (const rec of aiResult.recommendations) {
      const matchSkill = trends.find(
        (t) => t.skillName.toLowerCase() === (rec.skillName || '').toLowerCase()
      );

      await AdaptiveRecommendation.create({
        userId,
        careerRoleId: gapAnalysis.careerRoleId,
        type: rec.type,
        skillId: matchSkill?.skillId,
        skillName: rec.skillName || matchSkill?.skillName,
        priority: rec.priority || 'HIGH',
        title: rec.title,
        reason: rec.reason,
        actionLabel: rec.actionLabel || 'View Details',
        actionRoute: rec.actionRoute || '/learning',
        status: 'NEW',
      });
    }

    return state;
  }

  async updateRecommendationStatus(
    userId: string,
    recommendationId: string,
    status: 'ACCEPTED' | 'DISMISSED' | 'COMPLETED'
  ): Promise<any> {
    const rec = await AdaptiveRecommendation.findOne({ _id: recommendationId, userId });
    if (!rec) {
      throw new ApiError(404, 'Adaptive recommendation not found.');
    }

    rec.status = status;
    await rec.save();
    return rec;
  }
}

export const adaptiveService = new AdaptiveService();
