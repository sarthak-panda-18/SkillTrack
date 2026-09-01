import { CareerOutcome, ICareerOutcome, OutcomeType } from '../models/careerOutcome.model';
import { CareerOutcomeVerification } from '../models/careerOutcomeVerification.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';

export class CareerOutcomeService {
  async getCurrentOutcome(userId: string): Promise<ICareerOutcome | null> {
    const outcome = await CareerOutcome.findOne({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 });
    return outcome;
  }

  async getOutcomeHistory(userId: string): Promise<ICareerOutcome[]> {
    return CareerOutcome.find({ userId }).sort({ createdAt: -1 });
  }

  async createOutcome(userId: string, payload: any): Promise<ICareerOutcome> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User profile not found.');

    const { outcomeType, employment, selfEmployment, higherStudies, apprenticeship, internship, seekingEmployment } = payload;

    if (!outcomeType) {
      throw new ApiError(400, 'Career outcome type is required.');
    }

    // Validate minimum required fields per outcome type
    this.validateOutcomePayload(outcomeType, payload);

    // Archive previous active outcomes
    await CareerOutcome.updateMany(
      { userId, status: 'ACTIVE' },
      { $set: { status: 'HISTORICAL' } }
    );

    const newOutcome = await CareerOutcome.create({
      userId,
      outcomeType,
      status: 'ACTIVE',
      verificationStatus: 'NOT_SUBMITTED',
      employment: outcomeType === 'EMPLOYED' ? employment : undefined,
      selfEmployment: outcomeType === 'SELF_EMPLOYED' ? selfEmployment : undefined,
      higherStudies: outcomeType === 'HIGHER_STUDIES' ? higherStudies : undefined,
      apprenticeship: outcomeType === 'APPRENTICESHIP' ? apprenticeship : undefined,
      internship: outcomeType === 'INTERNSHIP' ? internship : undefined,
      seekingEmployment: outcomeType === 'SEEKING_EMPLOYMENT' ? seekingEmployment : undefined,
    });

    await CareerOutcomeVerification.create({
      careerOutcomeId: newOutcome._id,
      studentId: userId,
      action: 'SUBMITTED',
      newStatus: 'NOT_SUBMITTED',
      notes: `New ${outcomeType.replace('_', ' ')} career outcome recorded by student.`,
    });

    return newOutcome;
  }

  async updateOutcome(userId: string, outcomeId: string, payload: any): Promise<ICareerOutcome> {
    const outcome = await CareerOutcome.findOne({ _id: outcomeId, userId });
    if (!outcome) throw new ApiError(404, 'Career outcome record not found or access denied.');

    const { outcomeType, employment, selfEmployment, higherStudies, apprenticeship, internship, seekingEmployment } = payload;
    const typeToValidate = outcomeType || outcome.outcomeType;

    this.validateOutcomePayload(typeToValidate, payload);

    const prevVerificationStatus = outcome.verificationStatus;

    if (outcomeType) outcome.outcomeType = outcomeType;
    if (employment && typeToValidate === 'EMPLOYED') outcome.employment = employment;
    if (selfEmployment && typeToValidate === 'SELF_EMPLOYED') outcome.selfEmployment = selfEmployment;
    if (higherStudies && typeToValidate === 'HIGHER_STUDIES') outcome.higherStudies = higherStudies;
    if (apprenticeship && typeToValidate === 'APPRENTICESHIP') outcome.apprenticeship = apprenticeship;
    if (internship && typeToValidate === 'INTERNSHIP') outcome.internship = internship;
    if (seekingEmployment && typeToValidate === 'SEEKING_EMPLOYMENT') outcome.seekingEmployment = seekingEmployment;

    // Reset verification status to SUBMITTED if outcome details are modified while VERIFIED
    if (prevVerificationStatus === 'VERIFIED') {
      outcome.verificationStatus = 'SUBMITTED';
      await CareerOutcomeVerification.create({
        careerOutcomeId: outcome._id,
        studentId: outcome.userId,
        action: 'RESUBMITTED',
        previousStatus: 'VERIFIED',
        newStatus: 'SUBMITTED',
        notes: 'Outcome details updated by student after verification. Re-verification required.',
      });
    }

    await outcome.save();
    return outcome;
  }

  async archiveOutcome(userId: string, outcomeId: string): Promise<ICareerOutcome> {
    const outcome = await CareerOutcome.findOne({ _id: outcomeId, userId });
    if (!outcome) throw new ApiError(404, 'Career outcome record not found or access denied.');

    outcome.status = 'HISTORICAL';
    await outcome.save();
    return outcome;
  }

  private validateOutcomePayload(outcomeType: OutcomeType, payload: any): void {
    if (outcomeType === 'EMPLOYED') {
      const emp = payload.employment || {};
      if (!emp.companyName?.trim()) throw new ApiError(400, 'Company name is required for Employment outcome.');
      if (!emp.jobRole?.trim()) throw new ApiError(400, 'Job role is required for Employment outcome.');
      if (!emp.joiningDate) throw new ApiError(400, 'Joining date is required for Employment outcome.');
    } else if (outcomeType === 'SELF_EMPLOYED') {
      const self = payload.selfEmployment || {};
      if (!self.businessName?.trim()) throw new ApiError(400, 'Business name is required for Self-Employed outcome.');
      if (!self.businessType?.trim()) throw new ApiError(400, 'Business type is required for Self-Employed outcome.');
      if (!self.businessStartDate) throw new ApiError(400, 'Start date is required for Self-Employed outcome.');
      if (self.website && self.website.trim()) {
        const urlPattern = /^(https?:\/\/)?([\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/i;
        if (!urlPattern.test(self.website.trim())) {
          throw new ApiError(400, 'Please enter a valid website URL (e.g. https://example.com).');
        }
      }
    } else if (outcomeType === 'HIGHER_STUDIES') {
      const hs = payload.higherStudies || {};
      if (!hs.institution?.trim()) throw new ApiError(400, 'Institution name is required for Higher Studies outcome.');
      if (!hs.program?.trim()) throw new ApiError(400, 'Program/degree is required for Higher Studies outcome.');
      if (!hs.startDate) throw new ApiError(400, 'Start date is required for Higher Studies outcome.');
      if (hs.expectedCompletionDate && hs.startDate) {
        if (new Date(hs.expectedCompletionDate).getTime() < new Date(hs.startDate).getTime()) {
          throw new ApiError(400, 'Expected completion date cannot be before program start date.');
        }
      }
    } else if (outcomeType === 'APPRENTICESHIP') {
      const app = payload.apprenticeship || {};
      if (!app.organization?.trim()) throw new ApiError(400, 'Organization name is required for Apprenticeship outcome.');
      if (!app.role?.trim()) throw new ApiError(400, 'Apprenticeship role is required.');
      if (!app.startDate) throw new ApiError(400, 'Start date is required for Apprenticeship outcome.');
      if (app.endDate && app.startDate) {
        if (new Date(app.endDate).getTime() < new Date(app.startDate).getTime()) {
          throw new ApiError(400, 'End date cannot be before start date.');
        }
      }
    } else if (outcomeType === 'INTERNSHIP') {
      const intern = payload.internship || {};
      if (!intern.companyName?.trim()) throw new ApiError(400, 'Company/Organization name is required for Internship outcome.');
      if (!intern.internshipRole?.trim()) throw new ApiError(400, 'Internship role is required.');
      if (!intern.startDate) throw new ApiError(400, 'Start date is required for Internship outcome.');
      if (intern.endDate && intern.startDate) {
        if (new Date(intern.endDate).getTime() < new Date(intern.startDate).getTime()) {
          throw new ApiError(400, 'End date cannot be before start date.');
        }
      }
    } else if (outcomeType === 'SEEKING_EMPLOYMENT') {
      const seek = payload.seekingEmployment || {};
      if (!seek.seekingSince) throw new ApiError(400, 'Seeking since date is required.');
    } else {
      throw new ApiError(400, `Unsupported career outcome type: ${outcomeType}`);
    }
  }
}

export const careerOutcomeService = new CareerOutcomeService();
