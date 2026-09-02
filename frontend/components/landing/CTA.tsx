import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-[#0A0A0A] text-white border-b border-white/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
        <h2 className="font-condensed font-black text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
          KNOW WHERE YOU STAND.<br /><span className="text-[#FFD400]">BUILD YOUR FUTURE NEXT.</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Evaluate your technical proficiency through 20-question assessments and build a placement-ready engineering portfolio.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-sm uppercase tracking-wider gap-2 px-8">
              GET STARTED
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

