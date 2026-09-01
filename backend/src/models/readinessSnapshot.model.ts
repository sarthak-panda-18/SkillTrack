import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  targetCareerRoleId: mongoose.Types.ObjectId;
  careerRoleName: string;
  readinessScore: number;
  readinessCategory: 'GETTING_STARTED' | 'DEVELOPING' | 'PROGRESSING' | 'NEARLY_READY' | 'PLACEMENT_READY';
  skillReadinessScore: number;
  assessmentReadinessScore: number;
  roadmapProgressScore: number;
  studyConsistencyScore: number;
  snapshotDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const readinessSnapshotSchema = new Schema<IReadinessSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetCareerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    careerRoleName: { type: String, required: true },
    readinessScore: { type: Number, required: true, min: 0, max: 100 },
    readinessCategory: {
      type: String,
      enum: ['GETTING_STARTED', 'DEVELOPING', 'PROGRESSING', 'NEARLY_READY', 'PLACEMENT_READY'],
      default: 'GETTING_STARTED',
    },
    skillReadinessScore: { type: Number, default: 0 },
    assessmentReadinessScore: { type: Number, default: 0 },
    roadmapProgressScore: { type: Number, default: 0 },
    studyConsistencyScore: { type: Number, default: 0 },
    snapshotDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readinessSnapshotSchema.index({ userId: 1, targetCareerRoleId: 1, snapshotDate: -1 });

export const ReadinessSnapshot = mongoose.model<IReadinessSnapshot>(
  'ReadinessSnapshot',
  readinessSnapshotSchema
);
