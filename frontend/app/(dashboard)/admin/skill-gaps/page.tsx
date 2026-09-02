'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Target,
  Brain,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Code,
} from 'lucide-react';

export default function TrainerSkillGapsPage() {
  const [cohort, setCohort] = useState('Batch 2026');
  const [program, setProgram] = useState('Computer Science');

  const aiRemedialMutation = useMutation({
    mutationFn: (payload: any) => adminService.generateCohortRemedialIntervention(payload),
  });

  const commonSkillGaps = [
    { skillName: 'Data Structures & Algorithms', gapPercentage: 38, affectedStudents: 24 },
    { skillName: 'System Design & Architecture', gapPercentage: 45, affectedStudents: 18 },
    { skillName: 'Full-Stack REST APIs', gapPercentage: 28, affectedStudents: 15 },
    { skillName: 'Spring Boot & Microservices', gapPercentage: 52, affectedStudents: 30 },
  ];

  const handleGenerateAI = () => {
    aiRemedialMutation.mutate({
      cohort,
      trainingProgram: program,
      commonSkillGaps,
    });
  };

  const aiResult = aiRemedialMutation.data;

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Targeted Cohort Interventions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skill Gap Analytics & AI Interventions 🎯
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Identify cohort technical bottlenecks and trigger Gemini AI targeted remedial action plans to accelerate skill mastery.
          </p>
        </div>

        <Button
          onClick={handleGenerateAI}
          disabled={aiRemedialMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg flex items-center gap-2 shrink-0"
        >
          <Brain className="h-4 w-4" />
          <span>{aiRemedialMutation.isPending ? 'Analyzing Cohort...' : 'Generate AI Remedial Plan'}</span>
        </Button>
      </div>

      {/* Main Grid: Cohort Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Top Cohort Skill Gaps */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Cohort Technical Skill Gaps
            </CardTitle>
            <CardDescription className="text-xs">
              Skill gaps identified across cohort assessment results.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {commonSkillGaps.map((sg, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-slate-100">{sg.skillName}</span>
                  <span className="text-rose-600 dark:text-rose-400">-{sg.gapPercentage}% Average Gap</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${sg.gapPercentage}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Affected Trainees: {sg.affectedStudents}</span>
                  <span className="font-bold text-indigo-600">High Priority Remediation</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Skilling Summary */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code className="h-5 w-5 text-emerald-600" />
              Cohort Skilling Focus
            </CardTitle>
            <CardDescription className="text-xs">
              Summary of technical competencies evaluated.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">Primary Focus: Data Structures & Architecture</div>
              <p className="text-slate-500 text-[11px]">Trainees are completing 20-question assessments to measure proficiency.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">AI Remedial Strategy</div>
              <p className="text-slate-500 text-[11px]">Generate Gemini AI remedial plans to address common skill gaps.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Result Banner */}
      {aiResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 space-y-6"
        >
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-base">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Gemini AI Recommended Remedial Action Plan</span>
          </div>

          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {aiResult.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Recommended Trainer Interventions
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {aiResult.trainerActions?.map((act: string, i: number) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Trainee Remedial Learning Steps
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {aiResult.traineeRemedialPlan?.map((plan: string, i: number) => (
                  <li key={i}>{plan}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex justify-between items-center">
            <span>Expected Impact: {aiResult.expectedImpact}</span>
            <Badge variant="secondary" className="bg-white text-indigo-700 font-extrabold">
              AI Strategy Ready
            </Badge>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
