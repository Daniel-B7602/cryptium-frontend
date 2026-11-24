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
 * Cifra un texto usando el algoritmo y la clave proporcionada.
 * @param {string} text
 * @param {string} key
 * @param {string} [algorithm='AES']  'AES' | 'ChaCha20' | 'RSA'
 * @returns {Promise<{ encryptedText: string, algorithm: string, nonceOrIvHex?: string, details?: string }>}
 */
export async function encryptText(text, key, algorithm = 'AES') {
  const res = await fetch(`${BASE_URL}/api/Crypto/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key, algorithm }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Descifra un texto usando el algoritmo y la clave proporcionada.
 * @param {string} text
 * @param {string} key
 * @param {string} [algorithm='AES']  'AES' | 'ChaCha20' | 'RSA'
 * @returns {Promise<{ decryptedText: string, algorithm: string, nonceOrIvHex?: string, details?: string }>}
 */
export async function decryptText(text, key, algorithm = 'AES') {
  const res = await fetch(`${BASE_URL}/api/Crypto/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key, algorithm }),
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Genera un par de claves asimétricas RSA (Pública y Privada en formato PEM).
 * @param {number} [keySize=2048]
 * @returns {Promise<{ publicKey: string, privateKey: string, keySize: number }>}
 */
export async function generateRsaKeys(keySize = 2048) {
  const res = await fetch(`${BASE_URL}/api/Crypto/rsa/generate-keys?keySize=${keySize}`, {
    method: 'GET',
  });
  await handleResponse(res);
  return res.json();
}

// ---------- File Crypto ----------

/**
 * Cifra un archivo enviado como multipart/form-data.
 * @param {File} file
 * @param {string} key
 * @param {string} [algorithm='AES']  'AES' | 'ChaCha20' | 'RSA'
 * @returns {Promise<Blob>}
 */
export async function encryptFile(file, key, algorithm = 'AES') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);
  formData.append('algorithm', algorithm);

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
 * @param {string} [algorithm='AES']  'AES' | 'ChaCha20' | 'RSA'
 * @returns {Promise<Blob>}
 */
export async function decryptFile(file, key, algorithm = 'AES') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);
  formData.append('algorithm', algorithm);

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
 *   frequency: Record<string, number>,
 *   plaintext?: {
 *     entropy: number,
 *     totalBytes: number,
 *     uniqueBytes: number,
 *     frequency: Record<string, number>
 *   }
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
 * @param {number} [byteIndex=0] Índice del byte a alterar
 * @param {number} [bitIndex=0]  Índice del bit a invertir (0 a 7)
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
export async function testAvalanche(text, key, byteIndex = 0, bitIndex = 0) {
  const res = await fetch(`${BASE_URL}/api/Analysis/avalanche`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key, byteIndex, bitIndex }),
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

// ---------- Audio Steganography ----------

/**
 * Consulta la capacidad y metadatos de un archivo de audio WAV.
 * @param {File} file Archivo WAV portador
 * @returns {Promise<{
 *   fileName: string,
 *   fileSize: number,
 *   durationSeconds: number,
 *   sampleRate: number,
 *   channels: number,
 *   bitsPerSample: number,
 *   totalSamples: number,
 *   maxMessageBytes: number,
 *   maxMessageChars: number,
 *   audioFormat: string,
 *   isValid: boolean,
 *   errorMessage?: string
 * }>}
 */
export async function getAudioCapacity(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/AudioSteganography/capacity`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Cifra y oculta un mensaje de texto dentro de un archivo de audio WAV usando LSB + AES-256-GCM y PBKDF2.
 * @param {File} file Archivo WAV portador
 * @param {string} message Mensaje de texto a ocultar
 * @param {string} key Contraseña criptográfica
 * @returns {Promise<Blob>}
 */
export async function hideAudioMessage(file, message, key) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', message);
  formData.append('key', key);

  const res = await fetch(`${BASE_URL}/api/AudioSteganography/hide`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.blob();
}

/**
 * Extrae y descifra un mensaje de texto oculto en un archivo de audio WAV.
 * @param {File} file Archivo WAV con mensaje esteganográfico
 * @param {string} key Contraseña criptográfica
 * @returns {Promise<{
 *   message: string,
 *   messageBytes: number,
 *   fileName: string,
 *   algorithm: string,
 *   sampleRate: number,
 *   channels: number,
 *   bitsPerSample: number,
 *   integrityVerified: boolean
 * }>}
 */
export async function extractAudioMessage(file, key) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);

  const res = await fetch(`${BASE_URL}/api/AudioSteganography/extract`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Realiza un análisis forense técnico y esteganográfico detallado de un archivo WAV.
 * @param {File} file Archivo WAV a analizar
 * @returns {Promise<{
 *   fileName: string,
 *   fileSize: number,
 *   durationSeconds: number,
 *   sampleRate: number,
 *   channels: number,
 *   bitsPerSample: number,
 *   totalSamples: number,
 *   maxMessageBytes: number,
 *   maxMessageChars: number,
 *   audioFormat: string,
 *   isValid: boolean,
 *   blockAlign: number,
 *   byteRate: number,
 *   dynamicRangeDb: number,
 *   hasCryptiumPayload: boolean,
 *   payloadVersion?: number,
 *   payloadSizeBytes?: number,
 *   payloadCapacityPercentage?: number,
 *   remainingSamples?: number,
 *   stegoStatusDescription: string
 * }>}
 */
export async function analyzeAudio(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/AudioSteganography/analyze`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.json();
}

/**
 * Compara muestra a muestra un audio original con un audio portador con esteganografía.
 * @param {File} originalFile Archivo de audio original
 * @param {File} stegoFile Archivo de audio con mensaje oculto
 * @returns {Promise<{
 *   originalFileName: string,
 *   stegoFileName: string,
 *   totalSamples: number,
 *   channels: number,
 *   sampleRate: number,
 *   bitsPerSample: number,
 *   durationSeconds: number,
 *   modifiedSamplesCount: number,
 *   modifiedSamplesPercentage: number,
 *   maxAbsoluteDifference: number,
 *   meanAbsoluteError: number,
 *   meanSquaredError: number,
 *   rootMeanSquaredError: number,
 *   signalToNoiseRatioDb?: number,
 *   peakSignalToNoiseRatioDb?: number,
 *   isIdentical: boolean,
 *   snrQualityAssessment: string,
 *   waveformOriginal: number[],
 *   waveformStego: number[],
 *   waveformDifference: number[],
 *   isCompatible: boolean,
 *   errorMessage?: string
 * }>}
 */
export async function compareAudio(originalFile, stegoFile) {
  const formData = new FormData();
  formData.append('originalFile', originalFile);
  formData.append('stegoFile', stegoFile);

  const res = await fetch(`${BASE_URL}/api/AudioSteganography/compare`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse(res);
  return res.json();
}




