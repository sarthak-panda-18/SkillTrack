import { CareerRole, ICareerRole } from '../models/careerRole.model';
import { CareerRoleSkill, ICareerRoleSkill } from '../models/careerRoleSkill.model';
import { ApiError } from '../utils/apiError';

export class CareerRoleService {
  async getPublicCareerRoles(searchQuery?: string, category?: string): Promise<ICareerRole[]> {
    const filter: any = { isActive: true };

    if (category && category.trim() !== '') {
      filter.category = category.trim();
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const regex = new RegExp(searchQuery.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    return await CareerRole.find(filter).sort({ category: 1, name: 1 });
  }

  async getCareerRoleDetails(roleId: string) {
    const role = await CareerRole.findById(roleId);
    if (!role || !role.isActive) {
      throw new ApiError(404, 'Career role not found or is inactive.');
    }

    const roleSkills = await CareerRoleSkill.find({ careerRoleId: roleId })
      .populate('skillId', 'name category description')
      .sort({ priority: 1, importance: 1 });

    return {
      role,
      skills: roleSkills,
    };
  }

  async getAdminCareerRoles(query: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.category) filter.category = query.category;

    if (query.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const [roles, total] = await Promise.all([
      CareerRole.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CareerRole.countDocuments(filter),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createCareerRole(data: Partial<ICareerRole>): Promise<ICareerRole> {
    const slug = data.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await CareerRole.findOne({ slug });
    if (existing) {
      throw new ApiError(409, 'A career role with this name already exists.');
    }

    return await CareerRole.create({
      ...data,
      name: data.name!.trim(),
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async updateCareerRole(id: string, data: Partial<ICareerRole>): Promise<ICareerRole> {
    const role = await CareerRole.findById(id);
    if (!role) throw new ApiError(404, 'Career role not found.');

    if (data.name && data.name.trim() !== role.name) {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await CareerRole.findOne({ slug, _id: { $ne: id } });
      if (existing) throw new ApiError(409, 'Another career role with this name already exists.');
      role.slug = slug;
    }

    Object.assign(role, data);
    await role.save();
    return role;
  }

  async toggleCareerRoleStatus(id: string): Promise<ICareerRole> {
    const role = await CareerRole.findById(id);
    if (!role) throw new ApiError(404, 'Career role not found.');

    role.isActive = !role.isActive;
    await role.save();
    return role;
  }

  // --- Admin Role-Skill Requirements Management ---
  async addOrUpdateRoleSkill(
    careerRoleId: string,
    skillId: string,
    importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    minimumProficiency: number = 50,
    recommendedProficiency: number = 75
  ): Promise<ICareerRoleSkill> {
    if (minimumProficiency > recommendedProficiency) {
      throw new ApiError(400, 'Minimum proficiency cannot be greater than recommended proficiency.');
    }

    const mapping = await CareerRoleSkill.findOneAndUpdate(
      { careerRoleId, skillId },
      {
        $set: {
          importance,
          minimumProficiency,
          recommendedProficiency,
          isRequired: true,
        },
      },
      { upsert: true, new: true }
    );

    return mapping;
  }

  async removeRoleSkill(careerRoleId: string, skillId: string): Promise<void> {
    await CareerRoleSkill.deleteOne({ careerRoleId, skillId });
  }
}

export const careerRoleService = new CareerRoleService();
