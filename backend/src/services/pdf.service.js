import PDFDocument from "pdfkit";
import { logger } from "../config/logger.js";

const PAGE_HEIGHT = 842;
const BOTTOM_SAFE_ZONE = 50;
const FOOTER_Y = 780;
const PAGE_BREAK_AT = PAGE_HEIGHT - BOTTOM_SAFE_ZONE;

export class PDFService {
  generateReviewPDF(review, res) {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
      doc.pipe(res);

      const project = review.project || {};
      const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // ─── COVER PAGE ───────────────────────────────────
      doc.fillColor("#6b21a8").rect(50, 45, 495, 8).fill();

      doc.y = 70;
      doc.fillColor("#6b21a8").fontSize(22).text("REPOLENS AI — DEEP CODE AUDIT REPORT", {
        align: "center",
        font: "Helvetica-Bold",
      });
      doc.moveDown(0.2);
      doc.fillColor("#64748b").fontSize(9.5).text("DEEP AI AUDITS FOR GITHUB REPOSITORIES", {
        align: "center",
        font: "Helvetica",
      });

      // ─── Metadata Info Grid ───────────────────────────
      const metaTitleHeight = 14;
      const metaLineHeight = 16;
      const metaPadding = 12;
      const metaTop = doc.y + 18;

      doc.fillColor("#f8fafc").rect(50, metaTop, 495, metaTitleHeight + metaLineHeight * 2 + metaPadding * 2).fillAndStroke("#f8fafc", "#e2e8f0");

      doc.fillColor("#0f172a").fontSize(9.5).text("REPOSITORY METADATA", 65, metaTop + 10, { font: "Helvetica-Bold" });

      const metaY = metaTop + metaTitleHeight + 4;
      doc.fillColor("#475569").fontSize(9.5);
      doc.text(`Project Name: ${project.repoName || "N/A"}`, 65, metaY, { font: "Helvetica" });
      doc.text(`Owner: ${project.repoOwner || "N/A"}`, 65, metaY + metaLineHeight, { font: "Helvetica" });
      doc.text(`Primary Language: ${project.language || "N/A"}`, 230, metaY, { font: "Helvetica" });
      doc.text(`Default Branch: ${project.defaultBranch || "main"}`, 230, metaY + metaLineHeight, { font: "Helvetica" });
      doc.text(`Date of Audit: ${dateStr}`, 390, metaY, { font: "Helvetica" });

      doc.y = metaTop + metaTitleHeight + metaLineHeight * 2 + metaPadding * 2 + 18;

      // ─── Overall Score Card ───────────────────────────
      const scoreTitleSize = 14;
      const scoreBigSize = 24;
      const scoreLabelSize = 8.5;
      const scoreDescSize = 9;
      const scorePadding = 18;

      const scoreTitle = "Overall Rating";
      const scoreDesc =
        "The codebase was assessed across 7 key architectural dimensions by the AI code reviewing agent. Subscores are outlined in the dimension breakdown matrix below.";

      const scoreTitleH = doc.heightOfString(scoreTitle, { font: "Helvetica-Bold", fontSize: scoreTitleSize });
      const scoreBigH = scoreBigSize + 4;
      const scoreLabelH = scoreLabelSize + 2;
      const scoreDescW = 310;
      const scoreDescH = doc.heightOfString(scoreDesc, { font: "Helvetica", fontSize: scoreDescSize, width: scoreDescW, lineGap: 1.5 });
      const scoreCardHeight = scorePadding + scoreTitleH + 6 + Math.max(scoreBigH, scoreLabelH) + 8 + scoreDescH + scorePadding;

      const scoreCardY = doc.y;
      doc.fillColor("#f8fafc").rect(50, scoreCardY, 495, scoreCardHeight).fillAndStroke("#f8fafc", "#e2e8f0");

      let ratingText = "Needs Improvement";
      let ratingColor = "#ef4444";
      if (review.overallScore >= 80) {
        ratingText = "Excellent Quality";
        ratingColor = "#10b981";
      } else if (review.overallScore >= 60) {
        ratingText = "Good / Satisfactory";
        ratingColor = "#f59e0b";
      }

      const scoreInnerY = scoreCardY + scorePadding;
      doc.fillColor("#0f172a").fontSize(scoreTitleSize).text(scoreTitle, 80, scoreInnerY, { font: "Helvetica-Bold" });

      doc.fillColor("#0f172a").fontSize(scoreBigSize).text(`${review.overallScore}`, 80, scoreInnerY + scoreTitleH + 6, { font: "Helvetica-Bold" });
      doc.fillColor("#64748b").fontSize(scoreLabelSize).text("OVERALL RATING / 100", 80, scoreInnerY + scoreTitleH + 6 + scoreBigH, { font: "Helvetica-Bold" });

      doc.fillColor(ratingColor).fontSize(14).text(ratingText, 210, scoreInnerY + 4, { font: "Helvetica-Bold" });
      doc.fillColor("#475569").fontSize(scoreDescSize).text(scoreDesc, 210, scoreInnerY + 4 + 18, { width: scoreDescW, lineGap: 1.5 });

      doc.y = scoreCardY + scoreCardHeight + 22;

      // ─── Category Breakdown Table ─────────────────────
      const categories = [
        { key: "codeQuality", label: "Code Quality & Standards" },
        { key: "security", label: "Security & Vulnerabilities" },
        { key: "performance", label: "Performance Audit" },
        { key: "documentation", label: "Documentation & Readme" },
        { key: "bestPractices", label: "Architecture & MVC Layering" },
        { key: "testing", label: "Testing Suite Config" },
        { key: "uiux", label: "UI/UX & Developer Experience (DX)" },
      ];

      doc.fillColor("#0f172a").fontSize(12).text("Auditing Dimensions Breakdown", { font: "Helvetica-Bold" });
      doc.moveDown(0.6);

      const rowHeight = 22;
      const headerHeight = 24;
      let tableY = doc.y;

      // Header row
      doc.fillColor("#f1f5f9").rect(50, tableY, 495, headerHeight).fill();
      doc.fillColor("#475569").fontSize(9.5);
      doc.text("Auditing Dimension", 65, tableY + 7, { font: "Helvetica-Bold" });
      doc.text("Score", 240, tableY + 7, { font: "Helvetica-Bold" });
      doc.text("Max Score", 340, tableY + 7, { font: "Helvetica-Bold" });
      doc.text("Status", 440, tableY + 7, { font: "Helvetica-Bold" });
      tableY += headerHeight;

      categories.forEach((cat, idx) => {
        const catData = review.categories[cat.key] || {};
        const score = catData.score || 0;
        const maxScore = catData.maxScore || 20;
        const percentage = (score / maxScore) * 100;

        let statusText = "Critical";
        let statusColor = "#ef4444";
        if (percentage >= 80) {
          statusText = "Excellent";
          statusColor = "#10b981";
        } else if (percentage >= 60) {
          statusText = "Satisfactory";
          statusColor = "#f59e0b";
        }

        if (idx % 2 === 1) {
          doc.fillColor("#f8fafc").rect(50, tableY, 495, rowHeight).fill();
        }

        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, tableY).lineTo(545, tableY).stroke();

        doc.fillColor("#334155").fontSize(9.5);
        doc.text(cat.label, 65, tableY + 7, { font: "Helvetica" });
        doc.text(`${score}`, 240, tableY + 7, { font: "Helvetica-Bold" });
        doc.text(`${maxScore}`, 340, tableY + 7, { font: "Helvetica-Bold" });
        doc.fillColor(statusColor).text(statusText, 440, tableY + 7, { font: "Helvetica-Bold" });

        tableY += rowHeight;
      });

      doc.strokeColor("#e2e8f0").lineWidth(1.5).moveTo(50, tableY).lineTo(545, tableY).stroke();
      doc.y = tableY + 18;

      // ─── EXECUTIVE SUMMARY ─────────────────────────────
      if (doc.y + 20 > PAGE_BREAK_AT) {
        doc.addPage();
      }

      const summaryText = review.summary || "No summary provided.";
      const summaryHeaderH = doc.heightOfString("Executive Summary", { font: "Helvetica-Bold", fontSize: 14 }) + 4;
      const summaryBodyH = doc.heightOfString(summaryText, { font: "Helvetica", fontSize: 10, width: 495, lineGap: 3.5 });
      const summaryBlockH = summaryHeaderH + summaryBodyH + 30;

      if (doc.y + summaryBlockH > PAGE_BREAK_AT) {
        doc.addPage();
      }

      doc.fillColor("#0f172a").fontSize(14).text("Executive Summary", { font: "Helvetica-Bold" });
      doc.moveDown(0.6);
      doc.fillColor("#334155").fontSize(10).text(summaryText, { lineGap: 3.5, width: 495 });
      doc.moveDown(1.5);

      // ─── ACTION ITEMS ROADMAP ──────────────────────────
      if (review.recommendations && review.recommendations.length > 0) {
        if (doc.y + 30 > PAGE_BREAK_AT) {
          doc.addPage();
        }

        doc.fillColor("#0f172a").fontSize(14).text("Prioritized Action Roadmap", { font: "Helvetica-Bold" });
        doc.moveDown(0.8);

        const recFontSize = 10;
        const recLineGap = 3;
        const recWidth = 480;

        review.recommendations.forEach((rec) => {
          const recText = `[ ]  ${rec}`;
          const recH = doc.heightOfString(recText, { font: "Helvetica", fontSize: recFontSize, width: recWidth, lineGap: recLineGap }) + 6;

          if (doc.y + recH > PAGE_BREAK_AT) {
            doc.addPage();
          }

          doc.fontSize(recFontSize).fillColor("#6b21a8").text(`[ ]  `, { font: "Helvetica-Bold", continued: true })
            .fillColor("#334155").text(rec, { font: "Helvetica", fontSize: recFontSize, width: recWidth - 20, lineGap: recLineGap });
          doc.moveDown(0.6);
        });
        doc.moveDown(1.5);
      }

      // ─── FILE-SPECIFIC SUGGESTIONS ──────────────────────
      if (review.suggestions && review.suggestions.length > 0) {
        if (doc.y + 30 > PAGE_BREAK_AT) {
          doc.addPage();
        }

        doc.fillColor("#0f172a").fontSize(14).text("File-Specific Details & Suggestions", { font: "Helvetica-Bold" });
        doc.moveDown(0.8);

        const cardPaddingX = 15;
        const cardPaddingY = 10;
          const gapAfterHeader = 6;
          const gapAfterMessage = 6;
          const gapAfterSolution = 6;
          const gapAfterSnippet = 12;
          const snippetPadding = 8;

        review.suggestions.forEach((sug) => {
          const isCritical = sug.severity === "critical" || sug.severity === "high";
          const isWarning = sug.severity === "warning" || sug.severity === "medium";

          const severityColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#64748b";
          const severityBg = isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#f8fafc";
          const severityText = (sug.severity || "info").toUpperCase();

          const messageText = sug.message || "";
          const messageFont = { font: "Helvetica", fontSize: 9.5, width: 465 - cardPaddingX * 2, lineGap: 1.5 };
          const messageH = doc.heightOfString(messageText, messageFont);

          let solutionH = 0;
          if (sug.solution) {
            const solutionPrefix = "Fix / Solution: ";
            const solutionFont = { font: "Helvetica", fontSize: 9, width: 455 - cardPaddingX * 2, lineGap: 1.5 };
            solutionH = doc.heightOfString(`${solutionPrefix}${sug.solution}`, solutionFont) + 4;
          }

          let snippetH = 0;
          if (sug.codeSnippet) {
            const snippetFont = { font: "Courier", fontSize: 8.5, width: 448, lineGap: 1.5 };
            snippetH = doc.heightOfString(sug.codeSnippet, snippetFont) + snippetPadding * 2;
          }

          const headerText = `${severityText}                                    File: ${sug.file || "N/A"}  |  Line: ${sug.line || 1}`;
          const headerFont = { font: "Helvetica", fontSize: 9, width: 495 - cardPaddingX * 2, lineGap: 1.2 };
          const headerH = doc.heightOfString(headerText, headerFont);

          const cardHeight = cardPaddingY * 2 + headerH + gapAfterHeader + messageH + (solutionH ? gapAfterSolution + solutionH : 0) + (snippetH ? gapAfterSnippet + snippetH : 0);

          if (doc.y + cardHeight > PAGE_BREAK_AT) {
            doc.addPage();
          }

          const cardY = doc.y;
          doc.fillColor(severityBg).rect(50, cardY, 495, cardHeight).fillAndStroke(severityBg, "#e2e8f0");
          doc.strokeColor(severityColor).lineWidth(4).moveTo(50, cardY).lineTo(50, cardY + cardHeight).stroke();

          let innerY = cardY + cardPaddingY;
          doc.fillColor(severityColor).fontSize(9).text(severityText, 65, innerY, { font: "Helvetica-Bold" });
          doc.fillColor("#64748b").fontSize(9).text(`File: ${sug.file || "N/A"}  |  Line: ${sug.line || 1}`, 150, innerY, { font: "Helvetica" });

          innerY += headerH + gapAfterHeader;
          doc.fillColor("#1e293b").fontSize(9.5).text(messageText, 65, innerY, messageFont);
          innerY += messageH + gapAfterMessage;

          if (sug.solution) {
            doc.fillColor("#d97706").fontSize(9).text("Fix / Solution: ", 65, innerY, { font: "Helvetica-Bold", continued: true });
            doc.fillColor("#334155").fontSize(9).text(sug.solution, { font: "Helvetica", width: 455 - cardPaddingX * 2, lineGap: 1.5 });
            innerY += solutionH + gapAfterSolution;
          }

          if (sug.codeSnippet) {
            doc.fillColor("#0f172a").rect(72, innerY, 450, snippetH).fill();
            doc.fillColor("#10b981").fontSize(8.5).text(sug.codeSnippet, 78, innerY + snippetPadding, { font: "Courier", width: 448, lineGap: 1.5 });
            innerY += snippetH + gapAfterSnippet;
          }

          doc.y = cardY + cardHeight + 12;
        });
      }

      // ─── POST-PROCESS FOOTERS ──────────────────────────
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        if (i > 0) {
          doc.fillColor("#6b21a8").rect(50, 45, 495, 4).fill();
        }

        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, FOOTER_Y).lineTo(545, FOOTER_Y).stroke();

        doc.fillColor("#94a3b8").fontSize(8);
        doc.text(`RepoLens AI — Deep AI Audits for GitHub Repositories | Generated on ${dateStr}`, 50, FOOTER_Y + 8, { font: "Helvetica" });
        doc.text(`Page ${i + 1} of ${pages.count}`, 50, FOOTER_Y + 8, { align: "right", width: 495, font: "Helvetica" });
      }

      doc.end();
    } catch (error) {
      logger.error(`Failed to generate PDF document: ${error.message}`);
      res.status(500).json({ success: false, message: "Failed to generate report PDF" });
    }
  }
}

export const pdfService = new PDFService();
