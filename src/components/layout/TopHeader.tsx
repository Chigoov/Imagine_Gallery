import React from 'react';
import { Lock, Settings, FolderHeart } from 'lucide-react';
import { NavTab } from './DesktopSidebar';

interface TopHeaderProps {
  title?: string;
  onNavigate: (tab: NavTab) => void;
  onLockClick: () => void;
  isAppLocked?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  onNavigate,
  onLockClick,
  isAppLocked,
}) => {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-md border-b border-subtle sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2">
        <img
          src="/favicon.png"
          alt="Imagine Gallery"
          className="w-7 h-7 rounded-lg object-contain shadow"
        />
        <span className="text-sm font-semibold tracking-wide text-app-primary">
          {title || 'IMAGINE GALLERY'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate('collections')}
          className="p-2 rounded-lg text-app-muted hover:text-app-primary hover:bg-white/5 transition-colors"
          title="Koleksi"
        >
          <FolderHeart className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 rounded-lg text-app-muted hover:text-app-primary hover:bg-white/5 transition-colors"
          title="Pengaturan"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={onLockClick}
          className={`p-2 rounded-lg transition-colors ${
            isAppLocked
              ? 'text-accent bg-accent/15 border border-accent/40'
              : 'text-app-muted hover:text-app-primary hover:bg-white/5'
          }`}
          title="Kunci aplikasi"
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
