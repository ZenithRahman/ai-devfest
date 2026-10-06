import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates the tender package PDF according to Section 6 and bonus specifications.
 * 
 * @param {Object} tender - Tender details object
 * @param {Array} requirements - List of requirements sorted by order
 * @param {Object} matches - Mapping of reqId -> fileId
 * @param {Array} uploadedFiles - List of uploaded file objects with arrayBuffer & name
 * @param {Object} options - { includeIndexPage: boolean, sealImageBytes: Uint8Array|null, sealPages: string }
 * @param {Function} onProgress - Progress callback (percent, statusText)
 * @returns {Promise<Uint8Array>} The compiled PDF bytes
 */
export async function generateTenderPackage(tender, requirements, matches, uploadedFiles, options = {}, onProgress = () => {}) {
  onProgress(10, "Initializing document package...");

  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // Filter included documents in strict order
  // Section 6.2: "The documents come after the cover, sorted by order. Skip optional documents with no file."
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs = [];

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    if (fileId) {
      const fileObj = uploadedFiles.find(f => f.id === fileId);
      if (fileObj) {
        includedDocs.push({
          req,
          fileObj
        });
      }
    }
  }

  // Today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const tenderId = tender.tender_id || 'T-PACKAGE';

  // --- Step 1: Create Cover Page (Section 6.1) ---
  onProgress(20, "Creating cover page...");
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
  const { width: pageWidth, height: pageHeight } = coverPage.getSize();

  // Draw Header decorative line & Title
  coverPage.drawRectangle({
    x: 40,
    y: pageHeight - 60,
    width: pageWidth - 80,
    height: 4,
    color: rgb(0.24, 0.27, 0.75) // Indigo
  });

  coverPage.drawText("TENDER SUBMISSION PACKAGE", {
    x: 40,
    y: pageHeight - 90,
    size: 20,
    font: fontBold,
    color: rgb(0.09, 0.11, 0.19)
  });

  coverPage.drawText("Official Tender Document Dossier", {
    x: 40,
    y: pageHeight - 110,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  // Metadata Box
  const metaBoxY = pageHeight - 270;
  coverPage.drawRectangle({
    x: 40,
    y: metaBoxY,
    width: pageWidth - 80,
    height: 145,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.85, 0.88, 0.95),
    borderWidth: 1
  });

  const metaItems = [
    { label: "Tender ID:", value: tender.tender_id || "N/A" },
    { label: "Tender Title:", value: tender.title || "N/A" },
    { label: "Procuring Entity:", value: tender.procuring_entity || "N/A" },
    { label: "Bidder Name:", value: tender.bidder || "N/A" },
    { label: "Submission Deadline:", value: tender.submission_deadline || "N/A" },
    { label: "Package Created Date:", value: todayStr }
  ];

  let currentMetaY = metaBoxY + 120;
  for (const item of metaItems) {
    coverPage.drawText(item.label, {
      x: 55,
      y: currentMetaY,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.35)
    });
    // Sanitize value text for standard Helvetica font (ASCII safe)
    const sanitizedVal = (item.value || '').replace(/[^\x20-\x7E]/g, '');
    coverPage.drawText(sanitizedVal || item.value, {
      x: 200,
      y: currentMetaY,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.15)
    });
    currentMetaY -= 20;
  }

  // Section 6.1: "and the list of included documents in order."
  coverPage.drawText("SCHEDULE OF INCLUDED DOCUMENTS", {
    x: 40,
    y: metaBoxY - 30,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.18, 0.28)
  });

  // Table Header
  let tableY = metaBoxY - 50;
  coverPage.drawRectangle({
    x: 40,
    y: tableY - 5,
    width: pageWidth - 80,
    height: 22,
    color: rgb(0.92, 0.94, 0.98)
  });

  coverPage.drawText("Order", { x: 50, y: tableY, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText("Required Document Title", { x: 95, y: tableY, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText("Attached File Name", { x: 310, y: tableY, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText("Pages", { x: 510, y: tableY, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.35) });

  tableY -= 22;
  let coverPageActive = coverPage;
  const drawCoverRow = (order, title, fileName, pages, y) => {
    coverPageActive.drawText(String(order), { x: 55, y, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.15) });
    coverPageActive.drawText(title, { x: 95, y, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.15) });
    coverPageActive.drawText(fileName, { x: 310, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.35, 0.45) });
    coverPageActive.drawText(String(pages), { x: 515, y, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.15) });
    coverPageActive.drawLine({
      start: { x: 40, y: y - 4 },
      end: { x: pageWidth - 40, y: y - 4 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.93)
    });
  };
  for (const item of includedDocs) {
    if (tableY < 60) {
      // Overflow: continue the document list on a fresh page instead of dropping rows.
      coverPageActive = mergedPdf.addPage([595.28, 841.89]);
      coverPageActive.drawText('SCHEDULE OF INCLUDED DOCUMENTS (continued)', {
        x: 40,
        y: pageHeight - 70,
        size: 12,
        font: fontBold,
        color: rgb(0.15, 0.18, 0.28)
      });
      tableY = pageHeight - 100;
    }

    const titleEn = item.req.title_en || item.req.id;
    const cleanFileName = (item.fileObj.name || '').substring(0, 32);

    drawCoverRow(item.req.order, titleEn, cleanFileName, item.fileObj.pageCount || 1, tableY);

    tableY -= 18;
  }

  // --- Step 2: Index placeholder (drawn AFTER merge with actual page numbers) ---
  let indexPage = null;
  if (options.includeIndexPage) {
    onProgress(30, 'Generating Index & Table of Contents...');
    indexPage = mergedPdf.addPage([595.28, 841.89]);
  }
  // --- Step 3: Append Document Pages in Order (Section 6.2) ---
  // Record ACTUAL merged page counts so the index stays accurate even
  // when a file turns out corrupt/encrypted at merge time.
  const mergedCounts = [];
  let docIndex = 0;
  for (const item of includedDocs) {
    docIndex++;
    const progressPct = 40 + Math.floor((docIndex / includedDocs.length) * 40);
    onProgress(progressPct, `Merging document ${docIndex}/${includedDocs.length}: ${item.req.title_en}...`);

    try {
      const srcDoc = await PDFDocument.load(item.fileObj.arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
      mergedCounts.push(copiedPages.length);
    } catch (err) {
      console.error(`Error merging document ${item.fileObj.name}:`, err);
      // Create a clear placeholder page if a PDF was corrupted
      const fallbackPage = mergedPdf.addPage([595.28, 841.89]);
      fallbackPage.drawText(`[Document ${item.req.title_en} could not be rendered: ${err.message}]`, {
        x: 50,
        y: 400,
        size: 12,
        font: fontRegular,
        color: rgb(0.8, 0.1, 0.1)
      });
      mergedCounts.push(1);
    }
  }

  // --- Step 3b: Render Index with actual start pages ---
  if (indexPage) {
    const frontMatterCount = mergedPdf.getPageCount() - mergedCounts.reduce((a, b) => a + b, 0);
    let cursor = frontMatterCount + 1;
    const docStartPages = includedDocs.map((item, i) => {
      const info = {
        req: item.req,
        fileName: item.fileObj.name,
        pageCount: mergedCounts[i],
        startPage: cursor,
        endPage: cursor + mergedCounts[i] - 1
      };
      cursor += mergedCounts[i];
      return info;
    });

    indexPage.drawText('TABLE OF CONTENTS / INDEX', {
      x: 40,
      y: pageHeight - 70,
      size: 18,
      font: fontBold,
      color: rgb(0.09, 0.11, 0.19)
    });

    indexPage.drawText('Comprehensive Document Navigation & Page Sequence', {
      x: 40,
      y: pageHeight - 90,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55)
    });

    let indexY = pageHeight - 130;
    // Header
    indexPage.drawRectangle({
      x: 40,
      y: indexY - 5,
      width: pageWidth - 80,
      height: 24,
      color: rgb(0.94, 0.95, 0.98)
    });
    indexPage.drawText('Order', { x: 50, y: indexY, size: 9, font: fontBold });
    indexPage.drawText('Document Title', { x: 95, y: indexY, size: 9, font: fontBold });
    indexPage.drawText('File Name', { x: 300, y: indexY, size: 9, font: fontBold });
    indexPage.drawText('Start Page', { x: 480, y: indexY, size: 9, font: fontBold });

    indexY -= 24;
    for (const info of docStartPages) {
      if (indexY < 60) break;
      indexPage.drawText(String(info.req.order), { x: 55, y: indexY, size: 9, font: fontRegular });
      indexPage.drawText(info.req.title_en || info.req.id, { x: 95, y: indexY, size: 9, font: fontRegular });
      indexPage.drawText(info.fileName.substring(0, 30), { x: 300, y: indexY, size: 8.5, font: fontRegular, color: rgb(0.3, 0.35, 0.45) });
      indexPage.drawText(`Page ${info.startPage}`, { x: 480, y: indexY, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.7) });

      indexPage.drawLine({
        start: { x: 40, y: indexY - 4 },
        end: { x: pageWidth - 40, y: indexY - 4 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.93)
      });
      indexY -= 20;
    }
  }

  // --- Step 4: Embed Seal / Signature Image (Bonus) ---
  let embeddedSeal = null;
  if (options.sealImageBytes) {
    try {
      embeddedSeal = await mergedPdf.embedPng(options.sealImageBytes);
    } catch (err) {
      console.warn("Failed to embed seal PNG:", err);
    }
  }

  // --- Step 5: Add Footers to EVERY Page (Section 6.3 & 6.4) ---
  onProgress(85, "Stamping footers and pagination...");
  const totalPages = mergedPdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = mergedPdf.getPage(i);
    const { width: pWidth } = page.getSize();
    const pageNum = i + 1;

    // Footer text: <tender_id> | Page X of Y
    const footerText = `${tenderId}  |  Page ${pageNum} of ${totalPages}`;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, 8);

    // Section 6.4: keep the footer legible but minimal so it never
    // covers source content — a slim 12pt strip at the very bottom.
    page.drawRectangle({
      x: 30,
      y: 10,
      width: pWidth - 60,
      height: 13,
      color: rgb(1, 1, 1),
      opacity: 0.75
    });

    // Draw footer text centered at the bottom
    page.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 14,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.48)
    });

    // Stamp seal if requested
    if (embeddedSeal) {
      const sealWidth = 80;
      const sealHeight = (sealWidth * embeddedSeal.height) / embeddedSeal.width;
      let shouldStamp = false;

      if (options.sealPages === 'all') shouldStamp = true;
      else if (options.sealPages === 'cover' && pageNum === 1) shouldStamp = true;
      else if (options.sealPages === 'last' && pageNum === totalPages) shouldStamp = true;

      if (shouldStamp) {
        page.drawImage(embeddedSeal, {
          x: pWidth - sealWidth - 40,
          y: 40,
          width: sealWidth,
          height: sealHeight,
          opacity: 0.9
        });
      }
    }
  }

  onProgress(95, "Finalizing PDF package...");
  const pdfBytes = await mergedPdf.save();
  onProgress(100, "Package generated successfully!");

  return pdfBytes;
}

/**
 * Helper to download PDF bytes as a file.
 */
export function downloadPdfBlob(pdfBytes, fileName) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
