'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Zap,
  ArrowRight,
  Brain,
  Award,
  BookOpen,
  Code,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const skills = profileData?.skills || [];
  const skillsAddedCount = skills.length;
  const skillsToImprove = skills.filter((s) => s.proficiency < 65);
  const avgProficiency =
    skillsAddedCount > 0
      ? Math.round(skills.reduce((acc, curr) => acc + curr.proficiency, 0) / skillsAddedCount)
      : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-36 w-full rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-sm" />
          <Skeleton className="h-36 rounded-sm" />
          <Skeleton className="h-36 rounded-sm" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white shadow-2xl border border-white/15 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 text-xs font-mono font-bold uppercase">
            <Zap className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>SKILLTRACK AI TRAINEE INTELLIGENCE ACTIVE</span>
          </div>
          <h1 className="font-condensed font-black text-3xl sm:text-5xl uppercase tracking-wider text-white leading-none">
            {greeting}, <span className="text-[#FFD400]">{user?.name || 'TRAINEE'}</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
            Evaluate your technical proficiencies, resolve skill gaps, take 20-question assessments, and track your learning progress.
          </p>
        </div>

        <Link href="/assessment" className="shrink-0">
          <Button className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
            <Brain className="h-4 w-4 text-black" />
            <span>TAKE SKILL ASSESSMENT</span>
          </Button>
        </Link>
      </motion.div>

      {/* Core Dashboard Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Skill Gap & Readiness */}
        <Card className="p-6 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors">
          <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
            <CardTitle className="font-condensed text-lg font-extrabold uppercase text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#FFD400]" />
              Competency & Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3.5 text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-mono uppercase">Average Proficiency:</span>
              <span className="text-xl font-condensed font-black text-[#FFD400]">{avgProficiency}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-mono uppercase">Skills Needing Attention:</span>
              <span className="font-mono font-bold text-rose-400">{skillsToImprove.length} Skills</span>
            </div>
            <div className="pt-2">
              <Link href="/skill-gap">
                <Button size="sm" variant="outline" className="w-full text-xs font-condensed font-bold uppercase gap-1 border-white/20 text-white hover:border-[#FFD400]">
                  View Skill Gap Analysis <ArrowRight className="h-3.5 w-3.5 text-[#FFD400]" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Technical Skill Progress */}
        <Card className="p-6 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors">
          <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
            <CardTitle className="font-condensed text-lg font-extrabold uppercase text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-[#FFD400]" />
              Skill Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3.5 text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-mono uppercase">Total Skills Added:</span>
              <span className="text-xl font-condensed font-black text-white">{skillsAddedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-mono uppercase">Target Role:</span>
              <Badge className="bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40 font-mono font-bold text-[11px]">
                {user?.targetRole || 'Software Engineer'}
              </Badge>
            </div>
            <div className="pt-2">
              <Link href="/progress/growth">
                <Button size="sm" variant="outline" className="w-full text-xs font-condensed font-bold uppercase gap-1 border-white/20 text-white hover:border-[#FFD400]">
                  View Skill Growth <ArrowRight className="h-3.5 w-3.5 text-[#FFD400]" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Learning & Study Pathways */}
        <Card className="p-6 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors">
          <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
            <CardTitle className="font-condensed text-lg font-extrabold uppercase text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#FFD400]" />
              AI Study Plan & Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3.5 text-xs font-sans">
            <p className="text-zinc-400 leading-relaxed">
              Personalized weekly study modules tailored to your target role and skill gaps.
            </p>
            <div className="flex gap-2 pt-2">
              <Link href="/study-plan" className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs font-condensed font-bold uppercase border-white/20 text-white hover:border-[#FFD400]">
                  Study Plan
                </Button>
              </Link>
              <Link href="/learning" className="flex-1">
                <Button size="sm" className="w-full text-xs font-condensed font-bold uppercase bg-[#FFD400] text-black hover:bg-[#FFE033]">
                  Roadmap
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/assessment">
          <Card className="p-5 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-sm bg-[#171717] text-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-black transition-colors font-bold">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-condensed font-bold text-base text-white uppercase">Assessments</h4>
                <p className="text-xs text-zinc-400 font-sans">20-question skill evaluations.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/company-insights">
          <Card className="p-5 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-sm bg-[#171717] text-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-black transition-colors font-bold">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-condensed font-bold text-base text-white uppercase">Company Insights</h4>
                <p className="text-xs text-zinc-400 font-sans">Hiring trends & peer contributions.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/achievements">
          <Card className="p-5 bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-sm bg-[#171717] text-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-black transition-colors font-bold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-condensed font-bold text-base text-white uppercase">Achievements</h4>
                <p className="text-xs text-zinc-400 font-sans">Milestones & skill badges.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
}

