import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';
import { emailService } from './email.service';
import { notificationService } from './notification.service';

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  token: string;
}

export class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor() {
    if (env.GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password || '', salt);

    // SECURITY: Always force role to STUDENT on normal registration
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      authProviders: ['local'],
      college: data.college || '',
      degree: data.degree || '',
      branch: data.branch || '',
      graduationYear: data.graduationYear || new Date().getFullYear() + 1,
      onboardingCompleted: false,
      profileCompletion: 25,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send Welcome Email asynchronously
    emailService.sendWelcomeEmail(user._id.toString(), user.email, user.name);

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ApiError(403, 'Your account has been suspended. Please contact platform administration.');
    }

    const isMatch = await bcrypt.compare(data.password || '', user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  async getMe(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    if (user.status === 'SUSPENDED') {
      throw new ApiError(403, 'Your account has been suspended.');
    }
    return user.toObject();
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not disclose whether email exists (email enumeration protection)
      return 'If an account exists for this email, password reset instructions have been sent.';
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send real password reset email asynchronously
    emailService.sendPasswordResetEmail(user._id.toString(), user.email, user.name, rawToken);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Dev Password Reset Token for ${user.email}]: ${rawToken}`);
    }

    return 'If an account exists for this email, password reset instructions have been sent.';
  }

  async resetPassword(rawToken: string, newPass: string): Promise<string> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPass, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Create security notification & dispatch security email
    notificationService.createNotification({
      userId: user._id,
      type: 'PASSWORD_SECURITY',
      title: 'Password Reset Successful',
      message: 'Your account password was successfully updated.',
      link: '/profile',
      emailData: {
        actionDescription: 'Password Reset',
      },
    });

    return 'Password reset successful. You may now log in with your new password.';
  }

  async googleAuth(credential: string): Promise<AuthResponse> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new ApiError(
        501,
        'Google OAuth is not configured on this server environment. Please configure GOOGLE_CLIENT_ID in backend/.env'
      );
    }

    try {
      const client = this.googleClient || new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new ApiError(400, 'Invalid Google authentication payload.');
      }

      const email = payload.email.toLowerCase();
      const name = payload.name || payload.given_name || 'Google Student User';
      const picture = payload.picture || '';

      let user = await User.findOne({ email });

      if (user) {
        if (user.status === 'SUSPENDED') {
          throw new ApiError(403, 'Your account has been suspended. Please contact platform administration.');
        }

        if (!user.authProviders.includes('google')) {
          user.authProviders.push('google');
        }
        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }
        await user.save();
      } else {
        // Create new user via Google Sign-In with default STUDENT role
        user = await User.create({
          name,
          email,
          profileImage: picture,
          role: 'STUDENT',
          status: 'ACTIVE',
          authProviders: ['google'],
          onboardingCompleted: false,
          profileCompletion: 25,
        });
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const userObj = user.toObject();
      delete userObj.password;

      return { user: userObj, token };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error('[Google OAuth Verification Error]', error);
      throw new ApiError(400, `Google authentication failed: ${error.message}`);
    }
  }
}

export const authService = new AuthService();
