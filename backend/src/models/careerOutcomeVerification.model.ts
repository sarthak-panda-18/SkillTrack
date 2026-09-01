import mongoose, { Schema, Document } from 'mongoose';
import { VerificationStatus } from './careerOutcome.model';

export type VerificationAction =
  | 'SUBMITTED'
  | 'START_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED';

export interface ICareerOutcomeVerification extends Document {
  careerOutcomeId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  reviewerId?: mongoose.Types.ObjectId;
  action: VerificationAction;
  previousStatus?: VerificationStatus;
  newStatus: VerificationStatus;
  reason?: string;
  notes?: string;
  createdAt: Date;
}

const careerOutcomeVerificationSchema = new Schema<ICareerOutcomeVerification>(
  {
    careerOutcomeId: { type: Schema.Types.ObjectId, ref: 'CareerOutcome', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: {
      type: String,
      enum: ['SUBMITTED', 'START_REVIEW', 'VERIFIED', 'REJECTED', 'CHANGES_REQUESTED', 'RESUBMITTED'],
      required: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    reason: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

careerOutcomeVerificationSchema.index({ careerOutcomeId: 1, createdAt: -1 });

export const CareerOutcomeVerification = mongoose.model<ICareerOutcomeVerification>(
  'CareerOutcomeVerification',
  careerOutcomeVerificationSchema
);
