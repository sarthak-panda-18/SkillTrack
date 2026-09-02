'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  Mail,
  X,
} from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { NotificationType } from '@/types/notification';

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
        return <Award className="h-4 w-4 text-[#FFD400]" />;
      case 'GOAL_COMPLETED':
        return <Target className="h-4 w-4 text-[#FFD400]" />;
      case 'LEARNING_COMPLETED':
        return <BookOpen className="h-4 w-4 text-[#FFD400]" />;
      case 'PASSWORD_SECURITY':
        return <Shield className="h-4 w-4 text-rose-400" />;
      case 'ADMIN_MESSAGE':
        return <Mail className="h-4 w-4 text-[#FFD400]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#FFD400]" />;
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
        className="relative p-2 rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-[#FFD400] transition-colors focus:outline-none cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD400] text-[9px] font-black text-black shadow-xs animate-pulse font-mono">
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
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-sm bg-card border border-border shadow-2xl z-50 overflow-hidden text-card-foreground"
          >
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-border flex items-center justify-between bg-surface-secondary">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-black text-xs text-foreground uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-[#FFD400]/20 border border-[#FFD400]/40 text-yellow-900 dark:text-[#FFD400] font-mono font-bold text-[10px] uppercase">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="text-[11px] font-bold text-[#FFD400] dark:text-[#FFD400] text-yellow-800 hover:underline flex items-center gap-1 font-mono uppercase cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border scrollbar-thin">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground font-mono">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="h-7 w-7 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No notifications yet</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3.5 transition-colors flex items-start gap-3 relative group ${
                      !item.read
                        ? 'bg-[#FFD400]/10 border-l-4 border-[#FFD400]'
                        : 'hover:bg-surface-hover'
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span className="absolute top-4 left-1.5 h-2 w-2 rounded-full bg-[#FFD400]" />
                    )}

                    {/* Icon Container */}
                    <div className="p-2 rounded-sm bg-surface-secondary shrink-0 mt-0.5 border border-border">
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
                          className="block group-hover:text-[#FFD400]"
                        >
                          <h4 className="text-xs font-bold text-foreground truncate uppercase font-condensed">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
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
                          <h4 className="text-xs font-bold text-foreground truncate uppercase font-condensed">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {item.message}
                          </p>
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-muted-foreground/70 mt-1 block">
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
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-opacity p-1 cursor-pointer"
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

