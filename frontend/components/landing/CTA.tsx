import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Know where you stand.<br />Know what to learn next.
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Evaluate your technical proficiency through 20-question assessments and build a placement-ready engineering portfolio.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md gap-2 px-8">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
