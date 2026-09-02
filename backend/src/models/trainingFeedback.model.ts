import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  trainingRelevance: number; // 1-5 scale
  practicalExposure: number; // 1-5 scale
  interviewPrep: number; // 1-5 scale
  industryExposure: number; // 1-5 scale
  skillsTrained: string[];
  skillsUsed: string[];
  skillsMissing: string[];
  topicsToImprove?: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const trainingFeedbackSchema = new Schema<ITrainingFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainingRelevance: { type: Number, required: true, min: 1, max: 5 },
    practicalExposure: { type: Number, default: 4, min: 1, max: 5 },
    interviewPrep: { type: Number, default: 4, min: 1, max: 5 },
    industryExposure: { type: Number, default: 4, min: 1, max: 5 },
    skillsTrained: [{ type: String }],
    skillsUsed: [{ type: String }],
    skillsMissing: [{ type: String }],
    topicsToImprove: { type: String },
    comments: { type: String },
  },
  { timestamps: true }
);

trainingFeedbackSchema.index({ userId: 1, createdAt: -1 });

export const TrainingFeedback = mongoose.model<ITrainingFeedback>(
  'TrainingFeedback',
  trainingFeedbackSchema
);
