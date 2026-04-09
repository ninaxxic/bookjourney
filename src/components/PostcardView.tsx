import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, MapPin, Save, Check, ArrowLeft, ChevronDown, BookOpen, X as CloseIcon } from 'lucide-react';
import { Postcard } from '../types';
import { cn, renderWithBreaks } from '../lib/utils';
import { useState, useRef } from 'react';
import { Envelope } from './Envelope';

interface PostcardViewProps {
  postcard: Postcard;
  onSave: (postcard: Postcard) => Promise<void>;
  isSaved: boolean;
  onBack: () => void;
}

export function PostcardView({ postcard, onSave, isSaved, onBack }: PostcardViewProps) {
  const [saving, setSaving] = useState(false);
  const [showBookInfo, setShowBookInfo] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (isSaved || saving) return;
    setSaving(true);
    try {
      await onSave(postcard);
    } finally {
      setSaving(false);
    }
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl w-full mx-auto p-4 md:p-8"
    >
      <div onClick={scrollToContent} className="cursor-pointer md:cursor-default">
        <Envelope>
          <div className="relative group aspect-[3/2] md:aspect-[16/9] bg-stone-100 rounded-sm overflow-hidden shadow-2xl border-[12px] border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Main Image */}
            <img
              src={postcard.imageUrl}
              alt="Literary Scene"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay for Readability - Hidden on mobile */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] hidden md:block" />

            {/* Postcard Content - Hidden on mobile */}
            <div className="absolute inset-0 p-8 md:p-12 hidden md:flex flex-col justify-center items-start text-left text-white">
              <div className="max-w-2xl space-y-8 w-full">
                {/* Quote Section */}
                <div className="space-y-6">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl font-serif-tc leading-relaxed tracking-wide font-medium"
                  >
                    {renderWithBreaks(postcard.quote.quote_zh)}
                  </motion.p>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-xl font-display tracking-[0.05em] opacity-90 italic"
                  >
                    {renderWithBreaks(postcard.quote.quote_en)}
                  </motion.p>
                </div>

                {/* Source Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="pt-6 border-t border-white/20 inline-block"
                >
                  <p className="text-xs md:text-base font-display tracking-widest uppercase opacity-90">
                    《{postcard.quote.source}》 — {postcard.quote.author}
                  </p>
                </motion.div>
              </div>

              {/* Timestamp Badge */}
              <div className="absolute bottom-6 right-6 text-right">
                <p className="text-[10px] md:text-xs font-display tracking-widest opacity-60 uppercase">
                  Captured at {postcard.capturedAt}
                </p>
                <p className="text-[10px] md:text-xs font-display tracking-widest opacity-60 uppercase">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Mobile Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 md:hidden text-white/80">
              <span className="text-[10px] uppercase tracking-widest font-display">View Quote</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </div>
          </div>
        </Envelope>
      </div>

      {/* Mobile Content Section - Only visible on mobile */}
      <div 
        ref={contentRef}
        className="md:hidden mt-12 space-y-10 px-4 py-8 bg-white/50 rounded-3xl border border-stone-200/50 backdrop-blur-sm"
      >
        <div className="space-y-6">
          <p className="text-2xl font-serif-tc leading-relaxed text-stone-800">
            {renderWithBreaks(postcard.quote.quote_zh)}
          </p>
          <p className="text-lg font-display italic text-stone-500 border-l-2 border-stone-200 pl-4">
            {renderWithBreaks(postcard.quote.quote_en)}
          </p>
        </div>

        <div className="pt-6 border-t border-stone-200">
          <p className="text-sm font-display tracking-widest uppercase text-stone-400 mb-1">
            Source
          </p>
          <p className="text-lg font-display text-stone-700">
            《{postcard.quote.source}》 — {postcard.quote.author}
          </p>
        </div>

        <div className="flex justify-between items-end pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-display tracking-widest uppercase text-stone-400">
              Captured at
            </p>
            <p className="text-xs font-mono text-stone-500">
              {postcard.capturedAt}
            </p>
          </div>
          <p className="text-xs font-display tracking-widest uppercase text-stone-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaved || saving}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-md",
            isSaved 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-stone-900 text-white hover:bg-stone-800 active:scale-95"
          )}
        >
          {isSaved ? <Check size={18} /> : saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          {isSaved ? "已收藏" : saving ? "收藏中..." : "收藏明信片"}
        </button>
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white text-stone-700 border border-stone-200 rounded-full font-medium hover:bg-stone-50 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} />
          返回旅程
        </button>

        <button 
          onClick={() => setShowBookInfo(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-stone-700 border border-stone-200 rounded-full font-medium hover:bg-stone-50 transition-all shadow-sm active:scale-95"
        >
          <BookOpen size={18} />
          書籍介紹
        </button>
      </div>

      {/* Book Info Modal */}
      <AnimatePresence>
        {showBookInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookInfo(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#fdfaf6] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setShowBookInfo(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-stone-500 hover:text-stone-900 transition-colors"
              >
                <CloseIcon size={20} />
              </button>

              {/* Book Cover */}
              <div className="w-full md:w-2/5 aspect-[3/4] bg-stone-200 relative overflow-hidden">
                {postcard.quote?.cover ? (
                  <img 
                    src={postcard.quote?.cover} 
                    alt={postcard.quote.source}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <BookOpen size={48} />
                  </div> )
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Book Details */}
              <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-display tracking-[0.2em] text-stone-400 uppercase">
                    {postcard.quote.genre || 'Literary Work'}
                  </p>
                  <h3 className="text-2xl font-serif-tc font-bold text-stone-900 leading-tight">
                    《{postcard.quote.source}》
                  </h3>
                  <p className="text-lg font-display text-stone-600">
                    {postcard.quote.author}
                  </p>
                </div>

                <div className="w-12 h-[1px] bg-stone-200" />

                <div className="space-y-4">
                  <p className="text-stone-600 leading-relaxed font-serif-tc text-sm md:text-base">
                    {postcard.quote?.description || '這本書籍的詳細介紹正在整理中，敬請期待。'}
                  </p>
                </div>

                <button 
                  onClick={() => setShowBookInfo(false)}
                  className="mt-4 w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  關閉介紹
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
