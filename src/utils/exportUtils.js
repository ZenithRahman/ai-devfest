/**
 * Exports the tender checklist as a CSV file.
 * Fields: Document, File Name, Pages, Expiry Date, Status
 */
export function exportChecklistToCsv(requirements, matches, expiryDates, uploadedFiles, itemStatuses, tenderId = 'tender') {
  const headers = ['Order', 'Requirement ID', 'Document Title (EN)', 'Document Title (BN)', 'Type', 'Matched File Name', 'Pages', 'Expiry Date', 'Status'];
  
  const rows = requirements.map(req => {
    const fileId = matches[req.id];
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    const expiry = expiryDates[req.id] || 'N/A';
    const statusObj = itemStatuses[req.id];
    const status = statusObj ? statusObj.status : 'N/A';

    return [
      req.order,
      `"${req.id}"`,
      `"${(req.title_en || '').replace(/"/g, '""')}"`,
      `"${(req.title_bn || '').replace(/"/g, '""')}"`,
      req.mandatory ? 'Mandatory' : 'Optional',
      `"${fileObj ? fileObj.name.replace(/"/g, '""') : 'Not matched'}"`,
      fileObj ? (fileObj.pageCount || 1) : 0,
      `"${expiry}"`,
      `"${status}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tenderId}_Checklist.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
