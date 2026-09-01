import { CareerOutcome, ICareerOutcome, VerificationStatus } from '../models/careerOutcome.model';
import { CareerOutcomeEvidence } from '../models/careerOutcomeEvidence.model';
import { CareerOutcomeVerification, ICareerOutcomeVerification } from '../models/careerOutcomeVerification.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';

export interface QueueQueryParams {
  status?: string;
  outcomeType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class CareerOutcomeVerificationService {
  async getVerificationQueue(params: QueueQueryParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (params.status && params.status !== 'ALL') {
      filter.verificationStatus = params.status;
    } else {
      filter.verificationStatus = { $in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CHANGES_REQUESTED'] };
    }

    if (params.outcomeType && params.outcomeType !== 'ALL') {
      filter.outcomeType = params.outcomeType;
    }

    // Search by student name/email or company/institution
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { userId: { $in: userIds } },
        { 'employment.companyName': searchRegex },
        { 'employment.jobRole': searchRegex },
        { 'selfEmployment.businessName': searchRegex },
        { 'higherStudies.institution': searchRegex },
        { 'internship.companyName': searchRegex },
      ];
    }

    const [outcomes, totalCount] = await Promise.all([
      CareerOutcome.find(filter)
        .populate('userId', 'name email collegeId profilePicture')
        .populate('verifiedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      CareerOutcome.countDocuments(filter),
    ]);

    // Fetch counts for all verification status categories
    const [pendingCount, underReviewCount, verifiedCount, changesRequestedCount, rejectedCount] = await Promise.all([
      CareerOutcome.countDocuments({ verificationStatus: 'SUBMITTED' }),
      CareerOutcome.countDocuments({ verificationStatus: 'UNDER_REVIEW' }),
      CareerOutcome.countDocuments({ verificationStatus: 'VERIFIED' }),
      CareerOutcome.countDocuments({ verificationStatus: 'CHANGES_REQUESTED' }),
      CareerOutcome.countDocuments({ verificationStatus: 'REJECTED' }),
    ]);

    // For each outcome in the list, count evidence documents attached
    const enrichedOutcomes = await Promise.all(
      outcomes.map(async (outcome) => {
        const evidenceCount = await CareerOutcomeEvidence.countDocuments({ careerOutcomeId: outcome._id });
        return {
          ...outcome.toObject(),
          evidenceCount,
        };
      })
    );

    return {
      outcomes: enrichedOutcomes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        pending: pendingCount,
        underReview: underReviewCount,
        verified: verifiedCount,
        changesRequested: changesRequestedCount,
        rejected: rejectedCount,
        total: pendingCount + underReviewCount + verifiedCount + changesRequestedCount + rejectedCount,
      },
    };
  }

  async getVerificationDetails(outcomeId: string) {
    const outcome = await CareerOutcome.findById(outcomeId)
      .populate('userId', 'name email collegeId phone bio profilePicture')
      .populate('verifiedBy', 'name email');

    if (!outcome) {
      throw new ApiError(404, 'Career outcome submission record not found.');
    }

    const evidenceList = await CareerOutcomeEvidence.find({ careerOutcomeId: outcomeId }).sort({ uploadedAt: -1 });

    const auditHistory = await CareerOutcomeVerification.find({ careerOutcomeId: outcomeId })
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });

    return {
      outcome,
      evidenceList,
      auditHistory,
    };
  }

  async startReview(adminId: string, outcomeId: string): Promise<ICareerOutcome> {
    const outcome = await CareerOutcome.findById(outcomeId);
    if (!outcome) throw new ApiError(404, 'Outcome record not found.');

    const prevStatus = outcome.verificationStatus;
    if (prevStatus === 'VERIFIED') {
      throw new ApiError(400, 'Outcome is already verified.');
    }

    outcome.verificationStatus = 'UNDER_REVIEW';
    await outcome.save();

    await CareerOutcomeVerification.create({
      careerOutcomeId: outcome._id,
      studentId: outcome.userId,
      reviewerId: adminId,
      action: 'START_REVIEW',
      previousStatus: prevStatus,
      newStatus: 'UNDER_REVIEW',
      notes: 'Review initiated by administrator.',
    });

    return outcome;
  }

  async verifyOutcome(adminId: string, outcomeId: string, notes?: string): Promise<ICareerOutcome> {
    const outcome = await CareerOutcome.findById(outcomeId);
    if (!outcome) throw new ApiError(404, 'Outcome record not found.');

    // Check that at least 1 evidence document exists for evidence-required outcome types
    if (outcome.outcomeType !== 'SEEKING_EMPLOYMENT') {
      const evidenceCount = await CareerOutcomeEvidence.countDocuments({ careerOutcomeId: outcomeId });
      if (evidenceCount === 0) {
        throw new ApiError(400, 'Cannot verify outcome: No supporting evidence documents have been uploaded by student.');
      }
    }

    const prevStatus = outcome.verificationStatus;
    outcome.verificationStatus = 'VERIFIED';
    outcome.verifiedBy = adminId as any;
    outcome.verifiedAt = new Date();
    await outcome.save();

    await CareerOutcomeVerification.create({
      careerOutcomeId: outcome._id,
      studentId: outcome.userId,
      reviewerId: adminId,
      action: 'VERIFIED',
      previousStatus: prevStatus,
      newStatus: 'VERIFIED',
      notes: notes || 'Outcome verified by administrator.',
    });

    return outcome;
  }

  async rejectOutcome(adminId: string, outcomeId: string, reason: string, notes?: string): Promise<ICareerOutcome> {
    if (!reason || !reason.trim()) {
      throw new ApiError(400, 'A non-empty rejection reason is required.');
    }

    const outcome = await CareerOutcome.findById(outcomeId);
    if (!outcome) throw new ApiError(404, 'Outcome record not found.');

    const prevStatus = outcome.verificationStatus;
    outcome.verificationStatus = 'REJECTED';
    outcome.rejectionReason = reason.trim();
    await outcome.save();

    await CareerOutcomeVerification.create({
      careerOutcomeId: outcome._id,
      studentId: outcome.userId,
      reviewerId: adminId,
      action: 'REJECTED',
      previousStatus: prevStatus,
      newStatus: 'REJECTED',
      reason: reason.trim(),
      notes: notes || 'Outcome rejected by administrator.',
    });

    return outcome;
  }

  async requestChanges(adminId: string, outcomeId: string, reason: string, notes?: string): Promise<ICareerOutcome> {
    if (!reason || !reason.trim()) {
      throw new ApiError(400, 'A non-empty reason is required when requesting changes.');
    }

    const outcome = await CareerOutcome.findById(outcomeId);
    if (!outcome) throw new ApiError(404, 'Outcome record not found.');

    const prevStatus = outcome.verificationStatus;
    outcome.verificationStatus = 'CHANGES_REQUESTED';
    outcome.changesRequestedReason = reason.trim();
    await outcome.save();

    await CareerOutcomeVerification.create({
      careerOutcomeId: outcome._id,
      studentId: outcome.userId,
      reviewerId: adminId,
      action: 'CHANGES_REQUESTED',
      previousStatus: prevStatus,
      newStatus: 'CHANGES_REQUESTED',
      reason: reason.trim(),
      notes: notes || 'Changes requested by administrator.',
    });

    return outcome;
  }
}

export const careerOutcomeVerificationService = new CareerOutcomeVerificationService();
