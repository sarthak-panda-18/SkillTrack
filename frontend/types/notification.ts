export type NotificationType =
  | 'ASSESSMENT_COMPLETED'
  | 'GOAL_COMPLETED'
  | 'LEARNING_COMPLETED'
  | 'MILESTONE'
  | 'PASSWORD_SECURITY'
  | 'SYSTEM'
  | 'ACHIEVEMENT'
  | 'ADMIN_MESSAGE';

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  _id?: string;
  userId?: string;
  emailLearningCompletion: boolean;
  emailAssessmentResults: boolean;
  emailGoalMilestones: boolean;
  emailSecurityNotifications: boolean;
  inAppLearning: boolean;
  inAppAssessments: boolean;
  inAppGoals: boolean;
  inAppAchievements: boolean;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
