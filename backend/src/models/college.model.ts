import mongoose, { Schema, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  normalizedName?: string;
  shortName?: string;
  state: string;
  stateCode?: string;
  district?: string;
  city: string;
  country: string;
  pincode?: string;
  university?: string;
  type: 'IIT' | 'NIT' | 'IIIT' | 'Government' | 'State University' | 'Private' | 'Deemed' | 'Autonomous' | 'Engineering College';
  website?: string;
  aicteId?: string;
  nirfId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    normalizedName: { type: String, index: true, trim: true },
    shortName: { type: String, default: '', trim: true, index: true },
    state: { type: String, required: true, trim: true, index: true },
    stateCode: { type: String, default: '', trim: true },
    district: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true, index: true },
    country: { type: String, default: 'India', trim: true },
    pincode: { type: String, default: '' },
    university: { type: String, default: '', trim: true },
    type: {
      type: String,
      enum: ['IIT', 'NIT', 'IIIT', 'Government', 'State University', 'Private', 'Deemed', 'Autonomous', 'Engineering College'],
      default: 'Engineering College',
    },
    website: { type: String, default: '' },
    aicteId: { type: String, default: '' },
    nirfId: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

collegeSchema.index({ name: 'text', normalizedName: 'text', shortName: 'text', city: 'text', state: 'text' });

export const College = mongoose.model<ICollege>('College', collegeSchema);
