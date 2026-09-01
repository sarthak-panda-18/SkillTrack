import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 py-12 text-xs border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                SkillTrack <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Engineering skill assessment and career readiness platform for computer science, IT, electronics, and engineering students.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">20-Q Assessments</a></li>
              <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Skill Gap Analysis</a></li>
              <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Learning Pathways</a></li>
              <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Readiness Score</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider text-[10px]">Navigation</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">Get Started</Link></li>
              <li><a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</a></li>
              <li><a href="#why-skilltrack" className="hover:text-indigo-600 dark:hover:text-indigo-400">Why SkillTrack</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider text-[10px]">Platform</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li><span className="hover:text-indigo-600 cursor-pointer">Student Workspace</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">Admin Access</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">System Status</span></li>
              <li><span className="hover:text-indigo-600 cursor-pointer">Documentation</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SkillTrack AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-medium">Engineering Career Readiness Platform</p>
        </div>
      </div>
    </footer>
  );
}
