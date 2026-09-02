import { CompanyInsight, ICompanyInsight } from '../models/companyInsight.model';

export const opportunityService = {
  async submitCompanyInsight(userId: string, data: Partial<ICompanyInsight>): Promise<ICompanyInsight> {
    return CompanyInsight.create({
      userId,
      companyName: data.companyName,
      jobRole: data.jobRole,
      opportunityType: data.opportunityType || 'FULL_TIME',
      requiredSkills: data.requiredSkills || [],
      location: data.location || 'India',
      experienceLevel: data.experienceLevel || 'Freshers',
      hiringInfo: data.hiringInfo,
      applicationInfo: data.applicationInfo || '',
      status: 'PENDING',
    });
  },

  async getApprovedCompanyInsights() {
    return CompanyInsight.find({ status: 'APPROVED' }).sort({ createdAt: -1 });
  },

  async getAdminCompanyInsightsQueue() {
    return CompanyInsight.find().populate('userId', 'name email').sort({ createdAt: -1 });
  },

  async moderateCompanyInsight(insightId: string, status: 'APPROVED' | 'REJECTED', adminId: string) {
    return CompanyInsight.findByIdAndUpdate(
      insightId,
      { status, moderatedBy: adminId, moderatedAt: new Date() },
      { new: true }
    );
  },
};
