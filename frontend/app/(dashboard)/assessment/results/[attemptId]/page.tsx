'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { assessmentService } from '@/services/assessment.service';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const [showReview, setShowReview] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['attemptResults', attemptId],
    queryFn: () => assessmentService.getAttemptResults(attemptId),
  });

  if (isLoading) {
    return (
      <PageWrapper className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  const attempt = data?.attempt;
  const review = data?.review || [];
  const assessment = (attempt?.assessmentId as any) || {};
  const skill = (attempt?.skillId as any) || {};

  const mins = Math.floor((attempt?.timeTaken || 0) / 60);
  const secs = (attempt?.timeTaken || 0) % 60;
  const percentage = attempt?.percentage || 0;

  const topicPerf = attempt?.topicPerformance || [];
  const strengths = topicPerf.filter((t) => t.percentage >= 65);
  const areasToImprove = topicPerf.filter((t) => t.percentage < 65);

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-8">
      {/* Top Results Banner */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-6 sm:p-8 bg-slate-900 dark:bg-slate-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              <span>20-Question Assessment Evaluation Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{skill.name || 'Skill'} Assessment Results</h1>
            <p className="text-slate-300 text-sm">{assessment.title || 'Technical Skill Proficiency Evaluation'}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[140px]">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">{percentage}%</span>
            <Badge
              variant={
                attempt?.proficiency === 'ADVANCED'
                  ? 'success'
                  : attempt?.proficiency === 'INTERMEDIATE'
                  ? 'default'
                  : 'warning'
              }
              className="mt-1 font-bold text-xs py-0.5"
            >
              {attempt?.proficiency || 'BEGINNER'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Correct Answers</span>
              <strong className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {attempt?.correctAnswers} / {attempt?.totalQuestions || 20}
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Time Elapsed</span>
              <strong className="text-lg font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                {mins}m {secs}s
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Passing Score</span>
              <strong className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                {assessment.passingScore || 60}%
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Result Status</span>
              <span className={`text-base font-extrabold block ${percentage >= (assessment.passingScore || 60) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {percentage >= (assessment.passingScore || 60) ? 'PASSED ✅' : 'RETAKE SUGGESTED'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={async () => {
                try {
                  const newRes = await assessmentService.startAssessment(assessment._id || attempt?.assessmentId);
                  router.push(`/assessment/take/${newRes.attemptId}`);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to initialize retake attempt.');
                }
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Retake 20-Question Assessment
            </Button>

            <Link href="/learning">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                View Recommended Learning
              </Button>
            </Link>

            <Link href="/skill-gap">
              <Button variant="secondary" className="gap-2">
                Analyze Skill Gap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance Analysis */}
      {topicPerf.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Brain className="h-5 w-5 text-indigo-600" />
              Topic Breakdown ({attempt?.totalQuestions || 20} Questions Analyzed)
            </CardTitle>
            <CardDescription>
              Detailed proficiency analysis across individual skill domains.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicPerf.map((tp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-900 dark:text-slate-100">{tp.topic}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{tp.percentage}% ({tp.correct}/{tp.questionsAttempted})</span>
                  </div>
                  <Progress value={tp.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Review Section */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="cursor-pointer" onClick={() => setShowReview(!showReview)}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                Detailed Question Review ({review.length} Questions)
              </CardTitle>
              <CardDescription>
                Click to inspect full question breakdowns, your answers, and official explanations.
              </CardDescription>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showReview ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>

        {showReview && (
          <CardContent className="space-y-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            {review.map((item: any, idx: number) => {
              const isCorrect = item.isCorrect;
              const questionText = typeof item.question === 'string' ? item.question : item.question?.question || '';
              const topic = item.topic || (typeof item.question === 'object' ? item.question?.topic : '') || 'General';
              const options: string[] = item.options || (typeof item.question === 'object' ? item.question?.options : []) || [];
              const correctAnswer: number = item.correctAnswer ?? (typeof item.question === 'object' ? item.question?.correctAnswer : 0);
              const selectedOption: number = item.selectedOption ?? item.userAnswer;
              const explanation: string = item.explanation || (typeof item.question === 'object' ? item.question?.explanation : '');
              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border space-y-3 ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Question {idx + 1} of {review.length} • {topic}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {questionText}
                      </h4>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    )}
                  </div>

                  {/* Options Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {options.map((opt: string, optIdx: number) => {
                      const isUserSelected = selectedOption === optIdx;
                      const isCorrectAnswer = correctAnswer === optIdx;

                      let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                      if (isCorrectAnswer) {
                        style = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-bold';
                      } else if (isUserSelected && !isCorrectAnswer) {
                        style = 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-100 font-bold line-through';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-lg border flex items-center gap-2 ${style}`}>
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                            {optionLetters[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {explanation && (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <strong className="text-indigo-600 dark:text-indigo-400 block font-semibold">Explanation:</strong>
                      <p>{explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>
    </PageWrapper>
  );
}
