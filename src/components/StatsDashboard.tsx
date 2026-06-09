/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ChantingReport, Sutra } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Award, Search, RefreshCw, Heart, Calendar, Clock, Volume2, Sparkles } from "lucide-react";

interface StatsDashboardProps {
  reports: ChantingReport[];
  sutras: Sutra[];
  onResetDb: () => void;
}

export default function StatsDashboard({ reports, sutras, onResetDb }: StatsDashboardProps) {
  const [filterSutraId, setFilterSutraId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // 1. Calculate aggregated counts per sutra
  const aggregatedStats = useMemo(() => {
    const statsMap: Record<string, { total: number; count: number }> = {};
    
    // Initialize
    sutras.forEach(s => {
      statsMap[s.id] = { total: 0, count: 0 };
    });

    // Populate
    reports.forEach(r => {
      if (statsMap[r.sutraId]) {
        statsMap[r.sutraId].total += r.counts;
        statsMap[r.sutraId].count += 1;
      }
    });

    return statsMap;
  }, [reports, sutras]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSutra = filterSutraId === "all" || r.sutraId === filterSutraId;
      const matchesSearch = 
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.dedication.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSutra && matchesSearch;
    });
  }, [reports, filterSutraId, searchQuery]);

  // Format utility for large numbers
  const formatNum = (num: number) => {
    return num.toLocaleString();
  };

  const handleResetClick = async () => {
    if (confirm("資料庫重新設定後，所有您手動提交的回報紀錄將會清空。確認要重設嗎？")) {
      setIsResetting(true);
      await onResetDb();
      setIsResetting(false);
    }
  };

  return (
    <div id="stats-dashboard" className="space-y-3.5 font-serif select-none">
      {/* SECTION 0: BENTO QUICK STATS OVERVIEW (Highly compact 9:16 edition) */}
      <div className="grid grid-cols-1 gap-2.5 items-stretch">
        
        {/* White Bento card */}
        <div className="bg-white border border-stone-200/75 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-600/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-end z-10 mb-2">
            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-sans border border-emerald-200/40 px-1.5 py-0.5 rounded-full select-none">
              ● 雲端同步
            </span>
          </div>

          <div className="my-1.5 z-10">
            <div className="text-4xl font-sans font-black tracking-tight text-amber-600">
              {formatNum(reports.reduce((acc, curr) => acc + curr.counts, 0))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-150 z-10">
            <span>累計誦經部數</span>
            <span className="font-sans font-bold text-stone-900">{reports.length} 筆</span>
          </div>
        </div>

      </div>

      {/* SECTION 1: Collective Progress Visualizers (全體道親持誦一覽) */}
      <div className="bg-white rounded-xl border border-stone-200/75 p-3.5 shadow-2xs">
        <div className="flex flex-col gap-0.5 border-b border-stone-150 pb-2 mb-2.5">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-1">
            <Sparkles className="text-amber-600 animate-pulse" size={11} />
            全體道親持誦一覽
          </h3>
        </div>

        {/* Bento Grid layout for individual Sutra Progress circles */}
        <div className="grid grid-cols-1 gap-2">
          {sutras.map((sutra) => {
            const stats = aggregatedStats[sutra.id] || { total: 0, count: 0 };
            const percent = Math.min(100, Math.floor((stats.total / 1000) * 100));
            
            // Circular SVG calculations (compact for portrait dimensions)
            const radius = 32;
            const strokeWidth = 4;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percent / 100) * circumference;

            return (
              <div 
                key={sutra.id} 
                className="bg-stone-50 border border-stone-150 rounded-xl p-2.5 shadow-3xs flex items-center justify-between gap-2"
              >
                <div className="flex-grow min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded select-none ${
                    sutra.category === "sutra" ? "bg-amber-100/70 text-amber-900" :
                    sutra.category === "mantra" ? "bg-emerald-100/70 text-emerald-950" : "bg-purple-100/70 text-purple-950"
                  }`}>
                    {sutra.category === "sutra" ? "經典" : sutra.category === "mantra" ? "神咒" : "佛號"}
                  </span>
                  <h4 className="text-xs md:text-sm font-black text-stone-900 mt-1 truncate">{sutra.name}</h4>
                  
                  <div className="mt-1.5 text-[11px] text-stone-600 flex justify-between gap-1">
                    <span>累計 / 大願：</span>
                    <span className="text-stone-900 font-bold truncate">
                      {formatNum(stats.total)} / 1,000 部
                    </span>
                  </div>
                </div>

                {/* Circular Progress Gauge */}
                <div className="relative w-11 h-11 flex items-center justify-center select-none flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      className="stroke-stone-200"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      transform="scale(0.55) translate(18, 18)"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      className="stroke-amber-600"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="scale(0.55) translate(18, 18)"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="font-sans text-xs font-black text-amber-700">{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Dynamic Timeline Feed (大眾功德芳名 / 迴向看板) */}
      <div className="bg-white rounded-xl border border-stone-200/75 p-3.5 shadow-2xs">
        <h3 className="text-sm font-black text-stone-900 border-b border-stone-150 pb-2 mb-2.5 flex items-center justify-between">
          <span>隨喜功德錄・迴向祈願牆</span>
          <span className="text-xs text-stone-400 font-normal">共 {reports.length} 筆</span>
        </h3>

        {/* Toolbar & Filter */}
        <div className="flex flex-col gap-1.5 mb-2.5">
          {/* Sutra Dropdown Filter */}
          <select
            value={filterSutraId}
            onChange={(e) => setFilterSutraId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-750 text-xs py-1.5 px-2 rounded-lg cursor-pointer outline-none transition-all"
          >
            <option value="all">=== 顯示所有修持 ===</option>
            {sutras.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Core Search Bar */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Search size={11} />
            </span>
            <input
              type="text"
              placeholder="搜尋法名或迴向內容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-stone-750 text-xs py-1.5 pl-7 pr-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Scrollable list with animations - constraint height for 9:16 layout viewport */}
        <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const sDef = sutras.find(s => s.id === report.sutraId);
                const isSystemSeed = report.id.startsWith("mock-");
                
                return (
                  <motion.div
                    key={report.id}
                    layoutId={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="bg-stone-50 rounded-xl border border-stone-150 p-2.5 shadow-3xs relative"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Name */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-stone-200 to-stone-100 border border-stone-300/40 flex items-center justify-center text-stone-700 font-bold shadow-3xs text-xs select-none">
                          {report.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-stone-880 block leading-tight">{report.userName}</span>
                          <span className="text-[10px] text-stone-500 block mt-0.5 max-w-[120px] truncate leading-none">
                            {sDef?.name || report.sutraId}
                          </span>
                        </div>
                      </div>

                      {/* Achievement badge */}
                      <div className="flex flex-col items-end text-right">
                        <span className="bg-amber-100/50 border border-amber-200/50 font-serif font-black rounded px-1.5 py-0.5 text-xs text-amber-900">
                          {formatNum(report.counts)} 部
                        </span>
                        
                        {/* Timestamps */}
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                          <span>{report.reportDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dedication quote box */}
                    <div className="bg-white border-l border-amber-600/40 rounded-r p-2 text-xs text-stone-700 leading-normal relative italic select-text shadow-3xs">
                      <p>{report.dedication}</p>
                    </div>

                    {/* Seed indicator */}
                    {isSystemSeed && (
                      <span className="absolute bottom-1 right-2 text-[9.5px] text-stone-400 font-sans select-none italic scale-90">
                        修持種子
                      </span>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-stone-200 text-stone-400">
                <p className="text-xs">未找到符合篩選條件的登錄。</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>


    </div>
  );
}
