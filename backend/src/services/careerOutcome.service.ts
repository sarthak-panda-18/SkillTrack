import { CareerOutcome, ICareerOutcome, OutcomeType } from '../models/careerOutcome.model';
import { CareerOutcomeVerification } from '../models/careerOutcomeVerification.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
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

    let { outcomeType, employment, selfEmployment, higherStudies, apprenticeship, internship, seekingEmployment } = payload;

    if (!outcomeType) {
      throw new ApiError(400, 'Career outcome type is required.');
    }

    // Map aliased outcome types
    if (outcomeType === 'LOOKING_FOR_EMPLOYMENT' || outcomeType === 'UNEMPLOYED') {
      if (!seekingEmployment && (payload.unemployed || payload.lookingForEmployment)) {
        seekingEmployment = payload.unemployed || payload.lookingForEmployment;
      }
    }

    // Validate minimum required fields per outcome type
    this.validateOutcomePayload(outcomeType, payload);

    // Calculate Salary Growth if EMPLOYED
    if (outcomeType === 'EMPLOYED' && employment) {
      employment = await this.enrichEmploymentSalaryGrowth(userId, employment);
    }

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
      seekingEmployment: (outcomeType === 'SEEKING_EMPLOYMENT' || outcomeType === 'LOOKING_FOR_EMPLOYMENT' || outcomeType === 'UNEMPLOYED') ? seekingEmployment : undefined,
    });

    await CareerOutcomeVerification.create({
      careerOutcomeId: newOutcome._id,
      studentId: userId,
      action: 'SUBMITTED',
      newStatus: 'NOT_SUBMITTED',
      notes: `New ${outcomeType.replace(/_/g, ' ')} career outcome recorded by student.`,
    });

    // Notify admins / trainers about career outcome update
    const admins = await User.find({ role: { $in: ['ADMIN', 'TRAINER'] } }).select('_id');
    if (admins.length > 0) {
      const formattedType = outcomeType.replace(/_/g, ' ');
      const notifications = admins.map(admin => ({
        userId: admin._id,
        type: 'SYSTEM' as const,
        title: 'Student Career Outcome Updated',
        message: `Student ${user.name} updated their career outcome to ${formattedType}.`,
        link: `/admin/users/${userId}`,
        entityId: newOutcome._id.toString(),
      }));
      await Notification.insertMany(notifications);
    }

    return newOutcome;
  }

  async updateOutcome(userId: string, outcomeId: string, payload: any): Promise<ICareerOutcome> {
    const outcome = await CareerOutcome.findOne({ _id: outcomeId, userId });
    if (!outcome) throw new ApiError(404, 'Career outcome record not found or access denied.');

    let { outcomeType, employment, selfEmployment, higherStudies, apprenticeship, internship, seekingEmployment } = payload;
    const typeToValidate = outcomeType || outcome.outcomeType;

    this.validateOutcomePayload(typeToValidate, payload);

    if (typeToValidate === 'EMPLOYED' && employment) {
      employment = await this.enrichEmploymentSalaryGrowth(userId, employment, outcome);
    }

    const prevVerificationStatus = outcome.verificationStatus;

    if (outcomeType) outcome.outcomeType = outcomeType;
    if (employment && (typeToValidate === 'EMPLOYED')) outcome.employment = employment;
    if (selfEmployment && (typeToValidate === 'SELF_EMPLOYED')) outcome.selfEmployment = selfEmployment;
    if (higherStudies && (typeToValidate === 'HIGHER_STUDIES')) outcome.higherStudies = higherStudies;
    if (apprenticeship && (typeToValidate === 'APPRENTICESHIP')) outcome.apprenticeship = apprenticeship;
    if (internship && (typeToValidate === 'INTERNSHIP')) outcome.internship = internship;
    if (seekingEmployment && (typeToValidate === 'SEEKING_EMPLOYMENT' || typeToValidate === 'LOOKING_FOR_EMPLOYMENT' || typeToValidate === 'UNEMPLOYED')) {
      outcome.seekingEmployment = seekingEmployment;
    }

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

  private async enrichEmploymentSalaryGrowth(userId: string, employment: any, existingOutcome?: ICareerOutcome): Promise<any> {
    const currentSal = Number(employment.compensationAmount) || 0;
    let prevSal = Number(employment.previousCompensationAmount) || 0;

    // If previous compensation amount not passed explicitly, lookup historical outcomes
    if (!prevSal) {
      const historicalEmpl = await CareerOutcome.findOne({
        userId,
        _id: { $ne: existingOutcome?._id },
        'employment.compensationAmount': { $gt: 0 }
      }).sort({ createdAt: -1 });

      if (historicalEmpl?.employment?.compensationAmount) {
        prevSal = historicalEmpl.employment.compensationAmount;
      }
    }

    if (currentSal > 0 && prevSal > 0) {
      const growthAmount = currentSal - prevSal;
      const growthPct = Number(((growthAmount / prevSal) * 100).toFixed(2));
      return {
        ...employment,
        compensationAmount: currentSal,
        previousCompensationAmount: prevSal,
        salaryGrowthAmount: growthAmount,
        salaryGrowthPercentage: growthPct,
      };
    }

    return {
      ...employment,
      compensationAmount: currentSal,
      previousCompensationAmount: prevSal || undefined,
      salaryGrowthAmount: 0,
      salaryGrowthPercentage: 0,
    };
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
    } else if (outcomeType === 'SEEKING_EMPLOYMENT' || outcomeType === 'LOOKING_FOR_EMPLOYMENT' || outcomeType === 'UNEMPLOYED') {
      const seek = payload.seekingEmployment || payload.unemployed || payload.lookingForEmployment || {};
      if (!seek.seekingSince && !seek.lastUpdatedDate) {
        // Default to current date if missing
        seek.seekingSince = new Date();
      }
    } else {
      throw new ApiError(400, `Unsupported career outcome type: ${outcomeType}`);
    }
  }
}

export const careerOutcomeService = new CareerOutcomeService();

