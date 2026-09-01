import mongoose, { Schema, Document } from 'mongoose';

export interface ICollegeRequest extends Document {
  studentName: string;
  studentEmail: string;
  collegeName: string;
  city: string;
  state: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const collegeRequestSchema = new Schema<ICollegeRequest>(
  {
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, trim: true, lowercase: true },
    collegeName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

collegeRequestSchema.index({ status: 1 });

export const CollegeRequest = mongoose.model<ICollegeRequest>('CollegeRequest', collegeRequestSchema);
