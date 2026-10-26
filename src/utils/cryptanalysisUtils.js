/**
 * Utilidades criptográficas y de análisis para el Módulo 6: Criptoanálisis
 * Funciones puras para análisis de frecuencias, fuerza bruta César y comparación AES-GCM.
 */

// Tablas de frecuencias de referencia de letras (en porcentajes normalizados %)
export const LETTER_FREQUENCIES_ES = {
  E: 13.68,
  A: 12.53,
  O: 8.68,
  S: 7.98,
  R: 6.87,
  N: 6.71,
  I: 6.25,
  D: 5.86,
  L: 4.97,
  C: 4.68,
  T: 4.63,
  U: 3.93,
  M: 3.15,
  P: 2.51,
  B: 1.42,
  G: 1.01,
  V: 0.90,
  Y: 0.90,
  Q: 0.88,
  H: 0.70,
  F: 0.69,
  Z: 0.52,
  J: 0.44,
  X: 0.22,
  K: 0.05,
  W: 0.04,
};

export const LETTER_FREQUENCIES_EN = {
  E: 12.70,
  T: 9.06,
  A: 8.17,
  O: 7.51,
  I: 6.97,
  N: 6.75,
  S: 6.33,
  H: 6.09,
  R: 5.99,
  D: 4.25,
  L: 4.03,
  C: 2.78,
  U: 2.76,
  M: 2.41,
  W: 2.36,
  F: 2.23,
  G: 2.02,
  Y: 1.97,
  P: 1.93,
  B: 1.29,
  V: 0.98,
  K: 0.77,
  J: 0.15,
  X: 0.15,
  Q: 0.10,
  Z: 0.07,
};

// Palabras comunes breves para heurística de detección
const COMMON_WORDS_ES = new Set([
  'EL', 'LA', 'DE', 'QUE', 'Y', 'EN', 'UN', 'SE', 'NO', 'HABER', 'POR',
  'CON', 'SU', 'PARA', 'COMO', 'ESTAR', 'TENER', 'LE', 'LO', 'TODO',
  'PERO', 'MAS', 'HACER', 'O', 'PODER', 'DECIR', 'ESTE', 'IR', 'OTRO',
  'ESE', 'LA', 'SI', 'ME', 'YA', 'VER', 'PORQUE', 'DAR', 'CUANDO',
  'HOLA', 'MUNDO', 'MENSAJE', 'SEGURIDAD', 'CLAVE', 'CIFRADO', 'TEXTO'
]);

const COMMON_WORDS_EN = new Set([
  'THE', 'BE', 'TO', 'OF', 'AND', 'A', 'IN', 'THAT', 'HAVE', 'I',
  'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU', 'DO', 'AT',
  'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER',
  'SHE', 'OR', 'AN', 'WILL', 'MY', 'ONE', 'ALL', 'WOULD', 'THERE',
  'HELLO', 'WORLD', 'MESSAGE', 'SECURITY', 'CIPHER', 'SECRET'
]);

/**
 * Aplica el cifrado o descifrado César preservando mayúsculas, minúsculas,
 * acentos y caracteres especiales.
 * @param {string} text
 * @param {number} shift Desplazamiento (0 a 25)
 * @returns {string}
 */
export function caesarShift(text, shift) {
  const normShift = ((shift % 26) + 26) % 26;
  return text.split('').map((char) => {
    const code = char.charCodeAt(0);
    // Mayúsculas A-Z (65-90)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + normShift) % 26) + 65);
    }
    // Minúsculas a-z (97-122)
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + normShift) % 26) + 97);
    }
    // Otros caracteres (espacios, números, tildes, puntuación) se preservan
    return char;
  }).join('');
}

/**
 * Calcula la puntuación heurística de plausibilidad lingüística para un texto.
 * Combina la concordancia con las letras más frecuentes y la presencia de palabras comunes.
 * @param {string} text
 * @param {'es' | 'en'} lang
 * @returns {number} Puntuación de 0 a 100
 */
export function scorePlausibility(text, lang = 'es') {
  if (!text || text.trim().length === 0) return 0;

  const upper = text.toUpperCase();
  const words = upper.split(/[^A-ZÁÉÍÓÚÑa-záéíóúñ]+/).filter((w) => w.length > 0);
  const commonDict = lang === 'es' ? COMMON_WORDS_ES : COMMON_WORDS_EN;
  const refFreq = lang === 'es' ? LETTER_FREQUENCIES_ES : LETTER_FREQUENCIES_EN;

  // 1. Puntos por palabras reconocidas
  let wordMatches = 0;
  for (const w of words) {
    if (commonDict.has(w)) wordMatches++;
  }
  const wordScore = words.length > 0 ? (wordMatches / words.length) * 60 : 0;

  // 2. Concordancia estadística de las letras top (E, A, O, S en ES o E, T, A, O en EN)
  let letterCount = 0;
  const counts = {};
  for (const c of upper) {
    if (c >= 'A' && c <= 'Z') {
      counts[c] = (counts[c] || 0) + 1;
      letterCount++;
    }
  }

  if (letterCount === 0) return 0;

  let correlationScore = 0;
  const topLetters = lang === 'es' ? ['E', 'A', 'O', 'S', 'R', 'N'] : ['E', 'T', 'A', 'O', 'I', 'N'];
  for (const l of topLetters) {
    const obs = ((counts[l] || 0) / letterCount) * 100;
    const exp = refFreq[l] || 5;
    // Si la letra frecuente aparece en un rango razonable, suma puntos
    const diff = Math.abs(obs - exp);
    if (diff < 6) correlationScore += 7;
    else if (diff < 12) correlationScore += 3;
  }

  return Math.min(100, Math.round(wordScore + correlationScore));
}

/**
 * Ejecuta el ataque exhaustivo por fuerza bruta contra César.
 * Prueba los 26 desplazamientos posibles y calcula un puntaje heurístico.
 * @param {string} ciphertext
 * @param {'es' | 'en'} lang
 * @returns {Array<{ shift: number, key: number, plaintext: string, score: number, isBest: boolean }>}
 */
export function bruteForceCaesar(ciphertext, lang = 'es') {
  const candidates = [];

  for (let shift = 0; shift < 26; shift++) {
    // Si fue cifrado con k, se descifra con (26 - k)
    const decrypted = caesarShift(ciphertext, 26 - shift);
    const score = scorePlausibility(decrypted, lang);
    candidates.push({
      shift,
      key: shift,
      plaintext: decrypted,
      score,
      isBest: false,
    });
  }

  // Identificar la candidata con mayor puntaje
  let maxScore = -1;
  let bestIdx = 0;
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].score > maxScore) {
      maxScore = candidates[i].score;
      bestIdx = i;
    }
  }

  if (maxScore > 10) {
    candidates[bestIdx].isBest = true;
  }

  return candidates;
}

/**
 * Calcula las frecuencias reales de caracteres en un texto.
 * @param {string} text
 * @param {'es' | 'en'} lang
 * @returns {{
 *   totalLetters: number,
 *   data: Array<{ letter: string, count: number, observed: number, reference: number }>,
 *   topObserved: Array<{ letter: string, count: number, observed: number }>
 * }}
 */
export function calculateFrequencies(text, lang = 'es') {
  const upper = text.toUpperCase();
  const counts = {};
  let totalLetters = 0;

  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      const char = upper[i];
      counts[char] = (counts[char] || 0) + 1;
      totalLetters++;
    }
  }

  const refFreq = lang === 'es' ? LETTER_FREQUENCIES_ES : LETTER_FREQUENCIES_EN;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const data = alphabet.map((letter) => {
    const count = counts[letter] || 0;
    const observed = totalLetters > 0 ? Number(((count / totalLetters) * 100).toFixed(2)) : 0;
    const reference = refFreq[letter] || 0;
    return {
      letter,
      count,
      observed,
      reference,
    };
  });

  const topObserved = [...data]
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalLetters,
    data,
    topObserved,
  };
}

/**
 * Cifra un texto usando AES-GCM con Web Crypto API.
 * @param {string} text
 * @param {CryptoKey} key Clave AES-GCM de 256 bits
 * @param {Uint8Array} iv Vector de inicialización (96 bits / 12 bytes)
 * @returns {Promise<{
 *   ciphertextBytes: Uint8Array,
 *   ciphertextHex: string,
 *   tagHex: string,
 *   fullHex: string
 * }>}
 */
export async function encryptAESGCM(text, key, iv) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const buffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 16 bytes de tag de autenticación
    },
    key,
    data
  );

  const fullBytes = new Uint8Array(buffer);
  // Los últimos 16 bytes de AES-GCM en Web Crypto corresponden a la etiqueta de autenticación (Tag)
  const tagStart = fullBytes.length - 16;
  const cipherBytes = fullBytes.slice(0, tagStart);
  const tagBytes = fullBytes.slice(tagStart);

  const toHex = (arr) => Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    ciphertextBytes: cipherBytes,
    tagBytes,
    fullBytes,
    ciphertextHex: toHex(cipherBytes),
    tagHex: toHex(tagBytes),
    fullHex: toHex(fullBytes),
  };
}

/**
 * Genera una clave AES-GCM de 256 bits para demostración educativa.
 * @returns {Promise<CryptoKey>}
 */
export async function generateAESGCMKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Compara dos secuencias de bytes y calcula las posiciones diferentes.
 * @param {Uint8Array} bytesA
 * @param {Uint8Array} bytesB
 * @returns {{
 *   totalLength: number,
 *   diffCount: number,
 *   diffPercentage: number,
 *   sameCount: number
 * }}
 */
export function compareBytesDifference(bytesA, bytesB) {
  if (!bytesA || !bytesB) return { totalLength: 0, diffCount: 0, diffPercentage: 0, sameCount: 0 };
  const minLen = Math.min(bytesA.length, bytesB.length);
  const maxLen = Math.max(bytesA.length, bytesB.length);

  let diffCount = 0;
  for (let i = 0; i < minLen; i++) {
    if (bytesA[i] !== bytesB[i]) diffCount++;
  }
  // Se suman los bytes excedentes por diferencia de longitud
  diffCount += (maxLen - minLen);

  const diffPercentage = maxLen > 0 ? Number(((diffCount / maxLen) * 100).toFixed(2)) : 0;
  const sameCount = maxLen - diffCount;

  return {
    totalLength: maxLen,
    diffCount,
    diffPercentage,
    sameCount,
  };
}
