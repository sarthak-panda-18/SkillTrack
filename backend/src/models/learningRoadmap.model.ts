import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResource {
  provider: string; // 'YOUTUBE'
  videoId: string;
  url: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  score: number;
  fetchedAt: Date;
  fallbackSearchUrl?: string;
}

export interface IRoadmapTopic {
  topicId: string;
  skillId?: mongoose.Types.ObjectId;
  skillName: string;
  title: string;
  description: string;
  order: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // 0 to 100
  prerequisites: string[]; // array of topic titles or topicIds
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  completedAt?: Date;
  learningResource?: ILearningResource;
  resourceHistory?: string[];
}

export interface IRoadmapStage {
  stageId: string;
  title: string;
  description: string;
  order: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number; // 0 to 100
  estimatedHours: number;
  topics: IRoadmapTopic[];
}

export interface ILearningRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  careerRoleId: mongoose.Types.ObjectId;
  careerRoleName: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  overallProgress: number; // 0 to 100
  completedTopicsCount: number;
  totalTopicsCount: number;
  estimatedTotalHours: number;
  generatedAt: Date;
  roadmapVersion: string;
  aiSummary: string;
  stages: IRoadmapStage[];
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<IRoadmapTopic>(
  {
    topicId: { type: String, required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
    skillName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    estimatedHours: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'],
      default: 'LOCKED',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    prerequisites: [{ type: String }],
    importance: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    reason: { type: String, default: '' },
    completedAt: { type: Date },
    learningResource: {
      provider: { type: String, default: 'YOUTUBE' },
      videoId: { type: String },
      url: { type: String },
      title: { type: String },
      channelName: { type: String },
      thumbnail: { type: String },
      duration: { type: String },
      viewCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      fetchedAt: { type: Date, default: Date.now },
      fallbackSearchUrl: { type: String },
    },
    resourceHistory: [{ type: String }],
  },
  { _id: false }
);

const stageSchema = new Schema<IRoadmapStage>(
  {
    stageId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'],
      default: 'LOCKED',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    estimatedHours: { type: Number, default: 10 },
    topics: [topicSchema],
  },
  { _id: false }
);

const learningRoadmapSchema = new Schema<ILearningRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    careerRoleName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    completedTopicsCount: { type: Number, default: 0 },
    totalTopicsCount: { type: Number, default: 0 },
    estimatedTotalHours: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
    roadmapVersion: { type: String, default: '3.4.0' },
    aiSummary: { type: String, default: '' },
    stages: [stageSchema],
  },
  { timestamps: true }
);

learningRoadmapSchema.index({ userId: 1, careerRoleId: 1, status: 1 });

export const LearningRoadmap = mongoose.model<ILearningRoadmap>(
  'LearningRoadmap',
  learningRoadmapSchema
);
