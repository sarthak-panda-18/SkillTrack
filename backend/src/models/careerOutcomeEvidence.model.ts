import mongoose, { Schema, Document } from 'mongoose';

export type EvidenceDocumentType =
  | 'OFFER_LETTER'
  | 'INTERNSHIP_OFFER'
  | 'JOINING_LETTER'
  | 'EMPLOYMENT_LETTER'
  | 'EMPLOYEE_ID_CARD'
  | 'PAYSLIP'
  | 'EXPERIENCE_LETTER'
  | 'RELIEVING_LETTER'
  | 'TRAINING_CERTIFICATE'
  | 'COURSE_CERTIFICATE'
  | 'BUSINESS_REGISTRATION'
  | 'BUSINESS_CERTIFICATE'
  | 'ADMISSION_LETTER'
  | 'ENROLLMENT_LETTER'
  | 'STUDENT_ID'
  | 'APPRENTICESHIP_LETTER'
  | 'APPRENTICESHIP_CERTIFICATE'
  | 'INTERNSHIP_CERTIFICATE'
  | 'COMPLETION_CERTIFICATE'
  | 'OTHER';

export type EvidenceStatus = 'UPLOADED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type SalaryMatchStatus = 'MATCHED' | 'MISMATCHED' | 'REVIEW_REQUIRED';

export interface IExtractedEvidenceData {
  company?: string;
  jobRole?: string;
  joiningDate?: Date;
  grossPay?: number;
  netPay?: number;
  declaredSalary?: number;
  employeeId?: string;
  employeeName?: string;
  salaryMatchStatus?: SalaryMatchStatus;
  notes?: string;
}

export interface ICareerOutcomeEvidence extends Document {
  userId: mongoose.Types.ObjectId;
  careerOutcomeId: mongoose.Types.ObjectId;
  documentType: EvidenceDocumentType;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  status: EvidenceStatus;
  extractionStatus?: 'EXTRACTED' | 'PENDING_REVIEW' | 'VERIFIED';
  extractedData?: IExtractedEvidenceData;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const careerOutcomeEvidenceSchema = new Schema<ICareerOutcomeEvidence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerOutcomeId: { type: Schema.Types.ObjectId, ref: 'CareerOutcome', required: true, index: true },
    documentType: {
      type: String,
      enum: [
        'OFFER_LETTER',
        'INTERNSHIP_OFFER',
        'JOINING_LETTER',
        'EMPLOYMENT_LETTER',
        'EMPLOYEE_ID_CARD',
        'PAYSLIP',
        'EXPERIENCE_LETTER',
        'RELIEVING_LETTER',
        'TRAINING_CERTIFICATE',
        'COURSE_CERTIFICATE',
        'BUSINESS_REGISTRATION',
        'BUSINESS_CERTIFICATE',
        'ADMISSION_LETTER',
        'ENROLLMENT_LETTER',
        'STUDENT_ID',
        'APPRENTICESHIP_LETTER',
        'APPRENTICESHIP_CERTIFICATE',
        'INTERNSHIP_CERTIFICATE',
        'COMPLETION_CERTIFICATE',
        'OTHER',
      ],
      required: true,
    },
    originalFileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true },
    status: {
      type: String,
      enum: ['UPLOADED', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'SUBMITTED',
    },
    extractionStatus: {
      type: String,
      enum: ['EXTRACTED', 'PENDING_REVIEW', 'VERIFIED'],
      default: 'EXTRACTED',
    },
    extractedData: {
      company: { type: String },
      jobRole: { type: String },
      joiningDate: { type: Date },
      grossPay: { type: Number },
      netPay: { type: Number },
      declaredSalary: { type: Number },
      employeeId: { type: String },
      employeeName: { type: String },
      salaryMatchStatus: {
        type: String,
        enum: ['MATCHED', 'MISMATCHED', 'REVIEW_REQUIRED'],
        default: 'MATCHED',
      },
      notes: { type: String },
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

careerOutcomeEvidenceSchema.index({ userId: 1, careerOutcomeId: 1 });
careerOutcomeEvidenceSchema.index({ status: 1 });

export const CareerOutcomeEvidence = mongoose.model<ICareerOutcomeEvidence>(
  'CareerOutcomeEvidence',
  careerOutcomeEvidenceSchema
);
