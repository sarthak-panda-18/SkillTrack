import mongoose from 'mongoose';
import { env } from '../config/env';
import { College } from '../models/college.model';
import { expandedIndiaColleges } from '../data/indiaCollegesDataset';

export function normalizeCollegeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function seedColleges(): Promise<void> {
  try {
    const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Colleges Seed] Seeding India-wide engineering colleges dataset...');

    for (const collegeData of expandedIndiaColleges) {
      const normalized = normalizeCollegeName(collegeData.name);
      await College.findOneAndUpdate(
        { name: collegeData.name },
        {
          $set: {
            ...collegeData,
            normalizedName: normalized,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
    }

    const totalCount = await College.countDocuments({ isActive: true });
    console.log(`[Colleges Seed Complete] Total active India-wide engineering colleges in database: ${totalCount}`);
  } catch (error) {
    console.error('[Colleges Seed Error]', error);
  }
}

async function seedStandalone() {
  try {
    await seedColleges();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Colleges Standalone Seed Error]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedStandalone();
}
