const ADMIN_PASSWORD_HASH = '3c5b8c6aaa89db61910cdfe32f1bdb193d1923146dbd6a7b0634a32ab73ac1af';

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

async function digestMessage(message) {
  if (!textEncoder) {
    throw new Error('TextEncoder API is not available in this environment.');
  }

  if (typeof crypto === 'undefined' || !crypto.subtle || typeof crypto.subtle.digest !== 'function') {
    throw new Error('Web Crypto API is not available in this environment.');
  }

  const data = textEncoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminPassword(input) {
  if (typeof input !== 'string') {
    return { isValid: false, error: null };
  }

  try {
    const inputHash = await digestMessage(input);
    return { isValid: inputHash === ADMIN_PASSWORD_HASH, error: null };
  } catch (error) {
    console.warn('Impossible de vérifier le mot de passe via Web Crypto :', error);
    return { isValid: false, error };
  }
}

export function getObfuscatedAdminPasswordHash() {
  return ADMIN_PASSWORD_HASH;
}
