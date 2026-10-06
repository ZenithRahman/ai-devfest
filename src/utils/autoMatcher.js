/**
 * Auto-matches uploaded files to tender requirements based on filename heuristics.
 * Handles English and normalized keywords.
 */
export function suggestMatches(requirements, uploadedFiles, currentMatches = {}) {
  const newMatches = { ...currentMatches };
  const usedFileIds = new Set(Object.values(newMatches));
  let matchedCount = 0;

  // Keyword dictionary for each requirement type (sample-pack boost).
  // Unknown requirement IDs fall back to generic title-token scoring below.
  const matchRules = [
    { id: 'R01', keywords: ['trade', 'license', 'licence', 'ট্রেড'] },
    { id: 'R02', keywords: ['tin', 'tax', 'টিআইএন'] },
    { id: 'R03', keywords: ['vat', 'bin', 'ভ্যাট'] },
    { id: 'R04', keywords: ['bank', 'solvency', 'ব্যাংক', 'সচ্ছলতা'] },
    { id: 'R05', keywords: ['experience', 'completion', 'অভিজ্ঞতা'] },
    { id: 'R06', keywords: ['audit', 'audited', 'financial_statement', 'নিরীক্ষিত'] },
    { id: 'R07', keywords: ['manufacturer', 'authorization', 'maf', 'অনুমোদনপত্র'] },
    { id: 'R08', keywords: ['technical', 'tech_proposal', 'কারিগরি'] },
    { id: 'R09', keywords: ['financial', 'fin_proposal', 'commercial', 'আর্থিক'] },
    { id: 'R10', keywords: ['declaration', 'signed', 'undertaking', 'ঘোষণাপত্র', 'scan_0042'] }
  ];

  for (const rule of matchRules) {
    const req = requirements.find(r => r.id === rule.id);
    if (!req) continue;
    // If requirement already has a match, keep it
    if (newMatches[req.id]) continue;

    // Search through available uploaded files
    const availableFiles = uploadedFiles.filter(f => !usedFileIds.has(f.id));

    // Find best candidate
    let bestFile = null;
    let bestScore = 0;

    for (const file of availableFiles) {
      const lowerName = file.name.toLowerCase();
      let score = 0;

      for (const kw of rule.keywords) {
        if (lowerName.includes(kw)) {
          score += 10;
        }
      }

      // Special heuristic: for trade license, prefer 2026 over 2025
      if (rule.id === 'R01' && lowerName.includes('2026')) {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    }

    if (bestFile && bestScore > 0) {
      newMatches[req.id] = bestFile.id;
      usedFileIds.add(bestFile.id);
      matchedCount++;
    }
  }

  // Generic fallback for unseen packs: score file names against
  // tokens from the English title (words with 4+ letters).
  for (const req of requirements) {
    if (newMatches[req.id]) continue;
    if (matchRules.some((r) => r.id === req.id)) continue;
    const tokens = (req.title_en || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((w) => w.length >= 4);
    if (tokens.length === 0) continue;

    let bestFile = null;
    let bestScore = 0;
    for (const file of uploadedFiles.filter((f) => !usedFileIds.has(f.id))) {
      const lowerName = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      let score = 0;
      for (const tok of tokens) {
        if (lowerName.includes(tok)) score += 10;
      }
      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    }
    if (bestFile && bestScore > 0) {
      newMatches[req.id] = bestFile.id;
      usedFileIds.add(bestFile.id);
      matchedCount++;
    }
  }

  return { newMatches, matchedCount };
}
