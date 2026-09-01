import mongoose from 'mongoose';
import { Assessment, IAssessment } from '../models/assessment.model';
import { AssessmentQuestion, IAssessmentQuestion } from '../models/assessmentQuestion.model';
import { AssessmentAttempt, IAssessmentAttempt } from '../models/assessmentAttempt.model';
import { UserSkill } from '../models/userSkill.model';
import { Skill } from '../models/skill.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { aiQuestionService } from './aiQuestion.service';
import { skillService } from './skill.service';
import { notificationService } from './notification.service';

export interface AssessmentHistoryQueryOptions {
  page?: number | string;
  limit?: number | string;
  search?: string;
  skillId?: string;
  assessmentId?: string;
  timeRange?: string; // '7d' | '30d' | '3m' | '6m' | '1y' | 'all'
  sort?: string;      // 'latest' | 'oldest' | 'highest_score' | 'lowest_score' | 'most_improved'
}


export class AssessmentService {
  async getPublicAssessments(skillId?: string): Promise<any[]> {
    const filter: any = { isActive: true };
    if (skillId) filter.skillId = skillId;

    const assessments = await Assessment.find(filter)
      .populate('skillId', 'name category description')
      .sort({ createdAt: -1 });

    return assessments;
  }

  async getAssessmentById(assessmentId: string) {
    const assessment = await Assessment.findById(assessmentId).populate('skillId', 'name category description');
    if (!assessment || !assessment.isActive) {
      throw new ApiError(404, 'Assessment not found or is inactive.');
    }

    const questionCount = await AssessmentQuestion.countDocuments({ assessmentId, isActive: true });

    return {
      assessment,
      availableQuestionsCount: questionCount,
    };
  }

  async startAssessment(userId: string, assessmentId: string) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment || !assessment.isActive) {
      throw new ApiError(404, 'Assessment not found or is inactive.');
    }

    // Check if there is an existing IN_PROGRESS attempt created in the last 30 minutes
    let attempt = await AssessmentAttempt.findOne({
      userId,
      assessmentId,
      status: 'IN_PROGRESS',
      startedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (attempt && attempt.questionIds && attempt.questionIds.length > 0) {
      // Return existing attempt questions
      return this.getAttemptForPlayer(userId, attempt._id.toString());
    }

    // 1. Check question pool size; auto-replenish if bank < 100 questions
    let currentBankCount = await AssessmentQuestion.countDocuments({ assessmentId: assessment._id, isActive: true });
    if (currentBankCount < 50) {
      await aiQuestionService.replenishQuestionPool(assessment.skillId.toString(), 100);
    }

    // 2. Fetch all questions previously served to this student for this assessment
    const previousAttempts = await AssessmentAttempt.find({ userId, assessmentId }).select('questionIds createdAt').sort({ createdAt: -1 });
    
    const seenQuestionIds = new Set<string>();
    previousAttempts.forEach((att) => {
      if (att.questionIds) {
        att.questionIds.forEach((qId) => seenQuestionIds.add(qId.toString()));
      }
    });

    // 3. Fetch all active questions in bank for this assessment
    const allPoolQuestions = await AssessmentQuestion.find({ assessmentId: assessment._id, isActive: true });
    if (allPoolQuestions.length === 0) {
      throw new ApiError(500, 'No questions are currently available for this assessment.');
    }

    // 4. Filter for unseen questions
    const unseenQuestions = allPoolQuestions.filter((q) => !seenQuestionIds.has(q._id.toString()));

    const targetCount = assessment.questionCount || 20;
    let selectedQuestions: IAssessmentQuestion[] = [];

    if (unseenQuestions.length >= targetCount) {
      // Pick 20 unseen questions with mixed difficulty sampling
      selectedQuestions = this.sampleBalancedQuestions(unseenQuestions, targetCount);
    } else {
      // Take all unseen questions
      selectedQuestions = [...unseenQuestions];

      // Identify questions from immediately previous attempt to avoid instant repetition
      const lastAttempt = previousAttempts[0];
      const lastAttemptSeenIds = new Set<string>(lastAttempt?.questionIds?.map((id) => id.toString()) || []);

      const poolWithoutLastAttempt = allPoolQuestions.filter((q) => !lastAttemptSeenIds.has(q._id.toString()));
      const remainingNeeded = targetCount - selectedQuestions.length;

      // Exclude already picked unseen questions
      const alreadyPickedIds = new Set<string>(selectedQuestions.map((q) => q._id.toString()));
      const candidates = poolWithoutLastAttempt.filter((q) => !alreadyPickedIds.has(q._id.toString()));

      if (candidates.length >= remainingNeeded) {
        selectedQuestions.push(...this.sampleBalancedQuestions(candidates, remainingNeeded));
      } else {
        // Fallback: fill remaining from full pool excluding already picked
        const remainingCandidates = allPoolQuestions.filter((q) => !alreadyPickedIds.has(q._id.toString()));
        selectedQuestions.push(...this.sampleBalancedQuestions(remainingCandidates, remainingNeeded));
      }
    }

    // Shuffle the final selected 20 questions
    selectedQuestions = this.shuffleArray(selectedQuestions).slice(0, targetCount);

    // Create new attempt with questionIds snapshot
    attempt = await AssessmentAttempt.create({
      userId,
      assessmentId,
      skillId: assessment.skillId,
      questionIds: selectedQuestions.map((q) => q._id),
      startedAt: new Date(),
      status: 'IN_PROGRESS',
      totalQuestions: selectedQuestions.length,
    });

    // Return sanitized questions (no correctAnswer, no explanation)
    const sanitizedQuestions = selectedQuestions.map((q, idx) => ({
      _id: q._id,
      assessmentId: q.assessmentId,
      skillId: q.skillId,
      topic: q.topic,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      order: idx + 1,
    }));

    return {
      attemptId: attempt._id,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        timeLimit: assessment.timeLimit,
        questionCount: sanitizedQuestions.length,
        passingScore: assessment.passingScore,
      },
      startedAt: attempt.startedAt,
      questions: sanitizedQuestions,
    };
  }

  async getAttemptForPlayer(userId: string, attemptId: string) {
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) throw new ApiError(404, 'Assessment attempt not found.');

    if (attempt.userId.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You cannot access another user\'s assessment attempt.');
    }

    if (attempt.status === 'COMPLETED') {
      throw new ApiError(400, 'This assessment attempt has already been completed.');
    }

    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) throw new ApiError(404, 'Associated assessment configuration not found.');

    // Fetch questions matching exact attempt.questionIds snapshot
    let questions: IAssessmentQuestion[] = [];
    if (attempt.questionIds && attempt.questionIds.length > 0) {
      const fetched = await AssessmentQuestion.find({ _id: { $in: attempt.questionIds } });
      const qMap = new Map<string, IAssessmentQuestion>();
      fetched.forEach((q) => qMap.set(q._id.toString(), q));
      attempt.questionIds.forEach((qId) => {
        const found = qMap.get(qId.toString());
        if (found) questions.push(found);
      });
    } else {
      questions = await AssessmentQuestion.find({ assessmentId: assessment._id, isActive: true }).limit(assessment.questionCount || 20);
    }

    const sanitizedQuestions = questions.map((q, idx) => ({
      _id: q._id,
      assessmentId: q.assessmentId,
      skillId: q.skillId,
      topic: q.topic,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      order: idx + 1,
    }));

    return {
      attemptId: attempt._id,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        timeLimit: assessment.timeLimit,
        questionCount: sanitizedQuestions.length,
        passingScore: assessment.passingScore,
      },
      startedAt: attempt.startedAt,
      questions: sanitizedQuestions,
    };
  }

  async submitAssessment(
    userId: string,
    attemptId: string,
    userAnswers: Array<{ questionId: string; selectedOption: number }>
  ) {
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) throw new ApiError(404, 'Assessment attempt not found.');

    if (attempt.userId.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You cannot submit another user\'s assessment attempt.');
    }

    if (attempt.status === 'COMPLETED') {
      throw new ApiError(400, 'This assessment attempt has already been completed and submitted.');
    }

    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) throw new ApiError(404, 'Associated assessment configuration not found.');

    const now = new Date();
    const elapsedSeconds = Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);

    // Fetch questions matching attempt.questionIds INCLUDING correctAnswer and explanation for evaluation
    let questions: IAssessmentQuestion[] = [];
    if (attempt.questionIds && attempt.questionIds.length > 0) {
      questions = await AssessmentQuestion.find({ _id: { $in: attempt.questionIds } }).select(
        '+correctAnswer +explanation'
      );
    } else {
      questions = await AssessmentQuestion.find({ assessmentId: assessment._id }).select(
        '+correctAnswer +explanation'
      );
    }

    const questionMap = new Map<string, IAssessmentQuestion>();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    let correctCount = 0;
    const evaluatedAnswers: any[] = [];
    const topicStats: { [topic: string]: { attempted: number; correct: number } } = {};

    userAnswers.forEach((ans) => {
      const q = questionMap.get(ans.questionId);
      if (!q) return;

      const isCorrect = ans.selectedOption === q.correctAnswer;
      if (isCorrect) correctCount++;

      evaluatedAnswers.push({
        questionId: q._id,
        selectedOption: ans.selectedOption,
        isCorrect,
      });

      const topic = q.topic || 'General';
      if (!topicStats[topic]) topicStats[topic] = { attempted: 0, correct: 0 };
      topicStats[topic].attempted++;
      if (isCorrect) topicStats[topic].correct++;
    });

    const totalQ = questions.length || 1;
    const percentage = Math.round((correctCount / totalQ) * 100);

    let proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
    if (percentage >= 70) proficiency = 'ADVANCED';
    else if (percentage >= 40) proficiency = 'INTERMEDIATE';

    const topicPerformance = Object.entries(topicStats).map(([topic, stat]) => ({
      topic,
      questionsAttempted: stat.attempted,
      correct: stat.correct,
      percentage: Math.round((stat.correct / (stat.attempted || 1)) * 100),
    }));

    // Update attempt
    attempt.submittedAt = now;
    attempt.score = correctCount;
    attempt.percentage = percentage;
    attempt.correctAnswers = correctCount;
    attempt.totalQuestions = totalQ;
    attempt.timeTaken = elapsedSeconds;
    attempt.proficiency = proficiency;
    attempt.status = 'COMPLETED';
    attempt.answers = evaluatedAnswers;
    attempt.topicPerformance = topicPerformance;

    await attempt.save();

    // Update student's UserSkill proficiency in MongoDB if current score is higher!
    const userSkill = await UserSkill.findOne({ userId, skillId: attempt.skillId });
    if (userSkill) {
      if (percentage > userSkill.proficiency) {
        userSkill.proficiency = percentage;
        userSkill.level =
          percentage >= 75 ? 'Advanced' : percentage >= 45 ? 'Intermediate' : 'Beginner';
        userSkill.lastAssessedAt = now;
        await userSkill.save();
        await skillService.recordSkillSnapshot(userId, attempt.skillId.toString(), percentage, 'ASSESSMENT');
      }
    } else {
      await UserSkill.create({
        userId,
        skillId: attempt.skillId,
        proficiency: percentage,
        level: percentage >= 75 ? 'Advanced' : percentage >= 45 ? 'Intermediate' : 'Beginner',
        lastAssessedAt: now,
      });
      await skillService.recordSkillSnapshot(userId, attempt.skillId.toString(), percentage, 'ASSESSMENT');
    }

    // Trigger Assessment Completed Notification & Email asynchronously
    notificationService.createNotification({
      userId,
      type: 'ASSESSMENT_COMPLETED',
      title: `${assessment.title} Completed`,
      message: `You scored ${percentage}% on your ${assessment.title} assessment.`,
      link: '/assessment/history',
      entityId: attempt._id.toString(),
      emailData: {
        assessmentTitle: assessment.title,
        percentage,
        scoreText: `${correctCount} / ${totalQ} Correct`,
      },
    });

    return {
      attemptId: attempt._id,
      score: correctCount,
      totalQuestions: totalQ,
      percentage,
      proficiency,
      timeTaken: elapsedSeconds,
      passed: percentage >= assessment.passingScore,
      topicPerformance,
    };
  }

  async getAttemptResults(userId: string, attemptId: string) {
    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessmentId', 'title passingScore timeLimit')
      .populate('skillId', 'name category');

    if (!attempt) throw new ApiError(404, 'Assessment attempt not found.');
    if (attempt.userId.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You cannot view another user\'s assessment attempt.');
    }

    // Fetch questions matching attempt.questionIds WITH answer key & explanation
    let questions: IAssessmentQuestion[] = [];
    if (attempt.questionIds && attempt.questionIds.length > 0) {
      const fetched = await AssessmentQuestion.find({ _id: { $in: attempt.questionIds } }).select(
        '+correctAnswer +explanation'
      );
      const qMap = new Map<string, IAssessmentQuestion>();
      fetched.forEach((q) => qMap.set(q._id.toString(), q));
      attempt.questionIds.forEach((qId) => {
        const found = qMap.get(qId.toString());
        if (found) questions.push(found);
      });
    } else {
      questions = await AssessmentQuestion.find({ assessmentId: attempt.assessmentId }).select(
        '+correctAnswer +explanation'
      );
    }

    const answerMap = new Map<string, number>();
    attempt.answers.forEach((ans) => answerMap.set(ans.questionId.toString(), ans.selectedOption));

    const reviewList = questions.map((q) => {
      const selected = answerMap.get(q._id.toString());
      return {
        questionId: q._id,
        topic: q.topic,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedOption: selected !== undefined ? selected : -1,
        isCorrect: selected === q.correctAnswer,
        explanation: q.explanation,
      };
    });

    return {
      attempt,
      review: reviewList,
    };
  }

  async getUserAttemptHistory(userId: string, options: AssessmentHistoryQueryOptions = {}) {
    const user = await User.findById(userId);

    // Fetch all completed attempts for user sorted chronologically (oldest to newest)
    const allCompleted = await AssessmentAttempt.find({ userId, status: 'COMPLETED' })
      .populate('skillId', 'name category description')
      .populate('assessmentId', 'title description passingScore difficulty')
      .sort({ createdAt: 1 });

    if (allCompleted.length === 0) {
      return {
        summary: {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          latestScore: 0,
        },
        attempts: [],
        pagination: {
          total: 0,
          page: 1,
          limit: parseInt((options.limit as string) || '10', 10),
          totalPages: 0,
        },
        topicPerformanceSummary: [],
        skillPerformanceSummary: [],
        targetRoleName: user?.targetRole || null,
      };
    }

    // Process attempts chronologically to calculate attempt numbers, previous scores, and improvement points
    const assessmentStatsMap: Map<string, { lastPercentage: number; count: number; bestScore: number }> = new Map();
    const processedAttempts: any[] = [];

    for (const att of allCompleted) {
      const skillObj = (att.skillId as any) || {};
      const assessmentObj = (att.assessmentId as any) || {};
      const key = assessmentObj._id?.toString() || skillObj._id?.toString() || 'generic';

      const prev = assessmentStatsMap.get(key);
      let attemptNumber = 1;
      let previousScore: number | null = null;
      let improvementPoints: number | null = null;

      if (prev) {
        attemptNumber = prev.count + 1;
        previousScore = prev.lastPercentage;
        improvementPoints = att.percentage - prev.lastPercentage;
        prev.count = attemptNumber;
        prev.lastPercentage = att.percentage;
        if (att.percentage > prev.bestScore) {
          prev.bestScore = att.percentage;
        }
      } else {
        assessmentStatsMap.set(key, {
          lastPercentage: att.percentage,
          count: 1,
          bestScore: att.percentage,
        });
      }

      const answeredCount = att.answers ? att.answers.length : att.totalQuestions;
      const correctAnswers = att.correctAnswers || 0;
      const incorrectAnswers = att.answers
        ? att.answers.filter((a) => a.isCorrect === false).length
        : Math.max(0, att.totalQuestions - correctAnswers);
      const unanswered = Math.max(0, att.totalQuestions - answeredCount);

      processedAttempts.push({
        _id: att._id,
        attemptId: att._id.toString(),
        userId: att.userId,
        assessmentId: assessmentObj._id || att.assessmentId,
        assessmentTitle: assessmentObj.title || 'Technical Assessment',
        assessmentDifficulty: assessmentObj.difficulty || 'MIXED',
        passingScore: assessmentObj.passingScore || 70,
        skillId: skillObj._id || att.skillId,
        skillName: skillObj.name || 'Technical Skill',
        category: skillObj.category || 'General',
        score: att.score,
        percentage: att.percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        totalQuestions: att.totalQuestions,
        timeTaken: att.timeTaken || 0,
        proficiency: att.proficiency,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt || att.createdAt,
        createdAt: att.createdAt,
        attemptNumber,
        previousScore,
        improvementPoints,
        topicPerformance: att.topicPerformance || [],
      });
    }

    // Summary calculations over all completed attempts
    const totalAttempts = processedAttempts.length;
    const percentages = processedAttempts.map((a) => a.percentage);
    const bestScore = Math.max(...percentages);
    const latestScore = processedAttempts[processedAttempts.length - 1].percentage;
    const averageScore = Math.round((percentages.reduce((a, b) => a + b, 0) / totalAttempts) * 10) / 10;

    // Apply Filters (timeRange, search, skillId, assessmentId)
    let filtered = [...processedAttempts];

    // Time Range Filter
    const timeRange = options.timeRange || 'all';
    const now = new Date();
    let rangeStartDate: Date | null = null;
    if (timeRange === '7d') rangeStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') rangeStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '3m') rangeStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '6m') rangeStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    else if (timeRange === '1y') rangeStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    if (rangeStartDate) {
      filtered = filtered.filter((a) => new Date(a.createdAt) >= rangeStartDate!);
    }

    // Search Filter
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.assessmentTitle.toLowerCase().includes(q) ||
          a.skillName.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Skill Filter
    if (options.skillId && options.skillId !== 'ALL') {
      filtered = filtered.filter((a) => a.skillId?.toString() === options.skillId);
    }

    // Assessment Filter
    if (options.assessmentId && options.assessmentId !== 'ALL') {
      filtered = filtered.filter((a) => a.assessmentId?.toString() === options.assessmentId);
    }

    // Sorting
    const sortOpt = (options.sort || 'latest').toLowerCase();
    filtered.sort((a, b) => {
      if (sortOpt === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOpt === 'highest_score') {
        return b.percentage - a.percentage;
      }
      if (sortOpt === 'lowest_score') {
        return a.percentage - b.percentage;
      }
      if (sortOpt === 'most_improved') {
        const impA = a.improvementPoints !== null ? a.improvementPoints : -999;
        const impB = b.improvementPoints !== null ? b.improvementPoints : -999;
        return impB - impA;
      }
      // Default latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Pagination
    const pageNum = Math.max(1, parseInt((options.page as string) || '1', 10));
    const limitNum = Math.max(1, parseInt((options.limit as string) || '10', 10));
    const totalPages = Math.ceil(filtered.length / limitNum);
    const paginatedAttempts = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Topic Performance Aggregation across all attempts
    const topicMap: Map<string, { attempted: number; correct: number }> = new Map();
    processedAttempts.forEach((att) => {
      (att.topicPerformance || []).forEach((tp: any) => {
        if (!tp.topic) return;
        const existing = topicMap.get(tp.topic) || { attempted: 0, correct: 0 };
        existing.attempted += tp.questionsAttempted || 0;
        existing.correct += tp.correct || 0;
        topicMap.set(tp.topic, existing);
      });
    });

    const topicPerformanceSummary = Array.from(topicMap.entries())
      .map(([topic, stat]) => ({
        topic,
        questionsAttempted: stat.attempted,
        correct: stat.correct,
        percentage: stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Skill Performance Aggregation across all attempts
    const skillMap = new Map<string, { skillName: string; category: string; scores: number[]; bestScore: number }>();
    processedAttempts.forEach((att) => {
      const skillName = att.skillName;
      const existing = skillMap.get(skillName) || {
        skillName,
        category: att.category,
        scores: [] as number[],
        bestScore: 0,
      };
      existing.scores.push(att.percentage);
      if (att.percentage > existing.bestScore) existing.bestScore = att.percentage;
      skillMap.set(skillName, existing);
    });

    const skillPerformanceSummary = Array.from(skillMap.values()).map((s) => ({
      skillName: s.skillName,
      category: s.category,
      attemptCount: s.scores.length,
      latestScore: s.scores[s.scores.length - 1],
      bestScore: s.bestScore,
      averageScore: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
    }));

    return {
      summary: {
        totalAttempts,
        averageScore,
        bestScore,
        latestScore,
      },
      attempts: paginatedAttempts,
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      topicPerformanceSummary,
      skillPerformanceSummary,
      targetRoleName: user?.targetRole || null,
    };
  }


  // Helper method: sample questions balancing EASY, MEDIUM, and HARD difficulty
  private sampleBalancedQuestions(pool: IAssessmentQuestion[], targetCount: number): IAssessmentQuestion[] {
    const easy = this.shuffleArray(pool.filter((q) => q.difficulty === 'EASY'));
    const medium = this.shuffleArray(pool.filter((q) => q.difficulty === 'MEDIUM'));
    const hard = this.shuffleArray(pool.filter((q) => q.difficulty === 'HARD'));

    const targetEasy = Math.round(targetCount * 0.3); // ~6
    const targetMedium = Math.round(targetCount * 0.45); // ~9
    const targetHard = targetCount - targetEasy - targetMedium; // ~5

    const selected: IAssessmentQuestion[] = [];
    selected.push(...easy.slice(0, targetEasy));
    selected.push(...medium.slice(0, targetMedium));
    selected.push(...hard.slice(0, targetHard));

    // Fill remaining if some difficulty pool was short
    if (selected.length < targetCount) {
      const pickedIds = new Set<string>(selected.map((q) => q._id.toString()));
      const remainingPool = this.shuffleArray(pool.filter((q) => !pickedIds.has(q._id.toString())));
      selected.push(...remainingPool.slice(0, targetCount - selected.length));
    }

    return selected;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // --- Admin Assessment & Question Bank Management ---
  async getAdminAssessments() {
    const assessments = await Assessment.find().populate('skillId', 'name category').sort({ createdAt: -1 });
    const counts = await Promise.all(
      assessments.map((a) => AssessmentQuestion.countDocuments({ assessmentId: a._id, isActive: true }))
    );

    return assessments.map((a, i) => ({
      ...a.toObject(),
      questionCountInBank: counts[i],
    }));
  }

  async createAssessment(data: Partial<IAssessment>): Promise<IAssessment> {
    return await Assessment.create(data);
  }

  async updateAssessment(id: string, data: Partial<IAssessment>): Promise<IAssessment> {
    const assessment = await Assessment.findByIdAndUpdate(id, data, { new: true });
    if (!assessment) throw new ApiError(404, 'Assessment not found.');
    return assessment;
  }

  async toggleAssessmentStatus(id: string): Promise<IAssessment> {
    const assessment = await Assessment.findById(id);
    if (!assessment) throw new ApiError(404, 'Assessment not found.');
    assessment.isActive = !assessment.isActive;
    await assessment.save();
    return assessment;
  }

  async getAssessmentQuestions(assessmentId: string) {
    return await AssessmentQuestion.find({ assessmentId, isActive: true })
      .select('+correctAnswer +explanation')
      .sort({ order: 1 });
  }

  async generateAiQuestionsForSkill(skillId: string, count: number = 20) {
    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, 'Skill not found.');

    const assessment = await Assessment.findOne({ skillId });
    if (!assessment) throw new ApiError(404, 'Assessment for this skill not found.');

    const finalCount = await aiQuestionService.replenishQuestionPool(skillId, 100);
    return { createdCount: count, totalQuestions: finalCount };
  }
}

export const assessmentService = new AssessmentService();
