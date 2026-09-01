import { LearningRoadmap, ILearningRoadmap, IRoadmapStage, IRoadmapTopic } from '../models/learningRoadmap.model';
import { User } from '../models/user.model';
import { CareerRole } from '../models/careerRole.model';
import { skillGapService } from './skillGap.service';
import { aiRoadmapService } from './aiRoadmap.service';
import { ApiError } from '../utils/apiError';
import { notificationService } from './notification.service';

export class RoadmapService {
  async getStudentRoadmap(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    if (!user.targetCareerRoleId && !user.targetRole) {
      throw new ApiError(400, 'Please select a target career role in your profile before generating your roadmap.', 'TARGET_ROLE_REQUIRED');
    }

    // Find active roadmap for user matching current target career role
    let roadmap: any = await LearningRoadmap.findOne({
      userId,
      ...(user.targetCareerRoleId ? { careerRoleId: user.targetCareerRoleId } : {}),
      status: 'ACTIVE',
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      roadmap = await this.generateRoadmap(userId);
    }

    return roadmap;
  }

  async generateRoadmap(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    // Ensure Skill Gap Analysis is up to date
    const gapAnalysis = await skillGapService.getStudentSkillGap(userId);
    if (!gapAnalysis) {
      throw new ApiError(400, 'Skill gap analysis could not be calculated.');
    }

    // Archive previous active roadmaps for this user
    await LearningRoadmap.updateMany({ userId, status: 'ACTIVE' }, { $set: { status: 'ARCHIVED' } });

    // Generate new roadmap structure via AiRoadmapService
    const structure = await aiRoadmapService.generateRoadmapStructure(gapAnalysis);

    let totalTopics = 0;
    let totalHours = 0;
    structure.stages.forEach((st) => {
      totalTopics += st.topics.length;
      st.topics.forEach((tp) => {
        totalHours += tp.estimatedHours || 2;
      });
    });

    const roadmap = await LearningRoadmap.create({
      userId,
      careerRoleId: gapAnalysis.careerRoleId,
      careerRoleName: gapAnalysis.careerRoleName,
      title: structure.title,
      description: structure.description,
      status: 'ACTIVE',
      overallProgress: 0,
      completedTopicsCount: 0,
      totalTopicsCount: totalTopics,
      estimatedTotalHours: totalHours,
      generatedAt: new Date(),
      roadmapVersion: '3.4.0',
      aiSummary: structure.aiSummary,
      stages: structure.stages,
    });

    return roadmap;
  }

  async regenerateRoadmap(userId: string): Promise<any> {
    const existingActive = await LearningRoadmap.findOne({ userId, status: 'ACTIVE' });
    
    // Collect completed topic titles to preserve progress
    const completedTopicMap = new Map<string, Date>();
    if (existingActive) {
      existingActive.stages.forEach((st) => {
        st.topics.forEach((tp) => {
          if (tp.status === 'COMPLETED' || tp.progress === 100) {
            completedTopicMap.set(tp.title.toLowerCase().trim(), tp.completedAt || new Date());
          }
        });
      });
    }

    const newRoadmap = await this.generateRoadmap(userId);

    // Apply preserved progress to matching topics
    if (completedTopicMap.size > 0 && newRoadmap.stages) {
      newRoadmap.stages.forEach((st: any) => {
        st.topics.forEach((tp: any) => {
          const key = tp.title.toLowerCase().trim();
          if (completedTopicMap.has(key)) {
            tp.progress = 100;
            tp.status = 'COMPLETED';
            tp.completedAt = completedTopicMap.get(key);
          }
        });
      });

      // Re-evaluate initial statuses & progress
      const reEvaluated = aiRoadmapService.evaluateInitialStatuses(newRoadmap.stages);
      newRoadmap.stages = reEvaluated;

      // Recalculate total progress
      this.recalculateRoadmapProgress(newRoadmap);
      await newRoadmap.save();
    }

    return newRoadmap;
  }

  async updateTopicProgress(userId: string, topicId: string, progress: number): Promise<any> {
    const roadmap = await LearningRoadmap.findOne({ userId, status: 'ACTIVE' });
    if (!roadmap) throw new ApiError(404, 'Active learning roadmap not found.');

    const targetProgress = Math.max(0, Math.min(100, progress));
    let topicFound = false;

    for (const stage of roadmap.stages) {
      for (const topic of stage.topics) {
        if (topic.topicId === topicId) {
          topicFound = true;
          topic.progress = targetProgress;

          if (targetProgress === 100) {
            topic.status = 'COMPLETED';
            topic.completedAt = new Date();

            notificationService.createNotification({
              userId,
              type: 'LEARNING_COMPLETED',
              title: 'Learning Milestone Completed! 🎓',
              message: `Great job! You completed "${topic.title}".`,
              link: '/learning',
              entityId: topic.topicId,
              emailData: {
                topicTitle: topic.title,
                percentage: 100,
                skillsCovered: topic.skillName ? [topic.skillName] : [],
              },
            });
          } else if (targetProgress > 0) {
            topic.status = 'IN_PROGRESS';
          } else {
            topic.status = 'AVAILABLE';
          }
          break;
        }
      }
      if (topicFound) break;
    }

    if (!topicFound) {
      throw new ApiError(404, 'Topic not found in active roadmap.');
    }

    // Re-evaluate initial statuses & unlock downstream topics
    const reEvaluated = aiRoadmapService.evaluateInitialStatuses(roadmap.stages);
    roadmap.stages = reEvaluated;

    // Recalculate stage and overall progress
    this.recalculateRoadmapProgress(roadmap);
    await roadmap.save();

    return roadmap;
  }

  async completeTopic(userId: string, topicId: string): Promise<any> {
    return this.updateTopicProgress(userId, topicId, 100);
  }

  async getTopicResource(userId: string, topicId: string): Promise<any> {
    const roadmap = await LearningRoadmap.findOne({ userId, status: 'ACTIVE' });
    if (!roadmap) throw new ApiError(404, 'Active learning roadmap not found.');

    let targetTopic: any = null;
    for (const stage of roadmap.stages) {
      for (const topic of stage.topics) {
        if (topic.topicId === topicId) {
          targetTopic = topic;
          break;
        }
      }
      if (targetTopic) break;
    }

    if (!targetTopic) {
      throw new ApiError(404, 'Topic not found in active roadmap.');
    }

    // Auto-mark status as IN_PROGRESS if currently AVAILABLE
    if (targetTopic.status === 'AVAILABLE') {
      targetTopic.status = 'IN_PROGRESS';
      if (targetTopic.progress === 0) {
        targetTopic.progress = 25;
      }
      roadmap.stages = aiRoadmapService.evaluateInitialStatuses(roadmap.stages);
      this.recalculateRoadmapProgress(roadmap);
    }

    // Check if valid cached resource exists
    if (targetTopic.learningResource && targetTopic.learningResource.url) {
      await roadmap.save();
      return {
        topic: targetTopic,
        learningResource: targetTopic.learningResource,
      };
    }

    // Search and rank YouTube video resource
    const { youtubeResourceService } = await import('./youtubeResource.service');
    const resource = await youtubeResourceService.searchTopicVideo(
      targetTopic.title,
      targetTopic.skillName,
      roadmap.careerRoleName,
      targetTopic.resourceHistory || []
    );

    targetTopic.learningResource = resource;
    if (resource.videoId) {
      if (!targetTopic.resourceHistory) targetTopic.resourceHistory = [];
      if (!targetTopic.resourceHistory.includes(resource.videoId)) {
        targetTopic.resourceHistory.push(resource.videoId);
      }
    }

    await roadmap.save();
    return {
      topic: targetTopic,
      learningResource: resource,
    };
  }

  async refreshTopicResource(userId: string, topicId: string): Promise<any> {
    const roadmap = await LearningRoadmap.findOne({ userId, status: 'ACTIVE' });
    if (!roadmap) throw new ApiError(404, 'Active learning roadmap not found.');

    let targetTopic: any = null;
    for (const stage of roadmap.stages) {
      for (const topic of stage.topics) {
        if (topic.topicId === topicId) {
          targetTopic = topic;
          break;
        }
      }
      if (targetTopic) break;
    }

    if (!targetTopic) {
      throw new ApiError(404, 'Topic not found in active roadmap.');
    }

    const currentVideoId = targetTopic.learningResource?.videoId;
    const history = targetTopic.resourceHistory || [];
    if (currentVideoId && !history.includes(currentVideoId)) {
      history.push(currentVideoId);
    }

    const { youtubeResourceService } = await import('./youtubeResource.service');
    const newResource = await youtubeResourceService.searchTopicVideo(
      targetTopic.title,
      targetTopic.skillName,
      roadmap.careerRoleName,
      history
    );

    targetTopic.learningResource = newResource;
    if (newResource.videoId && !history.includes(newResource.videoId)) {
      history.push(newResource.videoId);
    }
    targetTopic.resourceHistory = history;

    await roadmap.save();
    return {
      topic: targetTopic,
      learningResource: newResource,
    };
  }

  private recalculateRoadmapProgress(roadmap: ILearningRoadmap): void {
    let completedCount = 0;
    let totalCount = 0;

    roadmap.stages.forEach((stage) => {
      let stageCompleted = 0;
      stage.topics.forEach((topic) => {
        totalCount++;
        if (topic.status === 'COMPLETED' || topic.progress === 100) {
          completedCount++;
          stageCompleted++;
        }
      });
      stage.progress = Math.round((stageCompleted / (stage.topics.length || 1)) * 100);
      if (stage.progress === 100) stage.status = 'COMPLETED';
      else if (stage.progress > 0) stage.status = 'IN_PROGRESS';
    });

    roadmap.completedTopicsCount = completedCount;
    roadmap.totalTopicsCount = totalCount;
    roadmap.overallProgress = Math.round((completedCount / (totalCount || 1)) * 100);

    if (roadmap.overallProgress === 100) {
      roadmap.status = 'COMPLETED';
    }
  }
}

export const roadmapService = new RoadmapService();
