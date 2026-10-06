export const TRANSLATIONS = {
  en: {
    appTitle: "Tender Package Builder",
    appSubtitle: "AI DevFest Compliant Document Preparation & Verification",
    loadRequirements: "Load Requirements JSON",
    resetSample: "Load Sample Tender",
    saveState: "Save Project",
    loadState: "Reopen Work",
    tenderDetails: "Tender Information",
    tenderId: "Tender ID",
    procuringEntity: "Procuring Entity",
    bidder: "Bidder",
    deadline: "Submission Deadline",
    statusSummary: "Status Overview",
    blockingIssues: "Blocking Issues",
    readyToGenerate: "All Requirements Met - Ready to Generate Package",
    tableHeaders: {
      order: "#",
      docTitle: "Required Document",
      type: "Type",
      matchedFile: "Matched PDF File",
      expiryDate: "Expiry Date",
      status: "Status",
      actions: "Actions"
    },
    types: {
      mandatory: "Mandatory",
      optional: "Optional"
    },
    statuses: {
      OK: "OK",
      MISSING: "Missing",
      EXPIRY_NEEDED: "Expiry Date Needed",
      EXPIRED: "Expired",
      NOT_PROVIDED: "Not Provided"
    },
    statusDescriptions: {
      OK: "Document verified and compliant.",
      MISSING: "Required document has no file matched.",
      EXPIRY_NEEDED: "File matched but expiry date is not entered.",
      EXPIRED: "Expiry date is before the submission deadline.",
      NOT_PROVIDED: "Optional document skipped."
    },
    uploadPanel: {
      title: "Uploaded PDF Files",
      dropPrompt: "Drag & drop PDF files here, or click to browse",
      subPrompt: "Accepts .pdf only • Up to 30 files / 50 MB",
      nonPdfError: "Rejected: Only PDF files are accepted. Non-PDF files (e.g., PNG/JPEG) cannot be processed here.",
      pages: "pages",
      duplicateBadge: "Duplicate File",
      remove: "Remove",
      unmatch: "Unmatch",
      preview: "Preview",
      noFiles: "No PDF files uploaded yet. Drag files into the area above to get started."
    },
    matching: {
      selectPlaceholder: "-- Select a PDF --",
      autoMatchBtn: "Auto-Match Files",
      autoMatchSuccess: "Auto-matched {count} documents based on file names!",
      duplicateWarning: "Duplicate file detected! Duplicate files cannot be matched to different documents."
    },
    packageBar: {
      generateBtn: "Generate & Download Package",
      generating: "Assembling & Numbering PDF Package...",
      exportCsvBtn: "Export Checklist (CSV)",
      sealBtn: "Add Seal / Signature",
      blockingWarning: "Package generation locked: {count} blocking problem(s) must be resolved first."
    },
    sealModal: {
      title: "Add Official Seal or Signature (Bonus)",
      description: "Upload a PNG stamp or signature image and specify which pages to stamp.",
      uploadPrompt: "Upload Seal / Signature (PNG)",
      selectPages: "Target Pages:",
      allPages: "All Pages",
      coverOnly: "Cover Page Only",
      lastPage: "Final Page Only",
      apply: "Apply Seal",
      clear: "Remove Seal",
      close: "Close"
    },
    tocOption: "Include Index / Table of Contents Page"
  },
  bn: {
    appTitle: "টেন্ডার প্যাকেজ প্রস্তুতকারক",
    appSubtitle: "এআই ডেভফেস্ট নির্দেশিকা অনুযায়ী যাচাইকৃত টেন্ডার প্যাকেজ বিল্ডার",
    loadRequirements: "রিকোয়ারমেন্টস JSON লোড করুন",
    resetSample: "নমুনা টেন্ডার লোড করুন",
    saveState: "প্রজেক্ট সংরক্ষণ করুন",
    loadState: "সংরক্ষিত ফাইল খুলুন",
    tenderDetails: "দরপত্রের বিবরণ",
    tenderId: "টেন্ডার আইডি",
    procuringEntity: "ক্রয়কারী কর্তৃপক্ষ",
    bidder: "দরপত্রদাতা",
    deadline: "জমা দেওয়ার শেষ তারিখ",
    statusSummary: "সারসংক্ষেপ ও স্ট্যাটাস",
    blockingIssues: "সমাধানযোগ্য সমস্যা",
    readyToGenerate: "সব শর্ত পূরণ হয়েছে - প্যাকেজ তৈরির জন্য প্রস্তুত",
    tableHeaders: {
      order: "ক্রম",
      docTitle: "প্রয়োজনীয় নথি",
      type: "ধরন",
      matchedFile: "সংযুক্ত পিডিএফ",
      expiryDate: "মেয়াদোত্তীর্ণের তারিখ",
      status: "অবস্থা",
      actions: "কার্যক্রম"
    },
    types: {
      mandatory: "আবশ্যিক",
      optional: "ঐচ্ছিক"
    },
    statuses: {
      OK: "সঠিক",
      MISSING: "অনুপস্থিত",
      EXPIRY_NEEDED: "মেয়াদ প্রয়োজন",
      EXPIRED: "মেয়াদোত্তীর্ণ",
      NOT_PROVIDED: "দেওয়া হয়নি"
    },
    statusDescriptions: {
      OK: "নথিটি যথাযথভাবে যাচাই করা হয়েছে।",
      MISSING: "আবশ্যিক নথি সংযুক্ত করা হয়নি।",
      EXPIRY_NEEDED: "নথি সংযুক্ত হলেও মেয়াদ উল্লেখ করা হয়নি।",
      EXPIRED: "মেয়াদ জমার শেষ তারিখের পূর্বেই শেষ হয়েছে।",
      NOT_PROVIDED: "ঐচ্ছিক নথি সংযুক্ত করা হয়নি।"
    },
    uploadPanel: {
      title: "আপলোডকৃত পিডিএফ ফাইলসমূহ",
      dropPrompt: "পিডিএফ ফাইল এখানে ড্র্যাগ ও ড্রপ করুন, অথবা ক্লিক করুন",
      subPrompt: "শুধুমাত্র .pdf গ্রহণযোগ্য • সর্বোচ্চ ৩০টি ফাইল / ৫০ মেগাবাইট",
      nonPdfError: "বাতিল: শুধুমাত্র পিডিএফ ফাইল গ্রহণযোগ্য। ইমেজ বা অন্যান্য ফাইল গ্রহণযোগ্য নয়।",
      pages: "পৃষ্ঠা",
      duplicateBadge: "ডুপ্লিকেট ফাইল",
      remove: "মুছুন",
      unmatch: "সংযোগ বাতিল",
      preview: "প্রিভিউ",
      noFiles: "এখনও কোনো পিডিএফ ফাইল আপলোড করা হয়নি। উপরে ফাইল ড্র্যাগ করুন।"
    },
    matching: {
      selectPlaceholder: "-- পিডিএফ নির্বাচন করুন --",
      autoMatchBtn: "স্বয়ংক্রিয় মিলকরণ",
      autoMatchSuccess: "ফাইলের নামের ভিত্তিতে {count}টি নথি স্বয়ংক্রিয়ভাবে সংযুক্ত হয়েছে!",
      duplicateWarning: "ডুপ্লিকেট ফাইল পাওয়া গেছে! একাধিক স্থানে একই ডুপ্লিকেট ফাইল ব্যবহার করা যাবে না।"
    },
    packageBar: {
      generateBtn: "প্যাকেজ তৈরি ও ডাউনলোড",
      generating: "পিডিএফ প্যাকেজ সাজানো হচ্ছে...",
      exportCsvBtn: "চেকলিস্ট এক্সপোর্ট (CSV)",
      sealBtn: "সিল / স্বাক্ষর যোগ করুন",
      blockingWarning: "প্যাকেজ তৈরি লক করা: প্যাকেজ তৈরিতে {count}টি বাধা রয়েছে।"
    },
    sealModal: {
      title: "সিল বা স্বাক্ষর যুক্ত করুন (বোনাস)",
      description: "স্বাক্ষর বা সিলের পিএনজি (PNG) ছবি আপলোড করুন এবং পৃষ্ঠা নির্বাচন করুন।",
      uploadPrompt: "সিল / স্বাক্ষর আপলোড করুন (PNG)",
      selectPages: "নির্বাচিত পৃষ্ঠা:",
      allPages: "সব পৃষ্ঠা",
      coverOnly: "শুধুমাত্র কভার পেজ",
      lastPage: "শুধুমাত্র শেষ পৃষ্ঠা",
      apply: "প্রয়োগ করুন",
      clear: "সিল মুছুন",
      close: "বন্ধ করুন"
    },
    tocOption: "সূচিপত্র (ইনডেক্স পেজ) যুক্ত করুন"
  }
};
