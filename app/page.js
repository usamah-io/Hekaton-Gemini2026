'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  BookOpen, 
  Download, 
  History, 
  ArrowRight, 
  Zap, 
  Target, 
  BookOpenCheck,
  Cpu,
  Sun,
  Moon,
  X
} from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    setDragDistance(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX; // Dragging left is positive
    if (isOpen) {
      if (diff < 0) {
        setDragDistance(diff);
      }
    } else {
      if (diff > 0) {
        setDragDistance(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (isOpen) {
      if (dragDistance < -35) {
        setIsOpen(false);
      }
    } else {
      if (dragDistance > 35) {
        setIsOpen(true);
      }
    }
    setDragDistance(0);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
    setDragDistance(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (isOpen) {
      if (diff < 0) setDragDistance(diff);
    } else {
      if (diff > 0) setDragDistance(diff);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (isOpen) {
      if (dragDistance < -35) setIsOpen(false);
    } else {
      if (dragDistance > 35) setIsOpen(true);
    }
    setDragDistance(0);
  };

  // Load theme and setup SW/PWA Listeners
  useEffect(() => {
    // 1. Theme Setup
    const savedTheme = localStorage.getItem('sks_master_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // 2. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.error('PWA Service Worker registration failed:', err));
    }

    // 3. PWA beforeinstallprompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('SKS-Master PWA successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('sks_master_theme', newTheme);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("ℹ️ SKS-Master sudah terinstal sebagai aplikasi PWA di perangkat Anda atau browser Anda tidak mendukung instalasi otomatis.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden relative transition-all duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-45 w-[500px] h-[500px] rounded-full blur-3xl opacity-60 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-blue-900/15' : 'bg-blue-200/30'
        }`}></div>
        <div className={`absolute top-1/4 -right-45 w-[600px] h-[600px] rounded-full blur-3xl opacity-50 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-sky-900/10' : 'bg-sky-200/20'
        }`}></div>
        <div className={`absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-60 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-blue-950/20' : 'bg-blue-100/20'
        }`}></div>
      </div>

      {/* Navigation bar */}
      <nav className={`relative z-10 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-350 ${
        theme === 'dark' ? 'border-zinc-900/60 bg-zinc-950/70' : 'border-zinc-200/60 bg-white/70'
      }`}>
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Minimalist Logo */}
            <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] shrink-0"></span>
            <div className="flex h-2.5 rounded-[1.5px] overflow-hidden shrink-0">
              <span className="w-2.5 h-full bg-[#4285F4]"></span>
              <span className="w-2.5 h-full bg-[#0F9D58]"></span>
              <span className="w-2.5 h-full bg-[#F4B400]"></span>
              <span className="w-2.5 h-full bg-[#DB4437]"></span>
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>
              SKS-Master
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors duration-205 ${
                theme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Masuk Dasbor
            </Link>



            {/* Toggle Theme Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.05] active:scale-[0.95] ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-white border-zinc-300 hover:bg-zinc-101 text-zinc-700 hover:text-black'
              }`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 stroke-[2] text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 stroke-[2] text-blue-605" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        {/* Hackathon Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-semibold mb-6 shadow-sm animate-bounce duration-1000 ${
          theme === 'dark'
            ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
            : 'bg-zinc-101 border-zinc-200 text-zinc-700'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Gemini Innovation Hackathon 2026 Entry</span>
        </div>

        {/* Main Title */}
        <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6 transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-zinc-950'
        }`}>
          Kuasai Ujian dalam Semalam dengan{" "}
          <span className="text-gemini-gradient font-black">
            Gemini AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed transition-colors duration-300 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          SKS-Master adalah platform belajar kilat berbasis SaaS tanpa database yang meracik kuis akademis instan secara adaptif. Siapkan dirimu menghadapi UTBK, IT, Sejarah, hingga Sains dengan pembahasan mendalam dan analisis pengecoh cerdas.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gemini-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98] border border-white/10"
          >
            Mulai Belajar Sekarang (Gratis)
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard?tab=history"
            className={`px-8 py-4 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] border ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-white border-zinc-305 hover:bg-zinc-101 text-zinc-700 hover:text-black'
            }`}
          >
            Lihat Dasbor Skor
          </Link>
        </div>

        {/* Divider */}
        <div className={`w-full border-t my-6 transition-colors duration-300 ${
          theme === 'dark' ? 'border-zinc-900/60' : 'border-zinc-200/60'
        }`}></div>

        {/* Features Grid Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          }`}>
            Mengapa Memilih SKS-Master?
          </h2>
          {/* Brand Accent Border */}
          <div className="w-24 h-1 bg-gemini-gradient rounded-full mb-3 shadow-[0_1px_4px_rgba(26,115,232,0.2)]"></div>
          <p className="text-xs text-zinc-500">Fitur premium SaaS yang siap mendongkrak progres belajar Anda secara kilat.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Kuis Cerdas Gemini</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Soal-soal pilihan ganda yang diracik instan oleh Gemini AI berdasarkan subjek dan tingkat kesulitan pilihanmu secara dinamis.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <Target className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Pengecoh Jawaban Cerdas</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Pengecoh (distractors) dibuat dengan tingkat kesulitan akademis tinggi untuk mendeteksi kelemahan logika berpikirmu.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Pembahasan Komprehensif</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Pembahasan akademis menyeluruh untuk setiap soal kuis. Pahami akar permasalahan konsep secara mendalam dan cepat.
            </p>
          </div>

          {/* Card 4 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <Download className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Ekspor Offline (.txt)</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Ekspor daftar jawaban salah lengkap dengan pembahasan akademisnya agar dapat Anda pelajari secara offline di mana saja.
            </p>
          </div>

          {/* Card 5 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <History className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Riwayat Progres Belajar</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Indikator skor ujian terakhir tersimpan aman di browser LocalStorage. Lacak kemampuan belajarmu tanpa database eksternal.
            </p>
          </div>

          {/* Card 6 */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 card-gemini-accent ${
            theme === 'dark'
              ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80'
              : 'bg-white border-zinc-200/80 hover:border-zinc-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-305 ${
              theme === 'dark'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-blue-50 text-blue-650 border-blue-100'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <h3 className={`font-bold mb-1.5 text-sm md:text-base ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}>Tanpa Database & Cepat</h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-655'
            }`}>
              Kecepatan akses tanpa latensi query database. Sepenuhnya serverless, kencang, dan siap diakses kapan saja demi kebutuhan SKS.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t text-center py-6 text-xs transition-colors duration-300 px-6 ${
        theme === 'dark' ? 'border-zinc-900 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-white text-zinc-400'
      }`}>
        <p className="max-w-6xl mx-auto">&copy; 2026 SKS-Master. Dibuat untuk Gemini Innovation Hackathon 2026. Melaju kencang dengan AI.</p>
      </footer>
      {/* Samsung Edge Panel PWA Install */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateY(-50%) translateX(${
            isDragging
              ? isOpen
                ? Math.max(0, Math.min(130, -dragDistance))
                : Math.max(0, Math.min(130, 130 - dragDistance))
              : isOpen
              ? 0
              : 130
          }px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="fixed right-0 top-1/2 z-50 flex items-center select-none cursor-grab active:cursor-grabbing"
      >
        {/* Handle Bar */}
        <div 
          className={`w-1.5 h-16 rounded-l-md transition-colors ${
            theme === 'dark' 
              ? 'bg-neutral-500/40 hover:bg-neutral-400/60' 
              : 'bg-neutral-400/40 hover:bg-neutral-500/60'
          }`}
          title="Geser ke kiri untuk PWA"
        />

        {/* Panel Content */}
        <div
          onClick={handleInstallPWA}
          className={`w-[130px] h-16 rounded-l-2xl backdrop-blur-md shadow-2xl flex items-center gap-2 px-3 border-l border-y transition-all ${
            theme === 'dark'
              ? 'bg-neutral-900/90 border-neutral-700 text-white hover:bg-neutral-800/90'
              : 'bg-white/95 border-zinc-200 text-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <Download className={`w-4 h-4 shrink-0 animate-bounce ${
            theme === 'dark' ? 'text-white' : 'text-zinc-850'
          }`} />
          <span className="text-xs font-black tracking-wide">Install</span>
          
          {/* Close button inside the panel */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className={`ml-auto p-1 rounded-full transition-colors flex items-center justify-center ${
              theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-black'
            }`}
            title="Sembunyikan panel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
