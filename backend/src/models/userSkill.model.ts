import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSkill extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  proficiency: number; // 0 to 100
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastAssessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSkillSchema = new Schema<IUserSkill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    proficiency: { type: Number, required: true, min: 0, max: 100, default: 50 },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    lastAssessedAt: { type: Date },
  },
  { timestamps: true }
);

userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export const UserSkill = mongoose.model<IUserSkill>('UserSkill', userSkillSchema);
