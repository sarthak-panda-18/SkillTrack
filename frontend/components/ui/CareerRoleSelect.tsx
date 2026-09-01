'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Check, Target, ChevronDown, RefreshCw, Briefcase } from 'lucide-react';
import { careerRoleService } from '@/services/careerRole.service';
import { CareerRole } from '@/types/careerRole';
import { cn } from '@/lib/utils';

interface CareerRoleSelectProps {
  label?: string;
  value?: string;
  onChange: (roleName: string, roleObj?: CareerRole) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CareerRoleSelect({
  label,
  value = '',
  onChange,
  error,
  placeholder = 'Search and select target career role...',
  disabled = false,
  className,
}: CareerRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active career roles via React Query
  const {
    data: careerRoles = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['publicCareerRoles', searchQuery],
    queryFn: () => careerRoleService.getPublicCareerRoles(searchQuery),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  // Selected role object
  const selectedRole = useMemo(
    () => careerRoles.find((r) => r.name === value || r._id === value),
    [careerRoles, value]
  );

  // Group roles by category
  const groupedRoles = useMemo(() => {
    const groups: { [cat: string]: CareerRole[] } = {};
    for (const r of careerRoles) {
      const cat = r.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    }
    return groups;
  }, [careerRoles]);

  // Flattened list for index lookup
  const flattenedRoles = useMemo(() => {
    const list: CareerRole[] = [];
    Object.values(groupedRoles).forEach((group) => list.push(...group));
    return list;
  }, [groupedRoles]);

  const handleSelect = (role: CareerRole) => {
    onChange(role.name, role);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < flattenedRoles.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flattenedRoles.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedRoles.length > 0 && flattenedRoles[highlightedIndex]) {
        handleSelect(flattenedRoles[highlightedIndex]);
      }
    }
  };

  return (
    <div className={cn('space-y-1.5 relative select-none', className)} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      {/* Main Select Button Display */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => searchInputRef.current?.focus(), 80);
          }
        }}
        className={cn(
          'flex items-center justify-between w-full h-11 px-3.5 rounded-lg border text-sm transition-all cursor-pointer bg-white dark:bg-zinc-900 focus:outline-none',
          error
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400'
            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
          disabled && 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span
            className={cn(
              'truncate font-medium',
              value ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Clear career selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-zinc-400 transition-transform duration-200',
              isOpen && 'transform rotate-180 text-purple-600 dark:text-purple-400'
            )}
          />
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Popover List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-2.5 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="relative flex items-center">
                <Search className="h-4 w-4 text-zinc-400 absolute left-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Search career role (e.g. SDE, Data Scientist)..."
                  className="w-full h-9 pl-9 pr-8 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-zinc-900 dark:text-zinc-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Category Options */}
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-3 text-xs scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-zinc-500 font-medium">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  <span>Loading career roles...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-6 space-y-2 text-rose-500 text-xs">
                  <p>Unable to load career roles.</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="px-3 py-1 rounded-md border border-rose-200 text-rose-600 font-semibold hover:bg-rose-50"
                  >
                    Retry
                  </button>
                </div>
              ) : Object.keys(groupedRoles).length > 0 ? (
                Object.entries(groupedRoles).map(([cat, items]) => (
                  <div key={cat} className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded bg-purple-50/50 dark:bg-purple-950/40 flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3 text-purple-500" />
                      <span>{cat}</span>
                    </div>

                    <div className="space-y-0.5 pt-0.5">
                      {items.map((role) => {
                        const isSelected = value === role.name || value === role._id;
                        const flatIdx = flattenedRoles.findIndex((r) => r._id === role._id);
                        const isHighlighted = highlightedIndex === flatIdx;

                        return (
                          <button
                            key={role._id}
                            type="button"
                            onClick={() => handleSelect(role)}
                            onMouseEnter={() => setHighlightedIndex(flatIdx)}
                            className={cn(
                              'w-full text-left px-3 py-2.5 rounded-lg flex flex-col gap-0.5 transition-colors',
                              isSelected
                                ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/50 dark:border-purple-800/50 shadow-xs'
                                : isHighlighted
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate font-bold">{role.name}</span>
                              {isSelected && <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-normal line-clamp-1">
                              {role.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-1 text-zinc-400 text-xs">
                  <p className="font-semibold text-zinc-600 dark:text-zinc-300">No career roles found.</p>
                  <p className="text-[11px]">Try another search term.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
