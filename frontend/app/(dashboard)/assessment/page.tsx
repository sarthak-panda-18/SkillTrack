'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  Search,
  BookOpen,
} from 'lucide-react';
import { assessmentService } from '@/services/assessment.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AssessmentHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [search, setSearch] = useState('');

  // Fetch active public assessments
  const { data: assessments = [], isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['publicAssessments'],
    queryFn: () => assessmentService.getPublicAssessments(),
  });

  // Fetch user attempt history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['userAttemptHistory'],
    queryFn: () => assessmentService.getUserAttemptHistory(),
    enabled: activeTab === 'history',
  });

  const history = historyData?.attempts || (Array.isArray(historyData) ? historyData : []);

  // Filter assessments
  const filteredAssessments = assessments.filter((a) => {
    const title = a.title?.toLowerCase() || '';
    const skillName = (a.skillId as any)?.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    return title.includes(q) || skillName.includes(q);
  });

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
            <Brain className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Powered Skill Assessment Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Assess Your Technical Skills 🎯
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Evaluate your knowledge through <strong>20-question timed assessments</strong>. Measure your actual proficiency and track topic-level skill gaps.
          </p>
        </div>
      </motion.div>

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'available'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Available Assessments ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            My Attempt History
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search skill assessment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        )}
      </div>

      {/* Available Assessments Tab */}
      {activeTab === 'available' && (
        <>
          {isLoadingAssessments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Brain className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assessments Found</h3>
              <p className="text-xs mt-1">Try adjusting your search filter or select another skill.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((a: any) => {
                const skillName = (a.skillId as any)?.name || 'Technical Skill';
                const skillCategory = (a.skillId as any)?.category || 'Engineering';

                return (
                  <Card
                    key={a._id}
                    className="hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between border-slate-200 dark:border-slate-800"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="default" className="text-[10px] py-0 font-bold uppercase tracking-wider">
                          {skillCategory}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 font-semibold">
                          {a.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {a.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {a.description || `Comprehensive 20-question evaluation covering ${skillName} concepts.`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <strong>20 Questions</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{a.timeLimit || 20} Mins</span>
                        </span>
                      </div>

                      <Link href={`/assessment/${a._id}`} className="block">
                        <Button className="w-full gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                          Start 20-Q Assessment
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {isLoadingHistory ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : history.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Completed Attempts Yet</h3>
              <p className="text-xs mt-1">Start your first 20-question skill evaluation above!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((att: any) => {
                const skillName = (att.skillId as any)?.name || 'Technical Skill';
                const dateStr = new Date(att.startedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <Card
                    key={att._id}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">{skillName}</span>
                        <Badge
                          variant={
                            att.proficiency === 'ADVANCED'
                              ? 'success'
                              : att.proficiency === 'INTERMEDIATE'
                              ? 'default'
                              : 'warning'
                          }
                          className="text-[10px] py-0"
                        >
                          {att.proficiency}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Attempted on {dateStr} • {att.correctAnswers} / {att.totalQuestions || 20} Correct
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 block">
                          {att.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{att.status}</span>
                      </div>

                      <Link href={`/assessment/results/${att._id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                          View Results
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
