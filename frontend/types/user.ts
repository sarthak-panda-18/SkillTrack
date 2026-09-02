export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'TRAINER';
  status: 'ACTIVE' | 'SUSPENDED';
  authProviders?: string[];
  profileImage?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  district?: string;
  state?: string;
  cohort?: string;
  consentGiven?: boolean;
  placementStage?: 'TRAINING_COMPLETED' | 'PLACEMENT_READY' | 'SEEKING_EMPLOYMENT' | 'INTERVIEW_STAGE' | 'OFFER_RECEIVED' | 'JOINING_PENDING' | 'EMPLOYED' | string;
  targetCareerRoleId?: string;
  targetRole?: string;
  targetDomain?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  onboardingCompleted: boolean;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface OnboardingInput {
  college: string;
  degree: string;
  branch: string;
  graduationYear: number;
  targetRole: string;
  targetDomain: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  skills?: {
    skillId: string;
    proficiency: number;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
}
