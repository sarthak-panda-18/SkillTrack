import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { careerStatusService } from '../services/careerStatus.service';

export const getMyCareerStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const careerStatus = await careerStatusService.getCareerStatus(userId);
    res.status(200).json({ success: true, data: careerStatus });
  } catch (error) {
    next(error);
  }
};

export const updateMyCareerStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const updated = await careerStatusService.updateCareerStatus(userId, req.body);
    res.status(200).json({ success: true, message: 'Career status updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const addEmploymentDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const updated = await careerStatusService.addEmploymentDocument(userId, req.file!, req.body);
    res.status(201).json({ success: true, message: 'Employment document uploaded successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEmploymentDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { docId } = req.params;
    const updated = await careerStatusService.deleteEmploymentDocument(userId, docId);
    res.status(200).json({ success: true, message: 'Employment document removed', data: updated });
  } catch (error) {
    next(error);
  }
};

export const getStudentCareerStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const careerStatus = await careerStatusService.getCareerStatus(userId);
    res.status(200).json({ success: true, data: careerStatus });
  } catch (error) {
    next(error);
  }
};

export const verifyEmploymentDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { docId } = req.params;
    const { status, notes } = req.body;
    const updated = await careerStatusService.verifyEmploymentDocument(docId, status, notes);
    res.status(200).json({ success: true, message: `Document status updated to ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
};
