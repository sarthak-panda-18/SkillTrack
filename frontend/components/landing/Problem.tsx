import { Brain, Target, BookOpen, LineChart } from 'lucide-react';

export function Problem() {
  const workflowSteps = [
    {
      step: '01 // ASSESS',
      icon: Brain,
      title: '20-Question Skill Assessments',
      description: 'Quantify your actual engineering proficiency through timed 20-question technical evaluations.',
    },
    {
      step: '02 // IDENTIFY',
      icon: Target,
      title: 'Industry Skill Gap Analysis',
      description: 'Compare your current technical skills directly against the requirements of your target engineering role.',
    },
    {
      step: '03 // IMPROVE',
      icon: BookOpen,
      title: 'Personalized Learning Pathways',
      description: 'Follow structured, step-by-step study modules tailored specifically to close your identified skill gaps.',
    },
    {
      step: '04 // TRACK',
      icon: LineChart,
      title: 'Placement Readiness Analytics',
      description: 'Measure progress with real-time competency trends, growth metrics, and topic-level mastery scores.',
    },
  ];

  return (
    <section className="py-20 bg-[#000000] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#FFD400]">
            ENGINEERING CAREER READINESS WORKFLOW
          </span>
          <h2 className="mt-3 font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
            FOUR STEPS TO PLACEMENT READINESS
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            SkillTrack AI replaces generic advice with objective assessment data, helping you systematically build placement-ready skills.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-sm border border-white/10 bg-[#0A0A0A] transition-all hover:border-[#FFD400]/40 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#FFD400] px-2 py-0.5 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/30">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-sm bg-[#171717] text-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-black transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold uppercase text-white mb-2 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
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

