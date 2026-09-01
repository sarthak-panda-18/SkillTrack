import mongoose from 'mongoose';
import { env, validateCoreEnv } from '../config/env';
import { seedAdmin } from '../seed';

async function runAdminSeedScript() {
  try {
    validateCoreEnv();
    const adminEmail = (env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      console.error('❌ [Admin Seed Error] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env');
      process.exit(1);
    }

    const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack';
    await mongoose.connect(mongoUri);
    console.log(`[Admin Seed Script] Connected to MongoDB`);

    await seedAdmin();

    console.log(`[Admin Seed Script] Admin credential synchronization complete for: ${adminEmail}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Admin Seed Script Failed]', error);
    process.exit(1);
  }
}

runAdminSeedScript();
