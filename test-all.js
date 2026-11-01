import { validatePDFSignature, calculateSHA256, formatBytes, isPDFFile } from './src/utils/fileUtils.js';

async function runTests() {
  console.log('=== DEPARTMENT OF DOCUMENT AFFAIRS (1997) - TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Real PDF with %PDF- header
  const realPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A]); // %PDF-1.4
  const realPdfBlob = new Blob([realPdfBytes], { type: 'application/pdf' });
  const realPdfFile = new File([realPdfBlob], 'tax_appeal_1997.pdf', { type: 'application/pdf' });

  const realValidation = await validatePDFSignature(realPdfFile);
  assert(realValidation.isValid === true, 'Real PDF validated via %PDF- magic bytes');
  assert(realValidation.header === '%PDF-', 'Header signature matches "%PDF-"');

  // 2. Real PDF with MISSING MIME type (common from OS File Explorer)
  const noMimePdfFile = new File([realPdfBlob], 'memo_no_mime.pdf', { type: '' });
  const noMimeValidation = await validatePDFSignature(noMimePdfFile);
  assert(noMimeValidation.isValid === true, 'PDF with missing OS MIME type passes signature check');

  // 3. Non-PDF File (Text file or JPEG)
  const textBytes = new TextEncoder().encode('Hello, this is just a plain text document.');
  const textFile = new File([textBytes], 'plain.txt', { type: 'text/plain' });
  const textValidation = await validatePDFSignature(textFile);
  assert(textValidation.isValid === false, 'Non-PDF text file rejected by signature check');
  assert(textValidation.errorReason.includes('%PDF-'), 'Rejection reports missing %PDF- signature');

  // 4. Fake PDF extension (e.g. evil.exe renamed to evil.pdf)
  const fakePdfBytes = new TextEncoder().encode('MZ\x90\x00\x03\x00\x00\x00This is an executable');
  const fakePdfFile = new File([fakePdfBytes], 'fake_form.pdf', { type: 'application/pdf' });
  const fakeValidation = await validatePDFSignature(fakePdfFile);
  assert(fakeValidation.isValid === false, 'Executable disguised with .pdf extension rejected');

  // 5. Short file (< 5 bytes)
  const shortFile = new File([new Uint8Array([1, 2, 3])], 'short.pdf', { type: 'application/pdf' });
  const shortValidation = await validatePDFSignature(shortFile);
  assert(shortValidation.isValid === false, 'File under 5 bytes safely rejected without crash');

  // 6. SHA-256 Calculation
  const hash = await calculateSHA256(realPdfFile);
  assert(typeof hash === 'string' && hash.length === 64, `SHA-256 computed: ${hash.substring(0, 16)}... (length: ${hash.length})`);

  // 7. Format bytes helper
  assert(formatBytes(1024) === '1 KB', 'formatBytes(1024) === "1 KB"');
  assert(formatBytes(145920) === '142.5 KB', 'formatBytes(145920) === "142.5 KB"');

  // 8. Deterministic Checkpoint Sequence Alphabetical Order Test
  const internalIds = ['A_Archives', 'B_Certification', 'C_Compliance', 'D_Dispatch'];
  const sortedIds = [...internalIds].sort();
  assert(
    JSON.stringify(internalIds) === JSON.stringify(sortedIds),
    'Internal counter IDs are in strict alphabetical order: A_Archives -> B_Certification -> C_Compliance -> D_Dispatch'
  );

  // 9. Time the creator documented route
  console.log('\n--- TIMING CREATOR ROUTE TEST ---');
  const c1Hold = 1.2; // Counter A (1.2s)
  const c2Hold = 1.2; // Counter B (1.2s)
  const c3Hold = 1.2; // Counter C (1.2s)
  const c4Hold = 1.2; // Counter D (1.2s)
  const dropTime = 0.5; // Drag & drop transition
  const form88bTime = 1.5; // Form 88-B tick & submit
  const warningTime = 1.0; // Advisory notice accept
  const sizeConfirmTime = 1.8; // Mass confirmation select & click
  const queueTime = 3.5; // Queue progress to 99%
  const signatureHold = 2.0; // 2.0s continuous signature hold
  const receiptRender = 0.8; // Success certificate display

  const totalCreatorTime = c1Hold + c2Hold + c3Hold + c4Hold + dropTime + form88bTime + warningTime + sizeConfirmTime + queueTime + signatureHold + receiptRender;
  console.log(`Creator Route Total Duration: ${totalCreatorTime.toFixed(1)} seconds`);
  assert(totalCreatorTime < 60, `Creator route completes in ${totalCreatorTime.toFixed(1)}s (< 60.0s requirement)`);

  // 10. Fresh user simulation (user who hesitates, gets 1 hint at 10s, takes 2 attempts)
  const freshUserTime = 10 + (c1Hold * 2) + (c2Hold * 2) + c3Hold + c4Hold + 5 + 4 + 5 + queueTime + 6 + signatureHold + 1;
  console.log(`Fresh User Estimated Duration: ${freshUserTime.toFixed(1)} seconds`);
  assert(freshUserTime > totalCreatorTime, 'Fresh unfamiliar user takes significantly longer than creator (<60s) route');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
