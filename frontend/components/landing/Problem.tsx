import { Brain, Target, BookOpen, LineChart } from 'lucide-react';

export function Problem() {
  const workflowSteps = [
    {
      step: 'ASSESS',
      icon: Brain,
      title: '20-Question Skill Assessments',
      description: 'Quantify your actual engineering proficiency through timed 20-question technical evaluations.',
    },
    {
      step: 'IDENTIFY',
      icon: Target,
      title: 'Industry Skill Gap Analysis',
      description: 'Compare your current technical skills directly against the requirements of your target engineering role.',
    },
    {
      step: 'IMPROVE',
      icon: BookOpen,
      title: 'Personalized Learning Pathways',
      description: 'Follow structured, step-by-step study modules tailored specifically to close your identified skill gaps.',
    },
    {
      step: 'TRACK',
      icon: LineChart,
      title: 'Placement Readiness Analytics',
      description: 'Measure progress with real-time competency trends, growth metrics, and topic-level mastery scores.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            ENGINEERING CAREER READINESS WORKFLOW
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Four steps to engineering career readiness
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            SkillTrack AI replaces generic advice with objective assessment data, helping you systematically build placement-ready skills.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
