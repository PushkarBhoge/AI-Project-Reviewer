import PDFDocument from "pdfkit";
import { logger } from "../config/logger.js";

export class PDFService {
  /**
   * Generates a styled PDF report for a given review and pipes it to the response.
   * @param {Object} review Review object populated with project.
   * @param {Object} res Node.js HTTP response object.
   */
  generateReviewPDF(review, res) {
    try {
      // Use bufferPages to allow footers with total page count at the end
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });

      // Pipe to response
      doc.pipe(res);

      const project = review.project || {};
      const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // ─── COVER PAGE / FIRST PAGE ───────────────────────
      
      // Top Brand Color accent bar
      doc.fillColor("#6b21a8").rect(50, 45, 495, 8).fill();
      
      // Header
      doc.y = 70;
      doc.fillColor("#6b21a8").fontSize(26).text("AI CODE AUDIT REPORT", { align: "center", font: "Helvetica-Bold" });
      doc.moveDown(0.2);
      doc.fillColor("#64748b").fontSize(9.5).text("AUTOMATED SECURITY, ARCHITECTURE & PERFORMANCE REVIEW", { align: "center", font: "Helvetica" });
      
      // ─── Metadata Info Grid ────────────────────────────
      const metaY = doc.y + 20;
      doc.fillColor("#f8fafc").rect(50, metaY, 495, 64).fillAndStroke("#f8fafc", "#e2e8f0");
      
      doc.fontSize(9.5).fillColor("#475569");
      doc.fillColor("#0f172a").text("REPOSITORY METADATA", 65, metaY + 10, { font: "Helvetica-Bold" });
      
      doc.fillColor("#475569");
      doc.text(`Project Name: ${project.repoName || "N/A"}`, 65, metaY + 26, { font: "Helvetica" });
      doc.text(`Owner: ${project.repoOwner || "N/A"}`, 65, metaY + 42);
      doc.text(`Primary Language: ${project.language || "N/A"}`, 230, metaY + 26);
      doc.text(`Default Branch: ${project.defaultBranch || "main"}`, 230, metaY + 42);
      doc.text(`Date of Audit: ${dateStr}`, 390, metaY + 26);
      
      // ─── Overall Score Card ────────────────────────────
      const scoreCardY = metaY + 84;
      doc.fillColor("#f8fafc").rect(50, scoreCardY, 495, 80).fillAndStroke("#f8fafc", "#e2e8f0");
      
      doc.fillColor("#0f172a").fontSize(24).text(`${review.overallScore}`, 80, scoreCardY + 20, { font: "Helvetica-Bold" });
      doc.fontSize(8.5).fillColor("#64748b").text("OVERALL RATING / 100", 80, scoreCardY + 48, { font: "Helvetica-Bold" });

      // Score description
      let ratingText = "Needs Improvement";
      let ratingColor = "#ef4444"; // red
      if (review.overallScore >= 80) {
        ratingText = "Excellent Quality";
        ratingColor = "#10b981"; // emerald
      } else if (review.overallScore >= 60) {
        ratingText = "Good / Satisfactory";
        ratingColor = "#f59e0b"; // amber
      }

      doc.fillColor(ratingColor).fontSize(14).text(ratingText, 210, scoreCardY + 22, { font: "Helvetica-Bold" });
      doc.fillColor("#475569").fontSize(9).text("The codebase was assessed across 7 key architectural dimensions by the Gemini AI code reviewing agent. Subscores are outlined in the dimension breakdown matrix below.", 210, scoreCardY + 40, { width: 310, lineGap: 1.5 });

      // ─── Category Breakdown Table ──────────────────────
      const tableStartY = scoreCardY + 105;
      doc.y = tableStartY;
      
      doc.fillColor("#0f172a").fontSize(12).text("Auditing Dimensions Breakdown", { font: "Helvetica-Bold" });
      doc.moveDown(0.6);

      const categories = [
        { key: "codeQuality", label: "Code Quality & Standards" },
        { key: "security", label: "Security & Vulnerabilities" },
        { key: "performance", label: "Performance Audit" },
        { key: "documentation", label: "Documentation & Readme" },
        { key: "bestPractices", label: "Architecture & MVC Layering" },
        { key: "testing", label: "Testing Suite Config" },
        { key: "uiux", label: "UI/UX & Accessibility" },
      ];

      let currentY = doc.y;
      doc.fillColor("#f1f5f9").rect(50, currentY, 495, 24).fill();
      
      doc.fillColor("#475569").fontSize(9.5);
      doc.text("Auditing Dimension", 65, currentY + 7, { font: "Helvetica-Bold" });
      doc.text("Score", 240, currentY + 7, { font: "Helvetica-Bold" });
      doc.text("Max Score", 340, currentY + 7, { font: "Helvetica-Bold" });
      doc.text("Status", 440, currentY + 7, { font: "Helvetica-Bold" });
      
      currentY += 24;

      categories.forEach((cat) => {
        const catData = review.categories[cat.key] || {};
        const score = catData.score || 0;
        const maxScore = catData.maxScore || 20;
        const percentage = (score / maxScore) * 100;

        let statusText = "Critical";
        let statusColor = "#ef4444"; // red
        if (percentage >= 80) {
          statusText = "Excellent";
          statusColor = "#10b981"; // emerald
        } else if (percentage >= 60) {
          statusText = "Satisfactory";
          statusColor = "#f59e0b"; // amber
        }

        // Draw Row Border/Background
        doc.strokeColor("#f1f5f9").lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();

        doc.fillColor("#334155").fontSize(9.5);
        doc.text(cat.label, 65, currentY + 7, { font: "Helvetica" });
        doc.text(`${score}`, 240, currentY + 7);
        doc.text(`${maxScore}`, 340, currentY + 7);
        doc.fillColor(statusColor).text(statusText, 440, currentY + 7, { font: "Helvetica-Bold" });

        currentY += 24;
      });

      // Bottom border of table
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();
      doc.y = currentY + 20;
      doc.x = 50; // Reset X coordinate to left margin

      // ─── EXECUTIVE SUMMARY ─────────────────────────────
      const summaryText = review.summary || "No summary provided.";
      const summaryHeight = 25 + doc.heightOfString(summaryText, { lineGap: 3.5, width: 495 });

      if (doc.y + summaryHeight > 730) {
        doc.addPage();
      }

      doc.fillColor("#0f172a").fontSize(14).text("Executive Summary", { font: "Helvetica-Bold" });
      doc.moveDown(0.6);
      doc.fillColor("#334155").fontSize(10).text(summaryText, { lineGap: 3.5, width: 495 });
      doc.moveDown(1.5);

      // ─── ACTION ITEMS ROADMAP ──────────────────────────
      if (review.recommendations && review.recommendations.length > 0) {
        // Calculate estimated header + first recommendation height
        const firstRec = review.recommendations[0];
        const firstRecHeight = doc.heightOfString(firstRec, { width: 480, lineGap: 3 }) + 6;
        
        if (doc.y + 35 + firstRecHeight > 730) {
          doc.addPage();
        }

        doc.fillColor("#0f172a").fontSize(14).text("Prioritized Action Roadmap", { font: "Helvetica-Bold" });
        doc.moveDown(0.8);

        review.recommendations.forEach((rec) => {
          const recHeight = doc.heightOfString(rec, { width: 480, lineGap: 3 }) + 6;
          if (doc.y + recHeight > 730) {
            doc.addPage();
          }
          doc.fontSize(10).fillColor("#6b21a8").text(`[ ]  `, { font: "Helvetica-Bold", continued: true })
             .fillColor("#334155").text(rec, { font: "Helvetica", lineGap: 3 });
          doc.moveDown(0.6);
        });
        doc.moveDown(1.5);
      }

      // ─── FILE-SPECIFIC SUGGESTIONS ──────────────────────
      if (review.suggestions && review.suggestions.length > 0) {
        if (doc.y + 35 > 730) {
          doc.addPage();
        }
        
        doc.fillColor("#0f172a").fontSize(14).text("File-Specific Details & Suggestions", { font: "Helvetica-Bold" });
        doc.moveDown(0.8);

        review.suggestions.forEach((sug) => {
          const severityColor = sug.severity === "high" ? "#ef4444" : sug.severity === "medium" ? "#f59e0b" : "#64748b";
          const severityBg = sug.severity === "high" ? "#fef2f2" : sug.severity === "medium" ? "#fffbeb" : "#f8fafc";
          const severityText = sug.severity.toUpperCase();

          const messageHeight = doc.heightOfString(sug.message, { width: 465, lineGap: 1.5 });
          const cardHeight = 10 + 14 + 8 + messageHeight + 12; // padding top + severity-row + gap + text + padding bottom

          // Check page overflow
          if (doc.y + cardHeight > 730) {
            doc.addPage();
          }

          const cardY = doc.y;
          // Draw background card
          doc.fillColor(severityBg).rect(50, cardY, 495, cardHeight).fillAndStroke(severityBg, "#e2e8f0");
          // Draw severity left-accent line
          doc.strokeColor(severityColor).lineWidth(4).moveTo(50, cardY).lineTo(50, cardY + cardHeight).stroke();

          // Render text inside
          doc.fillColor(severityColor).fontSize(9).text(severityText, 65, cardY + 10, { font: "Helvetica-Bold" });
          doc.fillColor("#64748b").fontSize(9).text(`File: ${sug.file}  |  Line: ${sug.line}`, 150, cardY + 10, { font: "Helvetica" });
          doc.fillColor("#1e293b").fontSize(9.5).text(sug.message, 65, cardY + 28, { font: "Helvetica", width: 465, lineGap: 1.5 });

          doc.y = cardY + cardHeight + 12; // Advance doc pointer plus vertical spacing
        });
      }

      // ─── POST-PROCESS PAGE NUMBERS & FOOTERS ───────────
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        // Draw top accent bar on later pages too
        if (i > 0) {
          doc.fillColor("#6b21a8").rect(50, 45, 495, 4).fill();
        }

        // Draw footer line
        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 780).lineTo(545, 780).stroke();
        
        // Footer text
        doc.fillColor("#94a3b8").fontSize(8);
        doc.text(`AI Project Reviewer | Generated on ${dateStr}`, 50, 788, { font: "Helvetica" });
        doc.text(`Page ${i + 1} of ${pages.count}`, 50, 788, { align: "right", width: 495, font: "Helvetica" });
      }

      // End document
      doc.end();
    } catch (error) {
      logger.error(`Failed to generate PDF document: ${error.message}`);
      res.status(500).json({ success: false, message: "Failed to generate report PDF" });
    }
  }
}
export const pdfService = new PDFService();
