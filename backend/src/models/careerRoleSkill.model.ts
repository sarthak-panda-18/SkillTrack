import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerRoleSkill extends Document {
  careerRoleId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  minimumProficiency: number;
  recommendedProficiency: number;
  priority: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerRoleSkillSchema = new Schema<ICareerRoleSkill>(
  {
    careerRoleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    importance: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
      required: true,
    },
    minimumProficiency: { type: Number, required: true, min: 0, max: 100, default: 50 },
    recommendedProficiency: { type: Number, required: true, min: 0, max: 100, default: 75 },
    priority: { type: Number, default: 1 },
    isRequired: { type: Boolean, default: true },
  },
  { timestamps: true }
);

careerRoleSkillSchema.index({ careerRoleId: 1, skillId: 1 }, { unique: true });

careerRoleSkillSchema.pre('save', function (next) {
  if (this.minimumProficiency > this.recommendedProficiency) {
    return next(new Error('Minimum proficiency cannot be greater than recommended proficiency.'));
  }
  next();
});

export const CareerRoleSkill = mongoose.model<ICareerRoleSkill>('CareerRoleSkill', careerRoleSkillSchema);
