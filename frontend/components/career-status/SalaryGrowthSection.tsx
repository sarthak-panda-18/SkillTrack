'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Edit3, Save, X, Info } from 'lucide-react';

interface SalaryGrowthSectionProps {
  salaryDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function SalaryGrowthSection({
  salaryDetails,
  onUpdate,
  isUpdating,
}: SalaryGrowthSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [startingSalary, setStartingSalary] = useState<number>(salaryDetails?.startingSalary || 450000);
  const [previousSalary, setPreviousSalary] = useState<number>(salaryDetails?.previousSalary || 450000);
  const [currentSalary, setCurrentSalary] = useState<number>(salaryDetails?.currentSalary || 600000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      startingSalary,
      previousSalary,
      currentSalary,
    });
    setIsEditing(false);
  };

  const hasPreviousSalary = previousSalary > 0;
  const growthAmount = currentSalary - previousSalary;
  const growthPct = hasPreviousSalary ? Number(((growthAmount / previousSalary) * 100).toFixed(2)) : 0;

  return (
    <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
      <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FFD400]" />
            4. SALARY & GROWTH
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            Compensation milestones and automated wage progression analytics.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-mono font-bold uppercase gap-1.5 border-white/20 text-white hover:border-[#FFD400]"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Salary'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Starting Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={startingSalary}
                  onChange={(e) => setStartingSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Previous Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={previousSalary}
                  onChange={(e) => setPreviousSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Current Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 600000"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#111111] border border-white/10 text-zinc-400 flex items-center gap-2 font-mono text-xs">
              <Info className="h-4 w-4 text-[#FFD400] shrink-0" />
              <span>Salary growth amount and percentage are calculated automatically using your entered salaries.</span>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5">
              <Save className="h-4 w-4" /> Save Salary Information
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Starting Salary</span>
                <span className="text-xl font-condensed font-black text-white">
                  ₹{(startingSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block">₹{startingSalary.toLocaleString()} / year</span>
              </div>

              <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Previous Salary</span>
                <span className="text-xl font-condensed font-black text-white">
                  ₹{(previousSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block">₹{previousSalary.toLocaleString()} / year</span>
              </div>

              <div className="p-4 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 space-y-1">
                <span className="text-[#FFD400] font-mono font-bold text-[11px] block uppercase">Current Salary</span>
                <span className="text-2xl font-condensed font-black text-[#FFD400]">
                  ₹{(currentSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-[#FFD400] font-mono block">₹{currentSalary.toLocaleString()} / year</span>
              </div>
            </div>

            {/* Growth Metrics */}
            {!hasPreviousSalary ? (
              <div className="p-3 text-zinc-400 bg-[#111111] rounded-sm border border-white/10 flex items-center gap-2 font-mono">
                <Info className="h-4 w-4 text-zinc-400" />
                <span>Salary growth will be calculated once previous salary information is available.</span>
              </div>
            ) : (
              <div className="p-4 rounded-sm bg-[#111111] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-condensed font-bold text-base uppercase text-white block">Automated Wage Progression</span>
                  <p className="text-xs text-zinc-400">Calculated growth between Previous and Current Salary.</p>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase">Growth Amount</span>
                    <span className="font-condensed font-black text-lg text-[#FFD400]">
                      +₹{(growthAmount / 100000).toFixed(2)} LPA
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase">Growth Rate</span>
                    <Badge variant="default" className="font-mono font-bold text-xs bg-[#FFD400] text-black uppercase">
                      +{growthPct}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

