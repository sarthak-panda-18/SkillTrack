import mongoose, { Schema, Document } from 'mongoose';

export type GoalCategory =
  | 'SKILL'
  | 'LEARNING'
  | 'ASSESSMENT'
  | 'DSA'
  | 'PROJECT'
  | 'INTERVIEW'
  | 'STUDY'
  | 'CAREER';

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'ARCHIVED';

export type MilestoneType = 'AUTOMATIC' | 'MANUAL';

export type AutoProgressSource =
  | 'ASSESSMENT_COUNT'
  | 'LEARNING_TOPIC_COUNT'
  | 'STUDY_TASK_COUNT'
  | 'SKILL_PROFICIENCY'
  | 'MANUAL';

export interface IMilestone {
  milestoneId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  type: MilestoneType;
  autoSource?: AutoProgressSource;
  skillId?: mongoose.Types.ObjectId;
  skillName?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  currentValue: number;
  targetValue: number;
  unit: string;
  order: number;
  completedAt?: Date;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  careerRoleId?: mongoose.Types.ObjectId;
  careerRoleName?: string;
  templateId?: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  isSystemRecommended: boolean;
  progress: number; // 0 to 100
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  deadline?: Date;
  milestones: IMilestone[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    milestoneId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['SKILL', 'LEARNING', 'ASSESSMENT', 'DSA', 'PROJECT', 'INTERVIEW', 'STUDY', 'CAREER'],
      default: 'SKILL',
    },
    type: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL'],
      default: 'MANUAL',
    },
    autoSource: {
      type: String,
      enum: ['ASSESSMENT_COUNT', 'LEARNING_TOPIC_COUNT', 'STUDY_TASK_COUNT', 'SKILL_PROFICIENCY', 'MANUAL'],
      default: 'MANUAL',
    },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
    skillName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
      default: 'NOT_STARTED',
    },
    currentValue: { type: Number, default: 0 },
    targetValue: { type: Number, default: 1 },
    unit: { type: String, default: 'item' },
    order: { type: Number, default: 1 },
    completedAt: { type: Date },
  },
  { _id: false }
);

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', index: true },
    careerRoleName: { type: String, default: '' },
    templateId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['SKILL', 'LEARNING', 'ASSESSMENT', 'DSA', 'PROJECT', 'INTERVIEW', 'STUDY', 'CAREER'],
      default: 'SKILL',
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'ARCHIVED'],
      default: 'NOT_STARTED',
    },
    isSystemRecommended: { type: Boolean, default: false },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    currentValue: { type: Number, default: 0 },
    targetValue: { type: Number, default: 1 },
    unit: { type: String, default: 'item' },
    deadline: { type: Date },
    milestones: [milestoneSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, careerRoleId: 1 });
goalSchema.index({ userId: 1, templateId: 1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
