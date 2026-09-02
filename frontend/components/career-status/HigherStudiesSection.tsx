'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GraduationCap, MapPin, Calendar, Save, Edit3, X } from 'lucide-react';

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
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Higher Studies Information
          </CardTitle>
          <CardDescription className="text-xs">
            Log enrolled institution, degree programme, and academic field of study.
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
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. IIT Hyderabad / IISc"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Programme *</label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  placeholder="e.g. M.Tech / MS / MBA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Higher Studies Info
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {!higherStudiesDetails?.institutionName ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold">Provide higher studies information</p>
                <p className="text-[11px]">Click "Edit Details" to record institution, degree programme, and specialization.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-1">
                  <span className="text-blue-700 dark:text-blue-400 font-bold text-[11px] block">Institution</span>
                  <span className="text-base font-extrabold text-blue-900 dark:text-blue-200">
                    {higherStudiesDetails.institutionName}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Programme</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {higherStudiesDetails.programme}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Field of Study</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
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
