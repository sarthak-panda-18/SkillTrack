import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ASSESSMENT_COMPLETED'
  | 'GOAL_COMPLETED'
  | 'LEARNING_COMPLETED'
  | 'MILESTONE'
  | 'PASSWORD_SECURITY'
  | 'SYSTEM'
  | 'ACHIEVEMENT'
  | 'ADMIN_MESSAGE';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: Date;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'ASSESSMENT_COMPLETED',
        'GOAL_COMPLETED',
        'LEARNING_COMPLETED',
        'MILESTONE',
        'PASSWORD_SECURITY',
        'SYSTEM',
        'ACHIEVEMENT',
        'ADMIN_MESSAGE',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    entityId: { type: String, default: '' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1, entityId: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
