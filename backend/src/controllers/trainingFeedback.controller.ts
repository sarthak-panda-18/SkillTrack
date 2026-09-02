import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { trainingFeedbackService } from '../services/trainingFeedback.service';

export const submitFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const feedback = await trainingFeedbackService.submitFeedback(userId, req.body);
    res.status(201).json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit feedback' });
  }
};

export const getStudentFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const feedback = await trainingFeedbackService.getStudentFeedback(userId);
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get feedback' });
  }
};

export const getAggregatedFeedbackAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const analytics = await trainingFeedbackService.getAggregatedFeedbackAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get feedback analytics' });
  }
};
