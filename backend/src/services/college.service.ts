import { College, ICollege } from '../models/college.model';
import { CollegeRequest, ICollegeRequest } from '../models/collegeRequest.model';
import { ApiError } from '../utils/apiError';

export class CollegeService {
  async searchColleges(
    searchQuery?: string,
    state?: string,
    city?: string,
    limit: number = 20
  ): Promise<ICollege[]> {
    const filter: any = { isActive: true };

    if (state && state.trim() !== '') {
      filter.state = state.trim();
    }

    if (city && city.trim() !== '') {
      filter.city = new RegExp(city.trim(), 'i');
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { shortName: regex },
        { city: regex },
        { state: regex },
        { university: regex },
      ];
    }

    const cappedLimit = Math.max(1, Math.min(50, limit));
    return await College.find(filter)
      .sort({ name: 1 })
      .limit(cappedLimit);
  }

  async getAdminColleges(query: {
    search?: string;
    state?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.state) filter.state = query.state;
    if (query.type) filter.type = query.type;

    if (query.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { shortName: regex },
        { city: regex },
        { state: regex },
      ];
    }

    const [colleges, total] = await Promise.all([
      College.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      College.countDocuments(filter),
    ]);

    return {
      colleges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createCollege(data: Partial<ICollege>): Promise<ICollege> {
    const existing = await College.findOne({ name: data.name?.trim() });
    if (existing) {
      throw new ApiError(409, 'A college with this exact name already exists.');
    }

    const normalized = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return await College.create({
      ...data,
      name: data.name!.trim(),
      normalizedName: normalized,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async updateCollege(id: string, data: Partial<ICollege>): Promise<ICollege> {
    const college = await College.findById(id);
    if (!college) throw new ApiError(404, 'College entry not found.');

    if (data.name && data.name.trim() !== college.name) {
      const existing = await College.findOne({ name: data.name.trim(), _id: { $ne: id } });
      if (existing) throw new ApiError(409, 'Another college already uses this name.');
      college.normalizedName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    Object.assign(college, data);
    await college.save();
    return college;
  }

  async toggleCollegeStatus(id: string): Promise<ICollege> {
    const college = await College.findById(id);
    if (!college) throw new ApiError(404, 'College entry not found.');

    college.isActive = !college.isActive;
    await college.save();
    return college;
  }

  // --- Student Unlisted College Request System ---
  async requestCollegeAddition(data: {
    studentName: string;
    studentEmail: string;
    collegeName: string;
    city: string;
    state: string;
  }): Promise<ICollegeRequest> {
    return await CollegeRequest.create(data);
  }

  async getAdminCollegeRequests(status?: string, page: number = 1, limit: number = 20) {
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      CollegeRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CollegeRequest.countDocuments(filter),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reviewCollegeRequest(
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    adminNotes?: string
  ): Promise<ICollegeRequest> {
    const req = await CollegeRequest.findById(requestId);
    if (!req) throw new ApiError(404, 'College request not found.');

    req.status = status;
    if (adminNotes) req.adminNotes = adminNotes;
    await req.save();

    // If APPROVED, auto-create college entry in College collection if not existing!
    if (status === 'APPROVED') {
      const existing = await College.findOne({ name: req.collegeName.trim() });
      if (!existing) {
        await College.create({
          name: req.collegeName.trim(),
          normalizedName: req.collegeName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          city: req.city.trim(),
          state: req.state.trim(),
          type: 'Engineering College',
          isActive: true,
        });
      }
    }

    return req;
  }
}

export const collegeService = new CollegeService();
