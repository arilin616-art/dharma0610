/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ChantingReport } from "./src/types";

// Prepare data storage path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");

// Define seed mock data to make the system rich and realistic upon initial loading
const INITIAL_REPORTS: ChantingReport[] = [];

function readDb(): ChantingReport[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_REPORTS, null, 2), "utf-8");
      return INITIAL_REPORTS;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content) as ChantingReport[];
  } catch (error) {
    console.error("Error reading database file, returning default initial reports:", error);
    return INITIAL_REPORTS;
  }
}

function writeDb(reports: ChantingReport[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to database file:", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Configuration to support cross-origin requests from custom static domains like GitHub Pages
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // JSON Body Parser with 5mb limit
  app.use(express.json({ limit: "5mb" }));

  // API 1: Health Checking
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 2: Get all reports
  app.get("/api/reports", (req, res) => {
    try {
      const reports = readDb();
      // Sort with newest reports first
      const sorted = [...reports].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sorted);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve chanting reports." });
    }
  });

  // API 3: Submit a new report
  app.post("/api/reports", (req, res) => {
    try {
      const { userName, reportDate, sutraId, counts, dedication } = req.body;

      // Validation
      if (!userName || typeof userName !== "string" || userName.trim() === "") {
        return res.status(400).json({ error: "請輸入有效的法名或姓名。" });
      }
      if (!sutraId || typeof sutraId !== "string") {
        return res.status(400).json({ error: "請選擇正確的佛學或經咒項目。" });
      }
      if (!counts || typeof counts !== "number" || counts <= 0) {
        return res.status(400).json({ error: "本次持誦次數必須大於 0。" });
      }

      const validatedDate = reportDate && typeof reportDate === "string" 
        ? reportDate 
        : new Date().toISOString().split("T")[0];

      const cleanDedication = dedication && typeof dedication === "string" 
        ? dedication 
        : "願以此功德，莊嚴佛淨土。上報四重恩，下濟三途苦。若有見聞者，悉發菩提心。盡此一報身，同生極樂國。";

      const reports = readDb();
      const newReport: ChantingReport = {
        id: "rep_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
        userName: userName.trim(),
        reportDate: validatedDate,
        sutraId,
        counts: Math.floor(counts),
        dedication: cleanDedication.trim(),
        createdAt: new Date().toISOString()
      };

      reports.push(newReport);
      const writeSuccess = writeDb(reports);

      if (!writeSuccess) {
        return res.status(500).json({ error: "資料庫寫入失敗。" });
      }

      res.status(201).json(newReport);
    } catch (err) {
      console.error("Error core writing:", err);
      res.status(500).json({ error: "登錄提交時發生錯誤，請稍後再試。" });
    }
  });

  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Zen Chants] Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
