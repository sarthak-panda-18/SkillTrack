import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  compensationAmount?: number;
  requiredSkills: string[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Freshers';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'APPRENTICESHIP' | 'CONTRACT';
  status: 'ACTIVE' | 'CLOSED';
  description?: string;
  applicationUrl?: string;
  postedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: { type: String, required: true },
    compensationAmount: { type: Number },
    requiredSkills: [{ type: String, required: true }],
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Freshers'],
      default: 'Freshers',
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'APPRENTICESHIP', 'CONTRACT'],
      default: 'FULL_TIME',
    },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
    description: { type: String },
    applicationUrl: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

opportunitySchema.index({ status: 1, createdAt: -1 });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);
