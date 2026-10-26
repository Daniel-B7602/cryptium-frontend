/**
 * Utilidades criptográficas para el Módulo de Firmas Digitales
 * Utiliza la API nativa Web Crypto del navegador con RSA-PSS (SHA-256).
 */

import { computeSHA256 } from './hashUtils';

/**
 * Verifica si Web Crypto API está disponible con capacidades de firma.
 * @returns {boolean}
 */
export function isWebCryptoSignSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined' &&
    typeof window.crypto.subtle.generateKey === 'function' &&
    typeof window.crypto.subtle.sign === 'function' &&
    typeof window.crypto.subtle.verify === 'function'
  );
}

/**
 * Genera un par de claves RSA-PSS (2048 bits, SHA-256, exponente 65537).
 * La clave privada es no-exportable o extractable solo en memoria para la demo.
 * @returns {Promise<CryptoKeyPair>}
 */
export async function generateSigningKeyPair() {
  if (!isWebCryptoSignSupported()) {
    throw new Error('Web Crypto API no disponible en este entorno.');
  }

  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: 'SHA-256',
    },
    true, // Claves extractables para la exportación de clave pública
    ['sign', 'verify']
  );
}

/**
 * Exporta la clave pública en formato SPKI codificado en Base64 con encabezados PEM estándar.
 * @param {CryptoKey} publicKey
 * @returns {Promise<{ pem: string, base64: string, rawBytes: Uint8Array, thumbprint: string }>}
 */
export async function exportPublicKeySPKI(publicKey) {
  const spkiBuffer = await window.crypto.subtle.exportKey('spki', publicKey);
  const rawBytes = new Uint8Array(spkiBuffer);

  // Conversión a Base64
  let binary = '';
  for (let i = 0; i < rawBytes.byteLength; i++) {
    binary += String.fromCharCode(rawBytes[i]);
  }
  const base64 = btoa(binary);

  // Formato PEM con líneas de 64 caracteres
  const pemFormatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
  const pem = `-----BEGIN PUBLIC KEY-----\n${pemFormatted}\n-----END PUBLIC KEY-----`;

  // Huella digital (Thumbprint) SHA-256 de la clave pública
  const thumbprintRes = await computeSHA256(base64);

  return {
    pem,
    base64,
    rawBytes,
    thumbprint: thumbprintRes.hex.slice(0, 16) + '...' + thumbprintRes.hex.slice(-8),
    fullThumbprint: thumbprintRes.hex,
  };
}

/**
 * Firma un texto plano usando RSA-PSS con SHA-256.
 * @param {CryptoKey} privateKey
 * @param {string} messageText
 * @returns {Promise<{
 *   signatureBytes: Uint8Array,
 *   signatureHex: string,
 *   signatureBase64: string,
 *   messageBytes: Uint8Array,
 *   messageHashHex: string,
 *   timestamp: number
 * }>}
 */
export async function signMessageText(privateKey, messageText) {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(messageText);

  // Calculamos el hash de visualización del mensaje
  const hashInfo = await computeSHA256(messageText);

  // Firma nativa con RSA-PSS (longitud de sal = 32 bytes para SHA-256)
  const sigBuffer = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateKey,
    messageBytes
  );

  const signatureBytes = new Uint8Array(sigBuffer);
  const signatureHex = Array.from(signatureBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signatureBase64 = btoa(binary);

  return {
    signatureBytes,
    signatureHex,
    signatureBase64,
    messageBytes,
    messageHashHex: hashInfo.hex,
    timestamp: Date.now(),
  };
}

/**
 * Verifica una firma digital contra el mensaje y la clave pública con RSA-PSS.
 * @param {CryptoKey} publicKey
 * @param {Uint8Array} signatureBytes
 * @param {string} messageText
 * @returns {Promise<boolean>}
 */
export async function verifySignatureText(publicKey, signatureBytes, messageText) {
  if (!publicKey || !signatureBytes || signatureBytes.length === 0) {
    return false;
  }

  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(messageText);

  try {
    return await window.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      publicKey,
      signatureBytes,
      messageBytes
    );
  } catch (err) {
    // Si la firma tiene formato corrupto o longitud incorrecta
    return false;
  }
}

/**
 * Altera intencionalmente un byte específico de la firma para demostración pedagógica.
 * @param {Uint8Array} originalSignatureBytes
 * @param {number} byteIndex
 * @returns {Uint8Array}
 */
export function corruptSignatureByte(originalSignatureBytes, byteIndex = 0) {
  const tampered = new Uint8Array(originalSignatureBytes);
  const targetIndex = Math.max(0, Math.min(tampered.length - 1, byteIndex));
  // Invertir todos los bits del byte objetivo (XOR con 0xFF)
  tampered[targetIndex] = tampered[targetIndex] ^ 0xff;
  return tampered;
}
