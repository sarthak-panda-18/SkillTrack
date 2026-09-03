import { UserPlus, Target, Brain, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Create Your Profile',
      description: 'Sign up with your college, degree, branch, and current skill set.',
      icon: UserPlus,
    },
    {
      num: '02',
      title: 'Select Target Career Goal',
      description: 'Define your target engineering position and industry benchmarks.',
      icon: Target,
    },
    {
      num: '03',
      title: 'Assess Your Skills',
      description: 'Take timed 20-question skill evaluations to measure your proficiency.',
      icon: Brain,
    },
    {
      num: '04',
      title: 'Follow Your Pathway',
      description: 'Access tailored study modules designed to bridge your skill gaps.',
      icon: BookOpen,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#000000] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="default" className="text-xs font-mono font-bold uppercase tracking-widest bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 mb-3">
            4-STEP PROCESS
          </Badge>
          <h2 className="font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
            HOW SKILLTRACK AI <span className="text-[#FFD400]">WORKS.</span>
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            From profile registration to placement readiness in four clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-sm border border-white/10 bg-[#0A0A0A] hover:border-[#FFD400]/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-bold text-[#FFD400] bg-[#FFD400]/10 px-2.5 py-1 rounded-sm border border-[#FFD400]/30">
                    STEP {step.num}
                  </span>
                  <div className="p-2 rounded-sm bg-[#171717] text-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-black transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold uppercase text-white mb-2 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

