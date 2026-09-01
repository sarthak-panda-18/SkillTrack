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

export interface CareerOutcomeEvidenceData {
  _id: string;
  userId: string;
  careerOutcomeId: string;
  documentType: EvidenceDocumentType;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  status: 'SUBMITTED';
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}
