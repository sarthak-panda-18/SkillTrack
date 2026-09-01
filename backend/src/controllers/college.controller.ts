import { Request, Response, NextFunction } from 'express';
import { collegeService } from '../services/college.service';

export const searchColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const state = req.query.state as string | undefined;
    const city = req.query.city as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const colleges = await collegeService.searchColleges(search, state, city, limit);
    res.status(200).json({
      success: true,
      data: { colleges },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const state = req.query.state as string | undefined;
    const type = req.query.type as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await collegeService.getAdminColleges({ search, state, type, page, limit });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createCollege = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegeService.createCollege(req.body);
    res.status(201).json({
      success: true,
      message: 'College entry created successfully',
      data: { college },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollege = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegeService.updateCollege(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'College entry updated successfully',
      data: { college },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCollegeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegeService.toggleCollegeStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `College status updated to ${college.isActive ? 'Active' : 'Inactive'}`,
      data: { college },
    });
  } catch (error) {
    next(error);
  }
};

// Student Unlisted College Request
export const requestCollegeAddition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await collegeService.requestCollegeAddition(req.body);
    res.status(201).json({
      success: true,
      message: 'College addition request submitted successfully for admin review.',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Review Endpoints
export const getAdminCollegeRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await collegeService.getAdminCollegeRequests(status, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewCollegeRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, adminNotes } = req.body;
    const request = await collegeService.reviewCollegeRequest(req.params.id, status, adminNotes);
    res.status(200).json({
      success: true,
      message: `College request marked as ${status}`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};
