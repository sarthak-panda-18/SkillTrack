'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Brain, Target, CheckCircle2, TrendingUp, Cpu, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <Badge variant="default" className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md gap-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
            <Brain className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Built for Engineering Students</span>
          </Badge>
        </motion.div>

        {/* Product Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl mx-auto leading-[1.15]"
        >
          Build the skills your <span className="text-indigo-600 dark:text-indigo-400">career demands</span>.
        </motion.h1>

        {/* Supporting Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          SkillTrack AI enables engineering students to evaluate technical proficiency through <strong>20-question assessments</strong>, identify industry skill gaps, follow personalized learning pathways, and achieve placement readiness.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold">
              Explore Platform
            </Button>
          </a>
        </motion.div>

        {/* Hero Realistic Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-md text-left"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">SkillTrack AI • Student Workspace</span>
            </div>
            <Badge variant="default" className="text-[10px] font-bold">LIVE PLATFORM PREVIEW</Badge>
          </div>

          {/* Product Dashboard Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target Role</h4>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Full Stack Engineer</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Placement Readiness</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">78%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[78%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Skill Gap Analysis</h4>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">3 Target Gaps Identified</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">System Design</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Docker</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">PostgreSQL</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Evaluations Completed</h4>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">20-Question Assessments</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Java & Web Architecture Passed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
