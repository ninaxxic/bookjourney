import { Book, History } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: 'home' | 'journal';
  onTabChange: (tab: 'home' | 'journal') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-stone-200 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-8">
      <button
        onClick={() => onTabChange('home')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'home' ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
        )}
      >
        <Book size={24} />
        <span className="text-[10px] font-medium uppercase tracking-widest">Travel</span>
      </button>
      <button
        onClick={() => onTabChange('journal')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'journal' ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
        )}
      >
        <History size={24} />
        <span className="text-[10px] font-medium uppercase tracking-widest">Journal</span>
      </button>
    </nav>
  );
}
