import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { assessmentService } from '../services/assessment.service';

export const getPublicAssessments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillId = req.query.skillId as string | undefined;
    const assessments = await assessmentService.getPublicAssessments(skillId);
    res.status(200).json({
      success: true,
      data: { assessments },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.getAssessmentById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const startAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.startAssessment(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Assessment started successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptForPlayer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.getAttemptForPlayer(req.user!.userId, req.params.attemptId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { answers } = req.body;
    const result = await assessmentService.submitAssessment(req.user!.userId, req.params.attemptId, answers || []);
    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptResults = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.getAttemptResults(req.user!.userId, req.params.attemptId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAttemptHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await assessmentService.getUserAttemptHistory(req.user!.userId, req.query as any);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers
export const getAdminAssessments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessments = await assessmentService.getAdminAssessments();
    res.status(200).json({
      success: true,
      data: { assessments },
    });
  } catch (error) {
    next(error);
  }
};

export const createAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessment = await assessmentService.createAssessment(req.body);
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessment = await assessmentService.updateAssessment(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAssessmentStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessment = await assessmentService.toggleAssessmentStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Assessment status updated to ${assessment.isActive ? 'Active' : 'Inactive'}`,
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentQuestions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await assessmentService.getAssessmentQuestions(req.params.id);
    res.status(200).json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    next(error);
  }
};

export const generateAiQuestionsForSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = req.body.count ? parseInt(req.body.count, 10) : 20;
    const result = await assessmentService.generateAiQuestionsForSkill(req.params.skillId, count);
    res.status(200).json({
      success: true,
      message: `${result.createdCount} AI questions generated successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
