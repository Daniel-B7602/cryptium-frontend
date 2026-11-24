import { useState, useRef } from 'react';
import { Upload, Download, FileKey, X, Play, Info, AlertTriangle, Lock, Unlock, Sparkles, ShieldCheck } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import RsaKeyManager from '../components/RsaKeyManager';
import { encryptFile, decryptFile } from '../services/api';
import './FileCrypto.css';

const FILE_ALGORITHMS = [
  {
    id: 'AES',
    name: 'AES-256',
    type: 'Simétrico (Bloques)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Estándar mundial de cifrado simétrico por bloques (128 bits / 16 bytes). Cifra y descifra cualquier tipo de archivo con la misma clave secreta mediante AES en modo CBC con IV aleatorio.',
    badgeClass: 'badge-accent',
    keyHelp: 'Introduce una contraseña o clave secreta compartida. El emisor y el receptor deben usar la misma clave.',
  },
  {
    id: 'ChaCha20',
    name: 'ChaCha20',
    type: 'Simétrico (Flujo)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Cifrador de flujo simétrico ultrarrápido (RFC 8439) con clave de 256 bits y nonce de 96 bits único por archivo. Es ideal para archivos de gran tamaño. No proporciona autenticación de integridad por sí solo (sin MAC Poly1305).',
    badgeClass: 'badge-blue',
    keyHelp: 'Introduce una contraseña o clave secreta. Se generará un nonce único de 12 bytes para este archivo.',
    isUnauthenticated: true,
  },
  {
    id: 'RSA',
    name: 'RSA Híbrido',
    type: 'Asimétrico (Sobre Digital)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Cifrado Híbrido: como RSA no puede cifrar directamente archivos grandes debido a su límite de bloque, una clave simétrica temporal de 256 bits cifra el archivo completo, y la Clave Pública RSA protege dicha clave simétrica dentro de un sobre digital.',
    badgeClass: 'badge-purple',
    keyHelp: 'Para CIFRAR el archivo necesitas la Clave Pública del destinatario. Para DESCIFRAR necesitas tu Clave Privada.',
    isAsymmetric: true,
  },
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function FileCrypto() {
  const [operation, setOperation] = useState('encrypt');
  const [selectedAlgo, setSelectedAlgo] = useState('AES');
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('');
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const currentAlgo = FILE_ALGORITHMS.find(a => a.id === selectedAlgo) || FILE_ALGORITHMS[0];

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus(null);
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove('fc-drop--over');
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setStatus(null);
      setDownloadUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add('fc-drop--over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove('fc-drop--over');
  };

  const validate = () => {
    if (!file) return 'Debes seleccionar un archivo para procesar.';
    if (!key.trim()) return currentAlgo.isAsymmetric
      ? `Debes proporcionar una ${operation === 'encrypt' ? 'Clave Pública' : 'Clave Privada'} RSA en formato PEM. Puedes pulsar «Generar par de claves RSA» para crear una.`
      : 'Debes introducir una clave criptográfica.';
    if (currentAlgo.isAsymmetric) {
      const cleanKey = key.trim();
      if (operation === 'encrypt') {
        if (cleanKey.includes('BEGIN PRIVATE KEY') || cleanKey.includes('BEGIN RSA PRIVATE KEY')) {
          return 'Has introducido una Clave Privada en el campo de cifrado. En RSA, los archivos se cifran con la Clave Pública del destinatario.';
        }
        if (!cleanKey.includes('-----BEGIN PUBLIC KEY-----')) {
          return 'Formato de clave inválido: La Clave Pública RSA debe comenzar con "-----BEGIN PUBLIC KEY-----".';
        }
        if (!cleanKey.includes('-----END PUBLIC KEY-----')) {
          return 'Clave incompleta: Falta la línea de cierre "-----END PUBLIC KEY-----".';
        }
      } else {
        if (cleanKey.includes('BEGIN PUBLIC KEY') && !cleanKey.includes('PRIVATE KEY')) {
          return 'Has introducido una Clave Pública en el campo de descifrado. Para descifrar necesitas tu Clave Privada correspondiente.';
        }
        const hasBeginPrivate = cleanKey.includes('-----BEGIN PRIVATE KEY-----') || cleanKey.includes('-----BEGIN RSA PRIVATE KEY-----');
        const hasEndPrivate = cleanKey.includes('-----END PRIVATE KEY-----') || cleanKey.includes('-----END RSA PRIVATE KEY-----');
        if (!hasBeginPrivate) {
          return 'Formato de clave inválido: La Clave Privada RSA debe comenzar con "-----BEGIN PRIVATE KEY-----" o "-----BEGIN RSA PRIVATE KEY-----".';
        }
        if (!hasEndPrivate) {
          return 'Clave incompleta: Falta la línea de cierre "-----END PRIVATE KEY-----".';
        }
      }
    }
    return null;
  };

  const getOutputFilename = () => {
    if (!file) return '';
    if (operation === 'encrypt') {
      return `${file.name}.cryptium`;
    } else {
      return file.name.endsWith('.cryptium')
        ? file.name.slice(0, -9)
        : `descifrado_${file.name}`;
    }
  };

  const handleExecute = async () => {
    const err = validate();
    if (err) {
      setStatus({ type: 'error', message: err });
      return;
    }

    setLoading(true);
    setStatus(null);
    setDownloadUrl(null);

    try {
      const blob =
        operation === 'encrypt'
          ? await encryptFile(file, key, selectedAlgo)
          : await decryptFile(file, key, selectedAlgo);

      const url = URL.createObjectURL(blob);
      const name = getOutputFilename();
      setDownloadUrl(url);
      setDownloadName(name);

      setStatus({
        type: 'success',
        message: `Archivo ${operation === 'encrypt' ? 'cifrado' : 'descifrado'} correctamente con ${currentAlgo.name}.`,
      });
    } catch (err) {
      const isNetwork = err instanceof TypeError;
      let msg = isNetwork
        ? 'No se pudo conectar con el backend. Comprueba que el servidor esté en ejecución.'
        : (err.message || 'Error al procesar el archivo.');

      if (msg.includes('ASN1') || msg.includes('corrupted') || msg.includes('asn1')) {
        msg = 'La clave proporcionada contiene datos corruptos o no compatibles con la estructura PEM/ASN.1 de RSA.';
      } else if (msg.includes('No supported key formats') || msg.includes('unsupported format')) {
        msg = 'El formato de la clave no es reconocido como una clave PEM RSA válida. Debe incluir cabeceras -----BEGIN... y -----END... estándar.';
      }

      setStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setDownloadUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    let str = '';
    for (let i = 0; i < array.length; i++) {
      str += chars[array[i] % chars.length];
    }
    setKey(str);
    setStatus({
      type: 'info',
      message: 'Se generó una clave aleatoria segura de 24 caracteres para el archivo.',
    });
  };

  return (
    <div className="filecrypto animate-fade-in">
      {/* Selector de operación */}
      <div className="fc-top-bar">
        <div className="segmented-control fc-segmented">
          <button
            id="fc-btn-tab-encrypt"
            className={`segmented-btn ${operation === 'encrypt' ? 'active' : ''}`}
            onClick={() => { setOperation('encrypt'); setStatus(null); setDownloadUrl(null); }}
          >
            <Lock size={15} /> Cifrar archivo
          </button>
          <button
            id="fc-btn-tab-decrypt"
            className={`segmented-btn ${operation === 'decrypt' ? 'active' : ''}`}
            onClick={() => { setOperation('decrypt'); setStatus(null); setDownloadUrl(null); }}
          >
            <Unlock size={15} /> Descifrar archivo
          </button>
        </div>
      </div>

      {/* Selector de Algoritmo de Cifrado para Archivos */}
      <div className="card fc-algo-card">
        <div className="fc-algo-header">
          <label className="form-label">
            🛡️ Algoritmo de cifrado de archivos
          </label>
          <span className={`badge ${currentAlgo.badgeClass}`}>
            {currentAlgo.statusText}
          </span>
        </div>

        <div className="fc-algo-grid">
          {FILE_ALGORITHMS.map(algo => (
            <button
              key={algo.id}
              type="button"
              className={`fc-algo-btn ${selectedAlgo === algo.id ? 'fc-algo-btn--active' : ''}`}
              onClick={() => {
                setSelectedAlgo(algo.id);
                setStatus(null);
                setKey('');
              }}
            >
              <div className="fc-algo-btn-top">
                <span className="fc-algo-name">{algo.name}</span>
                <span className={`badge badge-sm ${algo.badgeClass}`}>{algo.type}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tarjeta Informativa de Algoritmo para Archivos */}
        <div className="fc-algo-info-box">
          <div className="fc-algo-info-title">
            <Info size={16} />
            <span>¿Cómo funciona este algoritmo en archivos?</span>
          </div>
          <p className="fc-algo-info-desc">
            {currentAlgo.description}
          </p>

          {currentAlgo.isUnauthenticated && (
            <div className="fc-algo-warn-banner">
              <AlertTriangle size={15} />
              <span>
                <strong>Aviso de Seguridad:</strong> ChaCha20 es un cifrador de flujo puro. Ofrece alta velocidad de procesamiento, pero <strong>no proporciona autenticación ni verificación de integridad por sí solo</strong> (sin MAC Poly1305).
              </span>
            </div>
          )}

          {currentAlgo.isAsymmetric && (
            <div className="fc-algo-hybrid-banner">
              <ShieldCheck size={15} />
              <span>
                <strong>Arquitectura Híbrida:</strong> Debido a que RSA tiene un límite matemático de ~190 bytes de entrada por operación, el archivo se cifra a máxima velocidad con una clave de sesión AES-256-CBC, y dicha clave simétrica se protege en un sobre digital con la Clave Pública RSA.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gestor de Claves RSA si está seleccionado */}
      {currentAlgo.isAsymmetric && (
        <RsaKeyManager
          onSelectKey={(selectedKeyPem) => setKey(selectedKeyPem)}
          currentOperation={operation}
          disabled={loading}
        />
      )}

      {/* Grid principal */}
      <div className="fc-layout">
        {/* Columna izquierda: Dropzone + Datos */}
        <div className="card fc-upload-card">
          <div className="tc-panel-title">
            {operation === 'encrypt' ? '📁 Archivo de origen' : '🔒 Archivo cifrado (.cryptium)'}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="fc-file-input-hidden"
            onChange={handleFileChange}
          />

          {!file ? (
            <div
              ref={dropRef}
              className="fc-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={40} className="fc-drop-icon" />
              <span className="fc-drop-title">Arrastra tu archivo aquí</span>
              <span className="fc-drop-sub">o haz clic para explorar en tu equipo</span>
              <button className="btn btn-secondary btn-sm fc-browse-btn">
                Seleccionar archivo
              </button>
            </div>
          ) : (
            <div className="fc-file-info">
              <FileKey size={32} className="fc-file-icon" />
              <div className="fc-file-meta">
                <span className="fc-file-name">{file.name}</span>
                <span className="fc-file-size">{formatBytes(file.size)}</span>
                <span className="fc-file-type">{file.type || 'Tipo desconocido'}</span>
              </div>
              <button
                className="btn btn-icon btn-ghost fc-remove-btn"
                onClick={handleRemoveFile}
                title="Quitar archivo"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Clave según el algoritmo */}
          <div className="form-group fc-key-group">
            <div className="fc-key-header">
              <label className="form-label" htmlFor="fc-input-key">
                {currentAlgo.isAsymmetric
                  ? (operation === 'encrypt' ? '📜 Clave Pública RSA (PEM)' : '🔐 Clave Privada RSA (PEM)')
                  : `🔑 Clave criptográfica (${currentAlgo.name})`}
              </label>
              {!currentAlgo.isAsymmetric && operation === 'encrypt' && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost fc-btn-gen-key"
                  onClick={generateRandomKey}
                  title="Generar clave aleatoria segura"
                >
                  <Sparkles size={12} /> Generar clave segura
                </button>
              )}
            </div>

            {currentAlgo.isAsymmetric ? (
              <textarea
                id="fc-input-key"
                className="form-textarea fc-pem-textarea"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={
                  operation === 'encrypt'
                    ? '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----'
                    : '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----'
                }
                disabled={loading}
                rows={5}
              />
            ) : (
              <input
                id="fc-input-key"
                type="text"
                className="form-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Clave para el archivo..."
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              />
            )}

            <span className="fc-key-help">{currentAlgo.keyHelp}</span>
          </div>
        </div>

        {/* Columna derecha: Ejecutar + Descarga */}
        <div className="fc-right-col">
          <div className="card fc-action-card">
            <div className="tc-panel-title">Ejecución de la operación</div>

            <button
              id="fc-btn-execute"
              className="btn btn-primary btn-lg fc-exec-btn"
              onClick={handleExecute}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Procesando archivo...
                </>
              ) : (
                <>
                  <Play size={18} />
                  {operation === 'encrypt' ? 'Cifrar archivo' : 'Descifrar archivo'}
                </>
              )}
            </button>

            {file && (
              <div className="fc-output-preview">
                <span className="fc-op-label">Nombre resultante proyectado:</span>
                <span className="fc-op-name">{getOutputFilename()}</span>
              </div>
            )}
          </div>

          {/* Tarjeta de descarga tras procesar */}
          {downloadUrl && (
            <div className="card fc-download-card animate-fade-in">
              <div className="fc-download-content">
                <span className="fc-download-icon">
                  {operation === 'encrypt' ? '🔒' : '✅'}
                </span>
                <div className="fc-download-info">
                  <span className="fc-dl-filename">{downloadName}</span>
                  <span className="fc-dl-sub">
                    Archivo {operation === 'encrypt' ? 'cifrado' : 'descifrado'} listo para guardar
                  </span>
                </div>
              </div>

              <button
                id="fc-btn-download"
                className="btn btn-success fc-dl-btn"
                onClick={handleDownload}
              >
                <Download size={16} /> Descargar archivo procesado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de estado */}
      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          onDismiss={() => setStatus(null)}
        />
      )}
    </div>
  );
}
