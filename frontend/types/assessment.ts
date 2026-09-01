import { Skill } from './skill';

export interface Assessment {
  _id: string;
  title: string;
  skillId: Skill;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionCount: number;
  timeLimit: number; // in minutes
  passingScore: number;
  isActive: boolean;
  questionCountInBank?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionSanitized {
  _id: string;
  assessmentId: string;
  skillId: string;
  topic: string;
  question: string;
  options: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  order: number;
}

export interface StartAssessmentResponse {
  attemptId: string;
  assessment: {
    _id: string;
    title: string;
    timeLimit: number;
    questionCount: number;
    passingScore: number;
  };
  startedAt: string;
  questions: QuestionSanitized[];
}

export interface TopicPerformance {
  topic: string;
  questionsAttempted: number;
  correct: number;
  percentage: number;
}

export interface SubmitAssessmentResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeTaken: number;
  passed: boolean;
  topicPerformance: TopicPerformance[];
}

export interface QuestionReviewItem {
  questionId: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedOption: number;
  isCorrect: boolean;
  explanation: string;
}

export interface AttemptResultResponse {
  attempt: {
    _id: string;
    userId: string;
    assessmentId: Assessment;
    skillId: Skill;
    startedAt: string;
    submittedAt: string;
    score: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    topicPerformance: TopicPerformance[];
  };
  review: QuestionReviewItem[];
}
