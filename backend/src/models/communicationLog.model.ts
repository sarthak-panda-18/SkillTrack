import mongoose, { Schema, Document } from 'mongoose';

export type CommunicationType =
  | 'ADMIN_DIRECT'
  | 'ADMIN_BULK'
  | 'FORGOT_PASSWORD'
  | 'WELCOME'
  | 'TRAINING_COMPLETION'
  | 'ASSESSMENT_COMPLETED'
  | 'GOAL_COMPLETED'
  | 'SECURITY';

export type CommunicationStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED';

export interface ICommunicationLog extends Document {
  userId: mongoose.Types.ObjectId;
  recipientEmail: string;
  initiatedByAdminId?: mongoose.Types.ObjectId;
  type: CommunicationType;
  subject: string;
  message: string;
  status: CommunicationStatus;
  providerMessageId?: string;
  failureReason?: string;
  sentAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communicationLogSchema = new Schema<ICommunicationLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientEmail: { type: String, required: true, lowercase: true, trim: true },
    initiatedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'ADMIN_DIRECT',
        'ADMIN_BULK',
        'FORGOT_PASSWORD',
        'WELCOME',
        'TRAINING_COMPLETION',
        'ASSESSMENT_COMPLETED',
        'GOAL_COMPLETED',
        'SECURITY',
      ],
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['QUEUED', 'SENDING', 'SENT', 'FAILED'],
      default: 'QUEUED',
      index: true,
    },
    providerMessageId: { type: String, default: '' },
    failureReason: { type: String, default: '' },
    sentAt: { type: Date },
    failedAt: { type: Date },
  },
  { timestamps: true }
);

communicationLogSchema.index({ userId: 1, createdAt: -1 });
communicationLogSchema.index({ initiatedByAdminId: 1, createdAt: -1 });
communicationLogSchema.index({ status: 1, createdAt: -1 });

export const CommunicationLog = mongoose.model<ICommunicationLog>(
  'CommunicationLog',
  communicationLogSchema
);
