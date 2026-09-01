'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Brain,
  Plus,
  Search,
  Sparkles,
  Sliders,
  Power,
  Trash2,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { skillService } from '@/services/skill.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import { Assessment, QuestionReviewItem } from '@/types/assessment';

export default function AdminAssessmentsPage() {
  const queryClient = useQueryClient();
  const [managingAssessment, setManagingAssessment] = useState<Assessment | null>(null);
  const [generatingSkillId, setGeneratingSkillId] = useState<string | null>(null);

  // Fetch admin assessments
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['adminAssessments'],
    queryFn: () => adminService.getAdminAssessments(),
  });

  // Fetch catalog skills for AI generation dropdown
  const { data: catalogSkills = [] } = useQuery({
    queryKey: ['catalogSkills'],
    queryFn: () => skillService.getAllSkills(),
  });

  // Fetch questions for specific assessment when inspecting bank
  const { data: questions = [], refetch: refetchQuestions } = useQuery({
    queryKey: ['assessmentQuestions', managingAssessment?._id],
    queryFn: () => adminService.getAssessmentQuestions(managingAssessment!._id),
    enabled: !!managingAssessment,
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleAssessmentStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
      toast.success(`Assessment status updated to ${updated.isActive ? 'Active' : 'Inactive'}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    },
  });

  // AI Question Generation Mutation
  const generateAiQuestionsMutation = useMutation({
    mutationFn: (skillId: string) => adminService.generateAiQuestionsForSkill(skillId, 5),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
      if (managingAssessment) refetchQuestions();
      toast.success(`Generated ${res.createdCount} AI questions for skill! Total in bank: ${res.totalQuestions}`);
      setGeneratingSkillId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate AI questions.');
      setGeneratingSkillId(null);
    },
  });

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            Skill Assessments & Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Configure skill assessments, inspect question banks, and trigger Gemini AI question generation.
          </p>
        </div>
      </div>

      {/* Admin Assessments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configured Assessments ({assessments.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500">
              <Brain className="h-8 w-8 text-zinc-400 mx-auto" />
              <p>No configured assessments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pr-4">Assessment Title</th>
                    <th className="pb-3 px-4">Skill & Category</th>
                    <th className="pb-3 px-4">Questions in Bank</th>
                    <th className="pb-3 px-4">Time & Passing</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {assessments.map((a) => {
                    const skill = (a.skillId as any) || {};
                    return (
                      <tr key={a._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-zinc-900 dark:text-zinc-100">
                          <div>{a.title}</div>
                          <span className="text-[10px] text-zinc-400 font-normal">{a.difficulty} Difficulty</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{skill.name}</span>
                            <Badge variant="purple" className="text-[10px] py-0 font-semibold">
                              {skill.category}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                            {a.questionCountInBank || 0}
                          </strong>
                          <span className="text-zinc-400 text-[10px] block">Questions</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          <div>{a.timeLimit} Minutes</div>
                          <div className="text-[10px] text-zinc-400">Pass: {a.passingScore}%</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={a.isActive ? 'success' : 'outline'} className="text-[10px] py-0 font-bold">
                            {a.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setGeneratingSkillId(skill._id);
                                generateAiQuestionsMutation.mutate(skill._id);
                              }}
                              isLoading={generatingSkillId === skill._id && generateAiQuestionsMutation.isPending}
                              className="h-8 text-[11px] gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                              title="Generate AI Questions via Gemini"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              AI Gen
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setManagingAssessment(a)}
                              className="h-8 text-[11px] gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              title="View Question Bank"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                              Bank ({a.questionCountInBank || 0})
                            </Button>

                            <Button
                              variant={a.isActive ? 'outline' : 'secondary'}
                              size="sm"
                              onClick={() => toggleStatusMutation.mutate(a._id)}
                              className={`h-8 text-xs ${
                                a.isActive ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <Power className="h-3.5 w-3.5 mr-1" />
                              {a.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspect Question Bank Modal */}
      <Dialog open={!!managingAssessment} onOpenChange={() => setManagingAssessment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Question Bank ({questions.length}) for {managingAssessment?.title}
            </DialogTitle>
            <DialogDescription>
              Review validated questions, options, correct answer keys, and explanations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1 py-2 text-xs">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                No questions in bank for this assessment yet. Click "AI Gen" to generate questions.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.questionId || idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {idx + 1}. {q.question}
                    </span>
                    <Badge variant="purple" className="text-[10px] py-0 font-mono shrink-0">
                      {q.topic}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-md border font-medium ${
                          q.correctAnswer === optIdx
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt} {q.correctAnswer === optIdx && '✓'}
                      </div>
                    ))}
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-zinc-950 text-[10px] text-zinc-500">
                    <strong className="text-purple-600 dark:text-purple-400">Explanation:</strong> {q.explanation}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingAssessment(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
