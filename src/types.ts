/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sutra {
  id: string;
  name: string;
  title: string;
  category: "sutra" | "mantra" | "buddha";
  shortText?: string;
  fullText: string[];
  phoneticText?: string[]; // pinyin or bopomofo
  wordCount: number;
  metricUnit: string; // e.g. "遍" (times), "聲" (times chanted)
  targetCounts: number; // community goal for this sutra
  recommendCount: number; // standard daily recitation prescription, e.g. 7, 21, 108
  description: string;
}

export interface ChantingReport {
  id: string;
  userName: string;
  reportDate: string; // YYYY-MM-DD
  sutraId: string;
  counts: number;
  dedication: string;
  createdAt: string; // ISO string
}

export interface SummaryStats {
  sutraId: string;
  totalCounts: number;
  reportCount: number;
  targetCounts: number;
}
