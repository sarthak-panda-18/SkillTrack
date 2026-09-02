'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Building, DollarSign, Users, Calendar, Save, Edit3, X } from 'lucide-react';

interface SelfEmploymentSectionProps {
  selfEmploymentDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function SelfEmploymentSection({
  selfEmploymentDetails,
  onUpdate,
  isUpdating,
}: SelfEmploymentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState(selfEmploymentDetails?.businessName || '');
  const [businessType, setBusinessType] = useState(selfEmploymentDetails?.businessType || 'Freelancing / Agency');
  const [businessStatus, setBusinessStatus] = useState(selfEmploymentDetails?.businessStatus || 'Startup');
  const [currentIncome, setCurrentIncome] = useState(selfEmploymentDetails?.currentIncome || 500000);
  const [numberOfEmployees, setNumberOfEmployees] = useState(selfEmploymentDetails?.numberOfEmployees || 1);
  const [industry, setIndustry] = useState(selfEmploymentDetails?.industry || 'Software & IT Services');
  const [skillsUsedStr, setSkillsUsedStr] = useState(selfEmploymentDetails?.skillsUsed?.join(', ') || 'Full-Stack Web Development, REST APIs');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      businessName,
      businessType,
      businessStatus,
      currentIncome,
      numberOfEmployees,
      industry,
      skillsUsed: skillsUsedStr.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Self-Employment & Business Information
          </CardTitle>
          <CardDescription className="text-xs">
            Record startup details, freelancing ventures, or independent agency information.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Dev Studio"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Business Type</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Software Agency"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Business Status</label>
                <select
                  value={businessStatus}
                  onChange={(e) => setBusinessStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  <option value="Startup">Startup</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Established Business">Established Business</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Annual Income (₹)</label>
                <input
                  type="number"
                  value={currentIncome}
                  onChange={(e) => setCurrentIncome(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 500000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Number of Employees</label>
                <input
                  type="number"
                  value={numberOfEmployees}
                  onChange={(e) => setNumberOfEmployees(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology / IT Services"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Skills Used (comma-separated)</label>
              <input
                type="text"
                value={skillsUsedStr}
                onChange={(e) => setSkillsUsedStr(e.target.value)}
                placeholder="e.g. React, Node.js, Cloud Services"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
              />
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Self-Employment Details
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {!selfEmploymentDetails?.businessName ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold">Provide business details</p>
                <p className="text-[11px]">Click "Edit Details" to record your business name, status, and income.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1">
                  <span className="text-purple-700 dark:text-purple-400 font-bold text-[11px] block">Business Name</span>
                  <span className="text-base font-extrabold text-purple-900 dark:text-purple-200">
                    {selfEmploymentDetails.businessName}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Business Status</span>
                  <Badge variant="purple" className="font-black text-[10px]">
                    {selfEmploymentDetails.businessStatus || 'Startup'}
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Annual Income</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{((selfEmploymentDetails.currentIncome || 500000) / 100000).toFixed(1)} LPA
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
