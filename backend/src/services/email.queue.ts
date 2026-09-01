import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { CommunicationLog, CommunicationType } from '../models/communicationLog.model';

export interface EmailJobData {
  logId?: string;
  userId: string;
  recipientEmail: string;
  type: CommunicationType;
  subject: string;
  htmlContent: string;
  textContent: string;
  initiatedByAdminId?: string;
}

class EmailQueueService {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private redisConnection: Redis | null = null;
  private isRedisAvailable = false;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD || undefined;

    try {
      this.redisConnection = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[EmailQueueService] Redis connection max retries reached. Using resilient in-memory async fallback.');
            return null;
          }
          return Math.min(times * 200, 1000);
        },
      });

      this.redisConnection.on('connect', () => {
        console.log('[EmailQueueService] Connected to Redis successfully.');
        this.isRedisAvailable = true;
        this.setupBullMQ();
      });

      this.redisConnection.on('error', (err) => {
        this.isRedisAvailable = false;
        // Suppress unhandled error log spam when local Redis server is not running
      });
    } catch (err) {
      console.warn('[EmailQueueService] Redis initialization warning. Falling back to resilient async processing.');
      this.isRedisAvailable = false;
    }
  }

  private setupBullMQ() {
    if (!this.redisConnection || !this.isRedisAvailable) return;

    try {
      this.queue = new Queue('skilltrack-email-queue', {
        connection: this.redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      this.worker = new Worker(
        'skilltrack-email-queue',
        async (job: Job<EmailJobData>) => {
          await this.processEmailJob(job.data);
        },
        { connection: this.redisConnection }
      );

      this.worker.on('completed', (job) => {
        console.log(`[EmailQueueService] Job ${job.id} (${job.data.type}) delivered to ${job.data.recipientEmail}`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`[EmailQueueService] Job ${job?.id} failed for ${job?.data.recipientEmail}:`, err.message);
      });
    } catch (err) {
      console.warn('[EmailQueueService] BullMQ setup failed. Utilizing async fallback handler.');
      this.isRedisAvailable = false;
    }
  }

  /**
   * Central processor for email jobs
   */
  async processEmailJob(data: EmailJobData, sendMailFn?: (data: EmailJobData) => Promise<{ success: boolean; messageId?: string; error?: string }>) {
    let logRecord = null;
    if (data.logId) {
      logRecord = await CommunicationLog.findById(data.logId);
    } else {
      logRecord = await CommunicationLog.create({
        userId: data.userId,
        recipientEmail: data.recipientEmail,
        initiatedByAdminId: data.initiatedByAdminId,
        type: data.type,
        subject: data.subject,
        message: data.textContent,
        status: 'SENDING',
      });
    }

    if (logRecord) {
      logRecord.status = 'SENDING';
      await logRecord.save();
    }

    // Lazy load email service to avoid circular dependency
    const { emailService } = await import('./email.service');
    const result = await emailService.executeSendMail({
      to: data.recipientEmail,
      subject: data.subject,
      html: data.htmlContent,
      text: data.textContent,
    });

    if (result.success) {
      if (logRecord) {
        logRecord.status = 'SENT';
        logRecord.providerMessageId = result.messageId || 'SENT';
        logRecord.sentAt = new Date();
        await logRecord.save();
      }
      return result;
    } else {
      if (logRecord) {
        logRecord.status = 'FAILED';
        logRecord.failureReason = result.error || 'Email transport delivery failed';
        logRecord.failedAt = new Date();
        await logRecord.save();
      }
      return result;
    }
  }

  /**
   * Enqueue email for background delivery.
   * If Redis is available, uses BullMQ queue.
   * If Redis is not available, executes asynchronously without blocking caller.
   */
  async enqueueEmail(data: EmailJobData): Promise<{ logId: string; status: string }> {
    // Always persist QUEUED status log first
    const logRecord = await CommunicationLog.create({
      userId: data.userId,
      recipientEmail: data.recipientEmail,
      initiatedByAdminId: data.initiatedByAdminId,
      type: data.type,
      subject: data.subject,
      message: data.textContent,
      status: 'QUEUED',
    });

    data.logId = logRecord._id.toString();

    if (this.isRedisAvailable && this.queue) {
      try {
        await this.queue.add(`email-${data.type}-${Date.now()}`, data);
        return { logId: logRecord._id.toString(), status: 'QUEUED' };
      } catch (err) {
        console.warn('[EmailQueueService] BullMQ push failed, switching to async fallback execution:', err);
      }
    }

    // Async resilient fallback (does not block HTTP response)
    setImmediate(() => {
      this.processEmailJob(data).catch((err) => {
        console.error('[EmailQueueService Fallback Error]', err);
      });
    });

    return { logId: logRecord._id.toString(), status: 'QUEUED' };
  }
}

export const emailQueueService = new EmailQueueService();
