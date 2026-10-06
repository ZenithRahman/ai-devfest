export const STATUS = {
  OK: 'OK',
  MISSING: 'MISSING',
  EXPIRY_NEEDED: 'EXPIRY_NEEDED',
  EXPIRED: 'EXPIRED',
  NOT_PROVIDED: 'NOT_PROVIDED'
};

/**
 * Checks if a status blocks the package generation.
 * Per Section 5 of Problem Statement:
 * Missing -> Blocks: Yes
 * Expiry date needed -> Blocks: Yes
 * Expired -> Blocks: Yes
 * Not provided -> Blocks: No
 * OK -> Blocks: No
 */
export function isBlockingStatus(status) {
  return status === STATUS.MISSING || 
         status === STATUS.EXPIRY_NEEDED || 
         status === STATUS.EXPIRED;
}

/**
 * Evaluates the status of a single requirement.
 * 
 * @param {Object} req - The requirement item from requirements.json
 * @param {string|null} matchedFileId - The ID of the matched file (or null)
 * @param {string|null} expiryDate - The user-entered expiry date (YYYY-MM-DD)
 * @param {string} submissionDeadline - The tender submission deadline (YYYY-MM-DD)
 * @returns {string} One of the STATUS values
 */
export function evaluateRequirementStatus(req, matchedFileId, expiryDate, submissionDeadline) {
  const isMatched = !!matchedFileId;

  // Case 1: No file is matched
  if (!isMatched) {
    if (req.mandatory) {
      return STATUS.MISSING;
    } else {
      return STATUS.NOT_PROVIDED;
    }
  }

  // Case 2: File is matched
  if (req.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '') {
      return STATUS.EXPIRY_NEEDED;
    }

    // Compare date strings directly (YYYY-MM-DD format allows lexicographical comparison)
    // "If a document expires on the same day as the submission deadline, it is still OK."
    const cleanExpiry = expiryDate.trim();
    const cleanDeadline = (submissionDeadline || '').trim();

    if (cleanExpiry < cleanDeadline) {
      return STATUS.EXPIRED;
    }

    return STATUS.OK;
  }

  // File is matched and does not require expiry
  return STATUS.OK;
}

/**
 * Computes all statuses and duplicate validations for the entire requirements set.
 */
export function evaluateAllStatuses(requirements, matches, expiryDates, submissionDeadline, uploadedFiles) {
  const results = {};
  let blockingCount = 0;

  for (const req of requirements) {
    const fileId = matches[req.id] || null;
    const expiry = expiryDates[req.id] || null;
    const status = evaluateRequirementStatus(req, fileId, expiry, submissionDeadline);
    
    results[req.id] = {
      status,
      isBlocking: isBlockingStatus(status),
      matchedFileId: fileId,
      expiryDate: expiry
    };

    if (isBlockingStatus(status)) {
      blockingCount++;
    }
  }

  // Duplicate Matching Check (Task 4.6):
  // "If two or more uploaded files have exactly the same content, do not allow them to be matched to different documents."
  // If user matched duplicate file A to Doc 1 and duplicate file B to Doc 2, flag a duplicate match violation!
  const hashToReqMap = {};
  const duplicateMatchViolations = [];

  for (const req of requirements) {
    const fileId = matches[req.id];
    if (!fileId) continue;
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    if (!fileObj || !fileObj.hash) continue;

    if (hashToReqMap[fileObj.hash]) {
      duplicateMatchViolations.push({
        hash: fileObj.hash,
        req1: hashToReqMap[fileObj.hash],
        req2: req.id
      });
    } else {
      hashToReqMap[fileObj.hash] = req.id;
    }
  }

  return {
    itemStatuses: results,
    blockingCount: blockingCount + (duplicateMatchViolations.length > 0 ? 1 : 0),
    duplicateMatchViolations,
    canGenerate: blockingCount === 0 && duplicateMatchViolations.length === 0
  };
}
