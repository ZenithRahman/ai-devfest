export const TRANSLATIONS = {
  en: {
    appTitle: "TenderPack",
    appSubtitle: "Verify documents and build your submission package",
    openRequirements: "Open tender file",
    loadSample: "Load sample",
    saveProgress: "Save progress",
    reopenProgress: "Reopen saved work",
    moreActions: "More actions",
    menuFile: "Tender file",
    menuWorkspace: "Workspace",
    tenderDetails: "Tender Information",
    tenderId: "Tender ID",
    procuringEntity: "Procuring entity",
    bidder: "Bidder",
    deadline: "Deadline",
    daysLeft: "{count}d left",
    dueToday: "Due today",
    overdue: "Past due",
    statusSummary: "Ready",
    ofTotal: "of {total} ready",
    blockingIssues: "to fix",
    readyToGenerate: "Ready to generate",
    checklistTitle: "Document checklist",
    checklistSubtitle: "{ready} of {total} documents ready",
    autoMatchBtn: "Auto-match",
    tableHeaders: {
      order: "#",
      docTitle: "Document",
      type: "Required",
      matchedFile: "Attached file",
      expiryDate: "Expiry",
      status: "Status",
      actions: "Preview"
    },
    types: {
      mandatory: "Required",
      optional: "Optional"
    },
    statuses: {
      OK: "Ready",
      MISSING: "Missing",
      EXPIRY_NEEDED: "Needs date",
      EXPIRED: "Expired",
      NOT_PROVIDED: "Skipped"
    },
    statusDescriptions: {
      OK: "Attached and valid for the deadline.",
      MISSING: "No file attached yet.",
      EXPIRY_NEEDED: "Attached — add the expiry date.",
      EXPIRED: "Expiry is before the submission deadline.",
      NOT_PROVIDED: "Optional document, skipped."
    },
    uploadPanel: {
      title: "Files",
      dropPrompt: "Drop PDF files here",
      browseBtn: "Browse files",
      subPrompt: "PDF only · up to 30 files · 50 MB",
      nonPdfError: "Only PDF files are accepted here.",
      limitError: "Limit reached: up to 30 files and 50 MB total. Skipped: {names}",
      processing: "Reading files…",
      pages: "pages",
      duplicateBadge: "Duplicate",
      remove: "Remove",
      unmatch: "Detach",
      preview: "Preview",
      noFiles: "No files yet. Drop PDFs here or browse to attach them to the checklist."
    },
    previewModal: {
      subtitle: "{count} pages · Document preview",
      openNewTab: "New tab",
      loading: "Loading preview…"
    },
    matching: {
      selectPlaceholder: "Select file…",
      autoMatchBtn: "Auto-match",
      autoMatchTitle: "Auto-match finished",
      autoMatchSuccess: "Matched {count} documents by file name.",
      autoMatchEmpty: "No new matches found from file names.",
      duplicateWarning: "This file is already used for another document.",
      duplicateBlockDetail: "Same content attached to 2 documents — keep only one."
    },
    packageBar: {
      generateBtn: "Generate package",
      generating: "Building package…",
      exportCsvBtn: "Export CSV",
      sealBtn: "Seal",
      blockingWarning: "{count} issue(s) to fix before generating."
    },
    sealModal: {
      title: "Seal or signature",
      description: "Upload a transparent PNG stamp and choose where to place it.",
      uploadPrompt: "Upload PNG seal",
      selectPages: "Place on",
      allPages: "All pages",
      coverOnly: "Cover only",
      lastPage: "Last page",
      apply: "Apply",
      clear: "Remove",
      close: "Done"
    },
    tocOption: "Contents page",
    footerNote: "Files never leave your browser.",
    notice: {
      ok: "Got it",
      invalidFileTitle: "Can't open that file",
      invalidFileBody: "This doesn't look like a valid tender file. It must include tender details and a requirements list.",
      invalidJsonTitle: "Invalid JSON file",
      invalidJsonBody: "Couldn't parse that file: {error}",
      stateErrorTitle: "Couldn't reopen workspace",
      stateErrorBody: "Couldn't parse that project file: {error}",
      pngOnlyTitle: "PNG only",
      pngOnlyBody: "Please upload a transparent PNG for the seal or signature.",
      generateErrorTitle: "Couldn't build the package",
      generateErrorBody: "{error}"
    }
  },
  bn: {
    appTitle: "TenderPack",
    appSubtitle: "নথি যাচাই করুন ও সাবমিশন প্যাকেজ তৈরি করুন",
    openRequirements: "টেন্ডার ফাইল খুলুন",
    loadSample: "নমুনা লোড করুন",
    saveProgress: "কাজ সংরক্ষণ করুন",
    reopenProgress: "সংরক্ষিত কাজ খুলুন",
    moreActions: "আরও",
    menuFile: "টেন্ডার ফাইল",
    menuWorkspace: "ওয়ার্কস্পেস",
    tenderDetails: "দরপত্রের বিবরণ",
    tenderId: "টেন্ডার আইডি",
    procuringEntity: "ক্রয়কারী প্রতিষ্ঠান",
    bidder: "দরদাতা",
    deadline: "জমার শেষ তারিখ",
    daysLeft: "{count} দিন বাকি",
    dueToday: "আজই শেষ",
    overdue: "সময় পার হয়েছে",
    statusSummary: "প্রস্তুত",
    ofTotal: "{total}টির মধ্যে প্রস্তুত",
    blockingIssues: "টি ঠিক করুন",
    readyToGenerate: "প্যাকেজ তৈরির জন্য প্রস্তুত",
    checklistTitle: "নথির তালিকা",
    checklistSubtitle: "{total}টির মধ্যে {ready}টি প্রস্তুত",
    autoMatchBtn: "স্বয়ংক্রিয় মিল",
    tableHeaders: {
      order: "#",
      docTitle: "নথি",
      type: "আবশ্যক",
      matchedFile: "সংযুক্ত ফাইল",
      expiryDate: "মেয়াদ",
      status: "অবস্থা",
      actions: "দেখুন"
    },
    types: {
      mandatory: "আবশ্যক",
      optional: "ঐচ্ছিক"
    },
    statuses: {
      OK: "প্রস্তুত",
      MISSING: "নেই",
      EXPIRY_NEEDED: "তারিখ দিন",
      EXPIRED: "মেয়াদোত্তীর্ণ",
      NOT_PROVIDED: "বাদ"
    },
    statusDescriptions: {
      OK: "সংযুক্ত ও সময়সীমার জন্য বৈধ।",
      MISSING: "এখনও ফাইল সংযুক্ত হয়নি।",
      EXPIRY_NEEDED: "সংযুক্ত হয়েছে — মেয়াদের তারিখ দিন।",
      EXPIRED: "মেয়াদ জমার শেষ তারিখের আগেই শেষ।",
      NOT_PROVIDED: "ঐচ্ছিক নথি, বাদ দেওয়া হয়েছে।"
    },
    uploadPanel: {
      title: "ফাইল",
      dropPrompt: "পিডিএফ ফাইল এখানে রাখুন",
      browseBtn: "ফাইল বেছে নিন",
      subPrompt: "শুধু PDF · সর্বোচ্চ ৩০টি · ৫০ MB",
      nonPdfError: "এখানে শুধু PDF ফাইল দেওয়া যাবে।",
      limitError: "সীমা পূর্ণ: সর্বোচ্চ ৩০টি ফাইল ও ৫০ MB। বাদ পড়েছে: {names}",
      processing: "ফাইল পড়া হচ্ছে…",
      pages: "পৃষ্ঠা",
      duplicateBadge: "ডুপ্লিকেট",
      remove: "মুছুন",
      unmatch: "আলাদা করুন",
      preview: "দেখুন",
      noFiles: "এখনও ফাইল নেই। PDF এখানে রাখুন বা বেছে নিন।"
    },
    previewModal: {
      subtitle: "{count} পৃষ্ঠা · প্রিভিউ",
      openNewTab: "নতুন ট্যাবে",
      loading: "প্রিভিউ লোড হচ্ছে…"
    },
    matching: {
      selectPlaceholder: "ফাইল বেছে নিন…",
      autoMatchBtn: "স্বয়ংক্রিয় মিল",
      autoMatchTitle: "স্বয়ংক্রিয় মিল শেষ",
      autoMatchSuccess: "ফাইলের নাম দেখে {count}টি নথি মিলেছে।",
      autoMatchEmpty: "ফাইলের নাম থেকে নতুন কোনো মিল পাওয়া যায়নি।",
      duplicateWarning: "এই ফাইলটি অন্য নথিতে ব্যবহার হয়েছে।",
      duplicateBlockDetail: "একই ফাইল ২টি নথিতে আছে — একটি রাখুন।"
    },
    packageBar: {
      generateBtn: "প্যাকেজ তৈরি করুন",
      generating: "প্যাকেজ তৈরি হচ্ছে…",
      exportCsvBtn: "CSV ডাউনলোড",
      sealBtn: "সিল",
      blockingWarning: "তৈরির আগে {count}টি সমস্যা ঠিক করুন।"
    },
    sealModal: {
      title: "সিল বা স্বাক্ষর",
      description: "স্বচ্ছ PNG সিল আপলোড করে কোথায় বসবে ঠিক করুন।",
      uploadPrompt: "PNG সিল আপলোড করুন",
      selectPages: "বসবে",
      allPages: "সব পাতায়",
      coverOnly: "শুধু কভারে",
      lastPage: "শুধু শেষ পাতায়",
      apply: "প্রয়োগ করুন",
      clear: "মুছুন",
      close: "সম্পন্ন"
    },
    tocOption: "সূচিপত্র",
    footerNote: "ফাইল আপনার ব্রাউজারের বাইরে যায় না।",
    notice: {
      ok: "ঠিক আছে",
      invalidFileTitle: "ফাইল খোলা যাচ্ছে না",
      invalidFileBody: "এটি বৈধ টেন্ডার ফাইল মনে হচ্ছে না। এতে টেন্ডারের তথ্য ও নথির তালিকা থাকতে হবে।",
      invalidJsonTitle: "ভুল JSON ফাইল",
      invalidJsonBody: "ফাইলটি পড়া যায়নি: {error}",
      stateErrorTitle: "কাজ খোলা যায়নি",
      stateErrorBody: "প্রজেক্ট ফাইলটি পড়া যায়নি: {error}",
      pngOnlyTitle: "শুধু PNG",
      pngOnlyBody: "সিল বা স্বাক্ষরের জন্য স্বচ্ছ PNG আপলোড করুন।",
      generateErrorTitle: "প্যাকেজ তৈরি হয়নি",
      generateErrorBody: "{error}"
    }
  }
};
