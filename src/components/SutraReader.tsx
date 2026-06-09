/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sutra } from "../types";
import { BookOpen, CheckSquare, Sparkles, AlertCircle, Quote } from "lucide-react";

interface SutraReaderProps {
  sutras: Sutra[];
  selectedSutra: Sutra;
  onSutraChange: (sutra: Sutra) => void;
  onStartChanting: () => void;
}

export default function SutraReader({
  sutras,
  selectedSutra,
  onSutraChange,
  onStartChanting
}: SutraReaderProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");

  const fontSizeClass = {
    sm: "text-sm leading-7",
    base: "text-base leading-8",
    lg: "text-lg leading-9",
    xl: "text-xl leading-10"
  }[fontSize];

  return (
    <div id="sutra-reader-room" className="font-serif flex flex-col gap-2.5">
      {/* Sleek, space-saving selector dropdown at top */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-3 shadow-2xs select-none">
        <label className="block text-[9px] font-black text-amber-800 tracking-[0.16em] mb-1.5 uppercase">
          ✦ 誦經經文：
        </label>
        <select
          value={selectedSutra.id}
          onChange={(e) => {
            const s = sutras.find(x => x.id === e.target.value);
            if (s) onSutraChange(s);
          }}
          className="w-full bg-stone-50 border border-stone-200 text-stone-850 text-xs font-bold py-2 px-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer outline-none transition-all"
        >
          {sutras.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.wordCount}字)
            </option>
          ))}
        </select>
      </div>

      {/* HOLY DEEP READING AREA */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-3.5 flex flex-col justify-between shadow-2xs relative">
        
        <div>
          {/* Controls: Title and font settings - shrink space */}
          <div className="flex justify-between items-center gap-1.5 border-b border-stone-150 pb-2.5 mb-3.5">
            <div>
              <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5 pr-2">
                <Sparkles size={13} className="text-amber-600 animate-pulse" />
                {selectedSutra.title}
              </h2>
              <p className="text-[9px] text-stone-400 mt-0.5 uppercase tracking-wide">
                字數 約 {selectedSutra.wordCount} 字
              </p>
            </div>

            {/* Font size selectors - tightly compact */}
            <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200/50 text-[10px] select-none">
              {(["sm", "base", "lg", "xl"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`w-5.5 h-5.5 rounded transition-all text-[10px] font-black cursor-pointer ${
                    fontSize === size
                      ? "bg-stone-900 text-amber-50 shadow-2xs"
                      : "text-stone-600 hover:bg-stone-200/50"
                  }`}
                >
                  {size === "sm" ? "小" : size === "base" ? "中" : size === "lg" ? "大" : "特"}
                </button>
              ))}
            </div>
          </div>

          {/* Core Text content scrolls inside - generous height so user scrolls less */}
          <div className="bg-stone-50 border border-stone-150 rounded-xl p-3.5 shadow-inner overflow-y-auto max-h-[480px] text-stone-800 space-y-3.5 scrollbar-thin">
            <div className="text-center text-[10px] tracking-widest text-amber-700 font-bold border-b border-dashed border-stone-200 pb-2 mb-2 select-none">
              禮敬一心 · 至誠念誦
            </div>

            {selectedSutra.fullText.map((para, index) => {
              return (
                <div key={index}>
                  <p className={`${fontSizeClass} font-serif whitespace-pre-line tracking-wide pl-1 select-text text-stone-900 font-medium`}>
                    {para}
                  </p>
                </div>
              );
            })}

            <div className="text-center text-[10px] tracking-widest text-amber-700 font-bold border-t border-dashed border-stone-200 pt-3 select-none flex justify-center items-center gap-1">
              《恭誦畢 · 功德圓滿》
            </div>
          </div>
        </div>

        {/* Start practice routing footer - shrunk padding */}
        <div className="mt-3.5 flex flex-col items-stretch gap-2.5 border-t border-stone-100 pt-2.5">
          <div className="text-[9.5px] text-stone-400 flex items-start gap-1 select-none leading-relaxed">
            <AlertCircle size={10} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span>誠讀入心可消萬難。誦畢後，請點擊下方直接進行持誦功德呈送。</span>
          </div>

          <button
            onClick={onStartChanting}
            className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 py-2.5 rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-1 transition cursor-pointer select-none font-serif"
          >
            <CheckSquare size={12} />
            開啟誦經次數登錄 · 恭呈修持迴向
          </button>
        </div>
      </div>
    </div>
  );
}
