import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { opportunityService } from '../services/opportunity.service';

export const getMatchedOpportunities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const opportunities = await opportunityService.getMatchedOpportunities(userId);
    res.json(opportunities);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunities' });
  }
};

export const submitCompanyInsight = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const insight = await opportunityService.submitCompanyInsight(userId, req.body);
    res.status(201).json(insight);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit insight' });
  }
};

export const getCompanyInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const insights = await opportunityService.getApprovedCompanyInsights();
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch insights' });
  }
};

export const getAdminInsightsQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queue = await opportunityService.getAdminCompanyInsightsQueue();
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch queue' });
  }
};

export const moderateCompanyInsight = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user!.userId;
    const updated = await opportunityService.moderateCompanyInsight(id, status, adminId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to moderate insight' });
  }
};
