import { apiClient } from '@/lib/api-client';

export type CareerStatusType =
  | 'EMPLOYED'
  | 'SEEKING_EMPLOYMENT'
  | 'UNEMPLOYED'
  | 'SELF_EMPLOYED'
  | 'APPRENTICESHIP'
  | 'HIGHER_STUDIES';

export interface IEmploymentDocument {
  _id?: string;
  documentType: 'Employee ID Card' | 'Offer Letter' | 'Joining Letter' | 'Internship Offer Letter' | 'Experience Letter' | 'Other Employment Proof';
  fileName: string;
  originalFileName?: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  uploadedDate?: string;
  verificationStatus: 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  verificationNotes?: string;
}

export interface CareerStatusData {
  _id?: string;
  userId?: string;
  currentStatus: CareerStatusType;

  employmentDetails?: {
    companyName: string;
    jobRole: string;
    industry?: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
    joiningDate?: string;
    workLocation?: string;
    trainingRelevance?: 'Highly Relevant' | 'Relevant' | 'Partially Relevant' | 'Not Relevant';
    jobSatisfaction?: number;
    skillsUsed?: string[];
  };

  placementJourney?: {
    trainingCompleted: boolean;
    placementReady: boolean;
    applied: boolean;
    interview: boolean;
    offerReceived: boolean;
    joined: boolean;
    employed: boolean;
    trainingCompletedDate?: string;
    placementReadyDate?: string;
    appliedDate?: string;
    interviewDate?: string;
    offerReceivedDate?: string;
    joinedDate?: string;
  };

  employmentDocuments?: IEmploymentDocument[];

  salaryDetails?: {
    startingSalary?: number;
    previousSalary?: number;
    currentSalary?: number;
  };

  unemploymentDetails?: {
    reason?: string;
    preferredLocation?: string;
    expectedSalary?: number;
    skillsDeveloping?: string[];
  };

  seekingEmploymentDetails?: {
    preferredLocation?: string;
    expectedSalary?: number;
    jobSearchStatus?: string;
    skillsDeveloping?: string[];
  };

  selfEmploymentDetails?: {
    businessName?: string;
    businessType?: string;
    businessStatus?: string;
    currentIncome?: number;
    numberOfEmployees?: number;
    startDate?: string;
    industry?: string;
    skillsUsed?: string[];
  };

  apprenticeshipDetails?: {
    organizationName?: string;
    role?: string;
    stipend?: number;
    startDate?: string;
    expectedEndDate?: string;
    workLocation?: string;
    skillsUsed?: string[];
    trainingRelevance?: string;
  };

  higherStudiesDetails?: {
    institutionName?: string;
    programme?: string;
    fieldOfStudy?: string;
    startDate?: string;
    expectedCompletionDate?: string;
    location?: string;
  };
}

export const careerStatusService = {
  async getMyCareerStatus(): Promise<CareerStatusData> {
    const response = await apiClient.get('/career-status/me');
    return response.data.data;
  },

  async updateMyCareerStatus(payload: Partial<CareerStatusData>): Promise<CareerStatusData> {
    const response = await apiClient.put('/career-status/me', payload);
    return response.data.data;
  },

  async addEmploymentDocument(formData: FormData): Promise<CareerStatusData> {
    const response = await apiClient.post('/career-status/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async deleteEmploymentDocument(docId: string): Promise<CareerStatusData> {
    const response = await apiClient.delete(`/career-status/me/documents/${docId}`);
    return response.data.data;
  },

  async getStudentCareerStatus(userId: string): Promise<CareerStatusData> {
    const response = await apiClient.get(`/career-status/student/${userId}`);
    return response.data.data;
  },

  async verifyEmploymentDocument(docId: string, status: 'VERIFIED' | 'REJECTED', notes?: string): Promise<CareerStatusData> {
    const response = await apiClient.patch(`/career-status/admin/documents/${docId}/verify`, { status, notes });
    return response.data.data;
  },
};
