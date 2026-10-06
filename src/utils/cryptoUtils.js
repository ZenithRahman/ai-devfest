/**
 * Computes SHA-256 hash for an ArrayBuffer using Web Crypto API.
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function computeFileHash(arrayBuffer) {
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Crypto subtle failed, using fallback hash:', err);
    // Fallback simple 32-bit checksum in case subtle crypto is unavailable
    const bytes = new Uint8Array(arrayBuffer);
    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
      hash = ((hash << 5) - hash) + bytes[i];
      hash |= 0;
    }
    return `fallback-${hash}-${bytes.length}`;
  }
}

/**
 * Format bytes to human readable string (KB, MB).
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
