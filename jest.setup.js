import crypto from 'node:crypto';

if (typeof globalThis.crypto === 'undefined') {
  // Needed for Node.js 18 LTS
  globalThis.crypto = crypto;
}
