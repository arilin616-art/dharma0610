/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sutra } from "../types";
import { Send, User, ChevronRight, CheckSquare, Plus, CornerDownRight } from "lucide-react";

interface ReportFormProps {
  sutras: Sutra[];
  selectedSutra: Sutra;
  onSutraChange: (sutra: Sutra) => void;
  onSubmitReport: (data: {
    userName: string;
    reportDate: string;
    sutraId: string;
    counts: number;
    dedication: string;
  }) => void;
  isSubmitting: boolean;
  prefilledCount?: number;
}

export default function ReportForm({
  sutras,
  selectedSutra,
  onSutraChange,
  onSubmitReport,
  isSubmitting,
  prefilledCount
}: ReportFormProps) {
  const [userName] = useState<string>("同修大德");
  const [reportDate, setReportDate] = useState<string>(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().split("T")[0];
  });
  const [customCounts, setCustomCounts] = useState<number | "">(1);

  // Update count preset when sutra or prefilledCount changes
  useEffect(() => {
    if (prefilledCount !== undefined && prefilledCount > 0) {
      setCustomCounts(prefilledCount);
    } else {
      setCustomCounts(selectedSutra.category === "buddha" ? 100 : 1);
    }
  }, [selectedSutra, prefilledCount]);

  const handleQuickAdd = (value: number) => {
    setCustomCounts(prev => {
      const base = typeof prev === "number" ? prev : 0;
      return Math.max(1, base + value);
    });
  };

  const checkAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCounts = typeof customCounts === "number" ? customCounts : 0;
    if (finalCounts <= 0) {
      alert("請輸入大於 0 的誦經/念佛遍（聲）數。");
      return;
    }

    onSubmitReport({
      userName: userName.trim(),
      reportDate,
      sutraId: selectedSutra.id,
      counts: Math.floor(finalCounts),
      dedication: ""
    });

    // Reset counts based on context
    setCustomCounts(selectedSutra.category === "buddha" ? 100 : 1);
  };

  return (
    <div id="report-sheet" className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden font-serif p-4.5 flex flex-col gap-3.5">
      
      {/* Bento Header */}
      <div className="border-b border-stone-150 pb-3">
        <div className="text-[10px] font-bold text-amber-700 tracking-[0.25em] uppercase mb-0.5">DEDICATION FORM / 功德記</div>
        <h2 className="text-lg font-serif font-black text-stone-950 tracking-tight">誦經次數登錄</h2>
      </div>

      <form onSubmit={checkAndSubmit} className="space-y-4">
        {/* Row 1: Date only (Name is anonymous/implied) */}
        <div>
          <label className="block text-xs font-bold text-stone-400 mb-1 uppercase tracking-wider">
            共修/登錄日期：
          </label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
            className="w-full bg-stone-50 border border-stone-200 hover:border-stone-400 focus:border-amber-600 text-stone-850 text-sm py-2 px-3 rounded-xl focus:outline-none transition-all cursor-pointer font-sans"
          />
        </div>

        {/* Row 2: Selected Sutra */}
        <div>
          <label className="block text-xs font-bold text-stone-400 mb-1 uppercase tracking-wider">
            誦經經文：
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sutras.map((s) => {
              const isActive = s.id === selectedSutra.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSutraChange(s)}
                  className={`py-2.5 px-3 rounded-xl border transition-all flex items-center justify-center h-14 cursor-pointer text-center ${
                    isActive
                      ? "border-amber-600 bg-amber-50 text-amber-955 shadow-2xs font-extrabold text-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 text-xs"
                  }`}
                >
                  <span className="block truncate leading-tight">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Chanting counts */}
        <div>
          <label className="block text-xs font-bold text-stone-400 mb-1 uppercase tracking-wider">
            本次持誦次數：
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="number"
                min="1"
                step="1"
                value={customCounts}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setCustomCounts("");
                  } else {
                    const parsed = parseInt(val, 10);
                    setCustomCounts(isNaN(parsed) ? "" : parsed);
                  }
                }}
                onBlur={() => {
                  if (customCounts === "" || customCounts <= 0) {
                    setCustomCounts(1);
                  }
                }}
                required
                className="w-full bg-stone-50 border border-stone-200 text-stone-850 focus:border-amber-600 text-sm font-bold py-2 px-3 rounded-xl focus:outline-none transition-all outline-none font-serif"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">
                部
              </span>
            </div>

            {/* Quick Increment Buttons based on category */}
            <div className="flex gap-1.5 select-none flex-shrink-0">
              {selectedSutra.category === "buddha" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(100)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-bold py-2.5 px-2.5 rounded-lg transition cursor-pointer"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(1000)}
                    className="bg-amber-100/50 hover:bg-amber-100 text-amber-900 text-xs font-sans font-bold py-2.5 px-2.5 rounded-lg border border-amber-200 transition cursor-pointer"
                  >
                    +1K
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(1)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-bold py-2.5 px-3 rounded-lg transition cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(7)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-bold py-2.5 px-3 rounded-lg transition cursor-pointer"
                  >
                    +7
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(21)}
                    className="bg-amber-100/50 hover:bg-amber-100 text-amber-900 text-xs font-sans font-bold py-2.5 px-3 rounded-lg border border-amber-200 transition cursor-pointer"
                  >
                    +21
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 font-extrabold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.005] active:scale-95 text-xs tracking-widest font-serif outline-none"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在登錄功德，請收攝散亂...
            </>
          ) : (
            <>
              <Send size={14} />
              登錄誦經部數
            </>
          )}
        </button>
      </form>
    </div>
  );
}
