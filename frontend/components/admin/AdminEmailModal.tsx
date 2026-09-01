'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Mail, Send, AlertTriangle, UserCheck } from 'lucide-react';
import {
  adminCommunicationService,
  SendIndividualEmailResponse,
  SendBulkEmailResponse,
} from '@/services/adminCommunication.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

export interface AdminEmailRecipient {
  _id: string;
  name: string;
  email: string;
}

interface AdminEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: AdminEmailRecipient[];
  onSuccess?: () => void;
}

export function AdminEmailModal({ open, onOpenChange, recipients, onSuccess }: AdminEmailModalProps) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isBulk = recipients.length > 1;
  const singleRecipient = recipients.length === 1 ? recipients[0] : null;

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setShowConfirmation(false);
  };

  const sendMutation = useMutation<
    SendBulkEmailResponse | SendIndividualEmailResponse,
    AxiosError<{ message?: string }>,
    void
  >({
    mutationFn: async () => {
      if (recipients.length === 0) {
        throw new Error('No student recipient selected.');
      }

      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();

      if (isBulk) {
        const studentIds = recipients.map((r) => r._id);
        return adminCommunicationService.sendBulkEmail(studentIds, trimmedSubject, trimmedMessage);
      } else if (singleRecipient) {
        return adminCommunicationService.sendIndividualEmail(singleRecipient._id, trimmedSubject, trimmedMessage);
      }
      throw new Error('No valid recipient selected.');
    },
    onSuccess: () => {
      toast.success(
        isBulk
          ? `Bulk email successfully queued for ${recipients.length} students!`
          : `Email successfully queued for ${singleRecipient?.email || 'student'}!`
      );
      queryClient.invalidateQueries({ queryKey: ['adminCommunicationLogs'] });
      resetForm();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const serverMessage = err.response?.data?.message;
      const fallbackMessage = err.message || 'Failed to queue email delivery.';
      toast.error(serverMessage || fallbackMessage);
    },
  });

  const handleSendClick = () => {
    if (recipients.length === 0) {
      toast.error('No student recipient selected.');
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      toast.error('Please enter an email subject.');
      return;
    }
    if (!trimmedMessage) {
      toast.error('Please enter an email message.');
      return;
    }

    if (isBulk) {
      setShowConfirmation(true);
    } else {
      sendMutation.mutate();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) resetForm();
          onOpenChange(val);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Mail className="h-5 w-5" />
              {isBulk ? `Contact ${recipients.length} Selected Students` : `Contact Student`}
            </DialogTitle>
            <DialogDescription>
              {isBulk
                ? `Compose a bulk announcement or updates to send via official email.`
                : singleRecipient
                ? `Send a direct administrative message to ${singleRecipient.name}.`
                : `Send a direct administrative email to student.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Recipient Display Box */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Recipient</div>
              {isBulk ? (
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    {recipients.length} Selected Students
                  </div>
                  <div className="text-zinc-500 max-h-16 overflow-y-auto mt-1 flex flex-wrap gap-1">
                    {recipients.slice(0, 5).map((r) => (
                      <span
                        key={r._id}
                        className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300"
                      >
                        {r.email}
                      </span>
                    ))}
                    {recipients.length > 5 && (
                      <span className="text-[10px] text-zinc-400 pt-0.5">
                        + {recipients.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ) : singleRecipient ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{singleRecipient.name}</span>
                    <span className="text-zinc-500 ml-2">({singleRecipient.email})</span>
                  </div>
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                </div>
              ) : (
                <div className="text-zinc-400 text-xs">No student selected.</div>
              )}
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., Important Update regarding your Skill Evaluation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Message Body Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <Textarea
                placeholder="Write your email message here. Plain text and line breaks are preserved..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-[10px] text-zinc-400 text-right">{message.length} characters</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendClick}
              isLoading={sendMutation.isPending}
              disabled={sendMutation.isPending || recipients.length === 0}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-4 w-4" />
              {isBulk ? `Queue Bulk Email (${recipients.length})` : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Bulk Email Delivery
            </DialogTitle>
            <DialogDescription>
              You are about to queue and dispatch an official email to <strong>{recipients.length} students</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <div>
              <strong>Subject:</strong> {subject.trim()}
            </div>
            <div>
              <strong>Recipients:</strong> {recipients.length} verified student email addresses
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConfirmation(false);
                sendMutation.mutate();
              }}
              isLoading={sendMutation.isPending}
              disabled={sendMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Send className="h-4 w-4" />
              Confirm & Send to {recipients.length} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
