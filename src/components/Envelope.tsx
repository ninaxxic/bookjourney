import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface EnvelopeProps {
  children: ReactNode;
}

export function Envelope({ children }: EnvelopeProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto pt-32 md:pt-40 perspective-2000">
      {/* Envelope Back/Body */}
      <div className="relative bg-[#f4f1ea] rounded-lg shadow-2xl pt-12 pb-12 px-4 md:px-8 border border-stone-200/60">
        {/* Paper Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        {/* Envelope Flap (Opened/Flipped Up - 3D Effect) */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-[#e8e4da] border-stone-300/30 shadow-inner origin-bottom z-0"
          style={{ 
            clipPath: 'polygon(0 100%, 100% 100%, 50% 0)', 
            transform: 'translateY(-100%) rotateX(-10deg)',
            filter: 'drop-shadow(0 -5px 10px rgba(0,0,0,0.05))'
          }}
        >
          {/* Inner Flap Shadow/Crease */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/5 blur-sm" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        </div>

        {/* Postcard Container (On Top Layer) */}
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30"
        >
          {children}
        </motion.div>

        {/* Envelope Decorative Folds (Visual depth, below postcard) */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg"
        >
          {/* Bottom Fold (The Pocket Back) */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#f0ede6]/60 border-t border-stone-200/20"
            style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}
          />
          {/* Side Folds */}
          <div 
            className="absolute inset-y-0 left-0 w-1/2 bg-[#e8e4da]/30"
            style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
          />
          <div 
            className="absolute inset-y-0 right-0 w-1/2 bg-[#e8e4da]/30"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
          />
          
          {/* Subtle Inner Shadow for the "Opening" */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-black/5 to-transparent" />
        </div>
      </div>
    </div>
  );
}
