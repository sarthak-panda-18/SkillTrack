import mongoose from 'mongoose';
import { env } from '../config/env';
import { CareerRole } from '../models/careerRole.model';
import { CareerRoleSkill } from '../models/careerRoleSkill.model';
import { Skill } from '../models/skill.model';

export const initialCareerRoles = [
  // --- SOFTWARE DEVELOPMENT ---
  {
    name: 'Software Development Engineer',
    slug: 'software-development-engineer',
    description: 'Designs, builds, and maintains core software applications and algorithms.',
    category: 'Software Development',
    level: 'Entry',
    skills: [
      { name: 'Data Structures', importance: 'CRITICAL', min: 60, rec: 85 },
      { name: 'Algorithms', importance: 'CRITICAL', min: 60, rec: 85 },
      { name: 'Object-Oriented Programming', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Java', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'C++', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'Python', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'DBMS', importance: 'HIGH', min: 55, rec: 75 },
      { name: 'SQL', importance: 'HIGH', min: 50, rec: 70 },
      { name: 'Git', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'REST APIs', importance: 'MEDIUM', min: 40, rec: 65 },
    ],
  },
  {
    name: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Builds complete end-to-end web applications covering frontend UI and backend services.',
    category: 'Software Development',
    level: 'Entry',
    skills: [
      { name: 'JavaScript', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'TypeScript', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'React', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Node.js', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Express.js', importance: 'HIGH', min: 55, rec: 75 },
      { name: 'MongoDB', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'HTML', importance: 'HIGH', min: 70, rec: 90 },
      { name: 'CSS', importance: 'HIGH', min: 70, rec: 85 },
      { name: 'REST APIs', importance: 'HIGH', min: 60, rec: 80 },
      { name: 'Git', importance: 'HIGH', min: 50, rec: 75 },
    ],
  },
  {
    name: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Specializes in user interface development, responsive design, and web UI performance.',
    category: 'Software Development',
    level: 'Entry',
    skills: [
      { name: 'HTML', importance: 'CRITICAL', min: 80, rec: 95 },
      { name: 'CSS', importance: 'CRITICAL', min: 75, rec: 90 },
      { name: 'JavaScript', importance: 'CRITICAL', min: 70, rec: 85 },
      { name: 'React', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'TypeScript', importance: 'HIGH', min: 55, rec: 75 },
      { name: 'Next.js', importance: 'HIGH', min: 50, rec: 75 },
      { name: 'REST APIs', importance: 'HIGH', min: 50, rec: 70 },
      { name: 'Git', importance: 'HIGH', min: 50, rec: 75 },
    ],
  },
  {
    name: 'Backend Developer',
    slug: 'backend-developer',
    description: 'Designs server architecture, microservices, databases, and secure RESTful APIs.',
    category: 'Software Development',
    level: 'Entry',
    skills: [
      { name: 'Node.js', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Express.js', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'SQL', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'MongoDB', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'REST APIs', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'DBMS', importance: 'HIGH', min: 60, rec: 80 },
      { name: 'Docker', importance: 'MEDIUM', min: 40, rec: 65 },
      { name: 'Git', importance: 'HIGH', min: 50, rec: 75 },
    ],
  },
  {
    name: 'Mobile App Developer',
    slug: 'mobile-app-developer',
    description: 'Builds mobile applications for Android and iOS platforms.',
    category: 'Software Development',
    level: 'Entry',
    skills: [
      { name: 'JavaScript', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'React', importance: 'HIGH', min: 55, rec: 75 },
      { name: 'Java', importance: 'HIGH', min: 50, rec: 70 },
      { name: 'REST APIs', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Git', importance: 'HIGH', min: 50, rec: 75 },
    ],
  },

  // --- DATA / AI ---
  {
    name: 'Data Scientist',
    slug: 'data-scientist',
    description: 'Applies statistical analysis, machine learning models, and data science techniques to discover patterns.',
    category: 'Data / AI',
    level: 'Entry',
    skills: [
      { name: 'Python', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'Data Science', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Machine Learning', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'SQL', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Data Structures', importance: 'HIGH', min: 50, rec: 70 },
    ],
  },
  {
    name: 'Machine Learning Engineer',
    slug: 'machine-learning-engineer',
    description: 'Engineers, trains, deploys, and optimizes machine learning models in production.',
    category: 'Data / AI',
    level: 'Entry',
    skills: [
      { name: 'Python', importance: 'CRITICAL', min: 75, rec: 90 },
      { name: 'Machine Learning', importance: 'CRITICAL', min: 70, rec: 85 },
      { name: 'Deep Learning', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Algorithms', importance: 'HIGH', min: 60, rec: 80 },
      { name: 'Docker', importance: 'MEDIUM', min: 40, rec: 65 },
    ],
  },
  {
    name: 'AI Engineer',
    slug: 'ai-engineer',
    description: 'Integrates artificial intelligence models, computer vision, and neural networks into applications.',
    category: 'Data / AI',
    level: 'Entry',
    skills: [
      { name: 'Python', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'Generative AI', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Machine Learning', importance: 'HIGH', min: 60, rec: 80 },
      { name: 'Deep Learning', importance: 'HIGH', min: 55, rec: 75 },
    ],
  },
  {
    name: 'Generative AI Engineer',
    slug: 'generative-ai-engineer',
    description: 'Specializes in LLM orchestration, prompt engineering, RAG architectures, and fine-tuning models.',
    category: 'Data / AI',
    level: 'Entry',
    skills: [
      { name: 'Python', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'Generative AI', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'REST APIs', importance: 'HIGH', min: 60, rec: 80 },
      { name: 'Node.js', importance: 'MEDIUM', min: 50, rec: 70 },
    ],
  },

  // --- CLOUD / DEVOPS ---
  {
    name: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Automates deployment pipelines, CI/CD, infrastructure as code, and container orchestration.',
    category: 'Cloud / DevOps',
    level: 'Entry',
    skills: [
      { name: 'Docker', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Linux', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'AWS', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Git', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Computer Networks', importance: 'HIGH', min: 55, rec: 75 },
    ],
  },
  {
    name: 'Cloud Engineer',
    slug: 'cloud-engineer',
    description: 'Architects and manages resilient cloud infrastructure on platforms like AWS, Azure, and GCP.',
    category: 'Cloud / DevOps',
    level: 'Entry',
    skills: [
      { name: 'AWS', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Linux', importance: 'CRITICAL', min: 60, rec: 80 },
      { name: 'Docker', importance: 'HIGH', min: 55, rec: 75 },
      { name: 'Computer Networks', importance: 'HIGH', min: 55, rec: 75 },
    ],
  },

  // --- SECURITY & DATABASE ---
  {
    name: 'Cybersecurity Engineer',
    slug: 'cybersecurity-engineer',
    description: 'Protects system infrastructure, networks, applications, and data from cyber threats.',
    category: 'Security',
    level: 'Entry',
    skills: [
      { name: 'Computer Networks', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'Linux', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Operating Systems', importance: 'CRITICAL', min: 65, rec: 85 },
      { name: 'Python', importance: 'HIGH', min: 50, rec: 70 },
    ],
  },
  {
    name: 'Database Engineer',
    slug: 'database-engineer',
    description: 'Designs, optimizes, and tunes SQL and NoSQL database management systems.',
    category: 'Database',
    level: 'Entry',
    skills: [
      { name: 'SQL', importance: 'CRITICAL', min: 75, rec: 90 },
      { name: 'DBMS', importance: 'CRITICAL', min: 70, rec: 90 },
      { name: 'MySQL', importance: 'HIGH', min: 65, rec: 85 },
      { name: 'MongoDB', importance: 'HIGH', min: 60, rec: 80 },
    ],
  },
];

export async function seedCareerRoles(): Promise<void> {
  try {
    const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[CareerRoles Seed] Seeding career roles and role-skill mappings...');

    for (const roleItem of initialCareerRoles) {
      const { skills: skillReqs, ...roleData } = roleItem;

      const careerRole = await CareerRole.findOneAndUpdate(
        { slug: roleData.slug },
        { $set: { ...roleData, isActive: true } },
        { upsert: true, new: true }
      );

      // Create skill mappings linking to existing Skill collection IDs
      for (let i = 0; i < skillReqs.length; i++) {
        const reqItem = skillReqs[i];
        const dbSkill = await Skill.findOne({ name: reqItem.name });

        if (!dbSkill) {
          console.warn(`[CareerRoles Seed Warning] Skill "${reqItem.name}" not found in MongoDB Skill collection.`);
          continue;
        }

        await CareerRoleSkill.findOneAndUpdate(
          { careerRoleId: careerRole._id, skillId: dbSkill._id },
          {
            $set: {
              importance: reqItem.importance as any,
              minimumProficiency: reqItem.min,
              recommendedProficiency: reqItem.rec,
              priority: i + 1,
              isRequired: true,
            },
          },
          { upsert: true }
        );
      }
    }

    const totalRoles = await CareerRole.countDocuments({ isActive: true });
    const totalMappings = await CareerRoleSkill.countDocuments();
    console.log(`[CareerRoles Seed Complete] ${totalRoles} active career roles with ${totalMappings} skill requirement mappings.`);
  } catch (error) {
    console.error('[CareerRoles Seed Error]', error);
  }
}

async function seedStandalone() {
  try {
    await seedCareerRoles();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[CareerRoles Standalone Seed Error]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedStandalone();
}
