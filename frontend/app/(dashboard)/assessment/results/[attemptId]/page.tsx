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
        <Skeleton className="h-64 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-96 w-full rounded-sm bg-[#0A0A0A]" />
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

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-8">
      {/* Top Results Banner */}
      <Card className="border-white/10 overflow-hidden bg-[#0A0A0A] text-white rounded-sm">
        <div className="p-6 sm:p-8 bg-[#111111] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 text-[#FFD400]" />
              <span>20-QUESTION ASSESSMENT EVALUATION COMPLETED</span>
            </div>
            <h1 className="font-condensed text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">{skill.name || 'Skill'} Assessment Results</h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans">{assessment.title || 'Technical Skill Proficiency Evaluation'}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-sm bg-black border border-[#FFD400]/40 text-center min-w-[140px]">
            <span className="font-condensed text-4xl sm:text-5xl font-extrabold text-[#FFD400]">{percentage}%</span>
            <Badge
              variant="default"
              className="mt-1 font-mono font-bold text-xs bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40 uppercase"
            >
              {attempt?.proficiency || 'BEGINNER'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-sm bg-black border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Correct Answers</span>
              <strong className="font-condensed text-xl font-extrabold text-[#FFD400]">
                {attempt?.correctAnswers} / {attempt?.totalQuestions || 20}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Time Elapsed</span>
              <strong className="font-condensed text-xl font-extrabold text-white flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-zinc-400" />
                {mins}m {secs}s
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Passing Score</span>
              <strong className="font-condensed text-xl font-extrabold text-white">
                {assessment.passingScore || 60}%
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Result Status</span>
              <span className={`font-condensed text-xl font-extrabold block uppercase ${percentage >= (assessment.passingScore || 60) ? 'text-emerald-400' : 'text-rose-400'}`}>
                {percentage >= (assessment.passingScore || 60) ? 'PASSED ✅' : 'RETAKE SUGGESTED'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
            <Button
              onClick={async () => {
                try {
                  const newRes = await assessmentService.startAssessment(assessment._id || attempt?.assessmentId);
                  router.push(`/assessment/take/${newRes.attemptId}`);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to initialize retake attempt.');
                }
              }}
              className="gap-2 bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase"
            >
              <RotateCcw className="h-4 w-4 text-black" />
              Retake 20-Question Assessment
            </Button>

            <Link href="/learning">
              <Button variant="outline" className="gap-2 text-xs font-mono font-bold uppercase border-white/20 text-white hover:border-[#FFD400]">
                <BookOpen className="h-4 w-4" />
                View Recommended Learning
              </Button>
            </Link>

            <Link href="/skill-gap">
              <Button variant="secondary" className="gap-2 text-xs font-mono font-bold uppercase bg-[#111111] text-white border border-white/15">
                Analyze Skill Gap
                <ArrowRight className="h-4 w-4 text-[#FFD400]" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance Analysis */}
      {topicPerf.length > 0 && (
        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardHeader className="p-6 pb-4 border-b border-white/10">
            <CardTitle className="font-condensed text-xl font-bold flex items-center gap-2 text-white uppercase">
              <Brain className="h-5 w-5 text-[#FFD400]" />
              TOPIC BREAKDOWN ({attempt?.totalQuestions || 20} QUESTIONS ANALYZED)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 font-sans">
              Detailed proficiency analysis across individual skill domains.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              {topicPerf.map((tp: any, idx: number) => (
                <div key={idx} className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white uppercase">{tp.topic}</span>
                    <span className="text-[#FFD400]">{tp.percentage}% ({tp.correct}/{tp.questionsAttempted})</span>
                  </div>
                  <Progress value={tp.percentage} className="h-1.5 bg-zinc-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Review Section */}
      <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
        <CardHeader className="p-6 cursor-pointer" onClick={() => setShowReview(!showReview)}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-condensed text-xl font-bold flex items-center gap-2 text-white uppercase">
                <HelpCircle className="h-5 w-5 text-[#FFD400]" />
                DETAILED QUESTION REVIEW ({review.length} QUESTIONS)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-sans">
                Click to inspect full question breakdowns, your answers, and official explanations.
              </CardDescription>
            </div>
            <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${showReview ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>

        {showReview && (
          <CardContent className="p-6 space-y-6 pt-2 border-t border-white/10">
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
                  className={`p-5 rounded-sm border space-y-3 ${
                    isCorrect
                      ? 'bg-[#111111] border-[#FFD400]/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Question {idx + 1} of {review.length} • {topic}
                      </span>
                      <h4 className="font-condensed font-bold text-lg text-white leading-relaxed uppercase">
                        {questionText}
                      </h4>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-[#FFD400] shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    )}
                  </div>

                  {/* Options Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {options.map((opt: string, optIdx: number) => {
                      const isUserSelected = selectedOption === optIdx;
                      const isCorrectAnswer = correctAnswer === optIdx;

                      let style = 'bg-black border-white/10 text-zinc-300';
                      if (isCorrectAnswer) {
                        style = 'bg-[#FFD400]/20 border-[#FFD400] text-[#FFD400] font-bold';
                      } else if (isUserSelected && !isCorrectAnswer) {
                        style = 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold line-through';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-sm border flex items-center gap-2 ${style}`}>
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-white">
                            {optionLetters[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {explanation && (
                    <div className="p-3 rounded-sm bg-black border border-white/10 text-xs text-zinc-300 space-y-1 font-sans">
                      <strong className="text-[#FFD400] block font-mono font-bold uppercase">Explanation:</strong>
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

