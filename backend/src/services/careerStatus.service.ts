import { CareerStatus, ICareerStatus, IEmploymentDocument } from '../models/careerStatus.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { storageService } from './storage.service';

export class CareerStatusService {
  async getCareerStatus(userId: string): Promise<ICareerStatus> {
    let statusDoc = await CareerStatus.findOne({ userId });
    if (!statusDoc) {
      const user = await User.findById(userId);
      statusDoc = await CareerStatus.create({
        userId,
        currentStatus: 'SEEKING_EMPLOYMENT',
        seekingEmploymentDetails: {
          preferredLocation: user?.district || 'India',
          expectedSalary: 600000,
          jobSearchStatus: 'Actively Applying',
          skillsDeveloping: ['Java', 'React', 'SQL'],
        },
        employmentDetails: {
          companyName: '',
          jobRole: user?.targetRole || 'Software Engineer',
          industry: 'Information Technology',
          employmentType: 'FULL_TIME',
          workLocation: 'India',
          trainingRelevance: 'Highly Relevant',
          jobSatisfaction: 4,
          skillsUsed: ['Java', 'Spring Boot'],
        },
        placementJourney: {
          trainingCompleted: true,
          placementReady: true,
          applied: true,
          interview: true,
          offerReceived: true,
          joined: true,
          employed: true,
        },
        salaryDetails: {
          startingSalary: 450000,
          previousSalary: 450000,
          currentSalary: 600000,
        },
        unemploymentDetails: {
          reason: 'Skill Gap',
          preferredLocation: 'India',
          expectedSalary: 600000,
          skillsDeveloping: ['Java', 'SQL', 'Data Structures'],
        },
      });
    }
    return statusDoc;
  }

  async updateCareerStatus(userId: string, data: any): Promise<ICareerStatus> {
    let statusDoc = await CareerStatus.findOne({ userId });
    if (!statusDoc) {
      statusDoc = new CareerStatus({ userId });
    }

    if (data.currentStatus) {
      statusDoc.currentStatus = data.currentStatus;
      // Also sync placementStage on User model for backward consistency in Trainer analytics
      const stageMap: Record<string, string> = {
        EMPLOYED: 'EMPLOYED',
        SEEKING_EMPLOYMENT: 'SEEKING_EMPLOYMENT',
        UNEMPLOYED: 'SEEKING_EMPLOYMENT',
        SELF_EMPLOYED: 'EMPLOYED',
        APPRENTICESHIP: 'EMPLOYED',
        HIGHER_STUDIES: 'PLACEMENT_READY',
      };
      if (stageMap[data.currentStatus]) {
        await User.findByIdAndUpdate(userId, { placementStage: stageMap[data.currentStatus] });
      }
    }

    if (data.employmentDetails) {
      statusDoc.employmentDetails = {
        ...statusDoc.employmentDetails,
        ...data.employmentDetails,
      };
    }

    if (data.placementJourney) {
      statusDoc.placementJourney = {
        ...statusDoc.placementJourney,
        ...data.placementJourney,
      };
    }

    if (data.salaryDetails) {
      statusDoc.salaryDetails = {
        ...statusDoc.salaryDetails,
        ...data.salaryDetails,
      };
    }

    if (data.unemploymentDetails) {
      statusDoc.unemploymentDetails = {
        ...statusDoc.unemploymentDetails,
        ...data.unemploymentDetails,
      };
    }

    if (data.seekingEmploymentDetails) {
      statusDoc.seekingEmploymentDetails = {
        ...statusDoc.seekingEmploymentDetails,
        ...data.seekingEmploymentDetails,
      };
    }

    if (data.selfEmploymentDetails) {
      statusDoc.selfEmploymentDetails = {
        ...statusDoc.selfEmploymentDetails,
        ...data.selfEmploymentDetails,
      };
    }

    if (data.apprenticeshipDetails) {
      statusDoc.apprenticeshipDetails = {
        ...statusDoc.apprenticeshipDetails,
        ...data.apprenticeshipDetails,
      };
    }

    if (data.higherStudiesDetails) {
      statusDoc.higherStudiesDetails = {
        ...statusDoc.higherStudiesDetails,
        ...data.higherStudiesDetails,
      };
    }

    await statusDoc.save();
    return statusDoc;
  }

  async addEmploymentDocument(
    userId: string,
    file: Express.Multer.File,
    docData: { documentType: string; fileName?: string }
  ): Promise<ICareerStatus> {
    if (!file) throw new ApiError(400, 'Document file is required.');

    const statusDoc = await this.getCareerStatus(userId);
    if (!statusDoc.employmentDocuments) {
      statusDoc.employmentDocuments = [];
    }

    const { fileUrl } = storageService.saveDocumentFile(userId, file);
    const displayTitle = docData.fileName || file.originalname;

    statusDoc.employmentDocuments.push({
      documentType: docData.documentType as any,
      fileName: displayTitle,
      originalFileName: file.originalname,
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedDate: new Date(),
      verificationStatus: 'UNDER_REVIEW',
    });

    await statusDoc.save();
    return statusDoc;
  }

  async deleteEmploymentDocument(userId: string, docId: string): Promise<ICareerStatus> {
    const statusDoc = await this.getCareerStatus(userId);
    if (statusDoc.employmentDocuments) {
      statusDoc.employmentDocuments = statusDoc.employmentDocuments.filter(
        (doc: any) => doc._id?.toString() !== docId
      );
      await statusDoc.save();
    }
    return statusDoc;
  }

  async verifyEmploymentDocument(docId: string, status: 'VERIFIED' | 'REJECTED', notes?: string): Promise<ICareerStatus> {
    const statusDoc = await CareerStatus.findOne({ 'employmentDocuments._id': docId });
    if (!statusDoc) throw new ApiError(404, 'Employment document not found');

    const doc = statusDoc.employmentDocuments?.find((d: any) => d._id?.toString() === docId);
    if (doc) {
      doc.verificationStatus = status;
      doc.verificationNotes = notes || '';
      await statusDoc.save();
    }
    return statusDoc;
  }
}

export const careerStatusService = new CareerStatusService();
