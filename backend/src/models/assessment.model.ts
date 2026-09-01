import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  title: string;
  skillId: mongoose.Types.ObjectId;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionCount: number;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    description: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD', 'MIXED'],
      default: 'MIXED',
    },
    questionCount: { type: Number, default: 20 },
    timeLimit: { type: Number, default: 20 }, // 20 minutes default
    passingScore: { type: Number, default: 60 }, // 60% default
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
