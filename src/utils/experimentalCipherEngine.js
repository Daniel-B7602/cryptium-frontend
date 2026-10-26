/**
 * ================================================================
 * Cryptium – Motor de Cifrado Experimental Reversible
 * ================================================================
 * Implementación de transformaciones biyectivas parametrizadas para
 * diseño de cifrados por composición (confusión y difusión).
 * Garantiza reversibilidad matemática estricta: D(E(M)) = M.
 */

// ─── Utilidades de Bytes ──────────────────────────────────────────────────

export function stringToUtf8Bytes(str) {
  return new TextEncoder().encode(str);
}

export function utf8BytesToString(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  }
}

export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

export function bytesToBase64(bytes) {
  try {
    if (!bytes || bytes.length === 0) return '';
    let binary = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i] & 0xFF);
    }
    return btoa(binary);
  } catch {
    return '';
  }
}

export function calculateShannonEntropy(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  const freq = new Map();
  for (const b of bytes) {
    freq.set(b, (freq.get(b) || 0) + 1);
  }

  let entropy = 0;
  const len = bytes.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

export function countDifferentBytes(bytesA, bytesB) {
  if (!bytesA || !bytesB) return 0;
  const minLen = Math.min(bytesA.length, bytesB.length);
  const maxLen = Math.max(bytesA.length, bytesB.length);
  let diff = 0;
  for (let i = 0; i < minLen; i++) {
    if (bytesA[i] !== bytesB[i]) diff++;
  }
  diff += (maxLen - minLen);
  return diff;
}

// ─── Definición de Transformaciones Reversibles ────────────────────────────

export const TRANSFORMATION_TYPES = {
  XOR: {
    id: 'XOR',
    name: 'XOR con Clave Cíclica',
    tag: 'Mezcla / AddRoundKey',
    badgeClass: 'badge-accent',
    defaultParams: { key: 'CRYPTIUM' },
    description: 'Aplica una operación XOR byte a byte con una clave cíclica. Es una involución (su propia inversa).',
    inverseDescription: 'Se aplica exactamente el mismo XOR con la misma clave cíclica (A ⊕ B ⊕ B = A).',
  },
  PERMUTATION: {
    id: 'PERMUTATION',
    name: 'Permutación / Transposición de Bytes',
    tag: 'Difusión / ShiftRows',
    badgeClass: 'badge-purple',
    defaultParams: { mode: 'rotate_left', shift: 3 },
    description: 'Reordena las posiciones de los bytes sin modificar sus valores (rotación circular o inversión).',
    inverseDescription: 'Aplica el desplazamiento o transposición en sentido contrario (rotación a la derecha).',
  },
  SUBSTITUTION: {
    id: 'SUBSTITUTION',
    name: 'Sustitución Reversible (Caja S Modular)',
    tag: 'Confusión / SubBytes',
    badgeClass: 'badge-green',
    defaultParams: { mode: 'modulo_add', offset: 42 },
    description: 'Transformación biyectiva que mapea cada byte mediante suma modular (C = (P + k) mod 256).',
    inverseDescription: 'Resta modular inversa para restaurar el valor original (P = (C - k + 256) mod 256).',
  },
};

// ─── Ejecutores de Transformaciones ────────────────────────────────────────

/**
 * 1. Transformación XOR
 */
function applyXor(bytes, keyStr) {
  const validKey = (keyStr && typeof keyStr === 'string' && keyStr.length > 0) ? keyStr : 'CRYPTIUM';
  const keyBytes = stringToUtf8Bytes(validKey);
  const result = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return result;
}

/**
 * 2. Transformación de Permutación
 */
function applyPermutationForward(bytes, params = {}) {
  const len = bytes.length;
  if (len <= 1) return new Uint8Array(bytes);
  const result = new Uint8Array(len);
  const mode = params?.mode || 'rotate_left';

  if (mode === 'reverse') {
    for (let i = 0; i < len; i++) {
      result[i] = bytes[len - 1 - i];
    }
  } else if (mode === 'swap_pairs') {
    for (let i = 0; i < len; i++) {
      const target = (i % 2 === 0) ? Math.min(i + 1, len - 1) : i - 1;
      result[i] = bytes[target];
    }
  } else {
    // Rotación circular a la izquierda por defecto
    const shiftVal = Number(params?.shift);
    const shift = (((isNaN(shiftVal) ? 1 : shiftVal) % len) + len) % len;
    for (let i = 0; i < len; i++) {
      result[i] = bytes[(i + shift) % len];
    }
  }
  return result;
}

function applyPermutationInverse(bytes, params = {}) {
  const len = bytes.length;
  if (len <= 1) return new Uint8Array(bytes);
  const result = new Uint8Array(len);
  const mode = params?.mode || 'rotate_left';

  if (mode === 'reverse') {
    // La inversión de array es una involución
    for (let i = 0; i < len; i++) {
      result[i] = bytes[len - 1 - i];
    }
  } else if (mode === 'swap_pairs') {
    // El swap por pares es su propia inversa
    for (let i = 0; i < len; i++) {
      const target = (i % 2 === 0) ? Math.min(i + 1, len - 1) : i - 1;
      result[i] = bytes[target];
    }
  } else {
    // Inversa de rotación a la izquierda: rotación a la derecha
    const shiftVal = Number(params?.shift);
    const shift = (((isNaN(shiftVal) ? 1 : shiftVal) % len) + len) % len;
    for (let i = 0; i < len; i++) {
      result[i] = bytes[(i - shift + len) % len];
    }
  }
  return result;
}

/**
 * 3. Transformación de Sustitución
 */
function applySubstitutionForward(bytes, params = {}) {
  const result = new Uint8Array(bytes.length);
  const mode = params?.mode || 'modulo_add';
  if (mode === 'invert_bits') {
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ 0xFF; // Complemento a 1 (NOT)
    }
  } else {
    // Suma modular de byte: (b + offset) mod 256
    const offsetVal = Number(params?.offset);
    const offset = (((isNaN(offsetVal) ? 1 : offsetVal) % 256) + 256) % 256;
    for (let i = 0; i < bytes.length; i++) {
      result[i] = (bytes[i] + offset) % 256;
    }
  }
  return result;
}

function applySubstitutionInverse(bytes, params = {}) {
  const result = new Uint8Array(bytes.length);
  const mode = params?.mode || 'modulo_add';
  if (mode === 'invert_bits') {
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ 0xFF; // Involución
    }
  } else {
    // Resta modular de byte: (b - offset + 256) mod 256
    const offsetVal = Number(params?.offset);
    const offset = (((isNaN(offsetVal) ? 1 : offsetVal) % 256) + 256) % 256;
    for (let i = 0; i < bytes.length; i++) {
      result[i] = (bytes[i] - offset + 256) % 256;
    }
  }
  return result;
}

// ─── Motores de Ejecución de Pipeline ──────────────────────────────────────

/**
 * Ejecuta el cifrado a través de la secuencia configurada de operaciones.
 * @param {string} plainText
 * @param {Array<{ id: string, type: string, params: object }>} pipeline
 */
export function executeEncryptionPipeline(plainText, pipeline) {
  const originalBytes = stringToUtf8Bytes(plainText);
  let currentBytes = new Uint8Array(originalBytes);
  const steps = [];

  for (let idx = 0; idx < pipeline.length; idx++) {
    const op = pipeline[idx];
    const prevBytes = new Uint8Array(currentBytes);

    switch (op.type) {
      case 'XOR':
        currentBytes = applyXor(currentBytes, op.params.key);
        break;
      case 'PERMUTATION':
        currentBytes = applyPermutationForward(currentBytes, op.params);
        break;
      case 'SUBSTITUTION':
        currentBytes = applySubstitutionForward(currentBytes, op.params);
        break;
      default:
        break;
    }

    steps.push({
      stepNumber: idx + 1,
      opId: op.id,
      opType: op.type,
      opName: TRANSFORMATION_TYPES[op.type]?.name || op.type,
      params: { ...op.params },
      inputHex: bytesToHex(prevBytes),
      outputHex: bytesToHex(currentBytes),
      outputPreview: utf8BytesToString(currentBytes),
      bytesCount: currentBytes.length,
      bytesChanged: countDifferentBytes(prevBytes, currentBytes),
      description: TRANSFORMATION_TYPES[op.type]?.description,
    });
  }

  return {
    originalBytes,
    originalHex: bytesToHex(originalBytes),
    steps,
    finalBytes: currentBytes,
    finalHex: bytesToHex(currentBytes),
    finalBase64: bytesToBase64(currentBytes),
  };
}

/**
 * Ejecuta el descifrado aplicando las operaciones inversas en orden estrictamente inverso.
 * @param {Uint8Array} cipherBytes
 * @param {Array<{ id: string, type: string, params: object }>} pipeline
 */
export function executeDecryptionPipeline(cipherBytes, pipeline) {
  let currentBytes = new Uint8Array(cipherBytes);
  const steps = [];

  // Orden inverso: de n-1 hasta 0
  for (let idx = pipeline.length - 1; idx >= 0; idx--) {
    const op = pipeline[idx];
    const prevBytes = new Uint8Array(currentBytes);

    switch (op.type) {
      case 'XOR':
        currentBytes = applyXor(currentBytes, op.params.key);
        break;
      case 'PERMUTATION':
        currentBytes = applyPermutationInverse(currentBytes, op.params);
        break;
      case 'SUBSTITUTION':
        currentBytes = applySubstitutionInverse(currentBytes, op.params);
        break;
      default:
        break;
    }

    steps.push({
      stepNumber: steps.length + 1,
      inverseOfStep: idx + 1,
      opId: op.id,
      opType: op.type,
      opName: `Inversa de ${TRANSFORMATION_TYPES[op.type]?.name || op.type}`,
      params: { ...op.params },
      inputHex: bytesToHex(prevBytes),
      outputHex: bytesToHex(currentBytes),
      outputPreview: utf8BytesToString(currentBytes),
      bytesCount: currentBytes.length,
      description: TRANSFORMATION_TYPES[op.type]?.inverseDescription,
    });
  }

  const recoveredText = utf8BytesToString(currentBytes);

  return {
    recoveredBytes: currentBytes,
    recoveredHex: bytesToHex(currentBytes),
    recoveredText,
    steps,
  };
}

// ─── Presets Educativos ───────────────────────────────────────────────────

export const CIPHER_PRESETS = [
  {
    id: 'spn_classic',
    name: 'Red SPN Clásica (Sustitución + Permutación + Mezcla XOR)',
    desc: 'Arquitectura canónica de cifrado por bloques inspirada en Shannon: primero sustitución (confusión), luego rotación (difusión) y finalmente mezcla con clave.',
    pipeline: [
      { id: 'op_1', type: 'SUBSTITUTION', params: { mode: 'modulo_add', offset: 73 } },
      { id: 'op_2', type: 'PERMUTATION', params: { mode: 'rotate_left', shift: 3 } },
      { id: 'op_3', type: 'XOR', params: { key: 'KEY_RONDA_1' } },
    ],
  },
  {
    id: 'double_round',
    name: 'Cifrado en Dos Rondas (Mini-Cipher Feistel/SPN)',
    desc: 'Cadena de 4 operaciones consecutivas que simula dos rondas completas de mezcla, difusión y confusión modular.',
    pipeline: [
      { id: 'op_1', type: 'XOR', params: { key: 'RONDA_A' } },
      { id: 'op_2', type: 'SUBSTITUTION', params: { mode: 'modulo_add', offset: 31 } },
      { id: 'op_3', type: 'PERMUTATION', params: { mode: 'rotate_left', shift: 5 } },
      { id: 'op_4', type: 'XOR', params: { key: 'RONDA_B' } },
    ],
  },
  {
    id: 'transposition_sub',
    name: 'Transposición e Inversión de Bits',
    desc: 'Combina inversión de orden de bytes con complemento a 1 y mezcla final XOR.',
    pipeline: [
      { id: 'op_1', type: 'PERMUTATION', params: { mode: 'reverse', shift: 0 } },
      { id: 'op_2', type: 'SUBSTITUTION', params: { mode: 'invert_bits', offset: 0 } },
      { id: 'op_3', type: 'XOR', params: { key: 'DELTA2026' } },
    ],
  },
];
