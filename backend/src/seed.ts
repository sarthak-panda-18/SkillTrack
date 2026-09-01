import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import { Skill } from './models/skill.model';
import { User } from './models/user.model';

export const initialSkills = [
  // Programming
  { name: 'C', category: 'Programming', description: 'Low-level procedural programming language.' },
  { name: 'C++', category: 'Programming', description: 'Systems & competitive programming language.' },
  { name: 'Java', category: 'Programming', description: 'Object-oriented enterprise & Android language.' },
  { name: 'Python', category: 'Programming', description: 'Language for AI, Data Science, Scripting & Web.' },
  { name: 'JavaScript', category: 'Programming', description: 'Dynamic scripting language of the web.' },
  { name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript.' },
  { name: 'Go', category: 'Programming', description: 'Statistically typed language by Google for concurrency.' },
  { name: 'Rust', category: 'Programming', description: 'Systems language focusing on memory safety.' },

  // Web Development
  { name: 'HTML', category: 'Web Development', description: 'Standard markup language for document structure.' },
  { name: 'CSS', category: 'Web Development', description: 'Style sheet language for web presentation.' },
  { name: 'React', category: 'Web Development', description: 'Component-based UI framework for web interfaces.' },
  { name: 'Next.js', category: 'Web Development', description: 'Full-stack React framework with SSR and App Router.' },
  { name: 'Node.js', category: 'Web Development', description: 'Asynchronous event-driven JavaScript runtime.' },
  { name: 'Express.js', category: 'Web Development', description: 'Fast, minimalist backend web framework for Node.js.' },
  { name: 'REST APIs', category: 'Web Development', description: 'Representational State Transfer web services.' },

  // Databases
  { name: 'SQL', category: 'Databases', description: 'Language for relational database management.' },
  { name: 'MySQL', category: 'Databases', description: 'Open-source relational database management system.' },
  { name: 'PostgreSQL', category: 'Databases', description: 'Advanced object-relational database.' },
  { name: 'MongoDB', category: 'Databases', description: 'Document-oriented NoSQL database.' },

  // Computer Science
  { name: 'Data Structures', category: 'Computer Science', description: 'Fundamental data organization concepts.' },
  { name: 'Algorithms', category: 'Computer Science', description: 'Problem-solving steps and computational complexity.' },
  { name: 'Object-Oriented Programming', category: 'Computer Science', description: 'OOP paradigms, abstraction, inheritance & polymorphism.' },
  { name: 'Operating Systems', category: 'Computer Science', description: 'Process management, memory allocation & kernel operations.' },
  { name: 'DBMS', category: 'Computer Science', description: 'Database management systems & relational theory.' },
  { name: 'Computer Networks', category: 'Computer Science', description: 'TCP/IP, OSI model, routing & network protocols.' },
  { name: 'Computer Architecture', category: 'Computer Science', description: 'Processor organization & machine instruction sets.' },

  // AI / Data
  { name: 'Machine Learning', category: 'AI / Data', description: 'Predictive algorithms, supervised & unsupervised learning.' },
  { name: 'Deep Learning', category: 'AI / Data', description: 'Neural networks, computer vision & NLP models.' },
  { name: 'Data Science', category: 'AI / Data', description: 'Data analysis, statistics, and data visualization.' },
  { name: 'Generative AI', category: 'AI / Data', description: 'LLMs, prompt engineering & generative models.' },

  // Tools
  { name: 'Git', category: 'Tools', description: 'Distributed version control system.' },
  { name: 'GitHub', category: 'Tools', description: 'Cloud repository hosting and collaboration platform.' },
  { name: 'Docker', category: 'Tools', description: 'Containerization software platform.' },
  { name: 'Linux', category: 'Tools', description: 'Open-source operating system kernel & CLI tools.' },

  // Cloud
  { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud computing platform.' },
  { name: 'Azure', category: 'Cloud', description: 'Microsoft enterprise cloud platform.' },
  { name: 'Google Cloud', category: 'Cloud', description: 'Google Cloud Platform infrastructure and services.' },
];

export async function ensureSkillsSeeded(): Promise<void> {
  try {
    for (const item of initialSkills) {
      await Skill.findOneAndUpdate(
        { name: item.name },
        {
          $set: { name: item.name, category: item.category, description: item.description, isActive: true },
        },
        { upsert: true, new: true }
      );
    }
    // Explicitly activate all existing catalog items in MongoDB
    await Skill.updateMany({ isActive: { $ne: false } }, { $set: { isActive: true } });
    const total = await Skill.countDocuments({ isActive: { $ne: false } });
    console.log(`[Database Seed] Skill catalog active. Total verified skills in database: ${total}`);
  } catch (error) {
    console.error('[Database Seed Error]', error);
  }
}

export async function seedAdmin(): Promise<void> {
  try {
    const adminEmail = (env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      console.log('[Admin Seed] Skipped (ADMIN_EMAIL or ADMIN_PASSWORD missing from environment).');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Find all accounts matching role === 'ADMIN' or email === adminEmail
    const adminCandidates = await User.find({
      $or: [{ role: 'ADMIN' }, { email: adminEmail }],
    }).select('+password');

    let primaryAdmin = adminCandidates.find((u) => u.email.toLowerCase() === adminEmail);
    if (!primaryAdmin && adminCandidates.length > 0) {
      primaryAdmin = adminCandidates[0];
    }

    if (primaryAdmin) {
      // Synchronize primary admin credentials
      primaryAdmin.name = primaryAdmin.name || 'System Administrator';
      primaryAdmin.email = adminEmail;
      primaryAdmin.password = hashedPassword;
      primaryAdmin.role = 'ADMIN';
      primaryAdmin.status = 'ACTIVE';
      primaryAdmin.onboardingCompleted = true;
      primaryAdmin.profileCompletion = 100;
      await primaryAdmin.save();

      // Clean up obsolete/duplicate admin accounts (where email !== adminEmail AND role === 'ADMIN')
      const duplicateAdmins = adminCandidates.filter(
        (u) => u._id.toString() !== primaryAdmin!._id.toString() && u.email.toLowerCase() !== adminEmail
      );

      for (const dup of duplicateAdmins) {
        await User.deleteOne({ _id: dup._id });
        console.log(`[Admin Seed] Removed obsolete duplicate admin account (${dup.email}).`);
      }

      console.log(`[Admin Seed] Existing admin found. Credentials synchronized for ${adminEmail}.`);
    } else {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        authProviders: ['local'],
        college: 'SkillTrack AI Platform Administration',
        degree: 'Platform Admin',
        branch: 'System Operations',
        graduationYear: 2026,
        targetRole: 'Platform Administrator',
        targetDomain: 'System Administration',
        onboardingCompleted: true,
        profileCompletion: 100,
      });
      console.log(`[Admin Seed] Admin account created successfully for ${adminEmail}.`);
    }
  } catch (error) {
    console.error('[Admin Seed Error]', error);
  }
}

async function seedStandalone() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed Script] Connected to MongoDB');
    await ensureSkillsSeeded();
    await seedAdmin();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Script Error]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedStandalone();
}
