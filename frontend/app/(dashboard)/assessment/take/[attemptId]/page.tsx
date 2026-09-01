'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Brain,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { assessmentService } from '@/services/assessment.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { StartAssessmentResponse } from '@/types/assessment';

export default function AssessmentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [assessmentData, setAssessmentData] = useState<StartAssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(20 * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const isSubmittingRef = useRef(false);

  // Fetch assessment questions for attempt
  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const startRes = await assessmentService.getAttemptForPlayer(attemptId);
        setAssessmentData(startRes);

        const totalTime = (startRes.assessment.timeLimit || 20) * 60;
        const elapsed = Math.round((Date.now() - new Date(startRes.startedAt).getTime()) / 1000);
        const remaining = Math.max(0, totalTime - elapsed);
        setTimeLeftSeconds(remaining);
      } catch (err: any) {
        console.error('[Assessment Player Load Error]', err);
        const errMsg = err.response?.data?.message || err.message || 'Failed to load assessment questions.';
        toast.error(`Assessment load failed: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || !assessmentData || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, assessmentData, timeLeftSeconds]);

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      const formattedAnswers = Object.entries(userAnswers).map(([qId, optionIdx]) => ({
        questionId: qId,
        selectedOption: optionIdx,
      }));
      return assessmentService.submitAssessment(assessmentData!.attemptId, formattedAnswers);
    },
    onSuccess: () => {
      toast.success('Assessment submitted successfully!');
      router.push(`/assessment/results/${assessmentData!.attemptId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit assessment.');
    },
  });

  const handleAutoSubmit = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    toast.warning('Time is up! Submitting your assessment automatically...');
    submitMutation.mutate();
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  if (loading || !assessmentData) {
    return (
      <PageWrapper className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  const questions = assessmentData.questions || [];
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeLow = timeLeftSeconds <= 5 * 60;
  const isTimeCritical = timeLeftSeconds <= 60;

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {assessmentData.assessment.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Question {currentIdx + 1} of {totalQuestions} • {answeredCount} / {totalQuestions} Answered
          </p>
        </div>

        {/* Real-time Timer Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-extrabold transition-colors border ${
            isTimeCritical
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 border-rose-300 animate-pulse'
              : isTimeLow
              ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 border-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Main Question Interface */}
      {currentQuestion && (
        <Card className="shadow-sm relative overflow-hidden border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex justify-between items-center">
              <Badge variant="default" className="text-[10px] py-0 font-bold uppercase tracking-wider">
                Topic: {currentQuestion.topic}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 font-semibold">
                Difficulty: {currentQuestion.difficulty}
              </Badge>
            </div>

            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 leading-relaxed">
              {currentIdx + 1}. {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Options List */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((optionText, optionIdx) => {
                const isSelected = userAnswers[currentQuestion._id] === optionIdx;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={optionIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion._id, optionIdx)}
                    className={`w-full p-4 rounded-xl text-left border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-lg font-mono text-xs flex items-center justify-center shrink-0 font-bold ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {optionLetters[optionIdx]}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="gap-2 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentIdx < totalQuestions - 1 ? (
                  <Button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Review & Submit
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 20-Question Quick Jump Palette */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>Question Overview ({totalQuestions} Total)</span>
          <span className="text-[10px] text-slate-400 font-normal">Click number to jump</span>
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[q._id] !== undefined;
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-9 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                  isCurrent
                    ? 'ring-2 ring-indigo-500 border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : isAnswered
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              Submit Assessment?
            </DialogTitle>
            <DialogDescription>
              You have answered <strong>{answeredCount} of {totalQuestions}</strong> questions.
            </DialogDescription>
          </DialogHeader>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              ⚠️ You still have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>. Unanswered questions will be scored as incorrect.
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Back to Player
            </Button>
            <Button
              onClick={() => {
                setIsSubmitModalOpen(false);
                submitMutation.mutate();
              }}
              isLoading={submitMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Send className="h-4 w-4" />
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
