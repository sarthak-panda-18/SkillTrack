import { Skill, ISkill } from '../models/skill.model';
import { UserSkill } from '../models/userSkill.model';
import { SkillGrowthSnapshot, SkillGrowthSource } from '../models/skillGrowthSnapshot.model';
import { User } from '../models/user.model';
import { CareerRole } from '../models/careerRole.model';
import { CareerRoleSkill } from '../models/careerRoleSkill.model';
import { ApiError } from '../utils/apiError';

export interface SkillGrowthQueryOptions {
  timeRange?: string; // '7d' | '30d' | '3m' | '6m' | '1y' | 'all'
  category?: string;  // 'ALL' or specific category name
}

export class SkillService {
  async getAllSkills(): Promise<ISkill[]> {
    // Only return active skills (or skills where isActive is not explicitly false) for student catalog selection
    return await Skill.find({ isActive: { $ne: false } }).sort({ category: 1, name: 1 });
  }

  async getAdminSkills(): Promise<ISkill[]> {
    return await Skill.find().sort({ category: 1, name: 1 });
  }

  async createSkill(data: { name: string; category: string; description?: string; icon?: string; isActive?: boolean }): Promise<ISkill> {
    const existing = await Skill.findOne({ name: data.name.trim() });
    if (existing) {
      throw new ApiError(409, 'Skill with this name already exists in catalog.');
    }
    return await Skill.create({
      name: data.name.trim(),
      category: data.category.trim(),
      description: data.description || '',
      icon: data.icon || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async updateSkill(skillId: string, data: Partial<ISkill>): Promise<ISkill> {
    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, 'Skill not found');

    if (data.name && data.name.trim() !== skill.name) {
      const existing = await Skill.findOne({ name: data.name.trim(), _id: { $ne: skillId } });
      if (existing) throw new ApiError(409, 'Another skill already uses this name');
    }

    Object.assign(skill, data);
    await skill.save();
    return skill;
  }

  async deactivateSkill(skillId: string): Promise<{ message: string; skill: ISkill }> {
    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, 'Skill not found');

    // Safe deactivation preserves existing student skill records while hiding from new selection
    skill.isActive = !skill.isActive;
    await skill.save();

    return {
      message: skill.isActive ? 'Skill activated successfully' : 'Skill deactivated successfully',
      skill,
    };
  }

  async getUserSkills(userId: string) {
    return await UserSkill.find({ userId }).populate('skillId').sort({ updatedAt: -1 });
  }

  async recordSkillSnapshot(
    userId: string,
    skillId: string,
    proficiency: number,
    source: SkillGrowthSource = 'SYSTEM'
  ) {
    const latest = await SkillGrowthSnapshot.findOne({ userId, skillId }).sort({ recordedAt: -1 });

    // Prevent duplicate consecutive snapshots with identical proficiency
    if (latest && latest.proficiency === proficiency) {
      return latest;
    }

    return await SkillGrowthSnapshot.create({
      userId,
      skillId,
      proficiency,
      source,
      recordedAt: new Date(),
    });
  }

  async addUserSkill(
    userId: string,
    data: { skillId: string; proficiency: number; level?: 'Beginner' | 'Intermediate' | 'Advanced' }
  ) {
    const skillExists = await Skill.findById(data.skillId);
    if (!skillExists) throw new ApiError(404, 'Skill not found in catalog.');

    let level: 'Beginner' | 'Intermediate' | 'Advanced' = data.level || 'Intermediate';
    if (!data.level) {
      if (data.proficiency < 40) level = 'Beginner';
      else if (data.proficiency >= 75) level = 'Advanced';
    }

    const userSkill = await UserSkill.findOneAndUpdate(
      { userId, skillId: data.skillId },
      { proficiency: data.proficiency, level },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('skillId');

    // Record historical growth snapshot
    await this.recordSkillSnapshot(userId, data.skillId, data.proficiency, 'PROFILE');

    return userSkill;
  }

  async removeUserSkill(userId: string, skillId: string) {
    const deleted = await UserSkill.findOneAndDelete({ userId, skillId });
    if (!deleted) throw new ApiError(404, 'User skill entry not found.');
    return { message: 'Skill removed successfully' };
  }

  async getSkillGrowthData(userId: string, options: SkillGrowthQueryOptions = {}) {
    const userSkills = await UserSkill.find({ userId }).populate('skillId');

    // Ensure baseline snapshots exist for all user skills (non-destructive baseline initialization)
    for (const us of userSkills) {
      if (!us.skillId) continue;
      const count = await SkillGrowthSnapshot.countDocuments({ userId, skillId: (us.skillId as any)._id });
      if (count === 0) {
        await SkillGrowthSnapshot.create({
          userId,
          skillId: (us.skillId as any)._id,
          proficiency: us.proficiency,
          source: 'SYSTEM',
          recordedAt: (us as any).createdAt || new Date(),
        });
      }
    }

    // Determine time range date boundary
    const timeRange = options.timeRange || 'all';
    let rangeStartDate: Date | null = null;
    const now = new Date();

    if (timeRange === '7d') rangeStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') rangeStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '3m') rangeStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '6m') rangeStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    else if (timeRange === '1y') rangeStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const categoryFilter = (options.category || 'ALL').toUpperCase();

    const skillCards: any[] = [];
    let improvingCount = 0;
    let stableCount = 0;
    let decliningCount = 0;

    for (const us of userSkills) {
      if (!us.skillId) continue;
      const skillObj = us.skillId as any;

      if (categoryFilter !== 'ALL' && skillObj.category?.toUpperCase() !== categoryFilter) {
        continue;
      }

      // Fetch history snapshots sorted chronologically
      const allSnapshots = await SkillGrowthSnapshot.find({ userId, skillId: skillObj._id }).sort({ recordedAt: 1 });

      let filteredSnapshots = allSnapshots;
      if (rangeStartDate) {
        filteredSnapshots = allSnapshots.filter((s) => new Date(s.recordedAt) >= rangeStartDate!);
        // If range filtering yields 0 snapshots, fallback to the latest snapshot prior to rangeStartDate or allSnapshots[0]
        if (filteredSnapshots.length === 0 && allSnapshots.length > 0) {
          filteredSnapshots = [allSnapshots[allSnapshots.length - 1]];
        }
      }

      const initialProficiency = filteredSnapshots.length > 0 ? filteredSnapshots[0].proficiency : us.proficiency;
      const currentProficiency = us.proficiency;
      const growthPoints = currentProficiency - initialProficiency;

      let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
      if (growthPoints > 0) {
        trend = 'IMPROVING';
        improvingCount++;
      } else if (growthPoints < 0) {
        trend = 'DECLINING';
        decliningCount++;
      } else {
        stableCount++;
      }

      const historyPoints = filteredSnapshots.map((s) => ({
        date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: s.recordedAt,
        proficiency: s.proficiency,
        source: s.source,
      }));

      skillCards.push({
        skillId: skillObj._id,
        skillName: skillObj.name,
        category: skillObj.category,
        description: skillObj.description || '',
        currentProficiency,
        initialProficiency,
        growthPoints,
        trend,
        hasEnoughHistory: allSnapshots.length > 1,
        historyCount: allSnapshots.length,
        historyPoints,
      });
    }

    // Sort skillCards by highest current proficiency
    skillCards.sort((a, b) => b.currentProficiency - a.currentProficiency);

    // Identify Most Improved & Highest Current Skill
    let mostImproved: any = null;
    let highestCurrent: any = null;

    if (skillCards.length > 0) {
      highestCurrent = skillCards[0];

      const improvingCards = [...skillCards]
        .filter((c) => c.growthPoints > 0)
        .sort((a, b) => b.growthPoints - a.growthPoints);

      if (improvingCards.length > 0) {
        mostImproved = improvingCards[0];
      }
    }

    // Target Career Role Gap Analysis
    const user = await User.findById(userId);
    let careerRoleInfo: any = null;
    const careerTargetGaps: any[] = [];

    if (user && user.targetCareerRoleId) {
      const careerRole = await CareerRole.findById(user.targetCareerRoleId);
      if (careerRole) {
        careerRoleInfo = {
          roleId: careerRole._id,
          roleName: careerRole.name,
        };

        const roleSkills = await CareerRoleSkill.find({ careerRoleId: careerRole._id }).populate('skillId');

        for (const rs of roleSkills) {
          if (!rs.skillId) continue;
          const sObj = rs.skillId as any;

          const userSkillEntry = userSkills.find((us) => (us.skillId as any)?._id?.toString() === sObj._id.toString());
          const currentProf = userSkillEntry ? userSkillEntry.proficiency : 0;
          const targetProf = rs.minimumProficiency || 80;
          const gapPoints = Math.max(0, targetProf - currentProf);

          careerTargetGaps.push({
            skillId: sObj._id,
            skillName: sObj.name,
            category: sObj.category,
            currentProficiency: currentProf,
            targetProficiency: targetProf,
            gapPoints,
            status: currentProf >= targetProf ? 'TARGET_REACHED' : 'GAP',
          });
        }
      }
    }

    // Category Summaries
    const categoryMap: { [cat: string]: { count: number; totalCurrent: number; totalGrowth: number } } = {};
    skillCards.forEach((c) => {
      const cat = c.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, totalCurrent: 0, totalGrowth: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].totalCurrent += c.currentProficiency;
      categoryMap[cat].totalGrowth += c.growthPoints;
    });

    const categorySummaries = Object.entries(categoryMap).map(([category, stat]) => ({
      category,
      skillCount: stat.count,
      avgCurrentProficiency: Math.round(stat.totalCurrent / stat.count),
      avgGrowthPoints: Math.round(stat.totalGrowth / stat.count),
    }));

    // History Timeline Log (Chronological latest 50)
    const rawTimeline = await SkillGrowthSnapshot.find({ userId })
      .populate('skillId', 'name category')
      .sort({ recordedAt: -1 })
      .limit(50);

    const historyTimeline = rawTimeline.map((item: any) => ({
      id: item._id,
      skillId: item.skillId?._id || item.skillId,
      skillName: item.skillId?.name || 'Technical Skill',
      category: item.skillId?.category || 'General',
      proficiency: item.proficiency,
      source: item.source,
      recordedAt: item.recordedAt,
    }));

    return {
      summary: {
        totalSkills: skillCards.length,
        improvingCount,
        stableCount,
        decliningCount,
      },
      highlights: {
        mostImproved,
        highestCurrent,
      },
      careerRoleInfo,
      careerTargetGaps,
      skillCards,
      categorySummaries,
      historyTimeline,
    };
  }

  async getSkillHistory(userId: string, skillId: string) {
    const snapshots = await SkillGrowthSnapshot.find({ userId, skillId })
      .populate('skillId', 'name category description')
      .sort({ recordedAt: 1 });

    const userSkill = await UserSkill.findOne({ userId, skillId }).populate('skillId');

    return {
      userSkill,
      snapshots,
    };
  }
}

export const skillService = new SkillService();

