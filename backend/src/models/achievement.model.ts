import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  category: 'ASSESSMENT' | 'ROADMAP' | 'STUDY' | 'SKILL' | 'READINESS';
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Trophy' },
    category: {
      type: String,
      enum: ['ASSESSMENT', 'ROADMAP', 'STUDY', 'SKILL', 'READINESS'],
      default: 'SKILL',
    },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

achievementSchema.index({ userId: 1, achievementType: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
