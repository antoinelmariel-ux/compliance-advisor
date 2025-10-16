const ADMIN_PASSWORD_HASH = '3c5b8c6aaa89db61910cdfe32f1bdb193d1923146dbd6a7b0634a32ab73ac1af';

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const hasSubtleCrypto = typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function';

const encodeUtf8 = (message) => {
  if (textEncoder) {
    return textEncoder.encode(message);
  }

  const normalized = (() => {
    try {
      return encodeURIComponent(message);
    } catch (error) {
      console.warn('Impossible de normaliser le texte en UTF-8 :', error);
      return '';
    }
  })();

  const ascii = normalized.replace(/%([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const bytes = new Uint8Array(ascii.length);
  for (let index = 0; index < ascii.length; index += 1) {
    bytes[index] = ascii.charCodeAt(index);
  }
  return bytes;
};

const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));

const sha256Fallback = (ascii) => {
  const maxWord = Math.pow(2, 32);
  const lengthProperty = 'length';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  const hashConstants = sha256Fallback.h || [];
  const k = sha256Fallback.k || [];
  let primeCounter = k[lengthProperty] || 0;
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (let factor = candidate * candidate; factor < 313; factor += candidate) {
        isComposite[factor] = true;
      }

      hashConstants[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }

  sha256Fallback.h = hashConstants;
  sha256Fallback.k = k;

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (let index = 0; index < ascii[lengthProperty]; index += 1) {
    const code = ascii.charCodeAt(index);
    words[index >> 2] |= code << ((3 - index) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = asciiBitLength;

  let hash = hashConstants.slice(0, 8);
  for (let j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    let currentHash = hash.slice(0);

    for (let i = 0; i < 64; i += 1) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      w[i] = w[i] || 0;
      if (i >= 16) {
        const gamma0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const gamma1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = (((w[i - 16] + gamma0) | 0) + ((w[i - 7] + gamma1) | 0)) | 0;
      }

      const [a, b, c, d, e, f, g, h] = currentHash;
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((h + sigma1) | 0) + ((ch + k[i]) | 0)) | 0) + w[i]) | 0;
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + maj) | 0;

      currentHash = [((temp1 + temp2) | 0), a, b, c, ((d + temp1) | 0), e, f, g];
    }

    for (let i = 0; i < 8; i += 1) {
      hash[i] = (hash[i] + currentHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i += 1) {
    for (let j = 3; j >= 0; j -= 1) {
      const value = (hash[i] >> (j * 8)) & 255;
      result += (value < 16 ? '0' : '') + value.toString(16);
    }
  }

  return result;
};

const digestWithFallback = (message) => {
  const bytes = encodeUtf8(message);
  let ascii = '';
  for (let index = 0; index < bytes.length; index += 1) {
    ascii += String.fromCharCode(bytes[index]);
  }
  return sha256Fallback(ascii);
};

const digestWithWebCrypto = async (message) => {
  if (!hasSubtleCrypto) {
    throw new Error('Web Crypto API is not available in this environment.');
  }

  const data = encodeUtf8(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const digestMessage = async (message) => {
  if (hasSubtleCrypto) {
    try {
      return await digestWithWebCrypto(message);
    } catch (error) {
      console.warn('Échec de la vérification via Web Crypto, recours au mode dégradé.', error);
    }
  }

  return digestWithFallback(message);
};

export async function verifyAdminPassword(input) {
  if (typeof input !== 'string') {
    return { isValid: false, error: null };
  }

  try {
    const inputHash = await digestMessage(input);
    return { isValid: inputHash === ADMIN_PASSWORD_HASH, error: null };
  } catch (error) {
    console.warn('Impossible de vérifier le mot de passe :', error);
    return { isValid: false, error };
  }
}

export function getObfuscatedAdminPasswordHash() {
  return ADMIN_PASSWORD_HASH;
}
