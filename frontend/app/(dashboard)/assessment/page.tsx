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
  Search,
} from 'lucide-react';
import { assessmentService } from '@/services/assessment.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AssessmentHubPage() {
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
        className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD400]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/30 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <Brain className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>AI-POWERED SKILL ASSESSMENT ENGINE</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            ASSESS YOUR TECHNICAL SKILLS <span className="text-[#FFD400]">🎯</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl font-sans">
            Evaluate your knowledge through <strong className="text-white">20-question timed assessments</strong>. Measure your actual proficiency and track topic-level skill gaps.
          </p>
        </div>
      </motion.div>

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-[#0A0A0A] p-1 rounded-sm border border-white/10 text-xs font-mono font-bold uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-sm transition-all ${
              activeTab === 'available'
                ? 'bg-[#FFD400] text-black font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            AVAILABLE ASSESSMENTS ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-sm transition-all ${
              activeTab === 'history'
                ? 'bg-[#FFD400] text-black font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            MY ATTEMPT HISTORY
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="SEARCH SKILL ASSESSMENT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-mono uppercase bg-black border-white/15 focus:border-[#FFD400]"
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
                <Skeleton key={i} className="h-56 w-full rounded-sm bg-[#0A0A0A]" />
              ))}
            </div>
          ) : filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center bg-[#0A0A0A] border-white/10 text-zinc-400 font-mono rounded-sm">
              <Brain className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-condensed text-lg font-bold text-white uppercase">NO ASSESSMENTS FOUND</h3>
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
                    className="p-5 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/50 transition-all duration-200 flex flex-col justify-between rounded-sm"
                  >
                    <CardHeader className="p-0 space-y-3 pb-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
                          {skillCategory}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono uppercase border-white/20 text-zinc-400">
                          {a.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="font-condensed text-xl font-extrabold text-white uppercase">
                        {a.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs text-zinc-400 font-sans">
                        {a.description || `Comprehensive 20-question evaluation covering ${skillName} concepts.`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 pt-2 space-y-4">
                      <div className="p-3 rounded-sm bg-[#111111] border border-white/10 flex justify-between items-center text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-white">
                          <Brain className="h-4 w-4 text-[#FFD400]" />
                          <strong>20 Questions</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-zinc-400">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          <span>{a.timeLimit || 20} Mins</span>
                        </span>
                      </div>

                      <Link href={`/assessment/${a._id}`} className="block">
                        <Button className="w-full gap-2 text-xs font-extrabold uppercase bg-[#FFD400] hover:bg-[#FFE033] text-black">
                          Start 20-Q Assessment
                          <ArrowRight className="h-4 w-4 text-black" />
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
            <Skeleton className="h-96 w-full rounded-sm bg-[#0A0A0A]" />
          ) : history.length === 0 ? (
            <Card className="p-12 text-center bg-[#0A0A0A] border-white/10 text-zinc-400 font-mono rounded-sm">
              <Award className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-condensed text-lg font-bold text-white uppercase">NO COMPLETED ATTEMPTS YET</h3>
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
                    className="p-5 bg-[#0A0A0A] border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-condensed font-extrabold text-lg text-white uppercase">{skillName}</span>
                        <Badge
                          variant="default"
                          className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
                        >
                          {att.proficiency}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        Attempted on {dateStr} • {att.correctAnswers} / {att.totalQuestions || 20} Correct
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="font-condensed text-2xl font-black text-[#FFD400] block">
                          {att.percentage}%
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">{att.status}</span>
                      </div>

                      <Link href={`/assessment/results/${att._id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs font-mono font-bold uppercase border-white/20 text-white hover:border-[#FFD400]">
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

