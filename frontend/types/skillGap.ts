export interface EvaluatedSkill {
  skillId: string;
  name: string;
  category: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  minimumProficiency: number;
  recommendedProficiency: number;
  currentProficiency: number;
  gap: number;
  status: 'STRONG' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_GAP' | 'UNASSESSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'ASSESSED' | 'SELF_REPORTED' | 'UNASSESSED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  latestAssessmentId?: string;
  latestAssessmentScore?: number;
  bestAssessmentScore?: number;
  topicPerformance?: Array<{ topic: string; percentage: number }>;
  trendImprovement?: number;
}

export interface SkillGapAnalysis {
  _id: string;
  userId: string;
  careerRoleId: string;
  careerRoleName: string;
  overallReadiness: number; // 0-100
  readinessLabel: 'READY' | 'NEARLY_READY' | 'DEVELOPING' | 'EARLY_STAGE';
  analyzedAt: string;
  analysisVersion: string;
  skills: EvaluatedSkill[];
  criticalGaps: EvaluatedSkill[];
  needsImprovement: EvaluatedSkill[];
  strongSkills: EvaluatedSkill[];
  unassessedSkills: EvaluatedSkill[];
  topPriorities: EvaluatedSkill[];
  aiSummary: string;
  aiInsights: string[];
  aiRecommendations: Array<{ skillId: string; reason: string; priority: string }>;
}
