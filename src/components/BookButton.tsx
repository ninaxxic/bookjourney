import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BookButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function BookButton({ onClick, isLoading }: BookButtonProps) {
  return (
    <div className="flex flex-col items-center gap-12">
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="relative flex flex-col items-center gap-8 cursor-pointer group"
        onClick={onClick}
      >
        {/* Book Image Container */}
        <motion.div
          variants={{
            rest: { scale: 1, rotateY: 0 },
            hover: { 
              scale: 1.05, 
              rotateY: -15,
              transition: { duration: 0.4, ease: "easeOut" }
            },
            tap: { scale: 0.98 }
          }}
          className="relative perspective-2000"
        >
          {/* The Book Image */}
          <div className="relative w-64 h-80 transition-all duration-500 transform-style-3d">
            <img 
              src="/book.png" 
              alt="Book Journey" 
              className="w-full h-full object-contain drop-shadow-[20px_20px_40px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[30px_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-30 bg-white/20 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
                <div className="w-12 h-12 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Start Button Below */}
        <motion.button
          variants={{
            rest: { opacity: 0.8 },
            hover: { opacity: 1 },
            tap: { scale: 0.95 }
          }}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 rounded-full border border-stone-200 bg-white/50 backdrop-blur-sm",
            "text-stone-600 font-display text-sm uppercase tracking-[0.3em] font-medium",
            "shadow-sm hover:shadow-md transition-all duration-300",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "穿梭中..." : "點擊開始"}
        </motion.button>
      </motion.div>
    </div>
  );
}
