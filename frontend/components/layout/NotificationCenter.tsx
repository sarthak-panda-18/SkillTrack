'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import useRouter from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Trash2,
  Award,
  Target,
  BookOpen,
  Shield,
  Sparkles,
  Layers,
  Mail,
  X,
} from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { AppNotification, NotificationType } from '@/types/notification';
import { Button } from '@/components/ui/Button';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unread Count Query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 15 * 1000,
  });

  // Notifications List Query (enabled when open)
  const { data: listData, isLoading } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: () => notificationService.getUserNotifications(1, 20),
    enabled: isOpen,
    staleTime: 15 * 1000,
  });

  // Mark Read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });

  // Mark All Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ASSESSMENT_COMPLETED':
        return <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'GOAL_COMPLETED':
        return <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'LEARNING_COMPLETED':
        return <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'PASSWORD_SECURITY':
        return <Shield className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'ADMIN_MESSAGE':
        return <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-500" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  const notifications = listData?.notifications || [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-850">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 scrollbar-none">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-zinc-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="h-7 w-7 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3.5 transition-colors flex items-start gap-3 relative group ${
                      !item.read
                        ? 'bg-purple-50/40 dark:bg-purple-950/20'
                        : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-850/40'
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span className="absolute top-4 left-2 h-1.5 w-1.5 rounded-full bg-purple-600" />
                    )}

                    {/* Icon Container */}
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5 ml-1">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      {item.link ? (
                        <Link
                          href={item.link}
                          onClick={() => {
                            if (!item.read) markReadMutation.mutate(item._id);
                            setIsOpen(false);
                          }}
                          className="block group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        >
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                            {item.message}
                          </p>
                        </Link>
                      ) : (
                        <div
                          onClick={() => {
                            if (!item.read) markReadMutation.mutate(item._id);
                          }}
                          className="cursor-pointer"
                        >
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                            {item.message}
                          </p>
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-zinc-400 mt-1 block">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item._id);
                      }}
                      title="Delete notification"
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-opacity p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
