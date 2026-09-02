'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return {
    isDark,
    textColor: isDark ? '#FFFFFF' : '#080808',
    secondaryTextColor: isDark ? '#A3A3A3' : '#4A4A4A',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
    tooltipBg: isDark ? '#0A0A0A' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    tooltipText: isDark ? '#FFFFFF' : '#080808',
    primaryColor: '#FFD400',
    primaryHover: isDark ? '#FFE033' : '#E6BF00',
    accentColor: '#FFD400',
  };
}
