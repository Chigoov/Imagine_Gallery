import React from 'react';
import { Home, Play, Image as ImageIcon, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { NavTab } from './DesktopSidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  isSessionActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  isSessionActive,
}) => {
  const items: { id: NavTab; label: string; icon: React.ReactNode; isCenter?: boolean }[] = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { id: 'player', label: 'Pemutar', icon: <Play className={clsx('w-5 h-5', isSessionActive && 'fill-current text-accent')} />, isCenter: true },
    { id: 'library', label: 'Galeri', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-subtle pb-safe px-2 py-1 flex items-center justify-around select-none">
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              'flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-140',
              isActive ? 'text-accent font-semibold' : 'text-app-muted hover:text-app-secondary'
            )}
          >
            <div className="relative">
              {item.icon}
              {item.isCenter && isSessionActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
