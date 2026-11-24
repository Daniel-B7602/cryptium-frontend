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
  SUBSTITUTION: {
    id: 'SUBSTITUTION',
    name: 'Sustitución de Bytes',
    concept: 'Confusión (Ocultar el valor)',
    tag: 'Confusión / SubBytes',
    badgeClass: 'badge-green',
    iconName: 'Sparkles',
    analogy: 'Como un código secreto o el cifrado César: cambia cada letra por otra diferente según una regla matemática.',
    defaultParams: { mode: 'modulo_add', offset: 15 },
    description: 'Transformación biyectiva que modifica el valor de cada byte (suma modular o inversión de bits).',
    inverseDescription: 'Resta modular o inversión inversa que restaura el valor original de cada byte exactamente.',
    paramsDoc: {
      modulo_add: 'Suma un valor fijo (k) a cada byte. Si supera 255, da la vuelta (módulo 256), como las 12 horas en un reloj.',
      invert_bits: 'Invierte cada bit individualmente (operación NOT: 0 pasa a 1 y 1 pasa a 0). Es su propia inversa.',
    },
  },
  PERMUTATION: {
    id: 'PERMUTATION',
    name: 'Permutación / Barajado',
    concept: 'Difusión (Mover la posición)',
    tag: 'Difusión / ShiftRows',
    badgeClass: 'badge-purple',
    iconName: 'ArrowRightLeft',
    analogy: 'Como barajar un mazo de cartas: no cambia las cartas, pero altera por completo el orden en que aparecen.',
    defaultParams: { mode: 'rotate_left', shift: 3 },
    description: 'Reordena las posiciones espaciales de los bytes sin modificar sus valores numéricos.',
    inverseDescription: 'Aplica el desplazamiento o transposición en sentido exactamente contrario.',
    paramsDoc: {
      rotate_left: 'Desplaza los bytes hacia la izquierda k posiciones. Los que salen por la izquierda entran por la derecha.',
      reverse: 'Invierte todo el orden de los bytes (el primer byte pasa al último lugar y viceversa).',
      swap_pairs: 'Intercambia los bytes en parejas adyacentes (byte 0 ↔ byte 1, byte 2 ↔ byte 3...).',
    },
  },
  XOR: {
    id: 'XOR',
    name: 'Mezcla Secreta (XOR con Clave)',
    concept: 'Mezcla con Secreto',
    tag: 'Mezcla / AddRoundKey',
    badgeClass: 'badge-accent',
    iconName: 'Zap',
    analogy: 'Como un candado digital de doble llave: combina cada bit con tu contraseña. Si vuelves a aplicar la misma contraseña, el candado se abre.',
    defaultParams: { key: 'CRYPTIUM' },
    description: 'Combina cada byte con los bytes de una clave secreta mediante la operación lógica binaria XOR (⊕).',
    inverseDescription: 'Se reaplica exactamente el mismo XOR con la misma clave secreta (A ⊕ B ⊕ B = A).',
    paramsDoc: {
      key: 'Palabra o frase clave secreta. Si el mensaje es más largo que la clave, esta se repite cíclicamente para cubrirlo.',
    },
  },
};

// Aliases en minúsculas y sinónimos comunes para máxima resiliencia
TRANSFORMATION_TYPES.substitution = TRANSFORMATION_TYPES.SUBSTITUTION;
TRANSFORMATION_TYPES.permutation = TRANSFORMATION_TYPES.PERMUTATION;
TRANSFORMATION_TYPES.transposition = TRANSFORMATION_TYPES.PERMUTATION;
TRANSFORMATION_TYPES.xor = TRANSFORMATION_TYPES.XOR;

/**
 * Normaliza el identificador de tipo de transformación a mayúsculas canónicas.
 */
export function normalizeOperationType(type) {
  if (!type) return 'SUBSTITUTION';
  const upper = String(type).trim().toUpperCase();
  if (upper.includes('SUB') || upper === 'CAESAR') return 'SUBSTITUTION';
  if (upper.includes('PERM') || upper.includes('TRANS')) return 'PERMUTATION';
  if (upper.includes('XOR')) return 'XOR';
  return upper;
}

/**
 * Obtiene la definición de una transformación de manera segura.
 */
export function getTransformationDef(type) {
  const norm = normalizeOperationType(type);
  return TRANSFORMATION_TYPES[norm] || TRANSFORMATION_TYPES.SUBSTITUTION;
}

// ─── Utilidad de Visualización Detallada de Bytes ───────────────────────────

export function formatBytesForVisualizer(bytes) {
  if (!bytes) return [];
  const result = [];
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    const val = bytes[i];
    const isPrintable = val >= 32 && val <= 126;
    const char = isPrintable ? String.fromCharCode(val) : '·';
    const hex = val.toString(16).padStart(2, '0').toUpperCase();
    result.push({
      index: i,
      val,
      char,
      hex,
      isPrintable,
    });
  }
  return result;
}

// ─── Generadores de Explicaciones Didácticas Paso a Paso ───────────────────

function generateStepExplanation(op, prevBytes, currentBytes) {
  const len = currentBytes.length;
  const changed = countDifferentBytes(prevBytes, currentBytes);
  const pct = len > 0 ? ((changed / len) * 100).toFixed(0) : 0;
  const firstOld = prevBytes[0];
  const firstNew = currentBytes[0];
  const firstOldChar = (firstOld >= 32 && firstOld <= 126) ? `'${String.fromCharCode(firstOld)}'` : `0x${firstOld?.toString(16).toUpperCase()}`;
  const firstNewChar = (firstNew >= 32 && firstNew <= 126) ? `'${String.fromCharCode(firstNew)}'` : `0x${firstNew?.toString(16).toUpperCase()}`;
  const opType = normalizeOperationType(op?.type);

  switch (opType) {
    case 'XOR': {
      const key = op.params?.key || op.params?.repeatingKey || op.params?.keyByte || 'CRYPTIUM';
      return `Se aplicó la operación lógica XOR (⊕) byte a byte con la clave cíclica "${key}". Cada bit del mensaje se combinó con los bits de la clave. Mutaron ${changed} de ${len} bytes (${pct}%).`;
    }
    case 'PERMUTATION': {
      const mode = (op.params?.mode || 'rotate_left').toLowerCase();
      if (mode === 'reverse') {
        return `Se invirtió el orden completo de los ${len} bytes (el primer byte pasó al último lugar y viceversa). Ningún valor individual cambió, solo sus posiciones (difusión espacial pura).`;
      }
      if (mode === 'swap_pairs' || mode === 'swap_halves') {
        return `Se intercambiaron los bytes en parejas adyacentes (byte 0 ↔ byte 1, byte 2 ↔ byte 3...). Se preservaron los valores numéricos pero se alteró el orden espacial.`;
      }
      const shift = Number(op.params?.shift ?? op.params?.offset ?? 3);
      return `Se aplicó una rotación circular a la izquierda de ${shift} posiciones. Los primeros ${shift} bytes pasaron al final del mensaje (difusión por desplazamiento).`;
    }
    case 'SUBSTITUTION': {
      const mode = (op.params?.mode || 'modulo_add').toLowerCase();
      if (mode === 'invert_bits' || mode === 'invert' || mode === 'not') {
        return `Se invirtió cada bit individualmente (operación NOT o complemento a 1: 0 ↔ 1). Cada byte ${firstOldChar} se convirtió en su opuesto binario ${firstNewChar}.`;
      }
      const offset = Number(op.params?.offset ?? op.params?.shift ?? 15);
      return `Se sumó un desplazamiento aritmético de +${offset} a cada byte (módulo 256). Por ejemplo, el primer byte ${firstOldChar} (${firstOld}) se transformó en ${firstNewChar} (${firstNew}).`;
    }
    default:
      return 'Transformación aplicada a los bytes del mensaje.';
  }
}

function generateInverseStepExplanation(op, prevBytes, currentBytes) {
  const opType = normalizeOperationType(op?.type);

  switch (opType) {
    case 'XOR': {
      const key = op.params?.key || op.params?.repeatingKey || op.params?.keyByte || 'CRYPTIUM';
      return `Se reaplicó XOR (⊕) con la misma clave "${key}". Gracias a la propiedad (A ⊕ B ⊕ B = A), la operación se deshace exactamente a sí misma.`;
    }
    case 'PERMUTATION': {
      const mode = (op.params?.mode || 'rotate_left').toLowerCase();
      if (mode === 'reverse') {
        return `Se reinvirtió el orden de los bytes, restaurando cada posición espacial previa.`;
      }
      if (mode === 'swap_pairs' || mode === 'swap_halves') {
        return `Se volvieron a intercambiar las parejas adyacentes, devolviendo cada byte a su índice original.`;
      }
      const shift = Number(op.params?.shift ?? op.params?.offset ?? 3);
      return `Se aplicó una rotación inversa a la derecha de ${shift} posiciones para devolver cada byte a su posición anterior.`;
    }
    case 'SUBSTITUTION': {
      const mode = (op.params?.mode || 'modulo_add').toLowerCase();
      if (mode === 'invert_bits' || mode === 'invert' || mode === 'not') {
        return `Se reaplicó la inversión de bits (NOT), devolviendo cada bit a su estado original (0 ↔ 1).`;
      }
      const offset = Number(op.params?.offset ?? op.params?.shift ?? 15);
      return `Se restó el desplazamiento de -${offset} (módulo 256), restaurando el valor numérico exacto de cada byte antes de la suma.`;
    }
    default:
      return 'Operación inversa aplicada.';
  }
}

// ─── Ejecutores de Transformaciones ────────────────────────────────────────

/**
 * 1. Transformación XOR
 */
function applyXor(bytes, keyParam) {
  let validKey = 'CRYPTIUM';
  if (typeof keyParam === 'string' && keyParam.length > 0) {
    validKey = keyParam;
  } else if (typeof keyParam === 'number' && !isNaN(keyParam)) {
    validKey = String.fromCharCode(keyParam & 0xFF);
  }
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
  const mode = (params?.mode || 'rotate_left').toLowerCase();

  if (mode === 'reverse') {
    for (let i = 0; i < len; i++) {
      result[i] = bytes[len - 1 - i];
    }
  } else if (mode === 'swap_pairs' || mode === 'swap_halves') {
    for (let i = 0; i < len; i++) {
      const target = (i % 2 === 0) ? Math.min(i + 1, len - 1) : i - 1;
      result[i] = bytes[target];
    }
  } else {
    // Rotación circular a la izquierda por defecto
    const shiftVal = Number(params?.shift ?? params?.offset ?? 3);
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
  const mode = (params?.mode || 'rotate_left').toLowerCase();

  if (mode === 'reverse') {
    // La inversión de array es una involución
    for (let i = 0; i < len; i++) {
      result[i] = bytes[len - 1 - i];
    }
  } else if (mode === 'swap_pairs' || mode === 'swap_halves') {
    // El swap por pares es su propia inversa
    for (let i = 0; i < len; i++) {
      const target = (i % 2 === 0) ? Math.min(i + 1, len - 1) : i - 1;
      result[i] = bytes[target];
    }
  } else {
    // Inversa de rotación a la izquierda: rotación a la derecha
    const shiftVal = Number(params?.shift ?? params?.offset ?? 3);
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
  const mode = (params?.mode || 'modulo_add').toLowerCase();
  if (mode === 'invert_bits' || mode === 'invert' || mode === 'not') {
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ 0xFF; // Complemento a 1 (NOT)
    }
  } else {
    // Suma modular de byte: (b + offset) mod 256
    const offsetVal = Number(params?.offset ?? params?.shift ?? 15);
    const offset = (((isNaN(offsetVal) ? 1 : offsetVal) % 256) + 256) % 256;
    for (let i = 0; i < bytes.length; i++) {
      result[i] = (bytes[i] + offset) % 256;
    }
  }
  return result;
}

function applySubstitutionInverse(bytes, params = {}) {
  const result = new Uint8Array(bytes.length);
  const mode = (params?.mode || 'modulo_add').toLowerCase();
  if (mode === 'invert_bits' || mode === 'invert' || mode === 'not') {
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ 0xFF; // Involución
    }
  } else {
    // Resta modular de byte: (b - offset + 256) mod 256
    const offsetVal = Number(params?.offset ?? params?.shift ?? 15);
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
    const normType = normalizeOperationType(op?.type);
    const opParams = op?.params || {};

    switch (normType) {
      case 'XOR':
        currentBytes = applyXor(currentBytes, opParams.key ?? opParams.repeatingKey ?? opParams.keyByte ?? 'CRYPTIUM');
        break;
      case 'PERMUTATION':
        currentBytes = applyPermutationForward(currentBytes, opParams);
        break;
      case 'SUBSTITUTION':
        currentBytes = applySubstitutionForward(currentBytes, opParams);
        break;
      default:
        break;
    }

    const def = getTransformationDef(normType);

    steps.push({
      stepNumber: idx + 1,
      opId: op.id,
      opType: normType,
      opName: def?.name || normType,
      concept: def?.concept || 'Operación',
      params: { ...opParams },
      inputHex: bytesToHex(prevBytes),
      outputHex: bytesToHex(currentBytes),
      inputFormatted: formatBytesForVisualizer(prevBytes),
      outputFormatted: formatBytesForVisualizer(currentBytes),
      outputPreview: utf8BytesToString(currentBytes),
      bytesCount: currentBytes.length,
      bytesChanged: countDifferentBytes(prevBytes, currentBytes),
      description: def?.description,
      explanation: generateStepExplanation({ ...op, type: normType, params: opParams }, prevBytes, currentBytes),
    });
  }

  return {
    originalBytes,
    originalHex: bytesToHex(originalBytes),
    originalFormatted: formatBytesForVisualizer(originalBytes),
    steps,
    finalBytes: currentBytes,
    finalHex: bytesToHex(currentBytes),
    finalFormatted: formatBytesForVisualizer(currentBytes),
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
    const normType = normalizeOperationType(op?.type);
    const opParams = op?.params || {};

    switch (normType) {
      case 'XOR':
        currentBytes = applyXor(currentBytes, opParams.key ?? opParams.repeatingKey ?? opParams.keyByte ?? 'CRYPTIUM');
        break;
      case 'PERMUTATION':
        currentBytes = applyPermutationInverse(currentBytes, opParams);
        break;
      case 'SUBSTITUTION':
        currentBytes = applySubstitutionInverse(currentBytes, opParams);
        break;
      default:
        break;
    }

    const def = getTransformationDef(normType);

    steps.push({
      stepNumber: steps.length + 1,
      inverseOfStep: idx + 1,
      opId: op.id,
      opType: normType,
      opName: `Inversa de ${def?.name || normType}`,
      concept: `Deshacer ${def?.concept || 'Operación'}`,
      params: { ...opParams },
      inputHex: bytesToHex(prevBytes),
      outputHex: bytesToHex(currentBytes),
      inputFormatted: formatBytesForVisualizer(prevBytes),
      outputFormatted: formatBytesForVisualizer(currentBytes),
      outputPreview: utf8BytesToString(currentBytes),
      bytesCount: currentBytes.length,
      description: def?.inverseDescription,
      explanation: generateInverseStepExplanation({ ...op, type: normType, params: opParams }, prevBytes, currentBytes),
    });
  }

  const recoveredText = utf8BytesToString(currentBytes);

  return {
    recoveredBytes: currentBytes,
    recoveredHex: bytesToHex(currentBytes),
    recoveredFormatted: formatBytesForVisualizer(currentBytes),
    recoveredText,
    steps,
  };
}

// ─── Presets Educativos Progresivos (De Principiante a Experto) ─────────────

export const CIPHER_PRESETS = [
  {
    id: 'caesar_modular',
    name: 'Cifrado César Moderno (Sustitución Modular)',
    level: 'Principiante',
    levelBadge: 'badge-green',
    shortDesc: 'Sustitución de 1 paso: ideal para comprender cómo se alteran los valores.',
    desc: 'El punto de partida más clásico de la criptografía: desplaza cada byte sumándole un número fijo (+15 mod 256). Demuestra el principio de Confusión en su forma más pura y sencilla.',
    whyEducational: 'Muestra cómo un desplazamiento constante cambia cada letra de forma directa. Fácil de entender y de verificar a mano.',
    testMessage: 'HOLA MUNDO CRYPTIUM 2026',
    pipeline: [
      { id: 'op_1', type: 'SUBSTITUTION', params: { mode: 'modulo_add', offset: 15 } },
    ],
  },
  {
    id: 'xor_single',
    name: 'Mezcla Secreta con Clave (XOR Simple)',
    level: 'Principiante',
    levelBadge: 'badge-green',
    shortDesc: 'Mezcla con clave secreta: la operación fundamental de la criptografía digital.',
    desc: 'Combina los bits de cada carácter con una palabra clave secreta ("SECRETO"). Demuestra la propiedad mágica involutoria de XOR: aplicar la misma clave una segunda vez descifra el mensaje a la perfección.',
    whyEducational: 'Enseña el concepto de clave secreta simétrica. Si el receptor conoce la palabra clave, recupera el mensaje; si no la conoce, solo ve ruido.',
    testMessage: 'MENSAJE CONFIDENCIAL CRYPTIUM',
    pipeline: [
      { id: 'op_1', type: 'XOR', params: { key: 'SECRETO' } },
    ],
  },
  {
    id: 'transposition_basic',
    name: 'Cifrado por Barajado (Permutación + Inversión)',
    level: 'Intermedio',
    levelBadge: 'badge-amber',
    shortDesc: 'Difusión pura: cambia de lugar las letras sin modificar sus valores.',
    desc: 'Mueve las posiciones de los caracteres rotándolos e invirtiendo su orden. Demuestra el principio de Difusión: barajar los datos como cartas para romper la estructura gramatical de las palabras.',
    whyEducational: 'Permite comprender la diferencia entre cambiar el valor de una letra (sustitución) y cambiar su posición en el mensaje (permutación).',
    testMessage: 'SEGURIDAD Y CRIPTOLOGIA EXPERIMENTAL',
    pipeline: [
      { id: 'op_1', type: 'PERMUTATION', params: { mode: 'rotate_left', shift: 4 } },
      { id: 'op_2', type: 'PERMUTATION', params: { mode: 'reverse', shift: 0 } },
    ],
  },
  {
    id: 'spn_classic',
    name: 'Red SPN Clásica (Sustitución + Permutación + Mezcla XOR)',
    level: 'Avanzado',
    levelBadge: 'badge-accent',
    shortDesc: 'La arquitectura de Shannon: combina Confusión, Difusión y Clave en un ciclo.',
    desc: 'Arquitectura canónica de cifrado por bloques inspirada en Claude Shannon: primero sustitución (confusión), luego rotación (difusión) y finalmente mezcla con clave secreta (AddRoundKey).',
    whyEducational: 'Integra los tres principios en una ronda completa. Es el fundamento teórico sobre el que se diseñan algoritmos modernos como AES.',
    testMessage: 'Cryptium 2026: Construccion Experimental SPN',
    pipeline: [
      { id: 'op_1', type: 'SUBSTITUTION', params: { mode: 'modulo_add', offset: 73 } },
      { id: 'op_2', type: 'PERMUTATION', params: { mode: 'rotate_left', shift: 3 } },
      { id: 'op_3', type: 'XOR', params: { key: 'KEY_RONDA_1' } },
    ],
  },
  {
    id: 'double_round',
    name: 'Cifrado en Dos Rondas (Multi-Capa Feistel/SPN)',
    level: 'Experto',
    levelBadge: 'badge-purple',
    shortDesc: 'Multi-ronda: demuestra por qué repetir el ciclo multiplica la seguridad.',
    desc: 'Cadena de 4 operaciones consecutivas que simula dos rondas completas de mezcla, difusión y confusión modular con subclaves independientes.',
    whyEducational: 'Ilustra por qué los algoritmos modernos (como AES-128 con 10 rondas) repiten el proceso cíclicamente para alcanzar una resistencia impenetrable.',
    testMessage: 'ALGORITMO MULTI RONDA CRYPTIUM 2026',
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
    level: 'Intermedio',
    levelBadge: 'badge-amber',
    shortDesc: 'Manipulación binaria: orden de bytes y complemento a 1 bit a bit.',
    desc: 'Combina inversión de orden de bytes con complemento a 1 (inversión de bits 0↔1) y mezcla final con clave XOR.',
    whyEducational: 'Muestra que las transformaciones pueden operar tanto a nivel de bytes completos como a nivel de bits individuales.',
    testMessage: 'PRUEBA DE BITS Y TRANSPOSICION BINARIA',
    pipeline: [
      { id: 'op_1', type: 'PERMUTATION', params: { mode: 'reverse', shift: 0 } },
      { id: 'op_2', type: 'SUBSTITUTION', params: { mode: 'invert_bits', offset: 0 } },
      { id: 'op_3', type: 'XOR', params: { key: 'DELTA2026' } },
    ],
  },
];
