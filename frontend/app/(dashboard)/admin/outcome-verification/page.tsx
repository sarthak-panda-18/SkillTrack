'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Building2,
  GraduationCap,
  Rocket,
  Wrench,
  Laptop,
} from 'lucide-react';
import { adminOutcomeVerificationService } from '@/services/adminOutcomeVerification.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AdminOutcomeVerificationPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'outcome-verification', selectedStatus, selectedType, searchQuery, page],
    queryFn: () =>
      adminOutcomeVerificationService.getQueue({
        status: selectedStatus,
        outcomeType: selectedType,
        search: searchQuery,
        page,
      }),
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge variant="success" className="gap-1 font-mono uppercase text-[10px] font-black">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="purple" className="gap-1 font-mono uppercase text-[10px] font-black">
            <Clock className="h-3 w-3 text-purple-600" /> Under Review
          </Badge>
        );
      case 'CHANGES_REQUESTED':
        return (
          <Badge variant="warning" className="gap-1 font-mono uppercase text-[10px] font-black">
            <AlertTriangle className="h-3 w-3 text-amber-600" /> Changes Requested
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="rose" className="gap-1 font-mono uppercase text-[10px] font-black">
            <XCircle className="h-3 w-3 text-rose-600" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-mono uppercase text-[10px] font-black">
            <FileCheck className="h-3 w-3 text-blue-600" /> Submitted
          </Badge>
        );
    }
  };

  const getOutcomeIcon = (type: string) => {
    switch (type) {
      case 'EMPLOYED':
        return <Briefcase className="h-4 w-4 text-emerald-600" />;
      case 'SELF_EMPLOYED':
        return <Rocket className="h-4 w-4 text-purple-600" />;
      case 'HIGHER_STUDIES':
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'APPRENTICESHIP':
        return <Wrench className="h-4 w-4 text-amber-600" />;
      case 'INTERNSHIP':
        return <Laptop className="h-4 w-4 text-indigo-600" />;
      default:
        return <Search className="h-4 w-4 text-rose-600" />;
    }
  };

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Control Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Career Outcome Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review student placement records, verify evidence documents, and maintain audit records.
          </p>
        </div>
      </div>

      {/* Verification Queue Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Total Submissions</span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.total || 0}
          </div>
        </Card>
        <Card className="shadow-xs border border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/20 p-4">
          <span className="text-[10px] font-bold uppercase text-blue-600">Pending Review</span>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.pending || 0}
          </div>
        </Card>
        <Card className="shadow-xs border border-purple-200 dark:border-purple-900/50 bg-purple-50/20 dark:bg-purple-950/20 p-4">
          <span className="text-[10px] font-bold uppercase text-purple-600">Under Review</span>
          <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.underReview || 0}
          </div>
        </Card>
        <Card className="shadow-xs border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-4">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Verified</span>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.verified || 0}
          </div>
        </Card>
        <Card className="shadow-xs border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/20 p-4">
          <span className="text-[10px] font-bold uppercase text-amber-600">Changes Requested</span>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.changesRequested || 0}
          </div>
        </Card>
        <Card className="shadow-xs border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 p-4">
          <span className="text-[10px] font-bold uppercase text-rose-600">Rejected</span>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.stats.rejected || 0}
          </div>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name, email, company, or institution..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'CHANGES_REQUESTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                    selectedStatus === st
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-extrabold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-xs text-rose-500 font-bold">
              Failed to load outcome verification queue. Please check permissions or refresh.
            </div>
          ) : data?.outcomes.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">All caught up!</h3>
              <p className="text-xs text-zinc-500">No career outcomes match the current search or filter query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-500">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Outcome Path</th>
                    <th className="p-4">Entity / Organization</th>
                    <th className="p-4">Evidence</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {data?.outcomes.map((outcome) => {
                    const student = outcome.userId as any;
                    const orgName =
                      outcome.employment?.companyName ||
                      outcome.selfEmployment?.businessName ||
                      outcome.higherStudies?.institution ||
                      outcome.internship?.companyName ||
                      outcome.apprenticeship?.organization ||
                      'Self-Reported';

                    return (
                      <tr key={outcome._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="p-4">
                          <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{student?.name || 'Student'}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{student?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-extrabold text-zinc-900 dark:text-zinc-100">
                            {getOutcomeIcon(outcome.outcomeType)}
                            <span>{outcome.outcomeType.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-xs">{orgName}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px] font-mono gap-1">
                            <FileCheck className="h-3 w-3 text-indigo-600" /> {outcome.evidenceCount} Files
                          </Badge>
                        </td>
                        <td className="p-4">{getStatusBadge(outcome.verificationStatus)}</td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/outcome-verification/${outcome._id}`}>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1">
                              <Eye className="h-3.5 w-3.5" /> Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
