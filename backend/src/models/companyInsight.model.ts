import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyInsight extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  jobRole: string;
  opportunityType: 'FULL_TIME' | 'INTERNSHIP' | 'APPRENTICESHIP' | 'CONTRACT';
  requiredSkills: string[];
  location: string;
  experienceLevel: string;
  hiringInfo: string;
  applicationInfo?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const companyInsightSchema = new Schema<ICompanyInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    opportunityType: {
      type: String,
      enum: ['FULL_TIME', 'INTERNSHIP', 'APPRENTICESHIP', 'CONTRACT'],
      default: 'FULL_TIME',
    },
    requiredSkills: [{ type: String }],
    location: { type: String, required: true },
    experienceLevel: { type: String, default: 'Freshers' },
    hiringInfo: { type: String, required: true },
    applicationInfo: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
);

companyInsightSchema.index({ status: 1, createdAt: -1 });

export const CompanyInsight = mongoose.model<ICompanyInsight>('CompanyInsight', companyInsightSchema);
