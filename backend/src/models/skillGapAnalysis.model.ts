import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluatedSkill {
  skillId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  minimumProficiency: number;
  recommendedProficiency: number;
  currentProficiency: number;
  gap: number;
  status: 'STRONG' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_GAP' | 'UNASSESSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'ASSESSED' | 'SELF_REPORTED' | 'UNASSESSED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  latestAssessmentId?: mongoose.Types.ObjectId;
  latestAssessmentScore?: number;
  bestAssessmentScore?: number;
  topicPerformance?: Array<{ topic: string; percentage: number }>;
  trendImprovement?: number;
}

export interface ISkillGapAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  careerRoleId: mongoose.Types.ObjectId;
  careerRoleName: string;
  overallReadiness: number; // 0 to 100
  readinessLabel: 'READY' | 'NEARLY_READY' | 'DEVELOPING' | 'EARLY_STAGE';
  analyzedAt: Date;
  analysisVersion: string;
  skills: IEvaluatedSkill[];
  criticalGaps: IEvaluatedSkill[];
  needsImprovement: IEvaluatedSkill[];
  strongSkills: IEvaluatedSkill[];
  unassessedSkills: IEvaluatedSkill[];
  topPriorities: IEvaluatedSkill[];
  aiSummary: string;
  aiInsights: string[];
  aiRecommendations: Array<{ skillId: string; reason: string; priority: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const evaluatedSkillSchema = new Schema<IEvaluatedSkill>(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    importance: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    minimumProficiency: { type: Number, default: 50 },
    recommendedProficiency: { type: Number, default: 80 },
    currentProficiency: { type: Number, default: 0 },
    gap: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['STRONG', 'NEEDS_IMPROVEMENT', 'CRITICAL_GAP', 'UNASSESSED'],
      default: 'UNASSESSED',
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    source: {
      type: String,
      enum: ['ASSESSED', 'SELF_REPORTED', 'UNASSESSED'],
      default: 'UNASSESSED',
    },
    confidence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'LOW',
    },
    latestAssessmentId: { type: Schema.Types.ObjectId, ref: 'AssessmentAttempt' },
    latestAssessmentScore: { type: Number },
    bestAssessmentScore: { type: Number },
    topicPerformance: [
      {
        topic: { type: String },
        percentage: { type: Number },
      },
    ],
    trendImprovement: { type: Number, default: 0 },
  },
  { _id: false }
);

const skillGapAnalysisSchema = new Schema<ISkillGapAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    careerRoleName: { type: String, required: true },
    overallReadiness: { type: Number, required: true, min: 0, max: 100, default: 0 },
    readinessLabel: {
      type: String,
      enum: ['READY', 'NEARLY_READY', 'DEVELOPING', 'EARLY_STAGE'],
      default: 'EARLY_STAGE',
    },
    analyzedAt: { type: Date, default: Date.now },
    analysisVersion: { type: String, default: '3.3.0' },
    skills: [evaluatedSkillSchema],
    criticalGaps: [evaluatedSkillSchema],
    needsImprovement: [evaluatedSkillSchema],
    strongSkills: [evaluatedSkillSchema],
    unassessedSkills: [evaluatedSkillSchema],
    topPriorities: [evaluatedSkillSchema],
    aiSummary: { type: String, default: '' },
    aiInsights: [{ type: String }],
    aiRecommendations: [
      {
        skillId: { type: String },
        reason: { type: String },
        priority: { type: String },
      },
    ],
  },
  { timestamps: true }
);

skillGapAnalysisSchema.index({ userId: 1, careerRoleId: 1 });

export const SkillGapAnalysis = mongoose.model<ISkillGapAnalysis>(
  'SkillGapAnalysis',
  skillGapAnalysisSchema
);
