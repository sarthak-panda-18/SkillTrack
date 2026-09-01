import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env, validateCoreEnv } from './config/env';
import { connectDB } from './config/db';
import { ensureSkillsSeeded, seedAdmin } from './seed';
import { seedColleges } from './scripts/seedColleges';
import { seedCareerRoles } from './scripts/seedCareerRoles';
import { seedAssessments } from './scripts/seedAssessments';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import skillRoutes from './routes/skill.routes';
import collegeRoutes from './routes/college.routes';
import careerRoleRoutes from './routes/careerRole.routes';
import assessmentRoutes from './routes/assessment.routes';
import skillGapRoutes from './routes/skillGap.routes';
import roadmapRoutes from './routes/roadmap.routes';
import studyPlanRoutes from './routes/studyPlan.routes';
import adaptiveRoutes from './routes/adaptive.routes';
import progressRoutes from './routes/progress.routes';
import goalRoutes from './routes/goal.routes';
import careerOutcomeRoutes from './routes/careerOutcome.routes';
import careerOutcomeEvidenceRoutes from './routes/careerOutcomeEvidence.routes';
import adminRoutes from './routes/admin.routes';
import adminOutcomeVerificationRoutes from './routes/adminOutcomeVerification.routes';
import notificationRoutes from './routes/notification.routes';

validateCoreEnv();

const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    app: 'SkillTrack AI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/career-roles', careerRoleRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/adaptive-learning', adaptiveRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/career-outcome', careerOutcomeRoutes);
app.use('/api/career-outcome', careerOutcomeEvidenceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/outcome-verification', adminOutcomeVerificationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server and Auto-Seed DB
const PORT = parseInt(env.PORT, 10) || 5000;

connectDB().then(async () => {
  await ensureSkillsSeeded();
  await seedAdmin();
  await seedColleges();
  await seedCareerRoles();
  await seedAssessments();
  app.listen(PORT, () => {
    console.log(`🚀 [SkillTrack Server] Running on http://localhost:${PORT}`);
  });
});
