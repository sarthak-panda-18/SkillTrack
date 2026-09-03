import { Brain, SearchCheck, BookOpen, LineChart, Award, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function Features() {
  const features = [
    {
      icon: Brain,
      title: '20-Question Skill Assessments',
      description: 'Timed 20-question multiple choice evaluations covering syntax, architecture, and core CS concepts.',
    },
    {
      icon: SearchCheck,
      title: 'Industry Skill Gap Detection',
      description: 'Compare your evaluated technical skill proficiencies against target corporate hiring requirements.',
    },
    {
      icon: BookOpen,
      title: 'Personalized Learning Pathways',
      description: 'Curated study modules structured around your specific skill gaps to maximize placement efficiency.',
    },
    {
      icon: LineChart,
      title: 'Progress & Competency Analytics',
      description: 'Monitor your growth metrics with dynamic profile completion indicators and competency trends.',
    },
    {
      icon: Award,
      title: 'Career Goal Alignment',
      description: 'Define your target engineering position and track your progress toward job benchmarks.',
    },
    {
      icon: Zap,
      title: 'Adaptive Learning Engine',
      description: 'Intelligent recommendation system updating study pathways after each assessment attempt.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#000000] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs font-mono font-bold uppercase tracking-widest bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 mb-3">
            PLATFORM FEATURES
          </Badge>
          <h2 className="font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
            EVERYTHING YOU NEED FOR <span className="text-[#FFD400]">PLACEMENT READINESS.</span>
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Built for computer science, IT, electronics, and engineering students preparing for technical roles.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="relative overflow-hidden bg-[#0A0A0A] border-white/10 hover:border-[#FFD400]/40 transition-all group">
                <CardHeader>
                  <div className="h-10 w-10 rounded-sm bg-[#171717] flex items-center justify-center text-[#FFD400] mb-3 border border-white/10 group-hover:bg-[#FFD400] group-hover:text-black transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold uppercase text-white tracking-wide">
                    {feat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {feat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

