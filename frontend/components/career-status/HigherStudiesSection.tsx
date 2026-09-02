'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Save, Edit3, X } from 'lucide-react';

interface HigherStudiesSectionProps {
  higherStudiesDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function HigherStudiesSection({
  higherStudiesDetails,
  onUpdate,
  isUpdating,
}: HigherStudiesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [institutionName, setInstitutionName] = useState(higherStudiesDetails?.institutionName || '');
  const [programme, setProgramme] = useState(higherStudiesDetails?.programme || 'M.Tech');
  const [fieldOfStudy, setFieldOfStudy] = useState(higherStudiesDetails?.fieldOfStudy || 'Computer Science & Engineering');
  const [location, setLocation] = useState(higherStudiesDetails?.location || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      institutionName,
      programme,
      fieldOfStudy,
      location,
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
      <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#FFD400]" />
            HIGHER STUDIES INFORMATION
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            Log enrolled institution, degree programme, and academic field of study.
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
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. IIT Hyderabad / IISc"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Programme *</label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  placeholder="e.g. M.Tech / MS / MBA"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3 py-2 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5">
              <Save className="h-4 w-4" /> Save Higher Studies Info
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            {!higherStudiesDetails?.institutionName ? (
              <div className="p-4 text-center text-zinc-400 bg-[#111111] rounded-sm border border-dashed border-white/10 space-y-2">
                <p className="font-condensed font-bold text-white text-base uppercase">Provide higher studies information</p>
                <p className="text-xs">Click "Edit Details" to record institution, degree programme, and specialization.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 space-y-1">
                  <span className="text-[#FFD400] font-mono font-bold text-[11px] block uppercase">Institution</span>
                  <span className="font-condensed font-black text-xl text-white uppercase">
                    {higherStudiesDetails.institutionName}
                  </span>
                </div>

                <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                  <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Programme</span>
                  <span className="font-condensed font-black text-xl text-white uppercase">
                    {higherStudiesDetails.programme}
                  </span>
                </div>

                <div className="p-4 rounded-sm bg-[#111111] border border-white/10 space-y-1">
                  <span className="text-zinc-400 font-mono font-bold text-[11px] block uppercase">Field of Study</span>
                  <span className="font-condensed font-black text-xl text-white uppercase">
                    {higherStudiesDetails.fieldOfStudy}
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

