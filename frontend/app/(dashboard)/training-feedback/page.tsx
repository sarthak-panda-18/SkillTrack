'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingFeedbackService } from '@/services/trainingFeedback.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { MessageSquare, Star, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingFeedbackPage() {
  const queryClient = useQueryClient();
  const [relevance, setRelevance] = useState(5);
  const [practical, setPractical] = useState(4);
  const [interview, setInterview] = useState(4);
  const [industry, setIndustry] = useState(4);
  const [comments, setComments] = useState('');

  const { data: feedbackData } = useQuery({
    queryKey: ['studentFeedback'],
    queryFn: () => trainingFeedbackService.getStudentFeedback(),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => trainingFeedbackService.submitFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFeedback'] });
      toast.success('Training feedback submitted! Thank you for evaluating curriculum relevance.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      trainingRelevance: relevance,
      practicalExposure: practical,
      interviewPrep: interview,
      industryExposure: industry,
      skillsTrained: ['Java', 'SQL', 'React', 'REST APIs'],
      skillsUsed: ['Java', 'SQL', 'REST APIs'],
      skillsMissing: ['Spring Boot', 'Docker'],
      comments,
    });
  };

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Training Relevance & Job Skill Alignment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Training Feedback & Skills Evaluation 💬
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Evaluate how relevant your training was to your target/current job role and highlight skills used vs missing in industry.
          </p>
        </div>
      </div>

      {/* Effectiveness Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs font-extrabold uppercase text-slate-500 block">Training Effectiveness Score</span>
          <span className="text-4xl font-extrabold text-indigo-600 mt-2 block">88%</span>
          <p className="text-xs text-slate-500 mt-1">High career relevance alignment</p>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 md:col-span-2 space-y-2 text-xs">
          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">Skills Trained vs Currently Used in Industry</span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 font-bold block mb-1">Trained & Utilized</span>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-emerald-600 text-white">Java</Badge>
                <Badge className="bg-emerald-600 text-white">SQL</Badge>
                <Badge className="bg-emerald-600 text-white">REST APIs</Badge>
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-bold block mb-1">Missing for Current Role</span>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-rose-600 border-rose-300">Spring Boot</Badge>
                <Badge variant="outline" className="text-rose-600 border-rose-300">Docker</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Feedback Form */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send className="h-5 w-5 text-indigo-600" />
            Submit Training Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Overall Training Relevance (1-5 Stars)</label>
              <select
                value={relevance}
                onChange={(e) => setRelevance(Number(e.target.value))}
                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold"
              >
                <option value={5}>★★★★★ (5 Stars - Highly Relevant)</option>
                <option value={4}>★★★★☆ (4 Stars - Relevant)</option>
                <option value={3}>★★★☆☆ (3 Stars - Partially Relevant)</option>
                <option value={2}>★★☆☆☆ (2 Stars - Marginally Relevant)</option>
                <option value={1}>★☆☆☆☆ (1 Star - Not Relevant)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Feedback & Recommendations</label>
              <textarea
                rows={3}
                placeholder="Which topics should be improved? Was practical exposure sufficient?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <Button type="submit" isLoading={submitMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">
              <Send className="h-4 w-4" /> Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
