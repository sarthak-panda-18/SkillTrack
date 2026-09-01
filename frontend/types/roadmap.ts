export interface LearningResource {
  provider: string;
  videoId: string;
  url: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  score: number;
  fetchedAt?: string;
  fallbackSearchUrl?: string;
}

export interface RoadmapTopic {
  topicId: string;
  skillId?: string;
  skillName: string;
  title: string;
  description: string;
  order: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // 0 to 100
  prerequisites: string[];
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  completedAt?: string;
  learningResource?: LearningResource;
  resourceHistory?: string[];
}

export interface RoadmapStage {
  stageId: string;
  title: string;
  description: string;
  order: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // 0 to 100
  estimatedHours: number;
  topics: RoadmapTopic[];
}

export interface LearningRoadmap {
  _id: string;
  userId: string;
  careerRoleId: string;
  careerRoleName: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  overallProgress: number; // 0 to 100
  completedTopicsCount: number;
  totalTopicsCount: number;
  estimatedTotalHours: number;
  generatedAt: string;
  roadmapVersion: string;
  aiSummary: string;
  stages: RoadmapStage[];
}
