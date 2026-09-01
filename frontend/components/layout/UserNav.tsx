'use client';

import * as React from 'react';
import Link from 'next/link';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'ST';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="flex items-center gap-2.5 outline-none group rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600">
            {user.name}
          </span>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="z-50 min-w-[200px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg text-xs space-y-1 text-zinc-900 dark:text-zinc-100"
        >
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
            <p className="text-zinc-500 text-xs truncate">{user.email}</p>
          </div>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
            >
              <UserIcon className="h-4 w-4 text-zinc-500" />
              <span>Student Profile</span>
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
            >
              <Settings className="h-4 w-4 text-zinc-500" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuPrimitive.Item>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
            <DropdownMenuPrimitive.Item
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 outline-none"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuPrimitive.Item>
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
