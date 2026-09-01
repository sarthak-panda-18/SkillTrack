'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { goalService } from '@/services/goal.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Sparkles,
  UserCheck,
  TrendingUp,
  Target,
  ArrowRight,
  Brain,
  BookOpen,
  LineChart,
  Calendar,
  Zap,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: goalsData } = useQuery({
    queryKey: ['student-goals-summary'],
    queryFn: () => goalService.getStudentGoals(),
  });

  const skills = profileData?.skills || [];
  const skillsAddedCount = skills.length;
  const skillsToImprove = skills.filter((s) => s.proficiency < 65);
  const avgProficiency =
    skillsAddedCount > 0
      ? Math.round(skills.reduce((acc, curr) => acc + curr.proficiency, 0) / skillsAddedCount)
      : 0;

  // Dynamic greeting time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const targetRoleTitle = typeof user?.targetRole === 'string'
    ? user.targetRole
    : (user?.targetRole as any)?.title || (user?.targetRole as any)?.name || profileData?.user?.targetRole || '';

  return (
    <PageWrapper className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Career Platform Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            {targetRoleTitle ? (
              <>
                Targeting <strong>{targetRoleTitle}</strong>. Take your <strong>20-question skill evaluations</strong> and follow your adaptive pathway.
              </>
            ) : (
              'Set your target career role to generate personalized skill gap analytics and 20-question evaluations.'
            )}
          </p>
        </div>
      </motion.div>

      {/* Metric Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={cardItemVariants}>
          <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Target Career Role</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                  {targetRoleTitle || 'Not Set'}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Career Focus</span>
              <Link href="/profile" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Update →
              </Link>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Tracked Skills</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {skillsAddedCount}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Active Profile Skills</span>
              <Link href="/profile" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Manage →
              </Link>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Average Proficiency</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {avgProficiency}%
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Evaluated Competency</span>
              <Link href="/progress" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
                View Trends →
              </Link>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Skill Gaps Identified</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {skillsToImprove.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Brain className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Requires Focus</span>
              <Link href="/skill-gap" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Analyze Gaps →
              </Link>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Workspace Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills Breakdown & Action Cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Your Skill Competency Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time breakdown of evaluated skill proficiencies.
                </CardDescription>
              </div>
              <Link href="/assessment">
                <Button size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                  Take 20-Q Assessment
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <p className="text-sm font-semibold">No skills added to your profile yet.</p>
                  <p className="text-xs">Add skills to generate 20-question assessments and learning paths.</p>
                  <Link href="/profile" className="inline-block mt-2">
                    <Button size="sm" variant="outline">
                      Add Skills to Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.slice(0, 5).map((skillItem: any) => {
                    const skillName = (skillItem.skillId as any)?.name || 'Technical Skill';
                    const prof = skillItem.proficiency || 0;

                    return (
                      <div key={skillItem._id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-900 dark:text-slate-100">{skillName}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={prof >= 70 ? 'success' : prof >= 40 ? 'default' : 'warning'}
                              className="text-[10px] py-0"
                            >
                              {prof >= 70 ? 'ADVANCED' : prof >= 40 ? 'INTERMEDIATE' : 'BEGINNER'}
                            </Badge>
                            <span className="text-slate-600 dark:text-slate-400 font-mono">{prof}%</span>
                          </div>
                        </div>
                        <Progress value={prof} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Action Navigation Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/learning" className="block group">
              <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Adaptive Learning Pathways
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Curated study materials tailored to your skill gaps.
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/study-plan" className="block group">
              <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Weekly Study Schedules
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Personalized daily milestones and study goals.
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Goal Summary & Adaptive Highlights */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Goals & Milestones
              </CardTitle>
              <CardDescription className="text-xs">
                Active career development milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goalsData?.goals && goalsData.goals.length > 0 ? (
                <div className="space-y-3">
                  {goalsData.goals.slice(0, 3).map((goal: any) => (
                    <div key={goal._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{goal.title}</span>
                        <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'default'} className="text-[9px] py-0">
                          {goal.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{goal.targetSkill || goal.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <p>No active milestones set.</p>
                  <Link href="/goals">
                    <Button size="sm" variant="outline" className="text-xs">
                      Set Career Goals
                    </Button>
                  </Link>
                </div>
              )}

              <Link href="/goals" className="block pt-2">
                <Button variant="ghost" className="w-full text-xs gap-1 text-indigo-600 dark:text-indigo-400">
                  Manage All Goals →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 text-white p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Adaptive Learning Engine</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take a 20-question skill assessment to instantly refine your recommended study plan.
              </p>
              <Link href="/adaptive-learning" className="block pt-1">
                <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                  Launch Adaptive Engine →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
