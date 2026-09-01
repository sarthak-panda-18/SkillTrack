import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1 });
skillSchema.index({ isActive: 1 });

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
