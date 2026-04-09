import { motion, AnimatePresence } from 'motion/react';
import { Postcard } from '../types';
import { Search, Calendar as CalendarIcon, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfDay
} from 'date-fns';
import { cn } from '../lib/utils';

interface JournalViewProps {
  postcards: Postcard[];
  onSelect: (postcard: Postcard) => void;
}

export function JournalView({ postcards, onSelect }: JournalViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Derive all unique genres from postcards
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    postcards.forEach(p => {
      if (p.quote.genre) {
        genres.add(p.quote.genre);
      }
    });
    return Array.from(genres).sort();
  }, [postcards]);

  // Derive dates that have records
  // For this demo, we assume postcards have a 'timestamp' or we use the current date if missing.
  // Ideally, Postcard should have a full Date object.
  const availableDates = useMemo(() => {
    // We'll use the current date for all postcards in this demo since App.tsx doesn't store full dates yet.
    return [startOfDay(new Date())];
  }, [postcards]);

  const filteredPostcards = postcards.filter(p => {
    const matchesSearch = p.quote.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quote.quote_zh.includes(searchQuery) ||
      p.capturedAt.includes(searchQuery);
    
    const matchesDate = !selectedDate || isSameDay(new Date(), selectedDate); // Placeholder logic
    
    const matchesGenre = !selectedGenre || p.quote.genre === selectedGenre;

    return matchesSearch && matchesDate && matchesGenre;
  });

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="max-w-6xl w-full mx-auto p-6 space-y-8 pb-32">
      <header className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">書旅日誌</h1>
          <p className="text-stone-500">重溫你曾駐足的文學瞬間</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="搜尋書名、作者、內容或時間..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
            />
          </div>
          <div className="flex gap-2 relative">
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border rounded-xl transition-all",
                selectedDate || showCalendar ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              )}
            >
              <CalendarIcon size={18} />
              <span>{selectedDate ? format(selectedDate, 'yyyy/MM/dd') : '日期'}</span>
              {selectedDate && (
                <X 
                  size={14} 
                  className="ml-1 hover:text-red-400" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(null);
                  }} 
                />
              )}
            </button>
            
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 p-4 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 w-72"
                >
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-stone-100 rounded-full">
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold font-display">{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-stone-100 rounded-full">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                      <div key={`pad-${i}`} />
                    ))}
                    
                    {calendarDays.map(day => {
                      const hasRecord = availableDates.some(d => isSameDay(d, day));
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          disabled={!hasRecord}
                          onClick={() => {
                            setSelectedDate(day);
                            setShowCalendar(false);
                          }}
                          className={cn(
                            "aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                            isSelected ? "bg-stone-900 text-white" : 
                            hasRecord ? "text-stone-900 hover:bg-stone-100 font-medium" : "text-stone-200 cursor-not-allowed"
                          )}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <button 
                onClick={() => setShowGenreFilter(!showGenreFilter)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border rounded-xl transition-all",
                  selectedGenre || showGenreFilter ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                )}
              >
                <BookOpen size={18} />
                <span>{selectedGenre || '類型'}</span>
                {selectedGenre && (
                  <X 
                    size={14} 
                    className="ml-1 hover:text-red-400" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGenre(null);
                    }} 
                  />
                )}
              </button>

              <AnimatePresence>
                {showGenreFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 p-2 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 w-48 overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {availableGenres.length === 0 ? (
                        <div className="p-4 text-center text-sm text-stone-400">尚無類型資料</div>
                      ) : (
                        availableGenres.map(genre => (
                          <button
                            key={genre}
                            onClick={() => {
                              setSelectedGenre(genre);
                              setShowGenreFilter(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-lg transition-colors",
                              selectedGenre === genre ? "bg-stone-100 text-stone-900 font-medium" : "text-stone-600 hover:bg-stone-50"
                            )}
                          >
                            {genre}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {filteredPostcards.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
            <Search size={32} />
          </div>
          <p className="text-stone-400">尚無收藏的明信片，開始你的第一趟旅程吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPostcards.map((postcard, index) => (
            <motion.button
              key={postcard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(postcard)}
              className="group relative aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all text-left border border-stone-100"
            >
              <img
                src={postcard.imageUrl}
                alt={postcard.quote.source}
                className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                <p className="text-xs font-display opacity-60 uppercase tracking-widest">
                  {postcard.capturedAt}
                </p>
                <p className="text-lg font-serif-tc line-clamp-2 leading-relaxed">
                  {postcard.quote.quote_zh}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
