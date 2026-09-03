import { CheckCircle2, ShieldCheck, Target } from 'lucide-react';
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
    <section id="why-skilltrack" className="py-20 bg-[#000000] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="default" className="text-xs font-mono font-bold uppercase tracking-widest bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">
              WHY SKILLTRACK AI
            </Badge>
            <h2 className="font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
              A STRUCTURED ROADMAP TO <span className="text-[#FFD400]">ENGINEERING EXCELLENCE.</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              SkillTrack AI replaces guesswork with data-driven clarity. We help you systematically build skills, bridge gaps, and present your readiness for technical selection rounds.
            </p>

            <div className="pt-4 space-y-4">
              {differentiators.map((sol, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#FFD400] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-base uppercase tracking-wide">
                      {sol.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-sans">
                      {sol.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/15 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-sm bg-[#FFD400] flex items-center justify-center text-black font-bold">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white uppercase">Competency Scorecard Breakdown</h3>
                  <p className="text-zinc-400 text-xs font-mono">Standardized evaluation metrics</p>
                </div>
              </div>

              <div className="space-y-3 bg-[#111111] p-4 rounded-sm text-xs border border-white/10 font-mono">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-zinc-300">Data Structures & Algorithms</span>
                  <span className="font-bold text-[#FFD400]">Advanced (85%)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-zinc-300">Web Architecture & Node.js</span>
                  <span className="font-bold text-white">Intermediate (70%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">System Design & Databases</span>
                  <span className="font-bold text-amber-400">Target Gap (40%)</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <ShieldCheck className="h-4 w-4 text-[#FFD400]" />
                <span>20-Question Verified Evaluation Metric</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

