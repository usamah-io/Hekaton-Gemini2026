'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateQuiz } from '../actions';
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Clock, 
  Check, 
  History, 
  HelpCircle,
  BookOpenCheck,
  Sun,
  Moon,
  Trash2,
  ListTodo,
  FileBarChart2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

const LOADING_QUOTES = [
  "Gemini sedang meracik soal-soal pilihan ganda yang menantang...",
  "Menyusun pengecoh jawaban akademis yang melatih logika Anda...",
  "Menghubungkan ke server super-otak SKS-Master...",
  "Menyusun pembahasan akademis yang mendalam dan mudah dimengerti...",
  "Mengaktifkan mode belajar kilat. Tarik napas dulu..."
];

const SUBJECTS = [
  'UTBK Pengetahuan Kuantitatif',
  'Ilmu Komputer',
  'Sejarah',
  'Biologi',
  'Kimia'
];

const getMotivationalFeedback = (pct) => {
  if (pct === 100) return { title: "Sempurna! Master SKS!", desc: "Kamu menguasai topik ini sepenuhnya. Siap tempur!", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (pct >= 80) return { title: "Sangat Hebat!", desc: "Pemahaman kamu luar biasa tajam. Sedikit polesan lagi!", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  if (pct >= 50) return { title: "Cukup Baik!", desc: "Sudah di atas rata-rata, tapi baca lagi pembahasannya ya!", color: "text-amber-555", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { title: "Butuh Cramming Lebih Keras!", desc: "Jangan kecil hati. Tetap konsisten belajar dan ulangi kuis secara berkala.", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
};

export default function Dashboard() {
  // --- STATE ---
  const [step, setStep] = useState('setup'); // setup | loading | quiz | result
  const [activeTab, setActiveTab] = useState('quiz'); // quiz | history
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null); // null | historyItem
  const [subject, setSubject] = useState('UTBK Pengetahuan Kuantitatif');
  const [difficulty, setDifficulty] = useState('Sedang');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
  const [score, setScore] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [exitCount, setExitCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // --- LOCAL STORAGE & INTENT CHECKS ---
  useEffect(() => {
    let parsedLast = null;
    let parsedHist = [];

    // 1. Load Last Score
    const savedLast = localStorage.getItem('sks_master_last_score');
    if (savedLast) {
      try {
        parsedLast = JSON.parse(savedLast);
        setLastScore(parsedLast);
      } catch (e) {
        console.error("Gagal meload skor terakhir dari LocalStorage", e);
      }
    }
    
    // 2. Load History List
    const savedHist = localStorage.getItem('sks_master_history');
    if (savedHist) {
      try {
        parsedHist = JSON.parse(savedHist);
        setHistoryList(parsedHist);
      } catch (e) {
        console.error("Gagal meload riwayat dari LocalStorage", e);
      }
    }

    // 3. Auto-migration / Synchronization:
    if (parsedHist.length === 0 && parsedLast) {
      const migratedItem = {
        id: Date.now(),
        tanggal: parsedLast.date || new Date().toLocaleString('id-ID'),
        subject: parsedLast.subject,
        difficulty: parsedLast.difficulty,
        jumlahSoal: parsedLast.maxScore || 5,
        skor: parsedLast.score,
        percent: parsedLast.percent
      };
      const newHist = [migratedItem];
      localStorage.setItem('sks_master_history', JSON.stringify(newHist));
      setHistoryList(newHist);
    }

    // 4. Load Theme
    const savedTheme = localStorage.getItem('sks_master_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // 5. PWA beforeinstallprompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('SKS-Master Dashboard PWA successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Check Query Intent
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'history') {
        setActiveTab('history');
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // --- CYCLING LOADING QUOTES ---
  useEffect(() => {
    let interval;
    if (step === 'loading') {
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [step]);

  // --- FULLSCREEN INTEGRITY MONITORING ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if ((step === 'quiz' || step === 'loading') && !document.fullscreenElement) {
        if (blockModal) return;

        setExitCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setBlockModal(true);
            return 0; // Reset counter
          } else {
            setShowWarningModal(true);
            return newCount;
          }
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [step, blockModal]);

  // --- HANDLERS ---
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('sks_master_theme', newTheme);
  };

  const handleRestoreFullscreen = () => {
    if (typeof window !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => {
          setShowWarningModal(false);
        })
        .catch((err) => {
          console.error("Gagal memulihkan Fullscreen:", err);
        });
    }
  };

  const handleBlockReset = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setBlockModal(false);
    setShowWarningModal(false);
    setExitCount(0);
    setStep('setup');
  };

  const handleStartQuiz = async () => {
    setExitCount(0);

    if (typeof window !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Gagal masuk ke mode Fullscreen:", err);
      });
    }

    setStep('loading');
    setErrorMsg('');
    setLoadingQuoteIndex(0);

    const result = await generateQuiz(subject, difficulty, questionCount);

    if (result && result.success) {
      setQuestions(result.questions);
      setIsFallback(!!result.isFallback);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setStep('quiz');
    } else {
      setErrorMsg(result?.error || 'Gagal membuat kuis. Hubungi administrator.');
      setStep('setup');

      if (typeof window !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  const handleSelectOption = (optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIdx
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let calculatedScore = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct_answer_index) {
          calculatedScore += 1;
        }
      });

      const currentScorePct = Math.round((calculatedScore / questions.length) * 100);
      const currentTimeString = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      setScore(calculatedScore);

      // 1. Simpan Last Score
      const currentScoreData = {
        subject,
        score: calculatedScore,
        maxScore: questions.length,
        difficulty,
        percent: currentScorePct,
        date: currentTimeString,
        isFallback: !!isFallback
      };
      localStorage.setItem('sks_master_last_score', JSON.stringify(currentScoreData));
      setLastScore(currentScoreData);

      // 2. Simpan ke History List
      const itemHist = {
        id: Date.now(),
        tanggal: currentTimeString,
        subject,
        difficulty,
        jumlahSoal: questions.length,
        skor: calculatedScore,
        percent: currentScorePct
      };

      const updatedHistory = [itemHist, ...historyList];
      localStorage.setItem('sks_master_history', JSON.stringify(updatedHistory));
      setHistoryList(updatedHistory);
      
      setStep('result');

      setTimeout(() => {
        if (typeof window !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch((err) => console.error("Gagal keluar dari Fullscreen:", err));
        }
      }, 100);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleExplanation = (idx) => {
    setExpandedExplanations({
      ...expandedExplanations,
      [idx]: !expandedExplanations[idx]
    });
  };

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat kuis lokal Anda secara permanen?")) {
      localStorage.removeItem('sks_master_history');
      localStorage.removeItem('sks_master_last_score');
      setHistoryList([]);
      setLastScore(null);
      setSelectedHistoryItem(null);
    }
  };

  // --- EXPORT OFFLINE REPORT ---
  const handleExportIncorrect = () => {
    const incorrectQuestions = questions.filter((q, idx) => selectedAnswers[idx] !== q.correct_answer_index);
    
    let content = `=========================================================================\n`;
    content += `               SKS-MASTER - RINGKASAN & PEMBAHASAN UJIAN\n`;
    content += `=========================================================================\n\n`;
    content += `Waktu Evaluasi : ${new Date().toLocaleString('id-ID')}\n`;
    content += `Subjek Ujian   : ${subject}\n`;
    content += `Tingkat Kesul. : ${difficulty}\n`;
    content += `Skor Hasil     : ${score} dari ${questions.length} (${Math.round((score / questions.length) * 100)}%)\n`;
    content += `Mesin Generator: ${isFallback ? 'Mock Database (Offline / API key failed)' : 'Gemini AI Engine (Online)'}\n\n`;
    
    content += `=========================================================================\n`;
    content += `             DAFTAR PERTANYAAN DENGAN JAWABAN KELIRU\n`;
    content += `     (Gunakan pembahasan akademis ini untuk belajar secara offline)\n`;
    content += `=========================================================================\n\n`;
    
    if (incorrectQuestions.length === 0) {
      content += `Luar biasa! Seluruh soal dijawab dengan benar. Tidak ada soal salah yang harus dievaluasi.\n\n`;
    } else {
      incorrectQuestions.forEach((q, index) => {
        const originalIndex = questions.indexOf(q);
        const userAnswerIndex = selectedAnswers[originalIndex];
        const userAnswerStr = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "Tidak Dijawab";
        const correctAnswerStr = q.options[q.correct_answer_index];
        
        content += `Soal #${index + 1} (Pertanyaan Ke-${originalIndex + 1}):\n`;
        content += `${q.question}\n\n`;
        content += `Pilihan Jawaban:\n`;
        q.options.forEach(opt => {
          content += `  - ${opt}\n`;
        });
        content += `\n`;
        content += `Pilihan Jawaban Anda : ${userAnswerStr}\n`;
        content += `Jawaban Yang Benar   : ${correctAnswerStr}\n\n`;
        content += `PEMBAHASAN AKADEMIS:\n`;
        content += `${q.explanation}\n`;
        content += `\n-------------------------------------------------------------------------\n\n`;
      });
    }
    
    content += `Generated by SKS-Master. Teruslah belajar dan latih logikamu!\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sks-master_evaluasi_${subject.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleResetQuiz = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setExpandedExplanations({});
    setStep('setup');
  };

  // --- STATS CALCULATIONS ---
  const totalQuizzes = historyList.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.percent, 0) / totalQuizzes)
    : 0;
  
  const getFavoriteSubject = () => {
    if (totalQuizzes === 0) return '-';
    const counts = {};
    historyList.forEach(item => {
      counts[item.subject] = (counts[item.subject] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-60 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-blue-900/15' : 'bg-blue-200/20'
        }`}></div>
        <div className={`absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-sky-900/10' : 'bg-sky-200/15'
        }`}></div>
        <div className={`absolute -bottom-40 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-60 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-blue-950/20' : 'bg-blue-100/20'
        }`}></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 border-b backdrop-blur-md px-6 py-4 transition-colors duration-300 ${
        theme === 'dark' ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-zinc-205 bg-white/80'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(step === 'setup' || step === 'result') ? (
              <Link href="/" className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' ? 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-101 text-zinc-650 hover:text-zinc-900'
              } group`}>
                <ArrowLeft className="w-5 h-5 transition-colors" />
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => alert("🚨 Peringatan: Anda tidak dapat meninggalkan halaman ini saat kuis sedang aktif demi keamanan ujian!")}
                className={`p-2 cursor-not-allowed rounded-lg border transition-colors duration-205 ${
                  theme === 'dark' ? 'bg-zinc-900/50 text-zinc-600 border-zinc-800/40' : 'bg-zinc-101 text-zinc-400 border-zinc-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] shadow-[0_0_6px_rgba(66,133,244,0.4)]"></span>
              <h1 className={`text-xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${
                theme === 'dark' ? 'from-white via-zinc-200 to-zinc-400' : 'from-zinc-950 via-zinc-800 to-zinc-600'
              }`}>
                SKS-Master <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1.5 border ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-101 border-zinc-250 text-zinc-700'
                }`}>SaaS Pro</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>AI generation enabled</span>
            </div>

            {/* Toggle Theme Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.05] active:scale-[0.95] ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-white border-zinc-305 hover:bg-zinc-101 text-zinc-700 hover:text-black'
              }`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 stroke-[2] text-amber-400 animate-none" />
              ) : (
                <Moon className="w-4 h-4 stroke-[2] text-blue-600 animate-none" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start">
        
        {/* --- STEP 1: SETUP --- */}
        {step === 'setup' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Navigation Tabs */}
            <div className={`flex border-b transition-colors duration-300 ${
              theme === 'dark' ? 'border-zinc-800/80' : 'border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  setSelectedHistoryItem(null);
                }}
                className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'quiz' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-350'
                }`}
              >
                Mulai Kuis AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-355'
                }`}
              >
                Dasbor Skor Kuis ({totalQuizzes})
              </button>
            </div>

            {/* --- TAB A: QUIZ CREATION FORM --- */}
            {activeTab === 'quiz' && (
              <>
                {errorMsg && (
                  <div className="flex items-center gap-3 bg-rose-950/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                {/* Setup card */}
                <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-2xl transition-colors duration-300 card-gemini-accent ${
                  theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-650 border-blue-200'
                    }`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>Racik Kuis SKS Baru</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Konfigurasikan subjek dan tingkat kesulitan kuis pilihan ganda instan Anda.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Subject Selection */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>Subjek Kuis</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {SUBJECTS.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setSubject(sub)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-205 cursor-pointer ${
                              subject === sub
                                ? 'bg-blue-600/15 border-blue-500/50 text-blue-450 font-bold shadow-md shadow-blue-900/10'
                                : theme === 'dark'
                                  ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400'
                                  : 'bg-zinc-101/50 border-zinc-200 hover:bg-zinc-50 text-zinc-650'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${subject === sub ? 'bg-blue-500 scale-125' : 'bg-zinc-600'}`}></span>
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>Tingkat Kesulitan</label>
                      <div className="flex gap-3">
                        {['Mudah', 'Sedang', 'Sulit'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setDifficulty(lvl)}
                            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                              difficulty === lvl
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-505 text-white shadow-lg shadow-blue-900/10'
                                : theme === 'dark'
                                  ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-202'
                                  : 'bg-zinc-101/50 border-zinc-200 hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Count Selection */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>Jumlah Soal</label>
                      <div className="flex gap-4">
                        {[5, 10, 15].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuestionCount(num)}
                            className={`flex-1 py-3.5 rounded-xl border text-base font-bold transition-all duration-200 cursor-pointer ${
                              questionCount === num
                                ? 'bg-blue-600/15 border-blue-500/65 text-blue-450'
                                : theme === 'dark'
                                  ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400'
                                  : 'bg-zinc-101/50 border-zinc-205 hover:bg-zinc-50 text-zinc-650'
                            }`}
                          >
                            {num} Soal
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full mt-4 bg-gemini-gradient text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-950/10 hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 group text-base border border-white/10 active:scale-[0.98] cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-white/80 group-hover:animate-pulse" />
                      Mulai Kuis AI
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* --- TAB B: SCORE HISTORY DASHBOARD --- */}
            {activeTab === 'history' && (
              <>
                {selectedHistoryItem ? (
                  /* --- SUB-VIEW: DEDICATED REPORT PAGE FOR SELECTED SESSION --- */
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryItem(null)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                            : 'bg-white border-zinc-250 text-zinc-700 hover:text-black'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Log Riwayat
                      </button>
                    </div>

                    {/* Detailed Analysis Card */}
                    <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300 card-gemini-accent ${
                      theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <FileBarChart2 className="w-48 h-48 text-white" />
                      </div>

                      {/* Header Details */}
                      <div className="border-b border-zinc-800/40 pb-5 mb-6 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold uppercase tracking-wider">
                          <span className={`px-2 py-0.5 border rounded-full ${
                            selectedHistoryItem.difficulty === 'Sulit' 
                              ? 'bg-rose-950/20 border-rose-800/40 text-rose-455' 
                              : selectedHistoryItem.difficulty === 'Sedang'
                                ? 'bg-amber-950/20 border-amber-800/40 text-amber-500'
                                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-500'
                          }`}>
                            {selectedHistoryItem.difficulty}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {selectedHistoryItem.tanggal}
                          </span>
                        </div>
                        <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
                          Laporan Ujian: {selectedHistoryItem.subject}
                        </h2>
                      </div>

                      {/* Circle accuracy graph */}
                      <div className="flex flex-col items-center py-6">
                        <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border shadow-inner mb-6 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-101 border-zinc-200'
                        }`}>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="56" 
                              className={theme === 'dark' ? 'stroke-zinc-900' : 'stroke-zinc-200'} 
                              strokeWidth="7" 
                              fill="transparent" 
                            />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="56" 
                              className="stroke-blue-550 transition-all duration-1000" 
                              strokeWidth="7" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 56}
                              strokeDashoffset={2 * Math.PI * 56 * (1 - (selectedHistoryItem.skor / selectedHistoryItem.jumlahSoal))}
                            />
                          </svg>
                          <div className="flex flex-col items-center">
                            <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-905'}`}>{selectedHistoryItem.percent}%</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Akurasi</span>
                          </div>
                        </div>

                        {/* Recommendation Feedback Box */}
                        <div className={`w-full max-w-md p-4 rounded-xl border mb-6 text-center ${
                          getMotivationalFeedback(selectedHistoryItem.percent).bg
                        } ${getMotivationalFeedback(selectedHistoryItem.percent).border}`}>
                          <h4 className={`text-sm font-bold uppercase tracking-wider ${
                            getMotivationalFeedback(selectedHistoryItem.percent).color
                          }`}>
                            {getMotivationalFeedback(selectedHistoryItem.percent).title}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1">{getMotivationalFeedback(selectedHistoryItem.percent).desc}</p>
                        </div>
                      </div>

                      {/* Score breakdown metrics list */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800/40 pt-6">
                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-950/40 border-zinc-850' : 'bg-zinc-101/50 border-zinc-200'
                        }`}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Jawaban Benar</span>
                            <div className="text-xl font-black text-emerald-500">{selectedHistoryItem.skor} Soal</div>
                          </div>
                          <CheckCircle2 className="w-8 h-8 text-emerald-500/20 shrink-0" />
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-950/40 border-zinc-850' : 'bg-zinc-101/50 border-zinc-200'
                        }`}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Jawaban Salah</span>
                            <div className="text-xl font-black text-rose-500">{selectedHistoryItem.jumlahSoal - selectedHistoryItem.skor} Soal</div>
                          </div>
                          <XCircle className="w-8 h-8 text-rose-500/20 shrink-0" />
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-zinc-950/40 border-zinc-850' : 'bg-zinc-101/50 border-zinc-200'
                        }`}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rasio Poin</span>
                            <div className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
                              {selectedHistoryItem.skor} / {selectedHistoryItem.jumlahSoal}
                            </div>
                          </div>
                          <Layers className="w-8 h-8 text-blue-500/20 shrink-0" />
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  /* --- STANDARD HISTORY VIEW --- */
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Score Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Stat Card 1 */}
                      <div className={`p-5 rounded-2xl border transition-colors duration-300 card-gemini-accent ${
                        theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Total Ujian</div>
                        <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{totalQuizzes} Sesi</div>
                        <p className="text-[10px] text-zinc-400 mt-1">Tersimpan lokal di perangkat ini</p>
                      </div>
                      {/* Stat Card 2 */}
                      <div className={`p-5 rounded-2xl border transition-colors duration-300 card-gemini-accent ${
                        theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Rata-rata Akurasi</div>
                        <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{averageScore}%</div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-gemini-gradient" style={{ width: `${averageScore}%` }}></div>
                        </div>
                      </div>
                      {/* Stat Card 3 */}
                      <div className={`p-5 rounded-2xl border transition-colors duration-300 card-gemini-accent ${
                        theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Subjek Terfavorit</div>
                        <div className={`text-sm md:text-base font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{getFavoriteSubject()}</div>
                        <p className="text-[10px] text-zinc-400 mt-1">Subjek yang paling sering dikerjakan</p>
                      </div>
                    </div>

                    {/* Score Log List */}
                    <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-2xl transition-colors duration-300 card-gemini-accent ${
                      theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="flex items-center justify-between border-b border-zinc-805/40 pb-4 mb-6 gap-3">
                        <div className="flex items-center gap-2">
                          <ListTodo className="w-5 h-5 text-blue-500" />
                          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>Daftar Log Nilai Ujian</h3>
                        </div>
                        {totalQuizzes > 0 && (
                          <button
                            type="button"
                            onClick={handleClearHistory}
                            className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 px-3 py-2 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Semua
                          </button>
                        )}
                      </div>

                      {totalQuizzes === 0 ? (
                        <div className="text-center py-10 space-y-3">
                          <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center mx-auto">
                            <History className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>Belum Ada Riwayat Kuis</h4>
                            <p className="text-xs text-zinc-550 max-w-xs mx-auto">Selesaikan pengerjaan kuis kustom pertama Anda untuk melihat statistik nilai Anda tersimpan otomatis di sini.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('quiz')}
                            className="mt-2 text-xs font-bold text-blue-500 hover:underline cursor-pointer"
                          >
                            Kerjakan Kuis Pertama Sekarang &rarr;
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {historyList.map((item) => (
                            <button 
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedHistoryItem(item)}
                              className={`w-full text-left p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:translate-x-1 cursor-pointer hover:shadow-lg ${
                                theme === 'dark' 
                                  ? 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900/40 hover:border-zinc-700' 
                                  : 'bg-zinc-101/50 border-zinc-200 hover:bg-zinc-102 hover:border-zinc-300'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                    item.difficulty === 'Sulit' 
                                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-405' 
                                      : item.difficulty === 'Sedang'
                                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-500'
                                        : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-505'
                                  }`}>
                                    {item.difficulty}
                                  </span>
                                  <span className="text-[10px] text-zinc-450">{item.tanggal}</span>
                                </div>
                                <h4 className={`text-sm font-bold flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                  {item.subject}
                                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 opacity-60" />
                                </h4>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-24 hidden sm:block">
                                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                    <span>Akurasi</span>
                                    <span>{item.percent}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gemini-gradient" style={{ width: `${item.percent}%` }}></div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className={`text-base font-extrabold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                    {item.skor}/{item.jumlahSoal}
                                  </div>
                                  <div className={`text-[10px] font-bold ${getMotivationalFeedback(item.percent).color}`}>
                                    {getMotivationalFeedback(item.percent).title}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('quiz')}
                        className="bg-gemini-gradient text-white text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer"
                      >
                        Kerjakan Kuis Baru
                      </button>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* --- STEP 2: LOADING --- */}
        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center w-24 h-24 mb-8">
              {/* Spinning Loader */}
              <div className={`absolute inset-0 border-4 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'border-blue-500/10' : 'border-blue-600/10'
              }`}></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-sky-500 rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            
            <div className="max-w-md text-center space-y-3">
              <h3 className={`text-lg font-bold transition-colors duration-305 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>Merakit Soal Kuis</h3>
              <p className={`text-sm min-h-[48px] px-6 transition-all duration-300 italic ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                "{LOADING_QUOTES[loadingQuoteIndex]}"
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 3: QUIZ --- */}
        {step === 'quiz' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-350">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 px-2 py-0.5 bg-blue-950/80 border border-blue-800/40 rounded-full">
                  {subject}
                </span>
                <h3 className="text-sm text-zinc-400 font-medium">
                  Tingkat Kesulitan: <span className={theme === 'dark' ? 'text-zinc-200 font-semibold' : 'text-zinc-705 font-semibold'}>{difficulty}</span>
                </h3>
              </div>
              
              <div className="text-right">
                <span className={`text-sm font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
                  Soal {currentQuestionIndex + 1} dari {questions.length}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-205 border-zinc-300'
            }`}>
              <div 
                className="h-full bg-gemini-gradient rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-2xl transition-colors duration-300 card-gemini-accent ${
              theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
            }`}>
              <p className={`text-lg md:text-xl font-bold leading-relaxed mb-8 transition-colors duration-300 ${
                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {questions[currentQuestionIndex]?.question}
              </p>

              {/* Options */}
              <div className="space-y-3.5">
                {questions[currentQuestionIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm md:text-base transition-all duration-200 flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 text-blue-450 font-bold shadow-md shadow-blue-950/10'
                          : theme === 'dark'
                            ? 'bg-zinc-950/45 border-zinc-800/50 text-zinc-300 hover:bg-zinc-900/50 hover:border-zinc-700/60'
                            : 'bg-zinc-101/55 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-305'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-400 text-white' 
                          : 'border-zinc-700 group-hover:border-zinc-500'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                  theme === 'dark'
                    ? 'border-zinc-800/80 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-202'
                    : 'border-zinc-250 hover:bg-zinc-101 text-zinc-660 hover:text-zinc-900'
                }`}
              >
                Sebelumnya
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-950/10 transition-colors disabled:opacity-35 disabled:pointer-events-none active:scale-95 cursor-pointer"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Selesai & Evaluasi' : 'Selanjutnya'}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: RESULT --- */}
        {step === 'result' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Main Score Display Box */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center transition-colors duration-300 card-gemini-accent ${
              theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800/85' : 'bg-white border-zinc-200'
            }`}>
              
              {/* Fallback Badge */}
              {isFallback && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-amber-300 font-semibold px-2 py-0.5 bg-amber-950/80 border border-amber-800/40 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  <span>Mode Offline</span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' : 'bg-blue-50 text-blue-650 border-blue-200'
              }`}>
                <Award className="w-6 h-6" />
              </div>

              <h2 className={`text-xl font-extrabold transition-colors duration-355 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>Hasil Evaluasi Kuis</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">Evaluasi instan dari SKS-Master. Pelajari kesalahanmu untuk memperdalam konsep.</p>

              {/* Circular progress chart */}
              <div className={`relative w-36 h-36 flex items-center justify-center rounded-full border my-6 shadow-inner transition-colors duration-300 ${
                theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-101 border-zinc-200'
              }`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    className={theme === 'dark' ? 'stroke-zinc-900' : 'stroke-zinc-200'} 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    className="stroke-blue-550 transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - (score / questions.length))}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className={`text-4xl font-extrabold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-zinc-905'}`}>{Math.round((score / questions.length) * 100)}%</span>
                  <span className="text-xs text-zinc-500 font-semibold mt-1">Skor: {score}/{questions.length}</span>
                </div>
              </div>

              {/* Motivational feedback */}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${getMotivationalFeedback(Math.round((score / questions.length) * 100)).color}`}>
                  {getMotivationalFeedback(Math.round((score / questions.length) * 100)).title}
                </h3>
                <p className={`text-sm mt-1 max-w-md mx-auto transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-650'
                }`}>
                  {getMotivationalFeedback(Math.round((score / questions.length) * 100)).desc}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
                <button
                  type="button"
                  onClick={handleExportIncorrect}
                  className="flex-1 bg-gemini-gradient text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 text-sm border border-white/10 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white/90" />
                  Unduh Ringkasan Hasil Ujian
                </button>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className={`flex-1 border transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-95 font-bold py-3 px-4 rounded-xl cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/60 text-zinc-300'
                      : 'bg-white border-zinc-300 hover:bg-zinc-101 text-zinc-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Ulangi Kuis Baru
                </button>
              </div>
            </div>

            {/* Detailed Accordion Reviews */}
            <div className="space-y-4">
              <div className={`flex items-center gap-2 text-sm font-bold px-1 transition-colors duration-300 ${
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                <BookOpenCheck className="w-4.5 h-4.5 text-blue-500" />
                <span>Pembahasan Akademis Tiap Soal</span>
              </div>

              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correct_answer_index;
                const isExpanded = !!expandedExplanations[idx];
                const selectedOptStr = selectedAnswers[idx] !== undefined ? q.options[selectedAnswers[idx]] : "Tidak Dijawab";
                const correctOptStr = q.options[q.correct_answer_index];

                return (
                  <div 
                    key={idx}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isCorrect 
                        ? theme === 'dark' ? 'border-emerald-500/20 bg-emerald-950/5/20 backdrop-blur-xl' : 'border-emerald-250 bg-emerald-50/15'
                        : theme === 'dark' ? 'border-rose-500/20 bg-rose-950/5 backdrop-blur-xl' : 'border-rose-250 bg-rose-50/15'
                    }`}
                  >
                    {/* Header bar / Accordion Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExplanation(idx)}
                      className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-zinc-900/20 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-400">Soal #{idx + 1}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isCorrect 
                              ? 'bg-emerald-950 border-emerald-800/40 text-emerald-400' 
                              : 'bg-rose-950 border-rose-800/40 text-rose-400'
                          }`}>
                            {isCorrect ? 'Benar' : 'Salah'}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-normal transition-colors duration-300 ${
                          theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                        }`}>
                          {q.question}
                        </p>
                      </div>
                      
                      <div className="shrink-0 mt-1 p-1 hover:bg-zinc-800/60 rounded-lg text-zinc-400 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expandable Details Area */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-zinc-800/20 text-sm space-y-4">
                        {/* Options List */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Opsi Jawaban:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isThisCorrect = optIdx === q.correct_answer_index;
                              const isThisSelected = optIdx === selectedAnswers[idx];
                              
                              let optStyle = '';
                              if (isThisCorrect) {
                                optStyle = theme === 'dark' 
                                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-305 font-medium' 
                                  : 'border-emerald-300 bg-emerald-50/80 text-emerald-700 font-medium';
                              } else if (isThisSelected) {
                                optStyle = theme === 'dark' 
                                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-300 font-medium' 
                                  : 'border-rose-300 bg-rose-50/80 text-rose-700 font-medium';
                              } else {
                                optStyle = theme === 'dark'
                                  ? 'border-zinc-800/50 bg-zinc-950/30 text-zinc-400'
                                  : 'border-zinc-200 bg-zinc-101/50 text-zinc-650';
                              }

                              return (
                                <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors duration-300 ${optStyle}`}>
                                  <span>{opt}</span>
                                  {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                  {!isThisCorrect && isThisSelected && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Summary of User Answer */}
                        <div className="flex flex-col sm:flex-row gap-3 py-3 border-y border-zinc-800/20 text-xs">
                          <div className="flex-1">
                            <span className="block text-zinc-400 mb-0.5">Pilihan Anda:</span>
                            <span className={`font-bold ${isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}`}>{selectedOptStr}</span>
                          </div>
                          <div className="flex-1">
                            <span className="block text-zinc-400 mb-0.5">Jawaban Benar:</span>
                            <span className="font-bold text-emerald-500">{correctOptStr}</span>
                          </div>
                        </div>

                        {/* Academic Explanation */}
                        <div className={`border rounded-xl p-4 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-blue-950/10 border-blue-500/10' : 'bg-blue-50/50 border-blue-200/50'
                        }`}>
                          <div className="flex items-center gap-1.5 text-blue-500 text-xs font-bold uppercase tracking-wider mb-1.5">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Pembahasan Akademis Gemini</span>
                          </div>
                          <p className={`leading-relaxed text-xs md:text-sm transition-colors duration-300 ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                          }`}>
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`relative z-10 border-t text-center py-6 text-xs transition-colors duration-300 px-6 ${
        theme === 'dark' ? 'border-zinc-900 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-white text-zinc-400'
      }`}>
        <p className="max-w-6xl mx-auto">&copy; 2026 SKS-Master. Dibuat untuk Gemini Innovation Hackathon 2026. Bebas database, melaju kencang dengan AI.</p>
      </footer>

      {/* 1. WARNING INTEGRITY MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center transition-colors duration-300 ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center animate-none">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className={`text-lg font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>⚠️ Peringatan Integritas!</h3>
              <p className="text-xs text-zinc-400 font-medium">
                Ujian ini mewajibkan mode Fullscreen aktif untuk mencegah kecurangan.
              </p>
            </div>
            <div className={`p-3 border rounded-xl text-xs transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-905/60 border-zinc-850' : 'bg-zinc-101 border-zinc-200'
            }`}>
              Status Pelanggaran: <span className="text-amber-500 font-extrabold">{exitCount} dari 2</span>
            </div>
            <p className="text-xs text-rose-500 leading-relaxed bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 font-medium">
              Perhatian: Keluar dari fullscreen sebanyak 3 kali akan membatalkan kuis Anda secara otomatis!
            </p>
            <button
              type="button"
              onClick={handleRestoreFullscreen}
              className="w-full bg-gemini-gradient text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm active:scale-95 cursor-pointer border border-white/10"
            >
              Masuk Kembali ke Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* 2. BLOCK INTEGRITY MODAL */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center transition-colors duration-300 ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-205 text-zinc-900'
          }`}>
            <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-505 rounded-xl flex items-center justify-center animate-none">
              <XCircle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h3 className={`text-lg font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>🚨 Kuis Dibatalkan!</h3>
              <p className="text-xs text-zinc-400 font-medium">
                Anda terdeteksi melanggar batas keamanan kuis sebanyak 3 kali secara beruntun.
              </p>
            </div>
            <p className="text-xs text-rose-500 leading-relaxed bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 font-medium">
              Akses pengerjaan dibatalkan secara sepihak oleh sistem SKS-Master demi integritas akademik. Semua data kuis Anda telah diriset.
            </p>
            <button
              type="button"
              onClick={handleBlockReset}
              className="w-full bg-gemini-gradient text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm active:scale-95 cursor-pointer border border-white/10"
            >
              Kembali ke Menu Awal
            </button>
          </div>
        </div>
      )}
      {/* Custom Floating PWA Install Button */}
      {deferredPrompt && (
        <button
          type="button"
          onClick={handleInstallPWA}
          className="fixed bottom-8 right-8 z-50 group flex items-center justify-center hover:justify-start gap-2.5 h-12 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-xl hover:scale-[1.05] active:scale-[0.95] w-12 hover:w-[160px] overflow-hidden whitespace-nowrap bg-gemini-gradient text-white border border-white/20 px-3.5"
          title="Install SKS-Master PWA"
        >
          <Download className="w-4.5 h-4.5 shrink-0 text-white animate-bounce" />
          <span className="text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Install Aplikasi
          </span>
        </button>
      )}
    </div>
  );
}
