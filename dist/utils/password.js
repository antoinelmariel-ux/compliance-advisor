function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var ADMIN_PASSWORD_HASH = '3c5b8c6aaa89db61910cdfe32f1bdb193d1923146dbd6a7b0634a32ab73ac1af';
var textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
var hasSubtleCrypto = typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function';
var encodeUtf8 = message => {
  if (textEncoder) {
    return textEncoder.encode(message);
  }
  var normalized = (() => {
    try {
      return encodeURIComponent(message);
    } catch (error) {
      console.warn('Impossible de normaliser le texte en UTF-8 :', error);
      return '';
    }
  })();
  var ascii = normalized.replace(/%([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  var bytes = new Uint8Array(ascii.length);
  for (var index = 0; index < ascii.length; index += 1) {
    bytes[index] = ascii.charCodeAt(index);
  }
  return bytes;
};
var rightRotate = (value, amount) => value >>> amount | value << 32 - amount;
var sha256Fallback = ascii => {
  var maxWord = Math.pow(2, 32);
  var lengthProperty = 'length';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hashConstants = sha256Fallback.h || [];
  var k = sha256Fallback.k || [];
  var primeCounter = k[lengthProperty] || 0;
  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (var factor = candidate * candidate; factor < 313; factor += candidate) {
        isComposite[factor] = true;
      }
      hashConstants[primeCounter] = Math.pow(candidate, 0.5) * maxWord | 0;
      k[primeCounter] = Math.pow(candidate, 1 / 3) * maxWord | 0;
      primeCounter += 1;
    }
  }
  sha256Fallback.h = hashConstants;
  sha256Fallback.k = k;
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (var index = 0; index < ascii[lengthProperty]; index += 1) {
    var code = ascii.charCodeAt(index);
    words[index >> 2] |= code << (3 - index) % 4 * 8;
  }
  words[words[lengthProperty]] = asciiBitLength / maxWord | 0;
  words[words[lengthProperty]] = asciiBitLength;
  var hash = hashConstants.slice(0, 8);
  for (var j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var currentHash = hash.slice(0);
    for (var i = 0; i < 64; i += 1) {
      var w15 = w[i - 15];
      var w2 = w[i - 2];
      w[i] = w[i] || 0;
      if (i >= 16) {
        var gamma0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ w15 >>> 3;
        var gamma1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ w2 >>> 10;
        w[i] = (w[i - 16] + gamma0 | 0) + (w[i - 7] + gamma1 | 0) | 0;
      }
      var [a, b, c, d, e, f, g, h] = currentHash;
      var sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      var ch = e & f ^ ~e & g;
      var temp1 = ((h + sigma1 | 0) + (ch + k[i] | 0) | 0) + w[i] | 0;
      var sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      var maj = a & b ^ a & c ^ b & c;
      var temp2 = sigma0 + maj | 0;
      currentHash = [temp1 + temp2 | 0, a, b, c, d + temp1 | 0, e, f, g];
    }
    for (var _i = 0; _i < 8; _i += 1) {
      hash[_i] = hash[_i] + currentHash[_i] | 0;
    }
  }
  var result = '';
  for (var _i2 = 0; _i2 < 8; _i2 += 1) {
    for (var _j = 3; _j >= 0; _j -= 1) {
      var value = hash[_i2] >> _j * 8 & 255;
      result += (value < 16 ? '0' : '') + value.toString(16);
    }
  }
  return result;
};
var digestWithFallback = message => {
  var bytes = encodeUtf8(message);
  var ascii = '';
  for (var index = 0; index < bytes.length; index += 1) {
    ascii += String.fromCharCode(bytes[index]);
  }
  return sha256Fallback(ascii);
};
var digestWithWebCrypto = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (message) {
    if (!hasSubtleCrypto) {
      throw new Error('Web Crypto API is not available in this environment.');
    }
    var data = encodeUtf8(message);
    var hashBuffer = yield crypto.subtle.digest('SHA-256', data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  });
  return function digestWithWebCrypto(_x) {
    return _ref.apply(this, arguments);
  };
}();
var digestMessage = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (message) {
    if (hasSubtleCrypto) {
      try {
        return yield digestWithWebCrypto(message);
      } catch (error) {
        console.warn('Échec de la vérification via Web Crypto, recours au mode dégradé.', error);
      }
    }
    return digestWithFallback(message);
  });
  return function digestMessage(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
export function verifyAdminPassword(_x3) {
  return _verifyAdminPassword.apply(this, arguments);
}
function _verifyAdminPassword() {
  _verifyAdminPassword = _asyncToGenerator(function* (input) {
    if (typeof input !== 'string') {
      return {
        isValid: false,
        error: null
      };
    }
    try {
      var inputHash = yield digestMessage(input);
      return {
        isValid: inputHash === ADMIN_PASSWORD_HASH,
        error: null
      };
    } catch (error) {
      console.warn('Impossible de vérifier le mot de passe :', error);
      return {
        isValid: false,
        error
      };
    }
  });
  return _verifyAdminPassword.apply(this, arguments);
}
export function getObfuscatedAdminPasswordHash() {
  return ADMIN_PASSWORD_HASH;
}