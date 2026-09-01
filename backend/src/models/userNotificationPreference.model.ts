import mongoose, { Schema, Document } from 'mongoose';

export interface IUserNotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  emailLearningCompletion: boolean;
  emailAssessmentResults: boolean;
  emailGoalMilestones: boolean;
  emailSecurityNotifications: boolean;
  inAppLearning: boolean;
  inAppAssessments: boolean;
  inAppGoals: boolean;
  inAppAchievements: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationPreferenceSchema = new Schema<IUserNotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    emailLearningCompletion: { type: Boolean, default: true },
    emailAssessmentResults: { type: Boolean, default: true },
    emailGoalMilestones: { type: Boolean, default: true },
    emailSecurityNotifications: { type: Boolean, default: true },
    inAppLearning: { type: Boolean, default: true },
    inAppAssessments: { type: Boolean, default: true },
    inAppGoals: { type: Boolean, default: true },
    inAppAchievements: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserNotificationPreference = mongoose.model<IUserNotificationPreference>(
  'UserNotificationPreference',
  userNotificationPreferenceSchema
);
