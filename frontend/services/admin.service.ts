import { apiClient } from '@/lib/api-client';
import { User } from '@/types/user';
import { Skill, UserSkill } from '@/types/skill';
import { College } from '@/types/college';
import { CareerRole, CareerRoleSkillMapping } from '@/types/careerRole';
import { Assessment, QuestionReviewItem } from '@/types/assessment';
import { ApiResponse } from '@/types/api';

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  suspendedStudents: number;
  totalSkills: number;
  recentUsers: User[];
}

export interface TrainerStats {
  totalStudents: number;
  employedStudents: number;
  unemployedStudents: number;
  placementInProgressStudents: number;
  higherStudiesStudents: number;
  selfEmployedStudents: number;
  apprenticeshipStudents: number;
  employmentRate: number;
  averageCurrentSalary: number;
  averageSalaryGrowth: number;
  averageJobRelevance: number;
  averageJobSatisfaction: number;
  statusDistribution: Array<{ name: string; count: number; fill: string }>;
  pipeline: Array<{ stage: string; count: number }>;
  salaryDistributionChart: Array<{ range: string; count: number }>;
}

export interface AdminUsersQuery {
  search?: string;
  role?: 'STUDENT' | 'ADMIN' | 'TRAINER';
  status?: 'ACTIVE' | 'SUSPENDED';
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedColleges {
  colleges: College[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedCareerRoles {
  roles: CareerRole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CollegeRequestItem {
  _id: string;
  studentName: string;
  studentEmail: string;
  collegeName: string;
  city: string;
  state: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface PaginatedCollegeRequests {
  requests: CollegeRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStudentDetailResponse {
  user: User;
  skills: UserSkill[];
  goals?: any[];
  assessmentAttempts?: any[];
  skillGap?: any;
  studyPlan?: any;
  learningRoadmap?: any;
  careerOutcome?: any;
  outcomeHistory?: any[];
  careerOutcomeEvidence?: any[];
  readinessSnapshot?: any;
  communicationLogs?: any[];
}

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const res = await apiClient.get<ApiResponse<AdminStats>>('/admin/dashboard');
    return res.data.data!;
  },

  async getTrainerStats(): Promise<TrainerStats> {
    const res = await apiClient.get<ApiResponse<TrainerStats>>('/admin/trainer-stats');
    return res.data.data!;
  },

  async getUsers(query?: AdminUsersQuery): Promise<PaginatedUsers> {
    const res = await apiClient.get<ApiResponse<PaginatedUsers>>('/admin/users', { params: query });
    return res.data.data!;
  },

  async getUserById(userId: string): Promise<AdminStudentDetailResponse> {
    const res = await apiClient.get<ApiResponse<AdminStudentDetailResponse>>(`/admin/users/${userId}`);
    return res.data.data!;
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, { status });
    return res.data.data!.user;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/users/${userId}`);
    return { message: res.data.message || 'Student account permanently removed.' };
  },

  async forcePasswordReset(userId: string): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/users/${userId}/reset-password`);
    return { message: res.data.message || 'Password reset email sent.' };
  },

  async getAdminSkills(): Promise<Skill[]> {
    const res = await apiClient.get<ApiResponse<{ skills: Skill[] }>>('/admin/skills');
    return res.data.data?.skills || [];
  },

  async createSkill(data: { name: string; category: string; description?: string; icon?: string }): Promise<Skill> {
    const res = await apiClient.post<ApiResponse<{ skill: Skill }>>('/admin/skills', data);
    return res.data.data!.skill;
  },

  async updateSkill(skillId: string, data: Partial<Skill>): Promise<Skill> {
    const res = await apiClient.put<ApiResponse<{ skill: Skill }>>(`/admin/skills/${skillId}`, data);
    return res.data.data!.skill;
  },

  async toggleSkillStatus(skillId: string): Promise<Skill> {
    const res = await apiClient.delete<ApiResponse<{ skill: Skill }>>(`/admin/skills/${skillId}`);
    return res.data.data!.skill;
  },

  // Admin College Management
  async getAdminColleges(query?: { search?: string; state?: string; type?: string; page?: number; limit?: number }): Promise<PaginatedColleges> {
    const res = await apiClient.get<ApiResponse<PaginatedColleges>>('/admin/colleges', { params: query });
    return res.data.data!;
  },

  async createCollege(data: Partial<College>): Promise<College> {
    const res = await apiClient.post<ApiResponse<{ college: College }>>('/admin/colleges', data);
    return res.data.data!.college;
  },

  async updateCollege(collegeId: string, data: Partial<College>): Promise<College> {
    const res = await apiClient.put<ApiResponse<{ college: College }>>(`/admin/colleges/${collegeId}`, data);
    return res.data.data!.college;
  },

  async toggleCollegeStatus(collegeId: string): Promise<College> {
    const res = await apiClient.delete<ApiResponse<{ college: College }>>(`/admin/colleges/${collegeId}`);
    return res.data.data!.college;
  },

  // Admin College Requests
  async getAdminCollegeRequests(status?: string, page: number = 1): Promise<PaginatedCollegeRequests> {
    const res = await apiClient.get<ApiResponse<PaginatedCollegeRequests>>('/admin/college-requests', {
      params: { status, page },
    });
    return res.data.data!;
  },

  async reviewCollegeRequest(requestId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string): Promise<CollegeRequestItem> {
    const res = await apiClient.put<ApiResponse<{ request: CollegeRequestItem }>>(`/admin/college-requests/${requestId}/status`, {
      status,
      adminNotes,
    });
    return res.data.data!.request;
  },

  // Admin Career Role Management
  async getAdminCareerRoles(query?: { search?: string; category?: string; page?: number; limit?: number }): Promise<PaginatedCareerRoles> {
    const res = await apiClient.get<ApiResponse<PaginatedCareerRoles>>('/admin/career-roles', { params: query });
    return res.data.data!;
  },

  async createCareerRole(data: Partial<CareerRole>): Promise<CareerRole> {
    const res = await apiClient.post<ApiResponse<{ role: CareerRole }>>('/admin/career-roles', data);
    return res.data.data!.role;
  },

  async updateCareerRole(roleId: string, data: Partial<CareerRole>): Promise<CareerRole> {
    const res = await apiClient.put<ApiResponse<{ role: CareerRole }>>(`/admin/career-roles/${roleId}`, data);
    return res.data.data!.role;
  },

  async toggleCareerRoleStatus(roleId: string): Promise<CareerRole> {
    const res = await apiClient.delete<ApiResponse<{ role: CareerRole }>>(`/admin/career-roles/${roleId}`);
    return res.data.data!.role;
  },

  async addOrUpdateRoleSkill(
    roleId: string,
    data: { skillId: string; importance: string; minimumProficiency: number; recommendedProficiency: number }
  ): Promise<CareerRoleSkillMapping> {
    const res = await apiClient.post<ApiResponse<{ mapping: CareerRoleSkillMapping }>>(`/admin/career-roles/${roleId}/skills`, data);
    return res.data.data!.mapping;
  },

  async removeRoleSkill(roleId: string, skillId: string): Promise<void> {
    await apiClient.delete(`/admin/career-roles/${roleId}/skills/${skillId}`);
  },

  // Admin Assessment & Question Bank Management
  async getAdminAssessments(): Promise<Assessment[]> {
    const res = await apiClient.get<ApiResponse<{ assessments: Assessment[] }>>('/admin/assessments');
    return res.data.data?.assessments || [];
  },

  async createAssessment(data: Partial<Assessment>): Promise<Assessment> {
    const res = await apiClient.post<ApiResponse<{ assessment: Assessment }>>('/admin/assessments', data);
    return res.data.data!.assessment;
  },

  async updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment> {
    const res = await apiClient.put<ApiResponse<{ assessment: Assessment }>>(`/admin/assessments/${id}`, data);
    return res.data.data!.assessment;
  },

  async toggleAssessmentStatus(id: string): Promise<Assessment> {
    const res = await apiClient.delete<ApiResponse<{ assessment: Assessment }>>(`/admin/assessments/${id}`);
    return res.data.data!.assessment;
  },

  async getAssessmentQuestions(assessmentId: string): Promise<QuestionReviewItem[]> {
    const res = await apiClient.get<ApiResponse<{ questions: QuestionReviewItem[] }>>(`/admin/assessments/${assessmentId}/questions`);
    return res.data.data?.questions || [];
  },

  async generateAiQuestionsForSkill(skillId: string, count: number = 20): Promise<{ createdCount: number; totalQuestions: number }> {
    const res = await apiClient.post<ApiResponse<{ createdCount: number; totalQuestions: number }>>(
      `/admin/assessments/generate-questions/${skillId}`,
      { count }
    );
    return res.data.data!;
  },
};
