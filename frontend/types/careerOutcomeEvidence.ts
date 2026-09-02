export type EvidenceDocumentType =
  | 'OFFER_LETTER'
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
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  extractionStatus?: 'EXTRACTED' | 'PENDING_REVIEW' | 'VERIFIED';
  extractedData?: {
    company?: string;
    jobRole?: string;
    joiningDate?: string;
    declaredSalary?: number;
    grossPay?: number;
    netPay?: number;
    salaryMatchStatus?: 'MATCHED' | 'MISMATCHED' | 'REVIEW_REQUIRED';
    notes?: string;
  };
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}
