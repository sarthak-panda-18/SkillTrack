export type OutcomeType =
  | 'EMPLOYED'
  | 'SELF_EMPLOYED'
  | 'HIGHER_STUDIES'
  | 'APPRENTICESHIP'
  | 'INTERNSHIP'
  | 'SEEKING_EMPLOYMENT';

export type OutcomeStatus = 'ACTIVE' | 'HISTORICAL' | 'DRAFT';

export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export interface EmploymentDetails {
  companyName: string;
  jobRole: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  workArrangement: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  compensationAmount?: number;
  compensationPeriod?: 'ANNUAL' | 'MONTHLY';
  currency?: string;
  joiningDate: string;
  workLocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  industry?: string;
  jobDescription?: string;
  skillsUsed?: string[];
}

export interface SelfEmploymentDetails {
  businessName: string;
  businessType: 'STARTUP' | 'FREELANCE' | 'CONSULTANCY' | 'AGENCY' | 'SMALL_BUSINESS' | 'FAMILY_BUSINESS' | 'ONLINE_BUSINESS' | 'OTHER' | string;
  businessStartDate: string;
  currentStatus?: 'ACTIVE' | 'EARLY_STAGE' | 'GROWING' | 'PAUSED' | 'CLOSED' | string;
  incomeRange?: 'NO_REVENUE' | 'BELOW_2L' | '2L_5L' | '5L_10L' | '10L_25L' | '25L_50L' | '50L_PLUS' | string;
  teamSizeRange?: '1' | '2-5' | '6-10' | '11-25' | '26-50' | '51-100' | '100+' | string;
  teamSize?: number;
  industry?: string;
  website?: string;
  description?: string;
  businessLocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface HigherStudiesDetails {
  institution: string;
  program: string;
  degree?: string;
  specialization?: string;
  country?: string;
  city?: string;
  startDate: string;
  expectedCompletionDate?: string;
  admissionStatus?: 'APPLIED' | 'ACCEPTED' | 'ENROLLED' | 'COMPLETED' | 'WITHDRAWN' | 'DEFERRED' | string;
  studyMode?: 'ON_CAMPUS' | 'ONLINE' | 'HYBRID' | string;
  fundingType?: 'SELF_FUNDED' | 'SCHOLARSHIP' | 'LOAN' | 'SPONSORED' | 'ASSISTANTSHIP' | 'OTHER' | string;
}

export interface ApprenticeshipDetails {
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  workArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  location?: string;
  industry?: string;
}

export interface InternshipDetails {
  companyName: string;
  internshipRole: string;
  startDate: string;
  endDate?: string;
  isPaid?: boolean;
  stipendAmount?: number;
  stipendPeriod?: 'MONTHLY' | 'STIPEND_TOTAL';
  currency?: string;
  workArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  location?: string;
  industry?: string;
}

export interface SeekingEmploymentDetails {
  seekingSince: string;
  preferredRole?: string;
  preferredLocation?: string;
  preferredWorkArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  notes?: string;
}

export interface CareerOutcomeData {
  _id: string;
  userId: string | any;
  outcomeType: OutcomeType;
  status: OutcomeStatus;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string | any;
  verifiedAt?: string;
  rejectionReason?: string;
  changesRequestedReason?: string;
  employment?: EmploymentDetails;
  selfEmployment?: SelfEmploymentDetails;
  higherStudies?: HigherStudiesDetails;
  apprenticeship?: ApprenticeshipDetails;
  internship?: InternshipDetails;
  seekingEmployment?: SeekingEmploymentDetails;
  createdAt: string;
  updatedAt: string;
}
