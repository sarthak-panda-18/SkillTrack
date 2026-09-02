'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Building, Save, Edit3, X } from 'lucide-react';

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
    <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
      <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-[#FFD400]" />
            SELF-EMPLOYMENT & BUSINESS INFORMATION
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            Record startup details, freelancing ventures, or independent agency information.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-mono font-bold uppercase gap-1.5 border-white/20 text-white hover:border-[#FFD400]"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Dev Studio"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Business Type</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Software Agency"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Business Status</label>
                <select
                  value={businessStatus}
                  onChange={(e) => setBusinessStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                >
                  <option value="Startup">Startup</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Established Business">Established Business</option>
                </select>
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Current Annual Income (₹)</label>
                <input
                  type="number"
                  value={currentIncome}
                  onChange={(e) => setCurrentIncome(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 500000"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Number of Employees</label>
                <input
                  type="number"
                  value={numberOfEmployees}
                  onChange={(e) => setNumberOfEmployees(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology / IT Services"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Skills Used (comma-separated)</label>
              <input
                type="text"
                value={skillsUsedStr}
                onChange={(e) => setSkillsUsedStr(e.target.value)}
                placeholder="e.g. React, Node.js, Cloud Services"
                className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
              />
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5">
              <Save className="h-4 w-4" /> Save Self-Employment Details
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            {!selfEmploymentDetails?.businessName ? (
              <div className="p-4 text-center text-zinc-400 bg-[#111111] rounded-sm border border-dashed border-white/10 space-y-2">
                <p className="font-condensed font-bold text-white text-base uppercase">Provide business details</p>
                <p className="text-xs">Click "Edit Details" to record your business name, status, and income.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 space-y-1">
                  <span className="text-[#FFD400] font-mono font-bold text-[11px] block uppercase">Business Name</span>
                  <span className="font-condensed font-black text-xl text-white uppercase">
                    {selfEmploymentDetails.businessName}
                  </span>
                </div>

                <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                  <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Business Status</span>
                  <Badge variant="default" className="font-mono font-bold text-[10px] bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40 uppercase">
                    {selfEmploymentDetails.businessStatus || 'Startup'}
                  </Badge>
                </div>

                <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                  <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Annual Income</span>
                  <span className="font-condensed font-black text-xl text-[#FFD400]">
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

