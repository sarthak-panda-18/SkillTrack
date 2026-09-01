import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { CommunicationLog } from '../models/communicationLog.model';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';
import { ApiError } from '../utils/apiError';

/**
 * Send email to an individual student (Admin Endpoint)
 */
export const sendIndividualStudentEmail = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?.id;
  const { studentId } = req.params;
  const { subject, message } = req.body;

  if (!adminId) {
    throw new ApiError(401, 'Unauthorized request.');
  }

  // Security: Backend must determine the actual registered student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(404, 'Student account not found.');
  }

  if (student.status === 'SUSPENDED') {
    throw new ApiError(400, 'Cannot send email to a suspended user account.');
  }

  // 1. Enqueue Email via EmailService
  const { logId, status } = await emailService.sendCustomAdminEmail(
    adminId,
    student._id.toString(),
    student.email,
    student.name,
    subject,
    message,
    false
  );

  // 2. Create In-App Notification for Student
  await notificationService.createNotification({
    userId: student._id.toString(),
    type: 'ADMIN_MESSAGE',
    title: subject,
    message: message.length > 120 ? `${message.substring(0, 117)}...` : message,
    link: '/dashboard',
  });

  return res.status(200).json({
    success: true,
    message: `Email successfully queued for delivery to ${student.email}.`,
    logId,
    status,
  });
};

/**
 * Send bulk email to multiple students (Admin Endpoint)
 */
export const sendBulkStudentEmail = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?.id;
  const { studentIds, subject, message } = req.body;

  if (!adminId) {
    throw new ApiError(401, 'Unauthorized request.');
  }

  // Backend resolves actual registered active students
  const students = await User.find({
    _id: { $in: studentIds },
    role: 'STUDENT',
    status: 'ACTIVE',
  });

  if (students.length === 0) {
    throw new ApiError(404, 'No active student accounts found matching the selection.');
  }

  const results = [];
  for (const student of students) {
    const { logId, status } = await emailService.sendCustomAdminEmail(
      adminId,
      student._id.toString(),
      student.email,
      student.name,
      subject,
      message,
      true
    );

    // Also trigger in-app notification
    notificationService.createNotification({
      userId: student._id.toString(),
      type: 'ADMIN_MESSAGE',
      title: subject,
      message: message.length > 120 ? `${message.substring(0, 117)}...` : message,
      link: '/dashboard',
    });

    results.push({ studentId: student._id.toString(), email: student.email, logId, status });
  }

  return res.status(200).json({
    success: true,
    message: `Bulk email queued successfully for ${students.length} student(s).`,
    recipientCount: students.length,
    details: results,
  });
};

/**
 * Get communication history logs (Admin Endpoint)
 */
export const getCommunicationLogs = async (req: AuthenticatedRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || '';

  const filter: any = {};
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { recipientEmail: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }

  const [logs, total] = await Promise.all([
    CommunicationLog.find(filter)
      .populate('userId', 'name email role')
      .populate('initiatedByAdminId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    CommunicationLog.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
