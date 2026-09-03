import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#000000] py-14 text-xs border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-sm bg-[#FFD400] flex items-center justify-center text-black font-bold">
                <Zap className="h-4 w-4 fill-black text-black" />
              </div>
              <span className="font-bold text-lg uppercase tracking-wider text-white">
                SKILLTRACK <span className="text-[#FFD400]">AI</span>
              </span>
            </Link>
            <p className="text-zinc-400 max-w-sm leading-relaxed font-sans">
              Engineering skill assessment and career readiness platform for computer science, IT, electronics, and engineering students.
            </p>
          </div>

          <div>
            <h4 className="font-mono font-bold text-[#FFD400] mb-3 uppercase tracking-widest text-[10px]">Product</h4>
            <ul className="space-y-2 text-zinc-400 uppercase font-semibold tracking-wider">
              <li><a href="#features" className="hover:text-white transition-colors">20-Q Assessments</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Skill Gap Analysis</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Learning Pathways</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Readiness Score</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold text-[#FFD400] mb-3 uppercase tracking-widest text-[10px]">Navigation</h4>
            <ul className="space-y-2 text-zinc-400 uppercase font-semibold tracking-wider">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#why-skilltrack" className="hover:text-white transition-colors">Why SkillTrack</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold text-[#FFD400] mb-3 uppercase tracking-widest text-[10px]">Platform</h4>
            <ul className="space-y-2 text-zinc-400 uppercase font-semibold tracking-wider">
              <li><span className="hover:text-white cursor-pointer">Student Workspace</span></li>
              <li><span className="hover:text-white cursor-pointer">Admin Access</span></li>
              <li><span className="hover:text-white cursor-pointer">System Status</span></li>
              <li><span className="hover:text-white cursor-pointer">Documentation</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-zinc-500 font-mono text-[11px]">
          <p>© {new Date().getFullYear()} SKILLTRACK AI. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 sm:mt-0 font-bold uppercase tracking-wider text-[#FFD400]">ENGINEERING CAREER READINESS PLATFORM</p>
        </div>
      </div>
    </footer>
  );
}

