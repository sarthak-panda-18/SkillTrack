export interface ReadinessDimensionScores {
  skillReadiness: number;
  assessmentPerformance: number;
  roadmapProgress: number;
  studyConsistency: number;
}

export interface SkillGapItem {
  skillId: string;
  name: string;
  category: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentProficiency: number;
  targetProficiency: number;
  gap: number;
  status: string;
  source: string;
}

export interface SkillImprovementDelta {
  skillId: string;
  skillName: string;
  initialProficiency: number;
  currentProficiency: number;
  changePoints: number;
  source: string;
}

export interface AchievementItem {
  _id: string;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  category: 'ASSESSMENT' | 'ROADMAP' | 'STUDY' | 'SKILL' | 'READINESS';
  unlockedAt: string;
}

export interface ReadinessSnapshot {
  _id: string;
  readinessScore: number;
  readinessCategory: string;
  skillReadinessScore: number;
  assessmentReadinessScore: number;
  roadmapProgressScore: number;
  studyConsistencyScore: number;
  snapshotDate: string;
}

export interface CareerReadinessData {
  user: {
    id: string;
    name: string;
    email: string;
    targetRole: string;
    targetCareerRoleId: string;
  };
  careerRole: {
    id: string;
    name: string;
    category?: string;
  };
  readinessScore: number;
  readinessCategory: 'GETTING_STARTED' | 'DEVELOPING' | 'PROGRESSING' | 'NEARLY_READY' | 'PLACEMENT_READY';
  dimensions: ReadinessDimensionScores;
  biggestGaps: SkillGapItem[];
  strongestSkills: SkillGapItem[];
  unassessedSkills: SkillGapItem[];
  skillImprovements: SkillImprovementDelta[];
  achievements: AchievementItem[];
  history: ReadinessSnapshot[];
  aiSummary: string;
  aiInsight: string;
  nextActionExplanation: string;
  isAiGenerated: boolean;
  adaptiveRecommendations: any[];
}
