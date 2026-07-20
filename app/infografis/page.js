'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  Target, 
  Download, 
  History, 
  Lightbulb, 
  Flame,
  Award,
  HelpCircle,
  FileText
} from 'lucide-react';

const COPY_ITEMS = {
  headline: {
    title: "SKS-Master: Revolusi Sistem Kebut Semalam Berbasis Gemini AI",
    body: "Dari Cramming Buta Menuju Pemahaman Konseptual Mendalam dalam Hitungan Jam."
  },
  tagline: "Belajar Kilat, Paham Kuat. Mengubah kepanikan ujian menjadi kesiapan akademis terukur lewat kecerdasan buatan.",
  stat1: "85% Mahasiswa melakukan 'Sistem Kebut Semalam' (cramming) sebelum ujian, namun 70% di antaranya melupakan materi dalam waktu kurang dari 48 jam karena hanya mengandalkan hafalan pasif.",
  stat2: "Rata-rata tingkat kecemasan (exam anxiety) meningkat hingga 2.5 kali lipat saat mahasiswa menyadari mereka tidak memiliki tolok ukur pemahaman mandiri di malam sebelum ujian.",
  stat3: "Metode belajar pasif seperti membaca ulang modul kuliah hanya memiliki tingkat retensi memori sebesar 10%, berbanding terbalik dengan kuis aktif berbasis simulasi yang mencapai retensi 75%.",
  solution: "SKS-Master mengintegrasikan teknologi frontier Gemini 2.5 Flash untuk bertindak sebagai profesor pintar pribadi yang bersifat stateless. Aplikasi ini membedah dokumen materi perkuliahan yang rumit, lalu menyusun kuis adaptif secara seketika. Dengan merumuskan opsi jawaban pengecoh (distractors) berbasis logika ilmiah yang menantang, Gemini AI mendeteksi letak celah pemahaman mahasiswa dan langsung memberikan pembahasan akademis terperinci di saat itu juga. Belajar menjadi aktif, terarah, dan sangat efisien.",
  feature1: "AI-Generated Quiz with Dynamic Distractors\n\nKuis pilihan ganda yang dihasilkan langsung oleh Gemini AI. Soal tidak sekadar menguji hafalan, melainkan dilengkapi opsi jawaban pengecoh akademis yang dirancang khusus untuk menguji logika berpikir kritis mahasiswa.",
  feature2: "Stateless Progress Tracking (Local Storage)\n\nPantau kemajuan belajar mandiri tanpa hambatan registrasi. Menggunakan enkripsi penyimpanan lokal (LocalStorage) browser secara stateless untuk melacak riwayat skor terakhir, memastikan privasi data tetap terjaga.",
  feature3: "Offline Learning Export (.txt)\n\nKonversikan hasil evaluasi ujian menjadi dokumen teks ringkas (.txt) sekali klik. Menyediakan daftar soal yang salah dijawab lengkap dengan pembahasan mendalam dari Gemini AI untuk dipelajari secara offline di mana saja.",
  impact: "SKS-Master adalah jembatan nyata antara budaya belajar instan mahasiswa (cramming culture), kualitas pendidikan akademik tinggi (academic excellence), dan kecerdasan digital (digital intelligence). Dengan memanfaatkan Gemini AI, kami tidak melarang mahasiswa belajar di menit-menit terakhir, melainkan mendefinisikan ulang 'cramming' dari proses hafalan panik yang merusak mental menjadi sesi latihan interaktif yang merangsang kognisi dan penguasaan konsep yang sehat."
};

export default function InfografisCopyCenter() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-900/15 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-900/10 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-950/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-zinc-900/80 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gemini-gradient shadow-[0_0_8px_rgba(255,78,78,0.5)]"></span>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                SKS-Master <span className="text-xs text-zinc-405 font-semibold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full ml-1.5">Copywriting Center</span>
              </h1>
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-semibold px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gemini-yellow animate-pulse" />
            <span>Infografis Kit 2026</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Content Kit List */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="mb-2">
            <h2 className="text-2xl font-extrabold text-white">Content Copywriting Kit</h2>
            <p className="text-sm text-zinc-400 mt-1">Salin narasi promosi, data masalah, dan pembahasan fitur SKS-Master langsung untuk ditaruh di lembar Canva atau Figma Anda.</p>
          </div>

          {/* SECTION 1: HEADLINE */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-zinc-800 transition-colors shadow-xl card-gemini-accent">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>1. Headline & Subjudul Infografis</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`${COPY_ITEMS.headline.title}\n${COPY_ITEMS.headline.body}`, 'headline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  copiedId === 'headline'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-305'
                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {copiedId === 'headline' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'headline' ? 'Tersalin!' : 'Salin Headline'}
              </button>
            </div>
            <div className="space-y-2 select-text selection:bg-blue-500">
              <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                {COPY_ITEMS.headline.title}
              </h3>
              <p className="text-sm text-zinc-400 italic">
                "{COPY_ITEMS.headline.body}"
              </p>
            </div>
            
            {/* Tagline Box */}
            <div className="pt-3 border-t border-zinc-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">
                <span className="font-bold text-zinc-400">Tagline Alternatif:</span> "{COPY_ITEMS.tagline}"
              </div>
              <button
                type="button"
                onClick={() => handleCopy(COPY_ITEMS.tagline, 'tagline')}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all duration-200 ${
                  copiedId === 'tagline'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-305'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {copiedId === 'tagline' ? 'Tersalin!' : 'Salin Tagline'}
              </button>
            </div>
          </div>

          {/* SECTION 2: DATA & PROBLEM */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-zinc-800 transition-colors shadow-xl card-gemini-accent">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>2. Masalah & Data Statistik (Problem Statement)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`Data 1: ${COPY_ITEMS.stat1}\nData 2: ${COPY_ITEMS.stat2}\nData 3: ${COPY_ITEMS.stat3}`, 'stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  copiedId === 'stats'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-305'
                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {copiedId === 'stats' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'stats' ? 'Tersalin!' : 'Salin Semua Data'}
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs md:text-sm select-text selection:bg-blue-500">
              <div className="p-3 bg-zinc-950/65 rounded-xl border border-zinc-905 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-zinc-300 leading-relaxed">{COPY_ITEMS.stat1}</p>
              </div>
              <div className="p-3 bg-zinc-950/65 rounded-xl border border-zinc-905 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-zinc-300 leading-relaxed">{COPY_ITEMS.stat2}</p>
              </div>
              <div className="p-3 bg-zinc-950/65 rounded-xl border border-zinc-905 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="text-zinc-300 leading-relaxed">{COPY_ITEMS.stat3}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: CORE SOLUTION */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-zinc-800 transition-colors shadow-xl card-gemini-accent">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>3. Solusi Utama (Gemini AI Integration)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(COPY_ITEMS.solution, 'solution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  copiedId === 'solution'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-305'
                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {copiedId === 'solution' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'solution' ? 'Tersalin!' : 'Salin Solusi'}
              </button>
            </div>
            <div className="p-4 bg-zinc-950/65 rounded-xl border border-zinc-905 select-text selection:bg-blue-500">
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                {COPY_ITEMS.solution}
              </p>
            </div>
          </div>

          {/* SECTION 4: FEATURE HIGHLIGHTS */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-zinc-800 transition-colors shadow-xl card-gemini-accent">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>4. Fitur Unggulan (Feature Highlights)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`Fitur 1: ${COPY_ITEMS.feature1}\n\nFitur 2: ${COPY_ITEMS.feature2}\n\nFitur 3: ${COPY_ITEMS.feature3}`, 'features')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  copiedId === 'features'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-355'
                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {copiedId === 'features' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'features' ? 'Tersalin!' : 'Salin Semua Fitur'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-text selection:bg-blue-500 text-xs">
              {/* Feature Card 1 */}
              <div className="p-4 bg-zinc-950/65 rounded-xl border border-zinc-905 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4 text-gemini-yellow animate-pulse" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Quiz with Distractors</h4>
                  <p className="text-zinc-450 leading-relaxed text-[11px]">{COPY_ITEMS.feature1.split('\n\n')[1]}</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="p-4 bg-zinc-950/65 rounded-xl border border-zinc-905 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <History className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Stateless Tracking</h4>
                  <p className="text-zinc-450 leading-relaxed text-[11px]">{COPY_ITEMS.feature2.split('\n\n')[1]}</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="p-4 bg-zinc-950/65 rounded-xl border border-zinc-905 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <Download className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Offline Export (.txt)</h4>
                  <p className="text-zinc-450 leading-relaxed text-[11px]">{COPY_ITEMS.feature3.split('\n\n')[1]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: IMPACT */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-zinc-800 transition-colors shadow-xl card-gemini-accent">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>5. Dampak Edukatif (Future Educational Impact)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(COPY_ITEMS.impact, 'impact')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  copiedId === 'impact'
                    ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-355'
                    : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-202'
                }`}
              >
                {copiedId === 'impact' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'impact' ? 'Tersalin!' : 'Salin Dampak'}
              </button>
            </div>
            <div className="p-4 bg-zinc-950/65 rounded-xl border border-zinc-905 select-text selection:bg-blue-500">
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                {COPY_ITEMS.impact}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Canva/Figma Design Tips Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 text-gemini-yellow font-bold text-sm uppercase tracking-wider border-b border-zinc-800/60 pb-3">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <span>Canva/Figma Visual Tips</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white">1. Palet Warna Resmi (Gemini-Themed)</h4>
                <p className="text-zinc-450 leading-relaxed">
                  Gunakan latar belakang gelap (seperti UI SKS-Master) atau putih bersih. Padukan dengan warna aksen neon khas **Gemini AI** (Merah-Kuning-Hijau-Biru) untuk merepresentasikan teknologi AI, dan **Biru Google** sebagai warna penyeimbang utama.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white">2. Tipografi Judul (Typography)</h4>
                <p className="text-zinc-450 leading-relaxed">
                  Gunakan font sans-serif tebal untuk judul utama (seperti *Outfit*, *Inter*, atau *Lexend Deca*). Terapkan warna gradasi Gemini pada kata kunci utama seperti **Gemini AI** atau **SKS-Master** agar mencolok secara instan.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white">3. Tata Letak Mengalir (Flow Layout)</h4>
                <p className="text-zinc-450 leading-relaxed">
                  Susun informasi secara vertikal: Mulai dari *Headline provokatif* (Atas), disusul *3 poin statistik data masalah* (Tengah-Atas), *ilustrasi AI sebagai Solusi* (Tengah-Bawah), dan ditutup dengan *Dampak Edukasi* yang persuasif (Bawah).
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white">4. Elemen Pendukung Visual</h4>
                <p className="text-zinc-450 leading-relaxed">
                  Gunakan ikon-ikon berdesain garis bersih (*clean line-art*) beraksen Google Blue seperti grafik peningkatan retensi memori (75% aktif vs 10% pasif) untuk memperkuat kredibilitas informasi secara instan.
                </p>
              </div>
            </div>
            
            {/* Subtheme Confirmation Badge */}
            <div className="pt-3 border-t border-zinc-800/40 text-center">
              <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Education & Excellence</span>
              <p className="text-[10px] text-zinc-550 mt-0.5">Gemini Unity Festival 2026 Entry</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 text-center py-6 text-xs text-zinc-500 px-6">
        <p className="max-w-6xl mx-auto">&copy; 2026 SKS-Master. Dibuat untuk Gemini Unity Festival 2026. Bebas database, melaju kencang dengan AI.</p>
      </footer>
    </div>
  );
}
