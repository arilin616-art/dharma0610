/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  HelpCircle, 
  FileCheck, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Info,
  Check,
  UserCheck,
  Wifi,
  Battery,
  Music,
  Share2
} from "lucide-react";

import { SUTRAS_DATA } from "./data/sutras";
import { ChantingReport, Sutra } from "./types";
import ReportForm from "./components/ReportForm";
import StatsDashboard from "./components/StatsDashboard";
import SutraReader from "./components/SutraReader";

// Zen Inspirational Quotes for Spiritual Encouragement
const ZEN_QUOTES = [
  "「萬法皆空，因果不空。」今日之修持，皆為明日解脫之淨因。",
  "「自淨其意，是諸佛教。」心清淨則佛土清淨，一聲稱念萬慮頓消。",
  "「若人散亂心，入於塔廟中，單稱南無佛，皆已成佛道。」心誠則靈，隨喜讚嘆。",
  "「應無所住而生其心。」不念得失，不執福德，老實持誦，功德自然圓滿。",
  "「一水潤萬物，百川合大海。」蓮友共修結社之修行，能集大眾慈悲願力，共融成就波羅蜜。"
];

export default function App() {
  const [reports, setReports] = useState<ChantingReport[]>([]);
  const [selectedSutra, setSelectedSutra] = useState<Sutra>(SUTRAS_DATA[1]); // Let's default to Bai Xiao Jing!
  const [activeTab, setActiveTab] = useState<"stats" | "read" | "report">("read");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [prefilledCount, setPrefilledCount] = useState<number>(0);
  
  // Dynamic simulator clock
  const [currentTime, setCurrentTime] = useState<string>("13:20");

  // Custom modal congratulations state
  const [showAuraModal, setShowAuraModal] = useState<boolean>(false);
  const [latestSubmittedReport, setLatestSubmittedReport] = useState<ChantingReport | null>(null);

  // Quote generator
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  useEffect(() => {
    // Update live clock for mockup
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);

    setQuoteIndex(Math.floor(Math.random() * ZEN_QUOTES.length));
    fetchReports();

    return () => clearInterval(timer);
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error("伺服器連線異常");
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.warn("無法取得伺服器回報，改用本地端暫存暫代:", error);
      const local = localStorage.getItem("zen_chants_reports");
      if (local) {
        setReports(JSON.parse(local));
      } else {
        setReports([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async (formData: {
    userName: string;
    reportDate: string;
    sutraId: string;
    counts: number;
    dedication: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = "傳輸失敗";
        if (contentType && contentType.includes("application/json")) {
          const errJson = await response.json();
          errorMessage = errJson.error || errorMessage;
        } else {
          const errText = await response.text();
          errorMessage = `伺服器錯誤 (${response.status}): ${errText.substring(0, 80)}`;
        }
        throw new Error(errorMessage);
      }

      if (contentType && contentType.includes("application/json")) {
        const newReport: ChantingReport = await response.json();
        
        setReports(prev => [newReport, ...prev]);
        setLatestSubmittedReport(newReport);
        setShowAuraModal(true);
        setPrefilledCount(0); // Reset prefilled woodblock state

        // Save a fallback copy to client storage
        const existingLocal = localStorage.getItem("zen_chants_reports") || "[]";
        try {
          const parsed = JSON.parse(existingLocal);
          localStorage.setItem("zen_chants_reports", JSON.stringify([newReport, ...parsed]));
        } catch (e) {
          localStorage.setItem("zen_chants_reports", JSON.stringify([newReport]));
        }
      } else {
        throw new Error("伺服器未能回傳正確的 JSON 格式功德紀錄。");
      }

    } catch (err: any) {
      alert("登錄失敗：" + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReport = (sutraId: string, count: number) => {
    const selectedS = SUTRAS_DATA.find(s => s.id === sutraId) || selectedSutra;
    setSelectedSutra(selectedS);
    setPrefilledCount(count);
    setActiveTab("report");
  };

  const handleResetDb = async () => {
    try {
      const response = await fetch("/api/reports/reset", {
        method: "POST"
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = "重設失敗";
        if (contentType && contentType.includes("application/json")) {
          const errJson = await response.json();
          errorMessage = errJson.error || errorMessage;
        } else {
          const errText = await response.text();
          errorMessage = `伺服器錯誤 (${response.status}): ${errText.substring(0, 80)}`;
        }
        throw new Error(errorMessage);
      }
      
      if (contentType && contentType.includes("application/json")) {
        const resData = await response.json();
        setReports(resData.reports);
        localStorage.removeItem("zen_chants_reports");
        alert("資料庫重設成功！已清空所有修持回報紀錄。");
      } else {
        throw new Error("伺服器重新整理時未回傳 JSON 格式。");
      }
    } catch (e: any) {
      alert("重設失敗: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 md:bg-[#1a1714] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-850 via-[#14120f] to-black text-stone-800 font-sans antialiased flex flex-col items-center justify-center p-0 md:p-4 selection:bg-amber-100/60 selection:text-amber-900 overflow-hidden select-none">
      
      {/* 🔮 SPACIOUS COMFORTABLE VIEWPORT CARD (Fluid on mobile, 540px wide & 840px tall on Desktop for easy reading) */}
      <div 
        id="portable-dharma-aspect-frame" 
        className="w-full max-w-[540px] h-screen md:h-[840px] md:max-h-[840px] bg-stone-50 md:rounded-[24px] border-none md:border md:border-stone-800/10 md:shadow-[0_30px_70px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col relative"
      >
        {/* COMPACT APP COMPASSION HEADER */}
        <header className="bg-white px-4 py-2.5 border-b border-stone-200/70 select-none flex-shrink-0 z-15 shadow-sm">
          <div className="flex justify-between items-center gap-1">
            <div>
              <div className="text-[8.5px] font-bold text-amber-700 tracking-[0.25em] uppercase flex items-center gap-1">
                <Sparkles size={8} className="text-amber-600 animate-pulse" />
                Dharma 共修集氣閣
              </div>
              <h1 className="text-base font-serif font-black text-stone-950 tracking-tight mt-0.5">
                中元孝親祈福誦經
              </h1>
            </div>
            
            {/* Profile indicator removed as per request */}
          </div>

          {/* Inspirational quotes slider - tightly shrunk */}
          <div className="mt-1.5 bg-stone-50 border border-stone-200/50 rounded-xl px-2.5 py-1 text-[9px] text-stone-500 font-serif leading-normal italic flex items-start gap-1 w-full shadow-inner">
            <span className="text-amber-600 font-bold flex-shrink-0 leading-none">蓮云:</span>
            <span className="line-clamp-1">{ZEN_QUOTES[quoteIndex]}</span>
          </div>
        </header>

        {/* TOP MOBILE TAB BAR NAVIGATION (Sticky at top of content area) */}
        <nav 
          id="muyu-mobi-top-nav" 
          className="bg-white border-b border-stone-200/80 px-3 py-1 flex justify-around items-center select-none z-30 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex-shrink-0"
        >
          {/* T1: Stats */}
          <button
            onClick={() => { setActiveTab("stats"); setPrefilledCount(0); }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 w-18 transition-all duration-150 cursor-pointer ${
              activeTab === "stats" ? "text-amber-800 scale-105 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Award size={18} className={activeTab === "stats" ? "text-amber-700 h-5" : "h-5"} />
            <span className="text-xs font-serif">功德錄</span>
          </button>

          {/* T2: Read */}
          <button
            onClick={() => { setActiveTab("read"); setPrefilledCount(0); }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 w-22 transition-all duration-150 cursor-pointer ${
              activeTab === "read" ? "text-amber-800 scale-105 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <BookOpen size={18} className={activeTab === "read" ? "text-amber-700 h-5" : "h-5"} />
            <span className="text-xs font-serif">誦經本</span>
          </button>

          {/* T4: Report */}
          <button
            onClick={() => { setActiveTab("report"); }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 w-28 transition-all duration-150 cursor-pointer ${
              activeTab === "report" ? "text-amber-800 scale-105 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <FileCheck size={18} className={activeTab === "report" ? "text-amber-700 h-5" : "h-5"} />
            <span className="text-xs font-serif">誦經次數登錄</span>
          </button>
        </nav>

        {/* 📜 CENTRAL DYNAMIC PANEL CANVAS (Fully Scrollable) */}
        <div id="portable-scroll-panel" className="flex-grow overflow-y-auto bg-stone-50/50 pb-6 select-text">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="p-4"
            >
              {activeTab === "stats" && (
                <StatsDashboard
                  reports={reports}
                  sutras={SUTRAS_DATA}
                  onResetDb={handleResetDb}
                />
              )}

              {activeTab === "read" && (
                <SutraReader
                  sutras={SUTRAS_DATA}
                  selectedSutra={selectedSutra}
                  onSutraChange={setSelectedSutra}
                  onStartChanting={() => setActiveTab("report")}
                />
              )}

              {activeTab === "report" && (
                <ReportForm
                  sutras={SUTRAS_DATA}
                  selectedSutra={selectedSutra}
                  onSutraChange={setSelectedSutra}
                  onSubmitReport={handleSubmitReport}
                  isSubmitting={isSubmitting}
                  prefilledCount={prefilledCount > 0 ? prefilledCount : undefined}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* 🌟 AMAZING EMBEDDED DEDICATION SUCCESS POPUP */}
      <AnimatePresence>
        {showAuraModal && latestSubmittedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuraModal(false)}
              className="absolute inset-0 bg-stone-950/65 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative bg-white rounded-[28px] border-2 border-amber-600 p-6 max-w-[340px] w-full shadow-2xl text-center z-10 font-serif"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center mx-auto shadow-md mb-3 select-none">
                <Check size={22} strokeWidth={3.5} />
              </div>

              <h3 className="text-lg font-bold text-stone-900 tracking-wider">修持成果・已登錄</h3>
              <p className="text-[11px] text-stone-400 mt-1 uppercase tracking-wide">
                -同修大德 恭敬施禮-
              </p>

              <div className="my-4 bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-xs text-stone-700 leading-relaxed text-left">
                <p className="font-semibold text-stone-950 pb-1 border-b border-stone-200/50 mb-1.5 flex justify-between">
                  <span>恭誦：《{SUTRAS_DATA.find(s => s.id === latestSubmittedReport.sutraId)?.name}》</span>
                  <span className="text-amber-700">{latestSubmittedReport.counts} 部</span>
                </p>
                <p className="italic text-stone-500 leading-relaxed pl-2 border-l border-amber-600/30">
                  {latestSubmittedReport.dedication}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAuraModal(false);
                  setActiveTab("stats");
                }}
                className="w-full bg-stone-900 hover:bg-stone-850 text-amber-50 py-3 rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <UserCheck size={13} />
                合掌頂禮 · 前往功德錄
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
