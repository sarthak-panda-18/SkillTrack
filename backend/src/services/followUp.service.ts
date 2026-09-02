import { FollowUp, IFollowUp, CheckpointType, FollowUpStatus } from '../models/followUp.model';
import { User } from '../models/user.model';
import { CareerOutcome } from '../models/careerOutcome.model';
import { Notification } from '../models/notification.model';
import { ApiError } from '../utils/apiError';

export class FollowUpService {
  /**
   * Automatically generate 30, 90, 180, and 365-day follow-up checkpoints for a student
   * when they set/update their initial outcome or complete training.
   */
  async initializeStudentFollowUps(userId: string): Promise<IFollowUp[]> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'Student not found.');

    const activeOutcome = await CareerOutcome.findOne({ userId, status: 'ACTIVE' });
    const baseDate = activeOutcome?.createdAt || user.createdAt || new Date();

    const checkpoints: { checkpoint: CheckpointType; days: number }[] = [
      { checkpoint: '30_DAY', days: 30 },
      { checkpoint: '90_DAY', days: 90 },
      { checkpoint: '180_DAY', days: 180 },
      { checkpoint: '365_DAY', days: 365 },
    ];

    const results: IFollowUp[] = [];

    for (const cp of checkpoints) {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + cp.days);

      let status: FollowUpStatus = 'UPCOMING';
      if (new Date() > dueDate) {
        status = 'DUE';
      }

      const existing = await FollowUp.findOne({ userId, checkpoint: cp.checkpoint });
      if (!existing) {
        const created = await FollowUp.create({
          userId,
          careerOutcomeId: activeOutcome?._id,
          checkpoint: cp.checkpoint,
          dueDate,
          status,
        });
        results.push(created);
      } else {
        results.push(existing);
      }
    }

    return results;
  }

  /**
   * Fetch all follow-up checkpoints for a specific student.
   */
  async getStudentFollowUps(userId: string): Promise<IFollowUp[]> {
    let followUps: IFollowUp[] = await FollowUp.find({ userId }).sort({ dueDate: 1 });
    if (followUps.length === 0) {
      followUps = await this.initializeStudentFollowUps(userId);
    }

    // Auto-update status for overdue items
    const now = new Date();
    for (const f of followUps) {
      if (f.status === 'UPCOMING' && now >= f.dueDate) {
        f.status = 'DUE';
        await f.save();
      } else if (f.status === 'DUE' && now.getTime() - f.dueDate.getTime() > 14 * 24 * 60 * 60 * 1000) {
        f.status = 'OVERDUE';
        await f.save();
      }
    }

    return followUps;
  }

  /**
   * Submit student response to a follow-up checkpoint.
   */
  async submitFollowUpResponse(userId: string, followUpId: string, payload: any): Promise<IFollowUp> {
    const followUp = await FollowUp.findOne({ _id: followUpId, userId });
    if (!followUp) throw new ApiError(404, 'Follow-up record not found or access denied.');

    const {
      employmentStatus,
      companyName,
      jobRole,
      currentSalary,
      location,
      skillsUsed,
      trainingRelevance,
      jobSatisfaction,
      employmentContinuity,
      jobChangesCount,
      reasonForNonPlacement,
      notes,
    } = payload;

    followUp.employmentStatus = employmentStatus || followUp.employmentStatus;
    followUp.companyName = companyName || followUp.companyName;
    followUp.jobRole = jobRole || followUp.jobRole;
    followUp.currentSalary = currentSalary !== undefined ? currentSalary : followUp.currentSalary;
    followUp.location = location || followUp.location;
    followUp.skillsUsed = skillsUsed || followUp.skillsUsed;
    followUp.trainingRelevance = trainingRelevance || followUp.trainingRelevance;
    followUp.jobSatisfaction = jobSatisfaction || followUp.jobSatisfaction;
    followUp.employmentContinuity = employmentContinuity !== undefined ? employmentContinuity : followUp.employmentContinuity;
    followUp.jobChangesCount = jobChangesCount !== undefined ? jobChangesCount : followUp.jobChangesCount;
    followUp.reasonForNonPlacement = reasonForNonPlacement || followUp.reasonForNonPlacement;
    followUp.notes = notes || followUp.notes;
    followUp.status = 'COMPLETED';
    followUp.completedDate = new Date();

    await followUp.save();

    // If student updated current salary or status, enrich active outcome
    if (currentSalary || employmentStatus) {
      const activeOutcome = await CareerOutcome.findOne({ userId, status: 'ACTIVE' });
      if (activeOutcome && activeOutcome.outcomeType === 'EMPLOYED' && activeOutcome.employment) {
        if (currentSalary && currentSalary !== activeOutcome.employment.compensationAmount) {
          const prevSal = activeOutcome.employment.compensationAmount || 0;
          activeOutcome.employment.previousCompensationAmount = prevSal;
          activeOutcome.employment.compensationAmount = currentSalary;
          activeOutcome.employment.salaryGrowthAmount = currentSalary - prevSal;
          activeOutcome.employment.salaryGrowthPercentage = prevSal > 0 ? Number((((currentSalary - prevSal) / prevSal) * 100).toFixed(2)) : 0;
          await activeOutcome.save();
        }
      }
    }

    // Notify Trainers about completed follow-up
    const user = await User.findById(userId);
    const trainers = await User.find({ role: { $in: ['ADMIN', 'TRAINER'] } }).select('_id');
    if (trainers.length > 0 && user) {
      const notifications = trainers.map((t) => ({
        userId: t._id,
        type: 'SYSTEM' as const,
        title: 'Trainee Longitudinal Follow-Up Completed',
        message: `Student ${user.name} completed their ${followUp.checkpoint.replace('_', ' ')} longitudinal follow-up.`,
        link: `/admin/users/${userId}`,
        entityId: followUp._id.toString(),
      }));
      await Notification.insertMany(notifications);
    }

    return followUp;
  }

  /**
   * Trainer longitudinal follow-up queue & dashboard listing with filters.
   */
  async getTrainerFollowUpQueue(query: {
    status?: string;
    checkpoint?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query.checkpoint && query.checkpoint !== 'ALL') {
      filter.checkpoint = query.checkpoint;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const users = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { college: searchRegex }],
      }).select('_id');
      filter.userId = { $in: users.map((u) => u._id) };
    }

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter)
        .populate('userId', 'name email college district branch degree cohort')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit),
      FollowUp.countDocuments(filter),
    ]);

    const [upcomingCount, dueCount, completedCount, overdueCount] = await Promise.all([
      FollowUp.countDocuments({ status: 'UPCOMING' }),
      FollowUp.countDocuments({ status: 'DUE' }),
      FollowUp.countDocuments({ status: 'COMPLETED' }),
      FollowUp.countDocuments({ status: 'OVERDUE' }),
    ]);

    return {
      followUps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        upcoming: upcomingCount,
        due: dueCount,
        completed: completedCount,
        overdue: overdueCount,
        total: upcomingCount + dueCount + completedCount + overdueCount,
      },
    };
  }

  /**
   * Background runner / trigger to send follow-up reminder notifications to due trainees
   */
  async triggerDueNotifications(): Promise<{ notifiedCount: number }> {
    const now = new Date();
    const dueFollowUps = await FollowUp.find({
      status: { $in: ['DUE', 'OVERDUE'] },
    }).populate('userId', 'name email');

    let notifiedCount = 0;
    for (const f of dueFollowUps) {
      if (f.userId) {
        const existingNotif = await Notification.findOne({
          userId: (f.userId as any)._id,
          entityId: f._id.toString(),
          title: 'Career Outcome Follow-up Reminder',
        });
        if (!existingNotif) {
          await Notification.create({
            userId: (f.userId as any)._id,
            type: 'SYSTEM',
            title: 'Career Outcome Follow-up Reminder',
            message: `Your ${f.checkpoint.replace('_', ' ')} longitudinal outcome follow-up is due. Please update your current career status.`,
            link: '/career-outcome',
            entityId: f._id.toString(),
          });
          notifiedCount++;
        }
      }
    }

    return { notifiedCount };
  }
}

export const followUpService = new FollowUpService();
