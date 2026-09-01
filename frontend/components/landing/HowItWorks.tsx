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
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="default" className="text-[11px] font-bold uppercase tracking-wider mb-3">
            4-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            How SkillTrack AI Works
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            From profile registration to placement readiness in four clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                    STEP {step.num}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
