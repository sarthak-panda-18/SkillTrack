import { CareerOutcomeEvidence, ICareerOutcomeEvidence, EvidenceDocumentType } from '../models/careerOutcomeEvidence.model';
import { CareerOutcome } from '../models/careerOutcome.model';
import { CareerOutcomeVerification } from '../models/careerOutcomeVerification.model';
import { storageService } from './storage.service';
import { ApiError } from '../utils/apiError';

export class CareerOutcomeEvidenceService {
  private allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  private maxFileSize = 10 * 1024 * 1024; // 10 MB

  async uploadEvidence(
    userId: string,
    outcomeId: string,
    documentType: EvidenceDocumentType,
    file: Express.Multer.File
  ): Promise<ICareerOutcomeEvidence> {
    if (!file) {
      throw new ApiError(400, 'Document file is required.');
    }

    const outcome = await CareerOutcome.findOne({ _id: outcomeId, userId });
    if (!outcome) {
      throw new ApiError(404, 'Career outcome record not found or access denied.');
    }

    // Validate MIME type & file size
    if (!this.allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new ApiError(400, 'Unsupported file format. Please upload PDF, JPG, JPEG, or PNG files only.', 'UNSUPPORTED_FILE_TYPE');
    }

    if (file.size > this.maxFileSize) {
      throw new ApiError(400, 'File size exceeds maximum limit of 10 MB.', 'FILE_TOO_LARGE');
    }

    // Validate document type relevance to outcome type
    this.validateDocumentTypeRelevance(outcome.outcomeType, documentType);

    // Validate maximum file count per outcome (5 files max)
    const existingCount = await CareerOutcomeEvidence.countDocuments({ userId, careerOutcomeId: outcomeId });
    if (existingCount >= 5) {
      throw new ApiError(400, 'Maximum limit of 5 evidence documents reached for this career outcome.', 'MAX_FILES_REACHED');
    }

    // Save file via storageService
    const { storedFileName, storagePath } = storageService.saveFile(userId, outcomeId, file);

    try {
      const evidence = await CareerOutcomeEvidence.create({
        userId,
        careerOutcomeId: outcomeId,
        documentType,
        originalFileName: file.originalname,
        storedFileName,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath,
        status: 'SUBMITTED',
        uploadedAt: new Date(),
      });

      // Update outcome verificationStatus to SUBMITTED if currently NOT_SUBMITTED or CHANGES_REQUESTED
      const prevStatus = outcome.verificationStatus || 'NOT_SUBMITTED';
      if (prevStatus === 'NOT_SUBMITTED' || prevStatus === 'CHANGES_REQUESTED') {
        outcome.verificationStatus = 'SUBMITTED';
        await outcome.save();

        await CareerOutcomeVerification.create({
          careerOutcomeId: outcome._id,
          studentId: outcome.userId,
          action: prevStatus === 'CHANGES_REQUESTED' ? 'RESUBMITTED' : 'SUBMITTED',
          previousStatus: prevStatus,
          newStatus: 'SUBMITTED',
          notes: `Evidence document '${file.originalname}' uploaded by student.`,
        });
      }

      return evidence;
    } catch (err) {
      // Clean up uploaded file if database record creation fails
      storageService.deleteFile(storagePath);
      throw err;
    }
  }

  async getEvidenceList(userId: string, outcomeId: string): Promise<ICareerOutcomeEvidence[]> {
    const outcome = await CareerOutcome.findOne({ _id: outcomeId, userId });
    if (!outcome) {
      throw new ApiError(404, 'Career outcome record not found or access denied.');
    }

    return CareerOutcomeEvidence.find({ userId, careerOutcomeId: outcomeId }).sort({ uploadedAt: -1 });
  }

  async getEvidenceFile(
    userId: string,
    outcomeId: string,
    evidenceId: string
  ): Promise<{ evidence: ICareerOutcomeEvidence; storagePath: string }> {
    const evidence = await CareerOutcomeEvidence.findOne({ _id: evidenceId, userId, careerOutcomeId: outcomeId });
    if (!evidence) {
      throw new ApiError(404, 'Evidence document not found or access denied.');
    }

    if (!storageService.fileExists(evidence.storagePath)) {
      throw new ApiError(404, 'Evidence file storage asset missing or removed.');
    }

    return { evidence, storagePath: evidence.storagePath };
  }

  async deleteEvidence(userId: string, outcomeId: string, evidenceId: string): Promise<boolean> {
    const evidence = await CareerOutcomeEvidence.findOne({ _id: evidenceId, userId, careerOutcomeId: outcomeId });
    if (!evidence) {
      throw new ApiError(404, 'Evidence document not found or access denied.');
    }

    // Remove file from storage
    storageService.deleteFile(evidence.storagePath);

    // Remove metadata record
    await CareerOutcomeEvidence.deleteOne({ _id: evidenceId });

    return true;
  }

  private validateDocumentTypeRelevance(outcomeType: string, documentType: EvidenceDocumentType): void {
    if (documentType === 'OTHER') return;

    const allowedMap: Record<string, EvidenceDocumentType[]> = {
      EMPLOYED: ['OFFER_LETTER', 'JOINING_LETTER', 'EMPLOYMENT_LETTER', 'OTHER'],
      SELF_EMPLOYED: ['BUSINESS_REGISTRATION', 'BUSINESS_CERTIFICATE', 'OTHER'],
      HIGHER_STUDIES: ['ADMISSION_LETTER', 'ENROLLMENT_LETTER', 'STUDENT_ID', 'OTHER'],
      APPRENTICESHIP: ['APPRENTICESHIP_LETTER', 'APPRENTICESHIP_CERTIFICATE', 'OTHER'],
      INTERNSHIP: ['INTERNSHIP_OFFER', 'INTERNSHIP_CERTIFICATE', 'COMPLETION_CERTIFICATE', 'OTHER'],
      SEEKING_EMPLOYMENT: ['OTHER'],
    };

    const allowed = allowedMap[outcomeType] || ['OTHER'];
    if (!allowed.includes(documentType)) {
      throw new ApiError(
        400,
        `Document type '${documentType}' is not relevant for ${outcomeType.replace('_', ' ')} outcome.`
      );
    }
  }
}

export const careerOutcomeEvidenceService = new CareerOutcomeEvidenceService();
