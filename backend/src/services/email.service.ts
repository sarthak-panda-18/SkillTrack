import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { emailQueueService } from './email.queue';
import { CommunicationType } from '../models/communicationLog.model';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  /**
   * Initializes Nodemailer transporter with explicit IPv4 DNS resolution (family: 4)
   * to eliminate ENETUNREACH IPv6 routing errors on cloud platforms like Render.
   */
  private async getTransporter(): Promise<Transporter | null> {
    if (this.transporter) return this.transporter;

    try {
      if (env.SMTP_HOST && (env.SMTP_USER || process.env.EMAIL_USER)) {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT || 465,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
          family: 4, // FORCE IPv4 to prevent ENETUNREACH IPv6 connection failures on Render
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        } as any);
        console.log(`[EmailService] Production SMTP Mailer initialized (Host: ${env.SMTP_HOST}, Port: ${env.SMTP_PORT}, User: ${env.SMTP_USER}, IPv4 Forced)`);
      } else {
        // Fallback to Ethereal Test SMTP for dev/testing when no SMTP credentials provided
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.warn(`[EmailService WARNING] No SMTP credentials found in environment. Using Ethereal sandbox (${testAccount.user}).`);
      }
      return this.transporter;
    } catch (err) {
      console.warn('[EmailService] Failed to initialize mail transporter:', err);
      return null;
    }
  }

  /**
   * Resend HTTPS REST API dispatch strategy.
   * Uses standard HTTPS over port 443, bypassing socket firewall restrictions and IPv6 routing errors.
   */
  private async sendViaResendHttpApi(options: SendMailOptions, apiKey: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const fromAddress = env.EMAIL_FROM || 'SkillTrack AI <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        }),
      });

      const data = (await response.json()) as any;

      if (response.ok && data?.id) {
        console.log(`[EmailService] Delivered email to ${options.to} via Resend HTTP API (ID: ${data.id})`);
        return { success: true, messageId: data.id };
      } else {
        const errorMessage = data?.message || data?.name || `Resend HTTP API status ${response.status}`;
        console.error(`[EmailService] Resend HTTP API error for ${options.to}:`, errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      console.error(`[EmailService] Resend HTTP API fetch failed for ${options.to}:`, err.message || err);
      return { success: false, error: err.message || 'Resend HTTP API request failed' };
    }
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private wrapHtmlTemplate(title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e4e4e7; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #020617 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin: 20px 0; font-size: 14px; text-align: center; }
          .footer { background-color: #fafafa; padding: 20px 24px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #f4f4f5; }
          .badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #3730a3; font-weight: 700; border-radius: 20px; font-size: 12px; }
          .message-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px; margin: 16px 0; white-space: pre-wrap; word-break: break-word; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SkillTrack AI</h1>
            <p>Engineering Skill Assessment & Placement Readiness Platform</p>
          </div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillTrack AI. All rights reserved.</p>
            <p>If you did not request this communication, please contact platform administration.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Executes low-level email dispatch using Resend HTTP API (Primary) with Nodemailer SMTP fallback.
   */
  async executeSendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = env.RESEND_API_KEY || (env.SMTP_PASS?.startsWith('re_') ? env.SMTP_PASS : '');

    // 1. Primary Strategy: Resend HTTPS REST API (100% reliable on Render/Vercel)
    if (apiKey) {
      const resendResult = await this.sendViaResendHttpApi(options, apiKey);
      if (resendResult.success) {
        return resendResult;
      }
      console.warn(`[EmailService] Resend HTTP API dispatch failed. Attempting Nodemailer SMTP fallback...`);
    }

    // 2. Secondary Strategy: Nodemailer SMTP with forced IPv4
    try {
      const transporter = await this.getTransporter();
      if (!transporter) {
        return { success: false, error: 'Mail transporter unavailable' };
      }

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM || 'SkillTrack AI <onboarding@resend.dev>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

      console.log(`[EmailService] Email dispatched via SMTP to ${options.to} (MsgID: ${info.messageId})`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EmailService Sandbox Preview Link]: ${previewUrl}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EmailService Error] Failed to send email to ${options.to}:`, err.message || err);
      return { success: false, error: err.message || 'Unknown email transport failure' };
    }
  }

  /**
   * Send Password Reset Email (Enqueued)
   */
  async sendPasswordResetEmail(userId: string, toEmail: string, userName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const escapedName = this.escapeHtml(userName);

    const html = this.wrapHtmlTemplate(
      'Reset Your SkillTrack AI Password',
      `
        <h2>Hello ${escapedName || 'Student'},</h2>
        <p>We received a request to reset your password for your SkillTrack AI account.</p>
        <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong> and can only be used once.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #71717a;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="font-size: 12px; word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p>If you did not request a password reset, you can safely ignore this email; your account remains secure.</p>
      `
    );

    const text = `Hello ${userName || 'Student'},\n\nWe received a request to reset your password. Click the link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, please ignore.`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'FORGOT_PASSWORD',
      subject: '🔒 Reset Your SkillTrack AI Password',
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Welcome Email (Enqueued)
   */
  async sendWelcomeEmail(userId: string, toEmail: string, userName: string): Promise<boolean> {
    const escapedName = this.escapeHtml(userName);

    const html = this.wrapHtmlTemplate(
      'Welcome to SkillTrack AI!',
      `
        <h2>Welcome aboard, ${escapedName || 'Student'}! 🚀</h2>
        <p>We're thrilled to have you join SkillTrack AI. Your personalized career development journey starts now.</p>
        <p>Here is how you can get started:</p>
        <ul>
          <li><strong>Assess Your Skills:</strong> Take targeted 20-question skill evaluations.</li>
          <li><strong>Set Your Target Role:</strong> Map your goal career path and analyze your skill gap.</li>
          <li><strong>Follow Adaptive Study Plans:</strong> Progress through customized learning pathways.</li>
        </ul>
        <div style="text-align: center;">
          <a href="${env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
        </div>
      `
    );

    const text = `Welcome aboard, ${userName || 'Student'}!\n\nWe're thrilled to have you join SkillTrack AI. Log in to your dashboard to start assessing your skills:\n${env.FRONTEND_URL}/dashboard`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'WELCOME',
      subject: '🎉 Welcome to SkillTrack AI!',
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Training Completion Email (Enqueued)
   */
  async sendTrainingCompletionEmail(
    userId: string,
    toEmail: string,
    userName: string,
    topicTitle: string,
    percentage: number,
    skillsCovered: string[] = []
  ): Promise<boolean> {
    const escapedName = this.escapeHtml(userName);
    const escapedTopic = this.escapeHtml(topicTitle);
    const escapedSkills = skillsCovered.map((s) => this.escapeHtml(s));

    const html = this.wrapHtmlTemplate(
      'Learning Pathway Completed!',
      `
        <h2>Congratulations ${escapedName || 'Student'}! 🏆</h2>
        <p>You have successfully completed your learning milestone in <strong>${escapedTopic}</strong> with a score of <span class="badge">${percentage}%</span>.</p>
        ${
          escapedSkills.length > 0
            ? `<p><strong>Skills Covered:</strong> ${escapedSkills.join(', ')}</p>`
            : ''
        }
        <p>Your continuous learning progress has been updated on your SkillTrack AI profile.</p>
        <div style="text-align: center;">
          <a href="${env.FRONTEND_URL}/learning" class="btn">Continue Learning</a>
        </div>
      `
    );

    const text = `Congratulations ${userName || 'Student'}!\n\nYou completed your learning milestone in ${topicTitle} (${percentage}%).\nVisit: ${env.FRONTEND_URL}/learning`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'TRAINING_COMPLETION',
      subject: `🎓 Congratulations on completing your ${topicTitle} milestone!`,
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Assessment Completion Email (Enqueued)
   */
  async sendAssessmentCompletionEmail(
    userId: string,
    toEmail: string,
    userName: string,
    assessmentTitle: string,
    percentage: number,
    scoreText: string,
    improvementText: string
  ): Promise<boolean> {
    const escapedName = this.escapeHtml(userName);
    const escapedTitle = this.escapeHtml(assessmentTitle);
    const escapedScoreText = this.escapeHtml(scoreText);
    const escapedImprovement = this.escapeHtml(improvementText);

    const html = this.wrapHtmlTemplate(
      'Skill Assessment Results',
      `
        <h2>Assessment Completed! 🎯</h2>
        <p>Hello ${escapedName || 'Student'}, you recently completed the <strong>${escapedTitle}</strong> 20-question assessment.</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Score:</strong> <span class="badge">${percentage}%</span> (${escapedScoreText})</p>
          ${escapedImprovement ? `<p style="margin: 4px 0;"><strong>Improvement:</strong> ${escapedImprovement}</p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="${env.FRONTEND_URL}/assessment/history" class="btn">View Assessment History</a>
        </div>
      `
    );

    const text = `Hello ${userName || 'Student'},\n\nYou completed the ${assessmentTitle} assessment with a score of ${percentage}% (${scoreText}).\nView history: ${env.FRONTEND_URL}/assessment/history`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'ASSESSMENT_COMPLETED',
      subject: `📊 Your ${assessmentTitle} Assessment Result: ${percentage}%`,
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Goal Completion Email (Enqueued)
   */
  async sendGoalCompletionEmail(
    userId: string,
    toEmail: string,
    userName: string,
    goalTitle: string,
    category: string
  ): Promise<boolean> {
    const escapedName = this.escapeHtml(userName);
    const escapedTitle = this.escapeHtml(goalTitle);
    const escapedCategory = this.escapeHtml(category);

    const html = this.wrapHtmlTemplate(
      'Goal Achieved!',
      `
        <h2>Goal Completed — Great Work! 🎯</h2>
        <p>Hello ${escapedName || 'Student'}, you have officially marked your goal <strong>"${escapedTitle}"</strong> (${escapedCategory}) as completed!</p>
        <p>Keep pushing towards your target career milestones.</p>
        <div style="text-align: center;">
          <a href="${env.FRONTEND_URL}/goals" class="btn">View My Goals</a>
        </div>
      `
    );

    const text = `Hello ${userName || 'Student'},\n\nCongratulations! You marked your goal "${goalTitle}" (${category}) as completed.\nView goals: ${env.FRONTEND_URL}/goals`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'GOAL_COMPLETED',
      subject: `🌟 Goal Achieved: ${goalTitle}`,
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Security Notification Email (Enqueued)
   */
  async sendSecurityNotificationEmail(
    userId: string,
    toEmail: string,
    userName: string,
    actionDescription: string
  ): Promise<boolean> {
    const escapedName = this.escapeHtml(userName);
    const escapedAction = this.escapeHtml(actionDescription);

    const html = this.wrapHtmlTemplate(
      'Security Notice',
      `
        <h2>Security Alert 🛡️</h2>
        <p>Hello ${escapedName || 'Student'},</p>
        <p>This is a confirmation that <strong>${escapedAction}</strong> was recently performed on your SkillTrack AI account.</p>
        <p>If you performed this action, no further steps are required.</p>
        <p>If you did NOT perform this action, please reset your password immediately or contact platform support.</p>
      `
    );

    const text = `Hello ${userName || 'Student'},\n\nSecurity Notice: ${actionDescription} was recently performed on your SkillTrack AI account. If you did not authorize this, please reset your password immediately.`;

    await emailQueueService.enqueueEmail({
      userId,
      recipientEmail: toEmail,
      type: 'SECURITY',
      subject: '🛡️ SkillTrack AI Security Notice',
      htmlContent: html,
      textContent: text,
    });

    return true;
  }

  /**
   * Send Direct Admin Email to Student (Individual or Bulk)
   */
  async sendCustomAdminEmail(
    adminUserId: string,
    studentUserId: string,
    studentEmail: string,
    studentName: string,
    subject: string,
    message: string,
    isBulk = false
  ): Promise<{ logId: string; status: string }> {
    const escapedName = this.escapeHtml(studentName);
    const escapedSubject = this.escapeHtml(subject);
    const formattedMessageHtml = this.escapeHtml(message).replace(/\n/g, '<br/>');

    const html = this.wrapHtmlTemplate(
      escapedSubject,
      `
        <h2>Hello ${escapedName || 'Student'},</h2>
        <p>You have received a message from the <strong>SkillTrack AI Administration Team</strong>:</p>
        <div class="message-box">
          ${formattedMessageHtml}
        </div>
        <p style="font-size: 12px; color: #71717a;">If you have any questions, you can reply directly to this notification or reach out to platform support.</p>
        <div style="text-align: center;">
          <a href="${env.FRONTEND_URL}/dashboard" class="btn">Go to Student Portal</a>
        </div>
      `
    );

    const type: CommunicationType = isBulk ? 'ADMIN_BULK' : 'ADMIN_DIRECT';

    return emailQueueService.enqueueEmail({
      userId: studentUserId,
      recipientEmail: studentEmail,
      initiatedByAdminId: adminUserId,
      type,
      subject,
      htmlContent: html,
      textContent: message,
    });
  }
}

export const emailService = new EmailService();
