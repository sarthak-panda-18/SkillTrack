export interface AssessmentHistorySummary {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
}

export interface TopicPerformance {
  topic: string;
  questionsAttempted: number;
  correct: number;
  percentage: number;
}

export interface AssessmentAttemptHistoryItem {
  _id: string;
  attemptId: string;
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentDifficulty: string;
  passingScore: number;
  skillId: string;
  skillName: string;
  category: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  startedAt: string;
  submittedAt: string;
  createdAt: string;
  attemptNumber: number;
  previousScore: number | null;
  improvementPoints: number | null;
  topicPerformance: TopicPerformance[];
}

export interface TopicPerformanceSummary {
  topic: string;
  questionsAttempted: number;
  correct: number;
  percentage: number;
}

export interface SkillPerformanceSummary {
  skillName: string;
  category: string;
  attemptCount: number;
  latestScore: number;
  bestScore: number;
  averageScore: number;
}

export interface AssessmentHistoryData {
  summary: AssessmentHistorySummary;
  attempts: AssessmentAttemptHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  topicPerformanceSummary: TopicPerformanceSummary[];
  skillPerformanceSummary: SkillPerformanceSummary[];
  targetRoleName: string | null;
}

export interface AssessmentHistoryQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  skillId?: string;
  assessmentId?: string;
  timeRange?: string; // '7d' | '30d' | '3m' | '6m' | '1y' | 'all'
  sort?: string;      // 'latest' | 'oldest' | 'highest_score' | 'lowest_score' | 'most_improved'
}
