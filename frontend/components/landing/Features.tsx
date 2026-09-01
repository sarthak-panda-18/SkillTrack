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
    <section id="features" className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="default" className="text-[11px] font-bold uppercase tracking-wider mb-3">
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Everything you need for engineering placement readiness
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Built for computer science, IT, electronics, and engineering students preparing for technical roles.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
