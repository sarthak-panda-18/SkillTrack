import mongoose, { Schema, Document } from 'mongoose';

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

export interface ICareerOutcome extends Document {
  userId: mongoose.Types.ObjectId;
  outcomeType: OutcomeType;
  status: OutcomeStatus;

  // Verification metadata
  verificationStatus: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  changesRequestedReason?: string;

  // 1. EMPLOYED subdocument
  employment?: {
    companyName: string;
    jobRole: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
    workArrangement: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    compensationAmount?: number;
    compensationPeriod?: 'ANNUAL' | 'MONTHLY';
    currency?: string;
    joiningDate: Date;
    workLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
    industry?: string;
    jobDescription?: string;
    skillsUsed?: string[];
  };

  // 2. SELF_EMPLOYED subdocument
  selfEmployment?: {
    businessName: string;
    businessType: 'STARTUP' | 'FREELANCE' | 'CONSULTANCY' | 'AGENCY' | 'SMALL_BUSINESS' | 'FAMILY_BUSINESS' | 'ONLINE_BUSINESS' | 'OTHER';
    businessStartDate: Date;
    currentStatus?: 'ACTIVE' | 'EARLY_STAGE' | 'GROWING' | 'PAUSED' | 'CLOSED';
    teamSize?: number;
    teamSizeRange?: '1' | '2-5' | '6-10' | '11-25' | '26-50' | '51-100' | '100+';
    incomeRange?: 'NO_REVENUE' | 'BELOW_2L' | '2L_5L' | '5L_10L' | '10L_25L' | '25L_50L' | '50L_PLUS';
    currency?: string;
    industry?: string;
    website?: string;
    description?: string;
    businessLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };

  // 3. HIGHER_STUDIES subdocument
  higherStudies?: {
    institution: string;
    program: string;
    degree?: string;
    specialization?: string;
    country?: string;
    city?: string;
    startDate: Date;
    expectedCompletionDate?: Date;
    admissionStatus?: 'APPLIED' | 'ACCEPTED' | 'ENROLLED' | 'COMPLETED' | 'WITHDRAWN' | 'DEFERRED';
    studyMode?: 'ON_CAMPUS' | 'ONLINE' | 'HYBRID';
    fundingType?: 'SELF_FUNDED' | 'SCHOLARSHIP' | 'LOAN' | 'SPONSORED' | 'ASSISTANTSHIP' | 'OTHER';
  };

  // 4. APPRENTICESHIP subdocument
  apprenticeship?: {
    organization: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    workArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    location?: string;
    industry?: string;
  };

  // 5. INTERNSHIP subdocument
  internship?: {
    companyName: string;
    internshipRole: string;
    startDate: Date;
    endDate?: Date;
    isPaid?: boolean;
    stipendAmount?: number;
    stipendPeriod?: 'MONTHLY' | 'STIPEND_TOTAL';
    currency?: string;
    workArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    location?: string;
    industry?: string;
  };

  // 6. SEEKING_EMPLOYMENT subdocument
  seekingEmployment?: {
    seekingSince: Date;
    preferredRole?: string;
    preferredLocation?: string;
    preferredWorkArrangement?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    notes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const careerOutcomeSchema = new Schema<ICareerOutcome>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    outcomeType: {
      type: String,
      enum: ['EMPLOYED', 'SELF_EMPLOYED', 'HIGHER_STUDIES', 'APPRENTICESHIP', 'INTERNSHIP', 'SEEKING_EMPLOYMENT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'HISTORICAL', 'DRAFT'],
      default: 'ACTIVE',
      index: true,
    },

    // Verification fields
    verificationStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CHANGES_REQUESTED'],
      default: 'NOT_SUBMITTED',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    changesRequestedReason: { type: String },

    employment: {
      companyName: { type: String },
      jobRole: { type: String },
      employmentType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'] },
      workArrangement: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'] },
      compensationAmount: { type: Number },
      compensationPeriod: { type: String, enum: ['ANNUAL', 'MONTHLY'], default: 'ANNUAL' },
      currency: { type: String, default: 'INR' },
      joiningDate: { type: Date },
      workLocation: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
      },
      industry: { type: String },
      jobDescription: { type: String },
      skillsUsed: [{ type: String }],
    },

    selfEmployment: {
      businessName: { type: String },
      businessType: { type: String },
      businessStartDate: { type: Date },
      currentStatus: { type: String, enum: ['ACTIVE', 'EARLY_STAGE', 'GROWING', 'PAUSED', 'CLOSED'], default: 'GROWING' },
      teamSize: { type: Number },
      teamSizeRange: { type: String, enum: ['1', '2-5', '6-10', '11-25', '26-50', '51-100', '100+'] },
      incomeRange: { type: String, enum: ['NO_REVENUE', 'BELOW_2L', '2L_5L', '5L_10L', '10L_25L', '25L_50L', '50L_PLUS'] },
      currency: { type: String, default: 'INR' },
      industry: { type: String },
      website: { type: String },
      description: { type: String },
      businessLocation: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
      },
    },

    higherStudies: {
      institution: { type: String },
      program: { type: String },
      degree: { type: String },
      specialization: { type: String },
      country: { type: String },
      city: { type: String },
      startDate: { type: Date },
      expectedCompletionDate: { type: Date },
      admissionStatus: { type: String, enum: ['APPLIED', 'ACCEPTED', 'ENROLLED', 'COMPLETED', 'WITHDRAWN', 'DEFERRED'], default: 'ENROLLED' },
      studyMode: { type: String, enum: ['ON_CAMPUS', 'ONLINE', 'HYBRID'], default: 'ON_CAMPUS' },
      fundingType: { type: String, enum: ['SELF_FUNDED', 'SCHOLARSHIP', 'LOAN', 'SPONSORED', 'ASSISTANTSHIP', 'OTHER'] },
    },

    apprenticeship: {
      organization: { type: String },
      role: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      workArrangement: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'] },
      location: { type: String },
      industry: { type: String },
    },

    internship: {
      companyName: { type: String },
      internshipRole: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      isPaid: { type: Boolean, default: true },
      stipendAmount: { type: Number },
      stipendPeriod: { type: String, enum: ['MONTHLY', 'STIPEND_TOTAL'], default: 'MONTHLY' },
      currency: { type: String, default: 'INR' },
      workArrangement: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'] },
      location: { type: String },
      industry: { type: String },
    },

    seekingEmployment: {
      seekingSince: { type: Date },
      preferredRole: { type: String },
      preferredLocation: { type: String },
      preferredWorkArrangement: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'] },
      notes: { type: String },
    },
  },
  { timestamps: true }
);

careerOutcomeSchema.index({ userId: 1, status: 1 });
careerOutcomeSchema.index({ verificationStatus: 1 });

export const CareerOutcome = mongoose.model<ICareerOutcome>('CareerOutcome', careerOutcomeSchema);
