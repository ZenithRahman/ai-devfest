import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function generateSamplePackage() {
  const sampleDir = path.resolve('sample-pack');
  const reqData = JSON.parse(fs.readFileSync(path.join(sampleDir, 'requirements.json'), 'utf8'));
  const tender = reqData.tender;
  const requirements = reqData.requirements;

  const docDir = path.join(sampleDir, 'documents');

  // Solution matching for sample pack:
  // R01: trade_license_2026.pdf (valid license, expiry 2027-06-30)
  // R02: 03_tin_certificate.pdf
  // R03: 04_vat_certificate.pdf
  // R04: bank_solvency.pdf (expiry 2026-12-31)
  // R05: experience_cert.pdf (avoiding the duplicate 'experience_cert (1).pdf')
  // R06: optional, skipped
  // R07: optional, skipped
  // R08: 02_technical_proposal.pdf
  // R09: 01_financial_proposal.pdf
  // R10: scan_0042.pdf (Signed Declaration)
  const fileMappings = [
    { reqId: 'R01', fileName: 'trade_license_2026.pdf' },
    { reqId: 'R02', fileName: '03_tin_certificate.pdf' },
    { reqId: 'R03', fileName: '04_vat_certificate.pdf' },
    { reqId: 'R04', fileName: 'bank_solvency.pdf' },
    { reqId: 'R05', fileName: 'experience_cert.pdf' },
    { reqId: 'R08', fileName: '02_technical_proposal.pdf' },
    { reqId: 'R09', fileName: '01_financial_proposal.pdf' },
    { reqId: 'R10', fileName: 'scan_0042.pdf' }
  ];

  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs = [];

  for (const req of sortedReqs) {
    const mapping = fileMappings.find(m => m.reqId === req.id);
    if (mapping) {
      const filePath = path.join(docDir, mapping.fileName);
      const buffer = fs.readFileSync(filePath);
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      includedDocs.push({
        req,
        fileName: mapping.fileName,
        pageCount: srcDoc.getPageCount(),
        srcDoc
      });
    }
  }

  const tenderId = tender.tender_id;
  const todayStr = '2026-10-06';

  // --- Page 1: Cover Page (Section 6.1) ---
  const coverPage = mergedPdf.addPage([595.28, 841.89]);
  const { width: pWidth, height: pHeight } = coverPage.getSize();

  // Header band
  coverPage.drawRectangle({
    x: 40,
    y: pHeight - 60,
    width: pWidth - 80,
    height: 4,
    color: rgb(0.24, 0.27, 0.75)
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 40,
    y: pHeight - 90,
    size: 20,
    font: fontBold,
    color: rgb(0.09, 0.11, 0.19)
  });

  coverPage.drawText('Official Tender Document Dossier', {
    x: 40,
    y: pHeight - 110,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  const metaBoxY = pHeight - 270;
  coverPage.drawRectangle({
    x: 40,
    y: metaBoxY,
    width: pWidth - 80,
    height: 145,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.85, 0.88, 0.95),
    borderWidth: 1
  });

  const metaItems = [
    { label: 'Tender ID:', value: tender.tender_id },
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Created Date:', value: todayStr }
  ];

  let currentMetaY = metaBoxY + 120;
  for (const item of metaItems) {
    coverPage.drawText(item.label, { x: 55, y: currentMetaY, size: 10, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
    coverPage.drawText(item.value, { x: 200, y: currentMetaY, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.15) });
    currentMetaY -= 20;
  }

  coverPage.drawText('SCHEDULE OF INCLUDED DOCUMENTS', {
    x: 40,
    y: metaBoxY - 30,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.18, 0.28)
  });

  let tableY = metaBoxY - 50;
  coverPage.drawRectangle({
    x: 40,
    y: tableY - 5,
    width: pWidth - 80,
    height: 22,
    color: rgb(0.92, 0.94, 0.98)
  });

  coverPage.drawText('Order', { x: 50, y: tableY, size: 9, font: fontBold });
  coverPage.drawText('Required Document Title', { x: 95, y: tableY, size: 9, font: fontBold });
  coverPage.drawText('Attached File Name', { x: 310, y: tableY, size: 9, font: fontBold });
  coverPage.drawText('Pages', { x: 510, y: tableY, size: 9, font: fontBold });

  tableY -= 22;
  for (const item of includedDocs) {
    coverPage.drawText(String(item.req.order), { x: 55, y: tableY, size: 9, font: fontRegular });
    coverPage.drawText(item.req.title_en, { x: 95, y: tableY, size: 9, font: fontRegular });
    coverPage.drawText(item.fileName, { x: 310, y: tableY, size: 8.5, font: fontRegular, color: rgb(0.3, 0.35, 0.45) });
    coverPage.drawText(String(item.pageCount), { x: 515, y: tableY, size: 9, font: fontRegular });

    coverPage.drawLine({
      start: { x: 40, y: tableY - 4 },
      end: { x: pWidth - 40, y: tableY - 4 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.93)
    });
    tableY -= 18;
  }

  // --- Page 2: Index / Table of Contents (Bonus) ---
  const indexPage = mergedPdf.addPage([595.28, 841.89]);
  indexPage.drawText('TABLE OF CONTENTS / INDEX', {
    x: 40,
    y: pHeight - 70,
    size: 18,
    font: fontBold,
    color: rgb(0.09, 0.11, 0.19)
  });
  indexPage.drawText('Comprehensive Document Navigation & Page Sequence', {
    x: 40,
    y: pHeight - 90,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  let indexY = pHeight - 130;
  indexPage.drawRectangle({
    x: 40,
    y: indexY - 5,
    width: pWidth - 80,
    height: 24,
    color: rgb(0.94, 0.95, 0.98)
  });
  indexPage.drawText('Order', { x: 50, y: indexY, size: 9, font: fontBold });
  indexPage.drawText('Document Title', { x: 95, y: indexY, size: 9, font: fontBold });
  indexPage.drawText('File Name', { x: 300, y: indexY, size: 9, font: fontBold });
  indexPage.drawText('Start Page', { x: 480, y: indexY, size: 9, font: fontBold });

  indexY -= 24;
  let startPageTracker = 3; // Cover=1, Index=2, docs start at 3
  for (const item of includedDocs) {
    indexPage.drawText(String(item.req.order), { x: 55, y: indexY, size: 9, font: fontRegular });
    indexPage.drawText(item.req.title_en, { x: 95, y: indexY, size: 9, font: fontRegular });
    indexPage.drawText(item.fileName, { x: 300, y: indexY, size: 8.5, font: fontRegular, color: rgb(0.3, 0.35, 0.45) });
    indexPage.drawText(`Page ${startPageTracker}`, { x: 480, y: indexY, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.7) });

    indexPage.drawLine({
      start: { x: 40, y: indexY - 4 },
      end: { x: pWidth - 40, y: indexY - 4 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.93)
    });

    indexY -= 20;
    startPageTracker += item.pageCount;
  }

  // --- Step 3: Append Document Pages in Order (Section 6.2) ---
  for (const item of includedDocs) {
    const copiedPages = await mergedPdf.copyPages(item.srcDoc, item.srcDoc.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  // --- Step 4: Add Footers on every page (Section 6.3 & 6.4) ---
  const totalPages = mergedPdf.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = mergedPdf.getPage(i);
    const { width: pageW } = page.getSize();
    const pageNum = i + 1;
    const footerText = `${tenderId}  |  Page ${pageNum} of ${totalPages}`;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, 8.5);

    page.drawRectangle({
      x: 30,
      y: 12,
      width: pageW - 60,
      height: 18,
      color: rgb(1, 1, 1),
      opacity: 0.85
    });

    page.drawText(footerText, {
      x: (pageW - textWidth) / 2,
      y: 17,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.48)
    });
  }

  const pdfBytes = await mergedPdf.save();
  const outDir = path.resolve('output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${tenderId}_Package.pdf`);
  fs.writeFileSync(outFile, pdfBytes);
  console.log(`Generated ${outFile} successfully! Total pages: ${totalPages}`);
}

generateSamplePackage().catch(console.error);
