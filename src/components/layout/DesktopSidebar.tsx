import React from 'react';
import { Home, Image as ImageIcon, FolderHeart, Star, Heart, Calendar, Settings, Play, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export type NavTab = 'home' | 'library' | 'collections' | 'favorites' | 'liked' | 'calendar' | 'settings' | 'player';

interface DesktopSidebarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  isSessionActive?: boolean;
  onLockClick?: () => void;
  isAppLocked?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onNavigate,
  isSessionActive,
  onLockClick,
  isAppLocked,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: 'Galeri', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'collections', label: 'Koleksi', icon: <FolderHeart className="w-5 h-5" /> },
    { id: 'favorites', label: 'Favorit', icon: <Star className="w-5 h-5 text-fav" /> },
    { id: 'liked', label: 'Disukai', icon: <Heart className="w-5 h-5 text-heart" /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface/90 border-r border-subtle h-screen sticky top-0 shrink-0 select-none backdrop-blur-md">
      {/* App branding */}
      <div className="p-5 flex items-center justify-between border-b border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-player shadow-md font-bold text-base">
            ✦
          </div>
          <div>
            <h1 className="text-sm font-semibold text-app-primary tracking-wide">PAPAN PRIBADI</h1>
            <p className="text-[10px] text-app-muted uppercase tracking-wider">Ruang Pribadi Lokal</p>
          </div>
        </div>
        <button
          onClick={onLockClick}
          className={clsx(
            'p-1.5 rounded-lg border transition-colors',
            isAppLocked
              ? 'border-accent/50 text-accent bg-accent/10'
              : 'border-subtle text-app-muted hover:text-app-primary hover:bg-white/5'
          )}
          title="Kunci aplikasi"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Player Quick-Action if active */}
      {isSessionActive && (
        <div className="p-3">
          <button
            onClick={() => onNavigate('player')}
            className={clsx(
              'w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all duration-140 font-medium text-xs',
              currentTab === 'player'
                ? 'bg-accent text-player shadow-md font-semibold'
                : 'bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25'
            )}
          >
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Sesi aktif
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-140',
                isActive
                  ? 'bg-elevated text-app-primary border border-white/10 shadow-sm font-semibold'
                  : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
              )}
            >
              <span className={clsx(isActive ? 'text-accent' : 'text-app-muted')}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer subtle privacy indicator */}
      <div className="p-4 border-t border-subtle text-[11px] text-app-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Luring & pribadi
        </span>
        <span className="text-[10px] text-app-muted/80">v2.1</span>
      </div>
    </aside>
  );
};
