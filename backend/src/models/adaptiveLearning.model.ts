import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillTrendItem {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  currentProficiency: number;
  targetProficiency: number;
  gap: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  assessmentCount: number;
  scoreHistory: number[];
  latestScore?: number;
  changePoints: number; // e.g. +15 or -10
}

export interface IAdaptiveRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  careerRoleId: mongoose.Types.ObjectId;
  type:
    | 'FOCUS_MORE'
    | 'FOCUS_LESS'
    | 'REVISE'
    | 'PRACTICE_MORE'
    | 'REASSESS'
    | 'CONTINUE'
    | 'ADVANCE'
    | 'RESCHEDULE'
    | 'REDUCE_WORKLOAD'
    | 'GENERATE_NEW_PLAN';
  skillId?: mongoose.Types.ObjectId;
  skillName?: string;
  roadmapTopicId?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  actionLabel: string;
  actionRoute: string;
  status: 'NEW' | 'VIEWED' | 'ACCEPTED' | 'DISMISSED' | 'COMPLETED' | 'STALE';
  createdAt: Date;
  expiresAt?: Date;
}

export interface IAdaptiveLearningState extends Document {
  userId: mongoose.Types.ObjectId;
  careerRoleId: mongoose.Types.ObjectId;
  careerRoleName: string;
  lastAnalyzedAt: Date;
  analysisVersion: string;
  skillsAnalyzedCount: number;
  improvingCount: number;
  stableCount: number;
  decliningCount: number;
  insufficientDataCount: number;
  estimatedLearningVelocity: number; // e.g. +5.5 points / week
  studyConsistencyPercentage: number; // 0 to 100
  aiSummary: string;
  trends: ISkillTrendItem[];
  lastAssessmentCount: number;
  lastCompletedTopicsCount: number;
  lastCompletedStudyMins: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillTrendSchema = new Schema<ISkillTrendItem>(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    skillName: { type: String, required: true },
    currentProficiency: { type: Number, required: true, default: 0 },
    targetProficiency: { type: Number, required: true, default: 80 },
    gap: { type: Number, required: true, default: 0 },
    trend: {
      type: String,
      enum: ['IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA'],
      default: 'INSUFFICIENT_DATA',
    },
    assessmentCount: { type: Number, default: 0 },
    scoreHistory: [{ type: Number }],
    latestScore: { type: Number },
    changePoints: { type: Number, default: 0 },
  },
  { _id: false }
);

const recommendationSchema = new Schema<IAdaptiveRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    type: {
      type: String,
      enum: [
        'FOCUS_MORE',
        'FOCUS_LESS',
        'REVISE',
        'PRACTICE_MORE',
        'REASSESS',
        'CONTINUE',
        'ADVANCE',
        'RESCHEDULE',
        'REDUCE_WORKLOAD',
        'GENERATE_NEW_PLAN',
      ],
      required: true,
    },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
    skillName: { type: String },
    roadmapTopicId: { type: String },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    actionLabel: { type: String, default: 'View Details' },
    actionRoute: { type: String, default: '/learning' },
    status: {
      type: String,
      enum: ['NEW', 'VIEWED', 'ACCEPTED', 'DISMISSED', 'COMPLETED', 'STALE'],
      default: 'NEW',
      index: true,
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const adaptiveLearningStateSchema = new Schema<IAdaptiveLearningState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    careerRoleName: { type: String, required: true },
    lastAnalyzedAt: { type: Date, default: Date.now },
    analysisVersion: { type: String, default: '3.6.0' },
    skillsAnalyzedCount: { type: Number, default: 0 },
    improvingCount: { type: Number, default: 0 },
    stableCount: { type: Number, default: 0 },
    decliningCount: { type: Number, default: 0 },
    insufficientDataCount: { type: Number, default: 0 },
    estimatedLearningVelocity: { type: Number, default: 0 },
    studyConsistencyPercentage: { type: Number, default: 0 },
    aiSummary: { type: String, default: '' },
    trends: [skillTrendSchema],
    lastAssessmentCount: { type: Number, default: 0 },
    lastCompletedTopicsCount: { type: Number, default: 0 },
    lastCompletedStudyMins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AdaptiveRecommendation = mongoose.model<IAdaptiveRecommendation>(
  'AdaptiveRecommendation',
  recommendationSchema
);

export const AdaptiveLearningState = mongoose.model<IAdaptiveLearningState>(
  'AdaptiveLearningState',
  adaptiveLearningStateSchema
);
