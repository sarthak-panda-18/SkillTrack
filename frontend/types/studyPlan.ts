export interface StudyTask {
  taskId: string;
  roadmapTopicId?: string;
  skillId?: string;
  skillName: string;
  type: 'LEARN' | 'PRACTICE' | 'REVISE' | 'ASSESS' | 'PROJECT' | 'REVIEW';
  title: string;
  description: string;
  durationMinutes: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  order: number;
  completedAt?: string;
  rescheduledFrom?: string;
}

export interface StudyPlanDay {
  dayId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isRestDay: boolean;
  totalPlannedMinutes: number;
  completedMinutes: number;
  status: 'UPCOMING' | 'TODAY' | 'COMPLETED' | 'REST' | 'MISSED';
  tasks: StudyTask[];
}

export interface StudyPlanPreferences {
  dailyStudyMinutes: number;
  studyDays: string[];
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  studyIntensity: 'LIGHT' | 'BALANCED' | 'INTENSIVE';
  planDurationWeeks: number;
}

export interface StudyPlan {
  _id: string;
  userId: string;
  roadmapId: string;
  careerRoleId: string;
  careerRoleName: string;
  title: string;
  summary: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: string;
  endDate: string;
  dailyStudyMinutes: number;
  studyDays: string[];
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  studyIntensity: 'LIGHT' | 'BALANCED' | 'INTENSIVE';
  planDurationWeeks: number;
  overallProgress: number;
  completedMinutes: number;
  totalPlannedMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  streakDays: number;
  studyPlanVersion: string;
  aiSummary: string;
  days: StudyPlanDay[];
}
