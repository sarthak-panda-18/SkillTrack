import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentQuestion extends Document {
  assessmentId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  topic: string;
  question: string;
  questionHash?: string;
  options: string[];
  correctAnswer: number; // 0-3 index
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    topic: { type: String, required: true, trim: true, index: true },
    question: { type: String, required: true, trim: true },
    questionHash: { type: String, index: true },
    options: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length === 4,
        'Question must have exactly 4 options',
      ],
    },
    // SECURITY: Hide correctAnswer & explanation by default during normal queries
    correctAnswer: { type: Number, required: true, min: 0, max: 3, select: false },
    explanation: { type: String, required: true, select: false },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    points: { type: Number, default: 1 },
    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

assessmentQuestionSchema.index({ assessmentId: 1, topic: 1 });
assessmentQuestionSchema.index({ assessmentId: 1, isActive: 1 });

export const AssessmentQuestion = mongoose.model<IAssessmentQuestion>(
  'AssessmentQuestion',
  assessmentQuestionSchema
);
