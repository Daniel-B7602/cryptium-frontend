import { useState, useRef } from 'react';
import { Upload, Download, FileKey, X, Play, Info, AlertTriangle, Lock, Unlock } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import { encryptFile, decryptFile } from '../services/api';
import './FileCrypto.css';

const FILE_ALGORITHMS = [
  {
    id: 'AES',
    name: 'AES-256',
    status: 'available',
    statusText: 'Disponible',
    description: 'Estándar de cifrado de bloques simétrico ideal para todo tipo de archivos.',
    badgeClass: 'badge-accent',
  },
  {
    id: 'ChaCha20',
    name: 'ChaCha20',
    status: 'coming_soon',
    statusText: 'No disponible',
    description: 'Algoritmo de flujo en desarrollo para procesamiento de archivos masivos.',
    badgeClass: 'badge-muted',
  },
  {
    id: 'RSA',
    name: 'RSA',
    status: 'coming_soon',
    statusText: 'No disponible',
    description: 'Algoritmo asimétrico no apto para archivos grandes sin cifrado híbrido.',
    badgeClass: 'badge-muted',
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
    if (!key.trim()) return 'Debes introducir una clave.';
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
    if (currentAlgo.status !== 'available') {
      setStatus({
        type: 'warning',
        message: `El algoritmo ${currentAlgo.name} no está disponible para archivos en esta versión. Utiliza AES.`,
      });
      return;
    }

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
          ? await encryptFile(file, key)
          : await decryptFile(file, key);

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
      setStatus({
        type: 'error',
        message: isNetwork
          ? 'No se pudo conectar con el backend. Comprueba que el servidor está en ejecución.'
          : err.message,
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
              onClick={() => { setSelectedAlgo(algo.id); setStatus(null); }}
            >
              <span className="fc-algo-name">{algo.name}</span>
              <span className={`badge badge-sm ${algo.badgeClass}`}>{algo.statusText}</span>
            </button>
          ))}
        </div>

        {currentAlgo.status !== 'available' && (
          <div className="fc-algo-notice">
            <AlertTriangle size={15} />
            <span>
              Este algoritmo no está implementado para cifrado de archivos en esta versión. Selecciona <strong>AES-256</strong> para continuar.
            </span>
          </div>
        )}
      </div>

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

          {/* Clave */}
          <div className="form-group fc-key-group">
            <label className="form-label" htmlFor="fc-input-key">
              🔑 Clave criptográfica ({selectedAlgo})
            </label>
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
                  <span className="spinner" /> Procesando...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Ejecutar {operation === 'encrypt' ? 'cifrado' : 'descifrado'}
                </>
              )}
            </button>

            {file && (
              <div className="fc-output-preview">
                <span className="fc-op-label">Archivo de salida:</span>
                <span className="fc-op-name mono">{getOutputFilename()}</span>
              </div>
            )}
          </div>

          {/* Descarga */}
          {downloadUrl && (
            <div className="card fc-download-card animate-fade-in">
              <div className="tc-panel-title">
                <Download size={14} /> Resultado listo
              </div>
              <div className="fc-download-content">
                <div className="fc-download-icon">✅</div>
                <div className="fc-download-info">
                  <span className="fc-dl-filename">{downloadName}</span>
                  <span className="fc-dl-sub">Archivo procesado y listo para descargar</span>
                </div>
              </div>
              <button
                id="fc-btn-download"
                className="btn btn-primary fc-dl-btn"
                onClick={handleDownload}
              >
                <Download size={16} />
                Descargar archivo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estado */}
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
