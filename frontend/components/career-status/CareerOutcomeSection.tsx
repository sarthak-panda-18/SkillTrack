'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, Building, MapPin, Calendar, Star, Edit3, Save, X } from 'lucide-react';

interface CareerOutcomeSectionProps {
  employmentDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function CareerOutcomeSection({
  employmentDetails,
  onUpdate,
  isUpdating,
}: CareerOutcomeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: employmentDetails?.companyName || '',
    jobRole: employmentDetails?.jobRole || '',
    industry: employmentDetails?.industry || 'Information Technology',
    employmentType: employmentDetails?.employmentType || 'FULL_TIME',
    joiningDate: employmentDetails?.joiningDate ? employmentDetails.joiningDate.substring(0, 10) : '',
    workLocation: employmentDetails?.workLocation || '',
    trainingRelevance: employmentDetails?.trainingRelevance || 'Highly Relevant',
    jobSatisfaction: employmentDetails?.jobSatisfaction || 4,
    skillsUsedStr: employmentDetails?.skillsUsed?.join(', ') || 'Java, REST APIs, SQL',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      skillsUsed: formData.skillsUsedStr.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            1. Career Outcome
          </CardTitle>
          <CardDescription className="text-xs">
            Verified current employment information, role, and organization details.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. ABC Technologies"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Role *</label>
                <input
                  type="text"
                  required
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Work Location</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Training Relevance</label>
                <select
                  value={formData.trainingRelevance}
                  onChange={(e) => setFormData({ ...formData, trainingRelevance: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  <option value="Highly Relevant">Highly Relevant</option>
                  <option value="Relevant">Relevant</option>
                  <option value="Partially Relevant">Partially Relevant</option>
                  <option value="Not Relevant">Not Relevant</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Satisfaction (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={formData.jobSatisfaction}
                  onChange={(e) => setFormData({ ...formData, jobSatisfaction: parseInt(e.target.value, 10) || 4 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Skills Used (comma-separated)</label>
              <input
                type="text"
                value={formData.skillsUsedStr}
                onChange={(e) => setFormData({ ...formData, skillsUsedStr: e.target.value })}
                placeholder="e.g. Java, Spring Boot, REST APIs, SQL"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
              />
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Employment Details
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {!employmentDetails?.companyName ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold">Complete your employment information</p>
                <p className="text-[11px]">Click "Edit Details" to record your company, job role, and location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Building className="h-3.5 w-3.5 text-indigo-600" /> Company
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {employmentDetails.companyName}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-600" /> Current Role
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {employmentDetails.jobRole}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-purple-600" /> Location
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {employmentDetails.workLocation || 'Hyderabad, India'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold text-[11px]">Employment Type</div>
                  <Badge variant="success" className="font-black text-[10px]">
                    {employmentDetails.employmentType?.replace(/_/g, ' ') || 'FULL TIME'}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-sky-600" /> Joining Date
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {employmentDetails.joiningDate ? new Date(employmentDetails.joiningDate).toLocaleDateString() : 'Not Set'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Star className="h-3.5 w-3.5 text-amber-500" /> Job Satisfaction
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {employmentDetails.jobSatisfaction || 4} / 5
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
