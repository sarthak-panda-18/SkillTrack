import mongoose, { Schema, Document } from 'mongoose';

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
  uploadedDate: Date;
  verificationStatus: 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  verificationNotes?: string;
}

export interface ICareerStatus extends Document {
  userId: mongoose.Types.ObjectId;
  currentStatus: CareerStatusType;

  // EMPLOYED status fields
  employmentDetails?: {
    companyName: string;
    jobRole: string;
    industry?: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
    joiningDate?: Date;
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
    trainingCompletedDate?: Date;
    placementReadyDate?: Date;
    appliedDate?: Date;
    interviewDate?: Date;
    offerReceivedDate?: Date;
    joinedDate?: Date;
  };

  employmentDocuments?: IEmploymentDocument[];

  salaryDetails?: {
    startingSalary?: number;
    previousSalary?: number;
    currentSalary?: number;
  };

  // UNEMPLOYED status fields
  unemploymentDetails?: {
    reason?: string;
    preferredLocation?: string;
    expectedSalary?: number;
    skillsDeveloping?: string[];
  };

  // SEEKING_EMPLOYMENT status fields
  seekingEmploymentDetails?: {
    preferredLocation?: string;
    expectedSalary?: number;
    jobSearchStatus?: string;
    skillsDeveloping?: string[];
  };

  // SELF_EMPLOYED status fields
  selfEmploymentDetails?: {
    businessName?: string;
    businessType?: string;
    businessStatus?: string;
    currentIncome?: number;
    numberOfEmployees?: number;
    startDate?: Date;
    industry?: string;
    skillsUsed?: string[];
  };

  // APPRENTICESHIP status fields
  apprenticeshipDetails?: {
    organizationName?: string;
    role?: string;
    stipend?: number;
    startDate?: Date;
    expectedEndDate?: Date;
    workLocation?: string;
    skillsUsed?: string[];
    trainingRelevance?: string;
  };

  // HIGHER_STUDIES status fields
  higherStudiesDetails?: {
    institutionName?: string;
    programme?: string;
    fieldOfStudy?: string;
    startDate?: Date;
    expectedCompletionDate?: Date;
    location?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const employmentDocumentSchema = new Schema<IEmploymentDocument>(
  {
    documentType: {
      type: String,
      enum: ['Employee ID Card', 'Offer Letter', 'Joining Letter', 'Internship Offer Letter', 'Experience Letter', 'Other Employment Proof'],
      required: true,
    },
    fileName: { type: String, required: true },
    originalFileName: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    uploadedDate: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'UNDER_REVIEW',
    },
    verificationNotes: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);

const careerStatusSchema = new Schema<ICareerStatus>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentStatus: {
      type: String,
      enum: ['EMPLOYED', 'SEEKING_EMPLOYMENT', 'UNEMPLOYED', 'SELF_EMPLOYED', 'APPRENTICESHIP', 'HIGHER_STUDIES'],
      default: 'SEEKING_EMPLOYMENT',
      index: true,
    },
    employmentDetails: {
      companyName: { type: String, default: '' },
      jobRole: { type: String, default: '' },
      industry: { type: String, default: 'Information Technology' },
      employmentType: { type: String, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'], default: 'FULL_TIME' },
      joiningDate: { type: Date },
      workLocation: { type: String, default: '' },
      trainingRelevance: { type: String, enum: ['Highly Relevant', 'Relevant', 'Partially Relevant', 'Not Relevant'], default: 'Highly Relevant' },
      jobSatisfaction: { type: Number, default: 4, min: 1, max: 5 },
      skillsUsed: [{ type: String }],
    },
    placementJourney: {
      trainingCompleted: { type: Boolean, default: true },
      placementReady: { type: Boolean, default: true },
      applied: { type: Boolean, default: true },
      interview: { type: Boolean, default: true },
      offerReceived: { type: Boolean, default: true },
      joined: { type: Boolean, default: true },
      employed: { type: Boolean, default: true },
      trainingCompletedDate: { type: Date },
      placementReadyDate: { type: Date },
      appliedDate: { type: Date },
      interviewDate: { type: Date },
      offerReceivedDate: { type: Date },
      joinedDate: { type: Date },
    },
    employmentDocuments: [employmentDocumentSchema],
    salaryDetails: {
      startingSalary: { type: Number, default: 0 },
      previousSalary: { type: Number, default: 0 },
      currentSalary: { type: Number, default: 0 },
    },
    unemploymentDetails: {
      reason: { type: String, default: 'Skill Gap' },
      preferredLocation: { type: String, default: '' },
      expectedSalary: { type: Number, default: 0 },
      skillsDeveloping: [{ type: String }],
    },
    seekingEmploymentDetails: {
      preferredLocation: { type: String, default: '' },
      expectedSalary: { type: Number, default: 0 },
      jobSearchStatus: { type: String, default: 'Actively Applying' },
      skillsDeveloping: [{ type: String }],
    },
    selfEmploymentDetails: {
      businessName: { type: String, default: '' },
      businessType: { type: String, default: '' },
      businessStatus: { type: String, default: 'Startup' },
      currentIncome: { type: Number, default: 0 },
      numberOfEmployees: { type: Number, default: 1 },
      startDate: { type: Date },
      industry: { type: String, default: '' },
      skillsUsed: [{ type: String }],
    },
    apprenticeshipDetails: {
      organizationName: { type: String, default: '' },
      role: { type: String, default: '' },
      stipend: { type: Number, default: 0 },
      startDate: { type: Date },
      expectedEndDate: { type: Date },
      workLocation: { type: String, default: '' },
      skillsUsed: [{ type: String }],
      trainingRelevance: { type: String, default: 'Highly Relevant' },
    },
    higherStudiesDetails: {
      institutionName: { type: String, default: '' },
      programme: { type: String, default: '' },
      fieldOfStudy: { type: String, default: '' },
      startDate: { type: Date },
      expectedCompletionDate: { type: Date },
      location: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const CareerStatus = mongoose.model<ICareerStatus>('CareerStatus', careerStatusSchema);
