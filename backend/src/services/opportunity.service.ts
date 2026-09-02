import { Opportunity, IOpportunity } from '../models/opportunity.model';
import { CompanyInsight, ICompanyInsight } from '../models/companyInsight.model';
import { UserSkill } from '../models/userSkill.model';
import { User } from '../models/user.model';

export const opportunityService = {
  async getMatchedOpportunities(userId: string) {
    // Fetch student target role and user skills
    const user = await User.findById(userId);
    const userSkillsDocs = await UserSkill.find({ userId }).populate('skillId');
    const studentSkillNames = userSkillsDocs.map((us: any) => us.skillId?.name || us.name).filter(Boolean);

    let opportunities = await Opportunity.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });

    // Seed fallback opportunities if database is empty
    if (opportunities.length === 0) {
      opportunities = await Opportunity.create([
        {
          title: 'Java Backend Developer',
          company: 'TechCorp Solutions',
          location: 'Bangalore, Karnataka',
          salaryRange: '₹6.0 - ₹8.5 LPA',
          compensationAmount: 700000,
          requiredSkills: ['Java', 'SQL', 'Spring Boot', 'REST APIs'],
          experienceLevel: 'Freshers',
          employmentType: 'FULL_TIME',
          description: 'Build high-scale REST microservices in Java and Spring Boot.',
        },
        {
          title: 'Data Analyst',
          company: 'Analytics Hub Ltd',
          location: 'Hyderabad, Telangana',
          salaryRange: '₹5.5 - ₹7.0 LPA',
          compensationAmount: 600000,
          requiredSkills: ['Python', 'SQL', 'Data Analysis', 'Tableau'],
          experienceLevel: 'Freshers',
          employmentType: 'FULL_TIME',
          description: 'Analyze enterprise datasets and construct executive dashboards.',
        },
        {
          title: 'Full-Stack Developer Intern',
          company: 'InnovateX Labs',
          location: 'Remote',
          salaryRange: '₹25,000 / month',
          compensationAmount: 300000,
          requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
          experienceLevel: 'Freshers',
          employmentType: 'INTERNSHIP',
          description: 'Build modern web user interfaces and GraphQL/REST backends.',
        },
        {
          title: 'Cloud DevOps Trainee',
          company: 'Apex Cloud Systems',
          location: 'Pune, Maharashtra',
          salaryRange: '₹5.0 - ₹6.5 LPA',
          compensationAmount: 550000,
          requiredSkills: ['Linux', 'Docker', 'AWS', 'Git'],
          experienceLevel: 'Freshers',
          employmentType: 'APPRENTICESHIP',
          description: 'Manage cloud container pipelines and infrastructure deployment.',
        },
      ]);
    }

    // Calculate transparent match scores
    const matched = opportunities.map((opp) => {
      const required = opp.requiredSkills || [];
      const matchingSkills = required.filter((reqSkill) =>
        studentSkillNames.some((sk) => sk.toLowerCase().includes(reqSkill.toLowerCase()))
      );
      const missingSkills = required.filter((reqSkill) => !matchingSkills.includes(reqSkill));

      const matchPercentage =
        required.length > 0 ? Math.round((matchingSkills.length / required.length) * 100) : 75;

      return {
        _id: opp._id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        salaryRange: opp.salaryRange,
        requiredSkills: opp.requiredSkills,
        matchingSkills,
        missingSkills,
        matchPercentage: Math.max(matchPercentage, 50), // baseline match representation
        experienceLevel: opp.experienceLevel,
        employmentType: opp.employmentType,
        description: opp.description,
        explanation: `Your strongest matching skills are ${matchingSkills.join(', ') || 'core technical fundamentals'}. ${
          missingSkills.length > 0 ? `Developing ${missingSkills.join(', ')} will increase your readiness score.` : 'You meet all core requirements!'
        }`,
      };
    });

    return matched;
  },

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
