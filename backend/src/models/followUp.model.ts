import mongoose, { Schema, Document } from 'mongoose';
import { OutcomeType } from './careerOutcome.model';

export type CheckpointType = '30_DAY' | '90_DAY' | '180_DAY' | '365_DAY';
export type FollowUpStatus = 'UPCOMING' | 'DUE' | 'COMPLETED' | 'OVERDUE';

export interface IFollowUp extends Document {
  userId: mongoose.Types.ObjectId;
  careerOutcomeId?: mongoose.Types.ObjectId;
  checkpoint: CheckpointType;
  dueDate: Date;
  completedDate?: Date;
  status: FollowUpStatus;
  
  // Follow-up survey response data
  employmentStatus?: OutcomeType;
  companyName?: string;
  jobRole?: string;
  currentSalary?: number;
  location?: string;
  skillsUsed?: string[];
  trainingRelevance?: number; // 1-5 scale
  jobSatisfaction?: number; // 1-5 scale
  employmentContinuity?: boolean;
  jobChangesCount?: number;
  reasonForNonPlacement?: string;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerOutcomeId: { type: Schema.Types.ObjectId, ref: 'CareerOutcome', index: true },
    checkpoint: {
      type: String,
      enum: ['30_DAY', '90_DAY', '180_DAY', '365_DAY'],
      required: true,
    },
    dueDate: { type: Date, required: true, index: true },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ['UPCOMING', 'DUE', 'COMPLETED', 'OVERDUE'],
      default: 'UPCOMING',
      index: true,
    },
    employmentStatus: {
      type: String,
      enum: ['EMPLOYED', 'SELF_EMPLOYED', 'HIGHER_STUDIES', 'APPRENTICESHIP', 'INTERNSHIP', 'SEEKING_EMPLOYMENT', 'LOOKING_FOR_EMPLOYMENT', 'UNEMPLOYED'],
    },
    companyName: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    currentSalary: { type: Number },
    location: { type: String, trim: true },
    skillsUsed: [{ type: String }],
    trainingRelevance: { type: Number, min: 1, max: 5 },
    jobSatisfaction: { type: Number, min: 1, max: 5 },
    employmentContinuity: { type: Boolean, default: true },
    jobChangesCount: { type: Number, default: 0 },
    reasonForNonPlacement: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

followUpSchema.index({ userId: 1, checkpoint: 1 }, { unique: true });
followUpSchema.index({ status: 1, dueDate: 1 });

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', followUpSchema);
