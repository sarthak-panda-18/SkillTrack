'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingFeedbackService } from '@/services/trainingFeedback.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { MessageSquare, Send } from 'lucide-react';
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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <MessageSquare className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>TRAINING RELEVANCE & JOB SKILL ALIGNMENT</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            TRAINING FEEDBACK & SKILLS EVALUATION 💬
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans">
            Evaluate how relevant your training was to your target/current job role and highlight skills used vs missing in industry.
          </p>
        </div>
      </div>

      {/* Effectiveness Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm text-center">
          <span className="text-xs font-bold uppercase text-zinc-400 block">Training Effectiveness Score</span>
          <span className="font-condensed text-5xl font-black text-[#FFD400] mt-2 block">88%</span>
          <p className="text-xs text-zinc-400 mt-1 font-sans">High career relevance alignment</p>
        </Card>

        <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm md:col-span-2 space-y-2 text-xs">
          <span className="font-condensed text-xl font-bold uppercase text-white block">Skills Trained vs Currently Used in Industry</span>
          <div className="grid grid-cols-2 gap-4 pt-1 font-sans">
            <div>
              <span className="text-zinc-400 font-mono font-bold uppercase block mb-2">Trained & Utilized</span>
              <div className="flex flex-wrap gap-1 font-mono">
                <Badge variant="default" className="bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400] uppercase font-bold text-[10px]">Java</Badge>
                <Badge variant="default" className="bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400] uppercase font-bold text-[10px]">SQL</Badge>
                <Badge variant="default" className="bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400] uppercase font-bold text-[10px]">REST APIs</Badge>
              </div>
            </div>
            <div>
              <span className="text-zinc-400 font-mono font-bold uppercase block mb-2">Missing for Current Role</span>
              <div className="flex flex-wrap gap-1 font-mono">
                <Badge variant="default" className="bg-rose-950 text-rose-300 border-rose-500/40 uppercase font-bold text-[10px]">Spring Boot</Badge>
                <Badge variant="default" className="bg-rose-950 text-rose-300 border-rose-500/40 uppercase font-bold text-[10px]">Docker</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Feedback Form */}
      <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm font-mono">
        <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
          <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-[#FFD400]" />
            SUBMIT TRAINING EVALUATION
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-300 block mb-1 uppercase">Overall Training Relevance (1-5 Stars)</label>
              <select
                value={relevance}
                onChange={(e) => setRelevance(Number(e.target.value))}
                className="w-full sm:w-64 px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono font-bold"
              >
                <option value={5}>★★★★★ (5 Stars - Highly Relevant)</option>
                <option value={4}>★★★★☆ (4 Stars - Relevant)</option>
                <option value={3}>★★★☆☆ (3 Stars - Partially Relevant)</option>
                <option value={2}>★★☆☆☆ (2 Stars - Marginally Relevant)</option>
                <option value={1}>★☆☆☆☆ (1 Star - Not Relevant)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1 uppercase">Feedback & Recommendations</label>
              <textarea
                rows={3}
                placeholder="Which topics should be improved? Was practical exposure sufficient?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-sans text-xs focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <Button type="submit" isLoading={submitMutation.isPending} className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase flex items-center gap-2">
              <Send className="h-4 w-4 text-black" /> Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

