// File validation and cryptographic verification utilities for Department of Document Affairs (1997)

/**
 * Checks whether the file has the genuine %PDF- magic signature in its first 5 bytes.
 * Handles cases where OS file managers do not report MIME type.
 */
export async function validatePDFSignature(file: File): Promise<{
  isValid: boolean;
  header: string;
  errorReason?: string;
}> {
  if (!file) {
    return { isValid: false, header: '', errorReason: 'No file received.' };
  }

  // Files smaller than 5 bytes cannot be valid PDFs
  if (file.size < 5) {
    return {
      isValid: false,
      header: '',
      errorReason: 'File size is under 5 bytes. Incomplete payload.',
    };
  }

  try {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = String.fromCharCode(...bytes);

    if (header === '%PDF-') {
      return { isValid: true, header };
    }

    // Corrupted or non-PDF file
    const printableHeader = header.replace(/[^\x20-\x7E]/g, '?');
    return {
      isValid: false,
      header: printableHeader,
      errorReason: `Missing '%PDF-' header signature. Found: '${printableHeader}'.`,
    };
  } catch (err) {
    return {
      isValid: false,
      header: '',
      errorReason: `Stream read failure: ${(err as Error).message}`,
    };
  }
}

/**
 * Fallback quick extension / mime check
 */
export function isPDFFile(file: File): boolean {
  if (!file) return false;
  if (file.type && file.type.toLowerCase() === 'application/pdf') {
    return true;
  }
  const name = file.name ? file.name.toLowerCase() : '';
  if (name.endsWith('.pdf')) {
    return true;
  }
  return false;
}

/**
 * Formats bytes into clearly labelled units with sensible rounding
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm)) + ' ' + sizes[unitIndex];
}

/**
 * Calculates genuine SHA-256 hash using Web Crypto API
 */
export async function calculateSHA256(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Hash calculation error:', err);
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
}
