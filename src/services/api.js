// ============================================================
// Cryptium – API Service Layer
// Centraliza todas las llamadas al backend ASP.NET Core.
// Cambia BASE_URL si el backend cambia de puerto o host.
// ============================================================

export const BASE_URL = 'https://localhost:7099';

// ---------- Helpers ----------

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
    } catch {
      // respuesta no JSON, mantener mensaje genérico
    }
    throw new Error(message);
  }
  return res;
}

// ---------- Text Crypto ----------

/**
 * Cifra un texto usando la clave proporcionada.
 * @param {string} text
 * @param {string} key
 * @returns {Promise<{ encryptedText: string }>}
 */
export async function encryptText(text, key) {
  const res = await fetch(`${BASE_URL}/api/Crypto/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Descifra un texto usando la clave proporcionada.
 * @param {string} text
 * @param {string} key
 * @returns {Promise<{ decryptedText: string }>}
 */
export async function decryptText(text, key) {
  const res = await fetch(`${BASE_URL}/api/Crypto/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key }),
  });
  await handleResponse(res);
  return res.json();
}

// ---------- File Crypto ----------

/**
 * Cifra un archivo enviado como multipart/form-data.
 * @param {File} file
 * @param {string} key
 * @returns {Promise<Blob>}
 */
export async function encryptFile(file, key) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);

  const res = await fetch(`${BASE_URL}/api/FileCrypto/encrypt`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.blob();
}

/**
 * Descifra un archivo enviado como multipart/form-data.
 * @param {File} file
 * @param {string} key
 * @returns {Promise<Blob>}
 */
export async function decryptFile(file, key) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);

  const res = await fetch(`${BASE_URL}/api/FileCrypto/decrypt`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.blob();
}

// ---------- Analysis ----------

/**
 * Ejecuta el análisis criptográfico de un texto.
 * @param {string} text  Texto en claro
 * @param {string} key   Clave criptográfica
 * @returns {Promise<{
 *   encryptedText: string,
 *   entropy: number,
 *   totalBytes: number,
 *   uniqueBytes: number,
 *   frequency: Record<string, number>
 * }>}
 */
export async function analyzeText(text, key) {
  const res = await fetch(`${BASE_URL}/api/Analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Ejecuta la prueba experimental del efecto avalancha para AES.
 * @param {string} text  Texto en claro de prueba
 * @param {string} key   Clave experimental
 * @returns {Promise<{
 *   originalText: string,
 *   modifiedText: string,
 *   originalByteHex: string,
 *   modifiedByteHex: string,
 *   originalByteBinary: string,
 *   modifiedByteBinary: string,
 *   flippedBitInfo: string,
 *   differentBits: number,
 *   totalBits: number,
 *   avalanchePercentage: number,
 *   originalCiphertextBase64: string,
 *   modifiedCiphertextBase64: string,
 *   ivHex: string,
 *   blockCount: number,
 *   ciphertextBytesCompared: number
 * }>}
 */
export async function testAvalanche(text, key) {
  const res = await fetch(`${BASE_URL}/api/Analysis/avalanche`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Ejecuta una batería de pruebas por lotes del efecto avalancha (Experimento A).
 * @param {{ text: string, key: string, target?: 'text'|'key', sampleCount?: number }} params
 */
export async function testAvalancheBatch({ text, key, target = 'text', sampleCount = 10 }) {
  const res = await fetch(`${BASE_URL}/api/Analysis/avalanche/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key, target, sampleCount }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Ejecuta la prueba de patrones de bloques comparando ECB vs CBC (Experimento B).
 * @param {{ text: string, key: string }} params
 */
export async function testBlockModes({ text, key }) {
  const res = await fetch(`${BASE_URL}/api/Analysis/block-modes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Ejecuta el análisis estadístico y detección de metadatos de un texto cifrado (Experimento C).
 * @param {{ ciphertextBase64: string, hasIvPrefix?: boolean }} params
 */
export async function testCiphertextStats({ ciphertextBase64, hasIvPrefix = true }) {
  const res = await fetch(`${BASE_URL}/api/Analysis/statistics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciphertextBase64, hasIvPrefix }),
  });
  await handleResponse(res);
  return res.json();
}

// ---------- Malware Scan (Microsoft Defender) ----------

/**
 * Envía un archivo al backend para ser analizado por Microsoft Defender.
 * @param {File} file  Archivo a escanear
 * @returns {Promise<{
 *   fileName: string,
 *   fileSize: number,
 *   status: 'clean' | 'detected' | 'error' | 'unavailable',
 *   engine: string,
 *   message: string,
 *   exitCode: number
 * }>}
 */
export async function scanMalware(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/Malware/scan`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.json();
}


