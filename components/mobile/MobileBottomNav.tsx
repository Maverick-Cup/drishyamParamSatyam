'use client';

import React from 'react';
import {
  ChatCircleText,
  Graph,
  UsersThree,
  SquaresFour,
  BookmarkSimple,
} from '@phosphor-icons/react';

export type MobileTab = 'presence' | 'memories' | 'mindmap' | 'circle' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  pendingInvitesCount?: number;
  memoryCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
  pendingInvitesCount = 0,
  memoryCount = 0,
}: MobileBottomNavProps) {
  const navItems: Array<{
    id: MobileTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'presence',
      label: 'Presence',
      icon: <ChatCircleText className="text-xl" />,
    },
    {
      id: 'memories',
      label: 'Memories',
      icon: <BookmarkSimple className="text-xl" />,
      badge: memoryCount > 0 ? memoryCount : undefined,
    },
    {
      id: 'mindmap',
      label: 'Mind Map',
      icon: <Graph className="text-xl" />,
    },
    {
      id: 'circle',
      label: 'Circle',
      icon: <UsersThree className="text-xl" />,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined,
    },
    {
      id: 'more',
      label: 'More',
      icon: <SquaresFour className="text-xl" />,
    },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/95 border-t border-white/10 backdrop-blur-2xl pb-safe flex items-stretch justify-around px-1 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${item.label} tab`}
            className={`flex-1 flex flex-col items-center justify-center pt-2.5 pb-2 transition-colors relative min-h-[52px] touch-target-48 ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}

            <div className="relative flex items-center justify-center">
              {item.icon}
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-cyan-500 text-[#080c14] font-mono text-[9px] font-bold flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] mt-1 tracking-tight leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
