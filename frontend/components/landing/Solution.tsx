import { CheckCircle2, ShieldCheck, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Solution() {
  const differentiators = [
    {
      title: '20-Question Timed Assessments',
      description: 'Standardized 20-question evaluations measuring actual core engineering concepts across all active skills.',
    },
    {
      title: 'Target Role Skill Gap Analysis',
      description: 'Objective gap detection mapping your evaluated proficiencies against corporate hiring requirements.',
    },
    {
      title: 'Adaptive Learning Pathways',
      description: 'Structured, step-by-step study modules tailored specifically to close your identified skill gaps.',
    },
    {
      title: 'Real-Time Competency Analytics',
      description: 'Track your growth with dynamic proficiency trends, topic breakdowns, and placement readiness scores.',
    },
  ];

  return (
    <section id="why-skilltrack" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="default" className="text-[11px] font-bold uppercase tracking-wider">
              Why SkillTrack AI
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              A structured roadmap from student to industry-ready engineer.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              SkillTrack AI replaces guesswork with data-driven clarity. We help you systematically build skills, bridge gaps, and present your readiness for technical selection rounds.
            </p>

            <div className="pt-4 space-y-4">
              {differentiators.map((sol, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {sol.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {sol.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 dark:bg-slate-900 text-white shadow-md border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Competency Scorecard Breakdown</h3>
                  <p className="text-slate-400 text-xs">Standardized evaluation metrics</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-800/80 p-4 rounded-xl text-xs border border-slate-700">
                <div className="flex justify-between items-center border-b border-slate-700/80 pb-2">
                  <span className="text-slate-300">Data Structures & Algorithms</span>
                  <span className="font-bold text-emerald-400">Advanced (85%)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/80 pb-2">
                  <span className="text-slate-300">Web Architecture & Node.js</span>
                  <span className="font-bold text-indigo-300">Intermediate (70%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">System Design & Databases</span>
                  <span className="font-bold text-amber-400">Target Gap (40%)</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>20-Question Verified Evaluation Metric</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
