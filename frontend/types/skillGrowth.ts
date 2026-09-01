export type SkillGrowthSource = 'PROFILE' | 'ASSESSMENT' | 'LEARNING' | 'ADMIN' | 'SYSTEM';
export type SkillTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface HistoryPoint {
  date: string;
  timestamp: string;
  proficiency: number;
  source: SkillGrowthSource;
}

export interface SkillGrowthCard {
  skillId: string;
  skillName: string;
  category: string;
  description: string;
  currentProficiency: number;
  initialProficiency: number;
  growthPoints: number;
  trend: SkillTrend;
  hasEnoughHistory: boolean;
  historyCount: number;
  historyPoints: HistoryPoint[];
}

export interface SkillGrowthSummary {
  totalSkills: number;
  improvingCount: number;
  stableCount: number;
  decliningCount: number;
}

export interface HighlightSkill {
  skillId: string;
  skillName: string;
  category: string;
  currentProficiency: number;
  initialProficiency?: number;
  growthPoints?: number;
}

export interface CareerTargetGap {
  skillId: string;
  skillName: string;
  category: string;
  currentProficiency: number;
  targetProficiency: number;
  gapPoints: number;
  status: 'TARGET_REACHED' | 'GAP';
}

export interface CategoryGrowthSummary {
  category: string;
  skillCount: number;
  avgCurrentProficiency: number;
  avgGrowthPoints: number;
}

export interface SkillGrowthHistoryItem {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiency: number;
  source: SkillGrowthSource;
  recordedAt: string;
}

export interface SkillGrowthData {
  summary: SkillGrowthSummary;
  highlights: {
    mostImproved: HighlightSkill | null;
    highestCurrent: HighlightSkill | null;
  };
  careerRoleInfo: {
    roleId: string;
    roleName: string;
  } | null;
  careerTargetGaps: CareerTargetGap[];
  skillCards: SkillGrowthCard[];
  categorySummaries: CategoryGrowthSummary[];
  historyTimeline: SkillGrowthHistoryItem[];
}

export interface SkillGrowthQueryParams {
  timeRange?: string; // '7d' | '30d' | '3m' | '6m' | '1y' | 'all'
  category?: string;  // 'ALL' or category name
}
