import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'STUDENT' | 'ADMIN' | 'TRAINER';
  status: 'ACTIVE' | 'SUSPENDED';
  authProviders: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  profileImage?: string;
  collegeId?: mongoose.Types.ObjectId;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  targetCareerRoleId?: mongoose.Types.ObjectId;
  targetRole?: string;
  targetDomain?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  onboardingCompleted: boolean;
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN', 'TRAINER'],
      default: 'STUDENT',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    authProviders: {
      type: [String],
      default: ['local'],
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    profileImage: { type: String, default: '' },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    graduationYear: { type: Number, default: new Date().getFullYear() + 1 },
    targetCareerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole' },
    targetRole: { type: String, default: '' },
    targetDomain: { type: String, default: '' },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    onboardingCompleted: { type: Boolean, default: false },
    profileCompletion: { type: Number, default: 20 },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
