/**
 * Utilidades matemáticas y criptográficas para el cálculo y comparación de SHA-256
 * Utiliza la API nativa Web Crypto del navegador (crypto.subtle).
 */

/**
 * Verifica si la API Web Crypto está disponible en el entorno de ejecución actual.
 * @returns {boolean}
 */
export function isWebCryptoSupported() {
  return typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined' &&
    typeof window.crypto.subtle.digest === 'function';
}

/**
 * Convierte un ArrayBuffer o Uint8Array a una cadena hexadecimal de 64 caracteres.
 * @param {Uint8Array} byteArray
 * @returns {string}
 */
export function bytesToHex(byteArray) {
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convierte un arreglo de bytes a una cadena binaria de 256 caracteres ('0' y '1').
 * @param {Uint8Array} byteArray
 * @returns {string}
 */
export function bytesToBinary(byteArray) {
  return Array.from(byteArray)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Calcula el hash SHA-256 real para una cadena de texto usando UTF-8 y Web Crypto.
 * @param {string} text
 * @returns {Promise<{
 *   hex: string,
 *   bytes: Uint8Array,
 *   binary: string,
 *   bitLength: number,
 *   byteLength: number,
 *   inputCharLength: number,
 *   inputByteLength: number
 * }>}
 */
export async function computeSHA256(text) {
  if (!isWebCryptoSupported()) {
    throw new Error(
      'La Web Crypto API no está disponible en este contexto. ' +
      'Asegúrate de ejecutar la aplicación en localhost o mediante un contexto seguro (HTTPS).'
    );
  }

  // Codificación determinista en bytes UTF-8
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(text);

  // digest nativo por hardware/navegador
  const buffer = await window.crypto.subtle.digest('SHA-256', inputBytes);
  const hashBytes = new Uint8Array(buffer);
  const hex = bytesToHex(hashBytes);
  const binary = bytesToBinary(hashBytes);

  return {
    hex,
    bytes: hashBytes,
    binary,
    bitLength: hashBytes.length * 8, // 256 bits
    byteLength: hashBytes.length,    // 32 bytes
    inputCharLength: text.length,
    inputByteLength: inputBytes.length,
  };
}

/**
 * Realiza una comparación bit a bit exhaustiva entre dos hashes SHA-256 de 32 bytes (256 bits).
 * Calcula la distancia de Hamming y el porcentaje exacto de divergencia.
 * @param {Uint8Array} bytesA
 * @param {Uint8Array} bytesB
 * @returns {{
 *   diffBits: number,
 *   sameBits: number,
 *   totalBits: number,
 *   diffPercentage: number,
 *   samePercentage: number,
 *   byteDiffs: Array<{
 *     byteIndex: number,
 *     hexA: string,
 *     hexB: string,
 *     bitsA: string,
 *     bitsB: string,
 *     diffCount: number,
 *     bits: Array<{ bitIndex: number, valA: number, valB: number, changed: boolean }>
 *   }>
 * } | null}
 */
export function compareHashesBitwise(bytesA, bytesB) {
  if (!bytesA || !bytesB || bytesA.length !== 32 || bytesB.length !== 32) {
    return null;
  }

  let diffBits = 0;
  const totalBits = 256;
  const byteDiffs = [];

  for (let byteIdx = 0; byteIdx < 32; byteIdx++) {
    const bA = bytesA[byteIdx];
    const bB = bytesB[byteIdx];
    const bits = [];
    let byteDiffCount = 0;

    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      const valA = (bA >> bitIdx) & 1;
      const valB = (bB >> bitIdx) & 1;
      const changed = valA !== valB;

      if (changed) {
        diffBits++;
        byteDiffCount++;
      }

      bits.push({
        bitIndex: byteIdx * 8 + (7 - bitIdx),
        valA,
        valB,
        changed,
      });
    }

    byteDiffs.push({
      byteIndex: byteIdx,
      hexA: bA.toString(16).padStart(2, '0'),
      hexB: bB.toString(16).padStart(2, '0'),
      bitsA: bA.toString(2).padStart(8, '0'),
      bitsB: bB.toString(2).padStart(8, '0'),
      diffCount: byteDiffCount,
      bits,
    });
  }

  const sameBits = totalBits - diffBits;
  const diffPercentage = Number(((diffBits / totalBits) * 100).toFixed(2));
  const samePercentage = Number((100 - diffPercentage).toFixed(2));

  return {
    diffBits,
    sameBits,
    totalBits,
    diffPercentage,
    samePercentage,
    byteDiffs,
  };
}

/**
 * Analiza la diferencia exacta entre dos textos para verificar si difieren en exactamente 1 carácter.
 * @param {string} textA
 * @param {string} textB
 * @returns {{
 *   isExactlyOne: boolean,
 *   type: 'substitution' | 'insertion' | 'deletion' | 'identical' | 'multiple',
 *   description: string,
 *   diffCount: number
 * }}
 */
export function analyzeTextDifference(textA, textB) {
  if (textA === textB) {
    return {
      isExactlyOne: false,
      type: 'identical',
      description: 'Los dos mensajes son idénticos. No hay cambios.',
      diffCount: 0,
    };
  }

  const lenA = textA.length;
  const lenB = textB.length;

  // Caso 1: Misma longitud (sustitución de 1 carácter)
  if (lenA === lenB) {
    let diffIndex = -1;
    let diffCount = 0;

    for (let i = 0; i < lenA; i++) {
      if (textA[i] !== textB[i]) {
        diffCount++;
        diffIndex = i;
      }
    }

    if (diffCount === 1) {
      const charA = textA[diffIndex] === ' ' ? '[Espacio]' : `'${textA[diffIndex]}'`;
      const charB = textB[diffIndex] === ' ' ? '[Espacio]' : `'${textB[diffIndex]}'`;
      return {
        isExactlyOne: true,
        type: 'substitution',
        description: `Sustituiste ${charA} por ${charB} en la posición ${diffIndex + 1}.`,
        diffCount: 1,
      };
    }

    return {
      isExactlyOne: false,
      type: 'multiple',
      description: `Los mensajes tienen ${diffCount} caracteres diferentes (se requiere exactamente 1).`,
      diffCount,
    };
  }

  // Caso 2: Inserción de 1 carácter (lenB = lenA + 1)
  if (lenB === lenA + 1) {
    let i = 0;
    while (i < lenA && textA[i] === textB[i]) i++;
    let j = 0;
    while (j < lenA && textA[lenA - 1 - j] === textB[lenB - 1 - j]) j++;

    if (i + j >= lenA) {
      const insertedChar = textB[i] === ' ' ? '[Espacio]' : `'${textB[i]}'`;
      return {
        isExactlyOne: true,
        type: 'insertion',
        description: `Agregaste el carácter ${insertedChar} en la posición ${i + 1}.`,
        diffCount: 1,
      };
    }
  }

  // Caso 3: Eliminación de 1 carácter (lenA = lenB + 1)
  if (lenA === lenB + 1) {
    let i = 0;
    while (i < lenB && textA[i] === textB[i]) i++;
    let j = 0;
    while (j < lenB && textA[lenA - 1 - j] === textB[lenB - 1 - j]) j++;

    if (i + j >= lenB) {
      const removedChar = textA[i] === ' ' ? '[Espacio]' : `'${textA[i]}'`;
      return {
        isExactlyOne: true,
        type: 'deletion',
        description: `Eliminaste el carácter ${removedChar} de la posición ${i + 1}.`,
        diffCount: 1,
      };
    }
  }

  // Diferencia mayor
  return {
    isExactlyOne: false,
    type: 'multiple',
    description: `La longitud varía en ${Math.abs(lenA - lenB)} caracteres (se requiere exactamente 1 carácter de diferencia).`,
    diffCount: Math.abs(lenA - lenB),
  };
}
