'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Brain, Target, CheckCircle2, BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-white/10 bg-[#000000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <Badge variant="default" className="px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40">
            <Zap className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>BUILT FOR NEXT-GEN ENGINEERS</span>
          </Badge>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="font-condensed font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tight text-white max-w-5xl mx-auto leading-[0.95]"
        >
          MASTER YOUR <span className="text-[#FFD400]">CAREER.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered career readiness for the next generation of engineers. Evaluate proficiency, target skill gaps, and achieve placement excellence.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-sm uppercase tracking-wider">
              GET STARTED
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-extrabold uppercase tracking-wider border-white/20 hover:border-[#FFD400]">
              EXPLORE SKILLTRACK
            </Button>
          </a>
        </motion.div>

        {/* Hero Product Console Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 max-w-5xl mx-auto rounded-sm border border-white/10 bg-[#0A0A0A] p-4 sm:p-6 shadow-2xl text-left"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
              <div className="h-3 w-3 rounded-full bg-zinc-800" />
              <span className="font-mono text-xs font-bold text-zinc-400 ml-2">SKILLTRACK_AI // CONSOLE_v1.0</span>
            </div>
            <Badge variant="default" className="text-[10px] font-mono font-bold bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">LIVE CONSOLE PREVIEW</Badge>
          </div>

          {/* Console Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-sm bg-[#111111] border border-white/10 hover:border-[#FFD400]/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-sm bg-[#FFD400] text-black font-bold">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 font-mono uppercase">Target Role</h4>
                  <p className="font-condensed font-bold text-lg text-white uppercase">Full Stack Engineer</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase">Readiness</span>
                  <span className="text-[#FFD400] font-bold">78%</span>
                </div>
                <div className="h-2 rounded-sm bg-black border border-white/10 overflow-hidden">
                  <div className="h-full bg-[#FFD400] rounded-sm w-[78%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#111111] border border-white/10 hover:border-[#FFD400]/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-sm bg-[#FFD400] text-black font-bold">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 font-mono uppercase">Skill Gap Analysis</h4>
                  <p className="font-condensed font-bold text-lg text-white uppercase">3 Target Gaps Identified</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">SYSTEM DESIGN</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">DOCKER</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">POSTGRESQL</span>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#111111] border border-white/10 hover:border-[#FFD400]/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-sm bg-[#FFD400] text-black font-bold">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-400 font-mono uppercase">Evaluations Completed</h4>
                  <p className="font-condensed font-bold text-lg text-white uppercase">20-Question Assessments</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Java & Web Architecture Passed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

