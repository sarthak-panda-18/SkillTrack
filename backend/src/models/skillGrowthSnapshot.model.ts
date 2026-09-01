import mongoose, { Schema, Document } from 'mongoose';

export type SkillGrowthSource = 'PROFILE' | 'ASSESSMENT' | 'LEARNING' | 'ADMIN' | 'SYSTEM';

export interface ISkillGrowthSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  proficiency: number; // 0 to 100
  source: SkillGrowthSource;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillGrowthSnapshotSchema = new Schema<ISkillGrowthSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    proficiency: { type: Number, required: true, min: 0, max: 100 },
    source: {
      type: String,
      enum: ['PROFILE', 'ASSESSMENT', 'LEARNING', 'ADMIN', 'SYSTEM'],
      default: 'SYSTEM',
    },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Compound indexes for efficient historical retrieval and duplicate checking
skillGrowthSnapshotSchema.index({ userId: 1, skillId: 1, recordedAt: -1 });
skillGrowthSnapshotSchema.index({ userId: 1, recordedAt: -1 });

export const SkillGrowthSnapshot = mongoose.model<ISkillGrowthSnapshot>(
  'SkillGrowthSnapshot',
  skillGrowthSnapshotSchema
);
