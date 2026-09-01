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

export interface Milestone {
  milestoneId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  type: MilestoneType;
  autoSource?: AutoProgressSource;
  skillId?: string;
  skillName?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  currentValue: number;
  targetValue: number;
  unit: string;
  order: number;
  completedAt?: string;
}

export interface Goal {
  _id: string;
  userId: string;
  careerRoleId?: string;
  careerRoleName?: string;
  templateId?: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  isSystemRecommended: boolean;
  progress: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  milestones: Milestone[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary {
  totalGoals: number;
  activeCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface GoalsData {
  goals: Goal[];
  summary: GoalSummary;
  currentCareerGoal: {
    targetRole: string | null;
    targetCareerRoleId: string | null;
  };
}

export interface GoalQueryParams {
  category?: string;
  status?: string;
  sort?: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  type?: MilestoneType;
  autoSource?: AutoProgressSource;
  skillId?: string;
  skillName?: string;
  targetValue?: number;
  unit?: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  deadline?: string;
  milestones?: CreateMilestoneInput[];
  isSystemRecommended?: boolean;
  templateId?: string;
}

export interface GoalRecommendation {
  templateId: string;
  title: string;
  description: string;
  category: GoalCategory;
  milestones: CreateMilestoneInput[];
  isAdded: boolean;
}
