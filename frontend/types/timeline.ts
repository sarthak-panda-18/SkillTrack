export type TimelineCategory =
  | 'ALL'
  | 'ASSESSMENT'
  | 'SKILL'
  | 'LEARNING'
  | 'CAREER'
  | 'ACHIEVEMENT';

export type TimelineDateFilter =
  | 'ALL_TIME'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_3_MONTHS';

export type TimelineSortOrder = 'DESC' | 'ASC';

export type TimelineEventType =
  | 'PROFILE_COMPLETED'
  | 'CAREER_GOAL_SET'
  | 'CAREER_GOAL_CHANGED'
  | 'ASSESSMENT_COMPLETED'
  | 'SKILL_IMPROVED'
  | 'SKILL_MILESTONE'
  | 'TOPIC_STARTED'
  | 'TOPIC_COMPLETED'
  | 'STUDY_PLAN_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'CAREER_OUTCOME_CREATED'
  | 'CAREER_OUTCOME_SUBMITTED'
  | 'CAREER_OUTCOME_VERIFIED'
  | 'CAREER_OUTCOME_REJECTED'
  | 'CAREER_OUTCOME_CHANGES_REQUESTED';

export interface TimelineEventMetadata {
  score?: number;
  accuracy?: number;
  proficiency?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  previousScore?: number;
  newScore?: number;
  topicName?: string;
  moduleName?: string;
  stageTitle?: string;
  taskTitle?: string;
  roleName?: string;
  previousRoleName?: string;
  newRoleName?: string;
  outcomeType?: string;
  companyName?: string;
  institution?: string;
  businessName?: string;
  organization?: string;
  status?: string;
  achievementType?: string;
  category?: string;
  icon?: string;
  reason?: string;
  [key: string]: any;
}

export interface TimelineEvent {
  id: string; // Deterministic: eventType + sourceId
  eventType: TimelineEventType;
  category: 'ASSESSMENT' | 'SKILL' | 'LEARNING' | 'CAREER' | 'ACHIEVEMENT';
  title: string;
  description: string;
  timestamp: string; // ISO date string
  sourceId: string;
  metadata?: TimelineEventMetadata;
}

export interface TimelineHeroSummary {
  totalActivities: number;
  assessmentsCompleted: number;
  topicsCompleted: number;
  skillsImproved: number;
  careerMilestones: number;
}

export interface TimelinePagination {
  totalEvents: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TimelineData {
  events: TimelineEvent[];
  pagination: TimelinePagination;
  heroSummary: TimelineHeroSummary;
}

export interface TimelineQueryParams {
  page?: number;
  limit?: number;
  category?: TimelineCategory;
  dateFilter?: TimelineDateFilter;
  sort?: TimelineSortOrder;
}
