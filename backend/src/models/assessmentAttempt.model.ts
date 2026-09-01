import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOption: number;
  isCorrect?: boolean;
  timeSpent?: number; // seconds
}

export interface ITopicPerformance {
  topic: string;
  questionsAttempted: number;
  correct: number;
  percentage: number;
}

export interface IAssessmentAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  questionIds: mongoose.Types.ObjectId[];
  startedAt: Date;
  submittedAt?: Date;
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  answers: IUserAnswer[];
  topicPerformance: ITopicPerformance[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentAttemptSchema = new Schema<IAssessmentAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'AssessmentQuestion' }],
    startedAt: { type: Date, default: Date.now, required: true },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    proficiency: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'AssessmentQuestion', required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean },
        timeSpent: { type: Number, default: 0 },
      },
    ],
    topicPerformance: [
      {
        topic: { type: String, required: true },
        questionsAttempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ userId: 1, assessmentId: 1 });
assessmentAttemptSchema.index({ userId: 1, skillId: 1, status: 1 });

export const AssessmentAttempt = mongoose.model<IAssessmentAttempt>(
  'AssessmentAttempt',
  assessmentAttemptSchema
);
