/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookButton } from './components/BookButton';
import { PostcardView } from './components/PostcardView';
import { JournalView } from './components/JournalView';
import { LoginPage } from './components/LoginPage';
import { getTimeCSVQuote} from './services/quoteService';
import { getGeminiData} from './services/geminiService';
import { fetchImageByKeywords } from './services/unsplashService';
import { Postcard } from './types';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { LiteraryQuote } from './types';
import { pushToNotion } from './services/notionService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'journal'>('home');
  const [currentPostcard, setCurrentPostcard] = useState<Postcard | null>(null);
  const [savedPostcards, setSavedPostcards] = useState<Postcard[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load saved postcards and user from local storage
  useEffect(() => {
    const saved = localStorage.getItem('book-journey-postcards');
    if (saved) {
      try {
        setSavedPostcards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved postcards', e);
      }
    }

    const user = localStorage.getItem('book-journey-user');
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Save user to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('book-journey-user', currentUser);
    } else {
      localStorage.removeItem('book-journey-user');
    }
  }, [currentUser]);

  // Save postcards to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('book-journey-postcards', JSON.stringify(savedPostcards));
  }, [savedPostcards]);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      // MAIN QUOTE FETCHING
      const csvQuote = await getTimeCSVQuote(); // Get csv data
      const geminiData = await getGeminiData(csvQuote.quote_en, csvQuote.source, csvQuote.author); // Get Gemini data
      const cover = await fetchImageByKeywords([csvQuote.source]); // Get Unsplash data (cover)

      const quote:LiteraryQuote = {
        ...csvQuote,
        ...geminiData,
        cover,
      };

      const imageUrl = await fetchImageByKeywords(quote.keywords);
      
      const newPostcard: Postcard = {
        id: crypto.randomUUID(),
        imageUrl,
        quote,
        capturedAt: `${timeStr}:${now.getSeconds().toString().padStart(2, '0')}`,
        capturedAtISO: now.toISOString(),
        username: currentUser || 'Guest',
      };
      
      setCurrentPostcard(newPostcard);
      pushToNotion({
        userName: currentUser || "UNDEFINED", 
        time: timeStr,
        timezone: "Asia/Taipei",
        capturedAtISO: newPostcard.capturedAtISO,
        quote_en: quote.quote_en,
        quote_zh: quote.quote_zh,
        source: quote.source,
        author: quote.author,
        genre: quote.genre || "UNDEFINED",
        keywords: quote.keywords || [],
        image: imageUrl,
      });
    } catch (err) {
      console.error('Travel error:', err);
      setError('時空穿梭失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePostcard = async (postcard: Postcard) => {
    if (!savedPostcards.find(p => p.id === postcard.id)) {
      setSavedPostcards(prev => [postcard, ...prev]);
    }
  };

  const isCurrentPostcardSaved = !!currentPostcard && !!savedPostcards.find(p => p.id === currentPostcard.id);

  const userPostcards = savedPostcards.filter(p => p.username === currentUser);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex flex-col">
      {/* Header */}
      <header className="p-8 flex justify-between items-center relative z-30">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Book Journey Logo" className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
          <span className="font-bold tracking-tight text-stone-900 font-display hidden md:inline">Book Journey</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "text-[10px] uppercase tracking-[0.2em] transition-colors font-medium font-display",
              activeTab === 'home' ? "text-brand-blue" : "text-stone-400 hover:text-stone-600"
            )}
          >
            Travel
          </button>
          <button 
            onClick={() => setActiveTab('journal')}
            className={cn(
              "text-[10px] uppercase tracking-[0.2em] transition-colors font-medium font-display",
              activeTab === 'journal' ? "text-brand-blue" : "text-stone-400 hover:text-stone-600"
            )}
          >
            Journal
          </button>
          <button 
            onClick={() => {
              setCurrentUser(null);
              setCurrentPostcard(null);
              setActiveTab('home');
            }}
            className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-red-400 transition-colors font-medium font-display"
          >
            Logout: {currentUser}
          </button>
        </div>
        <button
          className="md:hidden text-stone-500 hover:text-stone-800 transition-colors"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={34} /> : <Menu size={30} />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden absolute top-[88px] left-0 w-full bg-[#f7f7f7] border-t border-stone-200/70 shadow-lg z-40 px-10 py-10"
          >
            <div className="flex flex-col text-[2.1rem] uppercase tracking-[0.18em] font-display">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setIsMobileMenuOpen(false);
                }}
                className={cn("text-left transition-colors", activeTab === 'home' ? "text-brand-blue" : "text-stone-400")}
              >
                Travel
              </button>
              <button
                onClick={() => {
                  setActiveTab('journal');
                  setIsMobileMenuOpen(false);
                }}
                className={cn("text-left mt-8 transition-colors", activeTab === 'journal' ? "text-brand-blue" : "text-stone-400")}
              >
                Journal
              </button>
            </div>
            <div className="h-px w-full bg-stone-200 my-10" />
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentPostcard(null);
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-[2.1rem] uppercase tracking-[0.18em] font-display text-stone-400 transition-colors hover:text-red-400"
            >
              Logout: {currentUser}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {!currentPostcard ? (
                <div className="relative w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center min-h-[80vh]">
                  {/* Main Content Grid */}
                  <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Side: Description */}
                    <div className="md:col-span-4 space-y-6 text-left">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                      >
                        <p className="text-brand-blue font-display text-xl md:text-2xl leading-tight italic">
                          在這一秒，<br/>與世界的某頁重逢
                        </p>
                        <div className="w-12 h-[1px] bg-brand-blue/30" />
                        <p className="text-stone-400 text-[1.05rem] max-w-[200px] leading-relaxed font-display italic">
                          Every second is a literary moment waiting to be discovered.
                        </p>
                      </motion.div>
                    </div>

                    {/* Center: The Book */}
                    <div className="md:col-span-4 flex justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <BookButton onClick={handleCheckIn} isLoading={isLoading} />
                      </motion.div>
                    </div>

                    {/* Right Side: Large Heading */}
                    <div className="md:col-span-4 text-right hidden md:block">
                      <motion.h2
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-6xl lg:text-[4.5rem] font-display text-brand-blue leading-[1.1] tracking-tighter"
                      >
                        Reunite with
                        a page of the world,<br/>
                        in this very second.
                      </motion.h2>
                    </div>
                  </div>

                  {/* Mobile Heading */}
                  <div className="md:hidden mt-12 mb-20 text-center px-4">
                    <h2 className="text-3xl font-display text-brand-blue leading-[1.1]">
                      Reunite with<br/>
                      a page of the world,<br/>
                      in this very second.
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <PostcardView 
                    postcard={currentPostcard} 
                    onSave={handleSavePostcard}
                    isSaved={isCurrentPostcardSaved}
                    onBack={() => setCurrentPostcard(null)}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="journal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <JournalView 
                postcards={userPostcards} 
                onSelect={(p) => {
                  setCurrentPostcard(p);
                  setActiveTab('home');
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-xl border border-red-100 shadow-lg flex items-center gap-3 z-50"
            >
              <span>{error}</span>
              <button onClick={() => setError(null)}><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        {/* Vintage Map Background */}
        <div 
          className="absolute inset-0 opacity-[0.04] grayscale contrast-125 scale-110"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Vignette/Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-stone-900/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-stone-900/5 blur-[120px]" />
      </div>
    </div>
  );
}
