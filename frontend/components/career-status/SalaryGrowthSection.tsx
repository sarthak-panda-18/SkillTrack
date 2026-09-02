'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, DollarSign, Edit3, Save, X, Info } from 'lucide-react';

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
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            4. Salary & Growth
          </CardTitle>
          <CardDescription className="text-xs">
            Compensation milestones and automated wage progression analytics.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Salary'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Starting Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={startingSalary}
                  onChange={(e) => setStartingSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Previous Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={previousSalary}
                  onChange={(e) => setPreviousSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Salary (₹ per annum) *</label>
                <input
                  type="number"
                  required
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 600000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>Salary growth amount and percentage are calculated automatically using your entered salaries.</span>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Salary Information
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block">Starting Salary</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{(startingSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-slate-500 block">₹{startingSalary.toLocaleString()} / year</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block">Previous Salary</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{(previousSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-slate-500 block">₹{previousSalary.toLocaleString()} / year</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px] block">Current Salary</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  ₹{(currentSalary / 100000).toFixed(2)} LPA
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">₹{currentSalary.toLocaleString()} / year</span>
              </div>
            </div>

            {/* Growth Metrics */}
            {!hasPreviousSalary ? (
              <div className="p-3 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" />
                <span>Salary growth will be calculated once previous salary information is available.</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 block">Automated Wage Progression</span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Calculated growth between Previous and Current Salary.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-indigo-500 font-bold block">Growth Amount</span>
                    <span className="font-black text-sm text-indigo-700 dark:text-indigo-300">
                      +₹{(growthAmount / 100000).toFixed(2)} LPA
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-500 font-bold block">Growth Rate</span>
                    <Badge variant="success" className="font-black text-xs">
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
