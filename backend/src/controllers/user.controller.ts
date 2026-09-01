import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await userService.getProfile(req.user!.userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedUser = await userService.updateProfile(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedUser = await userService.completeOnboarding(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await userService.deleteAccount(req.user!.userId);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
