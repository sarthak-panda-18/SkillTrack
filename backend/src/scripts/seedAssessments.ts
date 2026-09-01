import mongoose from 'mongoose';
import { env } from '../config/env';
import { Skill } from '../models/skill.model';
import { Assessment } from '../models/assessment.model';
import { AssessmentQuestion } from '../models/assessmentQuestion.model';
import { fallbackBank, computeQuestionHash, aiQuestionService } from '../services/aiQuestion.service';

export async function seedAssessments(): Promise<void> {
  try {
    const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Assessments Seed] Seeding default skill assessments and question bank...');

    const allSkills = await Skill.find({ isActive: true });
    let assessmentsCreated = 0;
    let questionsCreated = 0;

    for (const skill of allSkills) {
      // Find or create Assessment config for skill
      const assessment = await Assessment.findOneAndUpdate(
        { skillId: skill._id },
        {
          $set: {
            title: `${skill.name} Skill Proficiency Assessment`,
            skillId: skill._id,
            description: `Evaluate your knowledge and core engineering concepts in ${skill.name}.`,
            difficulty: 'MIXED',
            questionCount: 20,
            timeLimit: 20, // 20 minutes
            passingScore: 60, // 60%
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
      assessmentsCreated++;

      // Seed fallback questions with questionHash
      const key = skill.name.toLowerCase();
      const questionsList = fallbackBank[key] || fallbackBank['default'];

      for (let i = 0; i < questionsList.length; i++) {
        const q = questionsList[i];
        const hash = computeQuestionHash(q.question);

        await AssessmentQuestion.findOneAndUpdate(
          { assessmentId: assessment._id, questionHash: hash },
          {
            $set: {
              assessmentId: assessment._id,
              skillId: skill._id,
              topic: q.topic,
              question: q.question,
              questionHash: hash,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: q.difficulty as any,
              points: 1,
              order: i + 1,
              isActive: true,
            },
          },
          { upsert: true }
        );
        questionsCreated++;
      }
    }

    const totalQ = await AssessmentQuestion.countDocuments({ isActive: true });
    console.log(`[Assessments Seed Complete] ${assessmentsCreated} active assessments with ${totalQ} questions in database.`);
  } catch (error) {
    console.error('[Assessments Seed Error]', error);
  }
}

async function seedStandalone() {
  try {
    await seedAssessments();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Assessments Standalone Seed Error]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedStandalone();
}
