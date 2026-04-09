import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-stone-200 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-stone-300 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-2xl aspect-[1.6/1] bg-white shadow-[20px_20px_60px_rgba(0,0,0,0.05)] border border-stone-200 p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-0"
      >
        {/* Postcard Texture Overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        {/* Left Side: Message Area */}
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif-tc text-stone-800 italic">時空書旅</h1>
              <p className="text-stone-400 font-display text-sm tracking-widest uppercase">Book Journey</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-stone-600 font-serif-tc text-lg leading-relaxed">
                在這一秒，<br />
                與世界的某頁重逢。
              </p>
              <div className="w-12 h-[1px] bg-stone-200" />
              <p className="text-stone-400 italic font-display text-xs leading-relaxed">
                "Every second is a literary moment <br /> waiting to be discovered."
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="w-24 h-24 border-2 border-stone-100 rounded-full flex items-center justify-center opacity-40">
              <div className="w-16 h-16 border border-stone-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Vertical Divider (Postcard Style) */}
        <div className="hidden md:block w-[1px] bg-stone-100 mx-8 relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rounded-full bg-stone-100" />
        </div>

        {/* Right Side: Address & Stamp Area */}
        <div className="flex-1 flex flex-col justify-between relative z-10">
          {/* Stamp Area */}
          <div className="flex justify-end">
            <div className="w-20 h-24 border-2 border-dashed border-stone-200 rounded-sm flex items-center justify-center p-1">
              <div className="w-full h-full bg-stone-50 flex items-center justify-center overflow-hidden grayscale opacity-80">
                <img src="/stamp.png" alt="Stamp" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-8 mt-8 md:mt-0">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1 ml-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="請輸入您的名稱..."
                  className="w-full bg-transparent border-b border-stone-200 py-2 px-1 text-stone-800 font-serif-tc focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-200"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className={cn(
                "w-full group flex items-center justify-center gap-3 py-4 rounded-xl transition-all duration-500",
                username.trim() 
                  ? "bg-stone-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-1" 
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
            >
              <span className="font-display text-xs uppercase tracking-[0.3em] font-medium">簽名登入</span>
              <Send size={14} className={cn("transition-transform duration-500", username.trim() && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
            </button>
          </form>

          <div className="mt-8 text-center md:text-right">
            <p className="text-[10px] text-stone-300 font-display uppercase tracking-widest">
              Literary Postcard Service © 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
