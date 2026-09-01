import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyTask {
  taskId: string;
  roadmapTopicId?: string;
  skillId?: mongoose.Types.ObjectId;
  skillName: string;
  type: 'LEARN' | 'PRACTICE' | 'REVISE' | 'ASSESS' | 'PROJECT' | 'REVIEW';
  title: string;
  description: string;
  durationMinutes: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  order: number;
  completedAt?: Date;
  rescheduledFrom?: Date;
}

export interface IStudyPlanDay {
  dayId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isRestDay: boolean;
  totalPlannedMinutes: number;
  completedMinutes: number;
  status: 'UPCOMING' | 'TODAY' | 'COMPLETED' | 'REST' | 'MISSED';
  tasks: IStudyTask[];
}

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  careerRoleId: mongoose.Types.ObjectId;
  careerRoleName: string;
  title: string;
  summary: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: Date;
  endDate: Date;
  dailyStudyMinutes: number;
  studyDays: string[];
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  studyIntensity: 'LIGHT' | 'BALANCED' | 'INTENSIVE';
  planDurationWeeks: number;
  overallProgress: number; // 0 to 100
  completedMinutes: number;
  totalPlannedMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  streakDays: number;
  studyPlanVersion: string;
  aiSummary: string;
  days: IStudyPlanDay[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<IStudyTask>(
  {
    taskId: { type: String, required: true },
    roadmapTopicId: { type: String },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
    skillName: { type: String, required: true },
    type: {
      type: String,
      enum: ['LEARN', 'PRACTICE', 'REVISE', 'ASSESS', 'PROJECT', 'REVIEW'],
      default: 'LEARN',
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    durationMinutes: { type: Number, default: 45, min: 5, max: 240 },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
      default: 'NOT_STARTED',
    },
    order: { type: Number, required: true },
    completedAt: { type: Date },
    rescheduledFrom: { type: Date },
  },
  { _id: false }
);

const daySchema = new Schema<IStudyPlanDay>(
  {
    dayId: { type: String, required: true },
    date: { type: String, required: true },
    dayOfWeek: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      required: true,
    },
    isRestDay: { type: Boolean, default: false },
    totalPlannedMinutes: { type: Number, default: 0 },
    completedMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['UPCOMING', 'TODAY', 'COMPLETED', 'REST', 'MISSED'],
      default: 'UPCOMING',
    },
    tasks: [taskSchema],
  },
  { _id: false }
);

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'LearningRoadmap', required: true, index: true },
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    careerRoleName: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dailyStudyMinutes: { type: Number, default: 120, min: 15, max: 480 },
    studyDays: [{ type: String }],
    preferredStudyTime: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'],
      default: 'EVENING',
    },
    studyIntensity: {
      type: String,
      enum: ['LIGHT', 'BALANCED', 'INTENSIVE'],
      default: 'BALANCED',
    },
    planDurationWeeks: { type: Number, default: 1, min: 1, max: 4 },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    completedMinutes: { type: Number, default: 0 },
    totalPlannedMinutes: { type: Number, default: 0 },
    completedTasksCount: { type: Number, default: 0 },
    totalTasksCount: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    studyPlanVersion: { type: String, default: '3.5.0' },
    aiSummary: { type: String, default: '' },
    days: [daySchema],
  },
  { timestamps: true }
);

studyPlanSchema.index({ userId: 1, status: 1 });

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);
