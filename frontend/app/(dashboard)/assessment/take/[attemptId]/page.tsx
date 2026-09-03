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
        <Skeleton className="h-20 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-96 w-full rounded-sm bg-[#0A0A0A]" />
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
      <div className="p-4 sm:p-5 rounded-sm bg-surface-secondary border border-border text-card-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold uppercase text-card-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#FFD400]" />
            {assessmentData.assessment.title}
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase">
            Question {currentIdx + 1} of {totalQuestions} • {answeredCount} / {totalQuestions} Answered
          </p>
        </div>

        {/* Real-time Timer Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-sm font-extrabold transition-colors border ${
            isTimeCritical
              ? 'bg-rose-950/80 text-rose-400 border-rose-500 animate-pulse'
              : isTimeLow
              ? 'bg-amber-950/80 text-amber-400 border-amber-500'
              : 'bg-background text-[#FFD400] border-[#FFD400]/40'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Main Question Interface */}
      {currentQuestion && (
        <Card className="rounded-sm">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <div className="flex justify-between items-center">
              <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
                Topic: {currentQuestion.topic}
              </Badge>
              <Badge variant="default" className="text-[10px] font-mono uppercase bg-surface-secondary text-muted-foreground border-border">
                Difficulty: {currentQuestion.difficulty}
              </Badge>
            </div>

            <CardTitle className="text-xl font-bold text-card-foreground pt-2 leading-relaxed uppercase">
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
                    className={`w-full p-4 rounded-sm text-left border text-xs sm:text-sm font-sans transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD400]/10 border-[#FFD400] text-card-foreground font-bold'
                        : 'bg-surface-secondary border-border hover:border-border/80 text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-sm font-mono text-xs flex items-center justify-center shrink-0 font-bold ${
                        isSelected
                          ? 'bg-[#FFD400] text-black'
                          : 'bg-surface text-muted-foreground'
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
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <Button
                variant="secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="gap-2 text-xs font-mono font-bold uppercase"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentIdx < totalQuestions - 1 ? (
                  <Button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    variant="primary"
                    className="gap-2 text-xs font-bold uppercase"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4 text-black" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsSubmitModalOpen(true)}
                    variant="primary"
                    className="gap-2 text-xs font-bold uppercase"
                  >
                    Review & Submit
                    <Send className="h-4 w-4 text-black" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 20-Question Quick Jump Palette */}
      <Card className="p-4 rounded-sm">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
          <span>Question Overview ({totalQuestions} Total)</span>
          <span className="text-[10px] text-muted-foreground font-normal">Click number to jump</span>
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono">
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[q._id] !== undefined;
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-9 w-full rounded-sm text-xs font-bold transition-all flex items-center justify-center border ${
                  isCurrent
                    ? 'border-[#FFD400] bg-[#FFD400]/20 text-[#FFD400]'
                    : isAnswered
                    ? 'bg-surface-secondary border-[#FFD400]/40 text-[#FFD400]'
                    : 'bg-surface-secondary border-border text-muted-foreground hover:border-border/80'
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
        <DialogContent className="max-w-md bg-card border-border text-card-foreground rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#FFD400]" />
              SUBMIT ASSESSMENT?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              You have answered <strong className="text-card-foreground">{answeredCount} of {totalQuestions}</strong> questions.
            </DialogDescription>
          </DialogHeader>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-sm bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 font-mono">
              ⚠️ You still have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>. Unanswered questions will be scored as incorrect.
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)} className="text-xs font-mono uppercase">
              Back to Player
            </Button>
            <Button
              onClick={() => {
                setIsSubmitModalOpen(false);
                submitMutation.mutate();
              }}
              isLoading={submitMutation.isPending}
              variant="primary"
              className="font-bold text-xs uppercase gap-2"
            >
              <Send className="h-4 w-4 text-black" />
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

