export interface SkillTrendItem {
  skillId: string;
  skillName: string;
  currentProficiency: number;
  targetProficiency: number;
  gap: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  assessmentCount: number;
  scoreHistory: number[];
  latestScore?: number;
  changePoints: number;
}

export interface AdaptiveRecommendation {
  _id: string;
  userId: string;
  careerRoleId: string;
  type:
    | 'FOCUS_MORE'
    | 'FOCUS_LESS'
    | 'REVISE'
    | 'PRACTICE_MORE'
    | 'REASSESS'
    | 'CONTINUE'
    | 'ADVANCE'
    | 'RESCHEDULE'
    | 'REDUCE_WORKLOAD'
    | 'GENERATE_NEW_PLAN';
  skillId?: string;
  skillName?: string;
  roadmapTopicId?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  actionLabel: string;
  actionRoute: string;
  status: 'NEW' | 'VIEWED' | 'ACCEPTED' | 'DISMISSED' | 'COMPLETED' | 'STALE';
  createdAt: string;
}

export interface AdaptiveLearningState {
  _id: string;
  userId: string;
  careerRoleId: string;
  careerRoleName: string;
  lastAnalyzedAt: string;
  analysisVersion: string;
  skillsAnalyzedCount: number;
  improvingCount: number;
  stableCount: number;
  decliningCount: number;
  insufficientDataCount: number;
  estimatedLearningVelocity: number;
  studyConsistencyPercentage: number;
  aiSummary: string;
  trends: SkillTrendItem[];
  lastAssessmentCount: number;
  lastCompletedTopicsCount: number;
  lastCompletedStudyMins: number;
}
