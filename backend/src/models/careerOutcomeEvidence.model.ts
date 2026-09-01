import mongoose, { Schema, Document } from 'mongoose';

export type EvidenceDocumentType =
  | 'OFFER_LETTER'
  | 'JOINING_LETTER'
  | 'EMPLOYMENT_LETTER'
  | 'BUSINESS_REGISTRATION'
  | 'BUSINESS_CERTIFICATE'
  | 'ADMISSION_LETTER'
  | 'ENROLLMENT_LETTER'
  | 'STUDENT_ID'
  | 'APPRENTICESHIP_LETTER'
  | 'APPRENTICESHIP_CERTIFICATE'
  | 'INTERNSHIP_OFFER'
  | 'INTERNSHIP_CERTIFICATE'
  | 'COMPLETION_CERTIFICATE'
  | 'OTHER';

export type EvidenceStatus = 'SUBMITTED';

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
        'JOINING_LETTER',
        'EMPLOYMENT_LETTER',
        'BUSINESS_REGISTRATION',
        'BUSINESS_CERTIFICATE',
        'ADMISSION_LETTER',
        'ENROLLMENT_LETTER',
        'STUDENT_ID',
        'APPRENTICESHIP_LETTER',
        'APPRENTICESHIP_CERTIFICATE',
        'INTERNSHIP_OFFER',
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
    status: { type: String, enum: ['SUBMITTED'], default: 'SUBMITTED' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

careerOutcomeEvidenceSchema.index({ userId: 1, careerOutcomeId: 1 });

export const CareerOutcomeEvidence = mongoose.model<ICareerOutcomeEvidence>(
  'CareerOutcomeEvidence',
  careerOutcomeEvidenceSchema
);
