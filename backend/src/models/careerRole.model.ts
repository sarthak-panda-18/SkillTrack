import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerRole extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  level: 'Entry' | 'Mid' | 'Senior';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerRoleSchema = new Schema<ICareerRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    level: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      default: 'Entry',
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

careerRoleSchema.index({ name: 'text', description: 'text', category: 'text' });

export const CareerRole = mongoose.model<ICareerRole>('CareerRole', careerRoleSchema);
