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
        <button className="flex items-center gap-2.5 outline-none group rounded-sm p-1 hover:bg-[#171717] transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-condensed font-bold text-xs uppercase tracking-wider text-white group-hover:text-[#FFD400]">
            {user.name}
          </span>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="z-50 min-w-[200px] rounded-sm border border-white/15 bg-[#0A0A0A] p-1.5 shadow-2xl text-xs space-y-1 text-white"
        >
          <div className="px-3 py-2 border-b border-white/10">
            <p className="font-condensed font-bold text-sm uppercase text-white truncate">{user.name}</p>
            <p className="text-zinc-400 text-xs font-mono truncate">{user.email}</p>
          </div>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer hover:bg-[#171717] hover:text-[#FFD400] outline-none font-bold uppercase text-[11px] font-condensed tracking-wider"
            >
              <UserIcon className="h-4 w-4 text-zinc-400" />
              <span>Student Profile</span>
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer hover:bg-[#171717] hover:text-[#FFD400] outline-none font-bold uppercase text-[11px] font-condensed tracking-wider"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuPrimitive.Item>

          <div className="border-t border-white/10 pt-1">
            <DropdownMenuPrimitive.Item
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer text-rose-400 hover:bg-rose-950/50 outline-none font-bold uppercase text-[11px] font-condensed tracking-wider"
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

