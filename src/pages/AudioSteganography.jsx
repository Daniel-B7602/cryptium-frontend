import { useState, useRef, useEffect } from 'react';
import {
  AudioWaveform,
  Upload,
  Download,
  Lock,
  Unlock,
  Volume2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  FileAudio,
  X,
  Info,
  Sparkles,
  Search,
  GitCompare,
  Activity,
  Layers,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import AudioWaveformVisualizer from '../components/AudioWaveformVisualizer';
import AudioStegoIntro from '../components/AudioStegoIntro';
import {
  getAudioCapacity,
  hideAudioMessage,
  extractAudioMessage,
  analyzeAudio,
  compareAudio,
} from '../services/api';
import './AudioSteganography.css';

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AudioSteganography() {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'hide' | 'extract' | 'analyze' | 'compare'

  // --- Estados de Modo 1: Ocultar ---
  const [hideFile, setHideFile] = useState(null);
  const [hideAudioUrl, setHideAudioUrl] = useState(null);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hideKey, setHideKey] = useState('');
  const [showHideKey, setShowHideKey] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [resultFileName, setResultFileName] = useState('');
  const [resultBlob, setResultBlob] = useState(null);

  // --- Estados de Modo 2: Extraer ---
  const [extractFile, setExtractFile] = useState(null);
  const [extractAudioUrl, setExtractAudioUrl] = useState(null);
  const [extractKey, setExtractKey] = useState('');
  const [showExtractKey, setShowExtractKey] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // --- Estados de Modo 3: Analizador ---
  const [analyzeFile, setAnalyzeFile] = useState(null);
  const [analyzeAudioUrl, setAnalyzeAudioUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  // --- Estados de Modo 4: Comparador ---
  const [compareOrigFile, setCompareOrigFile] = useState(null);
  const [compareOrigUrl, setCompareOrigUrl] = useState(null);
  const [compareStegoFile, setCompareStegoFile] = useState(null);
  const [compareStegoUrl, setCompareStegoUrl] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // --- Estado global de alertas ---
  const [status, setStatus] = useState(null);

  // Refs para inputs file
  const hideInputRef = useRef(null);
  const extractInputRef = useRef(null);
  const analyzeInputRef = useRef(null);
  const compareOrigInputRef = useRef(null);
  const compareStegoInputRef = useRef(null);

  // Limpieza de URLs temporales al desmontar
  useEffect(() => {
    return () => {
      if (hideAudioUrl) URL.revokeObjectURL(hideAudioUrl);
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      if (extractAudioUrl) URL.revokeObjectURL(extractAudioUrl);
      if (analyzeAudioUrl) URL.revokeObjectURL(analyzeAudioUrl);
      if (compareOrigUrl) URL.revokeObjectURL(compareOrigUrl);
      if (compareStegoUrl) URL.revokeObjectURL(compareStegoUrl);
    };
  }, [hideAudioUrl, resultBlobUrl, extractAudioUrl, analyzeAudioUrl, compareOrigUrl, compareStegoUrl]);

  // Cálculo en bytes UTF-8 del mensaje en tiempo real
  const messageBytes = new TextEncoder().encode(message).length;
  const maxAvailableBytes = capacityInfo?.maxMessageBytes || 0;
  const isOverCapacity = maxAvailableBytes > 0 && messageBytes > maxAvailableBytes;
  const capacityPercent = maxAvailableBytes > 0
    ? Math.min(100, Math.round((messageBytes / maxAvailableBytes) * 100))
    : 0;

  // ============================================================
  // MANEJADORES: MODO 1 (OCULTAR)
  // ============================================================
  const handleHideFileSelected = async (selected) => {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.wav')) {
      setStatus({
        type: 'warning',
        message: 'El archivo seleccionado debe ser un audio WAV PCM (.wav).',
      });
      return;
    }

    if (hideAudioUrl) URL.revokeObjectURL(hideAudioUrl);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);

    setHideFile(selected);
    setHideAudioUrl(URL.createObjectURL(selected));
    setResultBlobUrl(null);
    setResultFileName('');
    setResultBlob(null);
    setStatus(null);
    setCapacityLoading(true);

    try {
      const info = await getAudioCapacity(selected);
      setCapacityInfo(info);
    } catch (err) {
      setCapacityInfo(null);
      setStatus({
        type: 'error',
        message: `Error al analizar el audio: ${err.message}`,
      });
    } finally {
      setCapacityLoading(false);
    }
  };

  const handleRemoveHideFile = () => {
    if (hideAudioUrl) URL.revokeObjectURL(hideAudioUrl);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setHideFile(null);
    setHideAudioUrl(null);
    setCapacityInfo(null);
    setResultBlobUrl(null);
    setResultFileName('');
    setResultBlob(null);
    if (hideInputRef.current) hideInputRef.current.value = '';
  };

  const handleExecuteHide = async () => {
    if (!hideFile) {
      setStatus({ type: 'warning', message: 'Debes seleccionar un archivo de audio WAV portador.' });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: 'warning', message: 'Debes escribir el mensaje secreto que deseas ocultar.' });
      return;
    }
    if (!hideKey.trim()) {
      setStatus({ type: 'warning', message: 'Debes introducir una contraseña criptográfica de protección.' });
      return;
    }
    if (isOverCapacity) {
      setStatus({
        type: 'error',
        message: `El mensaje excede la capacidad disponible del audio (${formatBytes(messageBytes)} de ${formatBytes(maxAvailableBytes)}).`,
      });
      return;
    }

    setHideLoading(true);
    setStatus(null);

    try {
      const blob = await hideAudioMessage(hideFile, message, hideKey);
      const url = URL.createObjectURL(blob);
      const outName = hideFile.name.startsWith('stego_') ? hideFile.name : `stego_${hideFile.name}`;

      setResultBlob(blob);
      setResultBlobUrl(url);
      setResultFileName(outName);
      setStatus({
        type: 'success',
        message: '¡Mensaje cifrado con AES-256-GCM y ocultado en el audio mediante LSB exitosamente!',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error al intentar ocultar el mensaje en el audio.',
      });
    } finally {
      setHideLoading(false);
    }
  };

  const handleDownloadResult = () => {
    if (!resultBlobUrl) return;
    const a = document.createElement('a');
    a.href = resultBlobUrl;
    a.download = resultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendToComparator = () => {
    if (!hideFile || !resultBlob) return;
    const stegoFile = new File([resultBlob], resultFileName, { type: 'audio/wav' });

    if (compareOrigUrl) URL.revokeObjectURL(compareOrigUrl);
    if (compareStegoUrl) URL.revokeObjectURL(compareStegoUrl);

    setCompareOrigFile(hideFile);
    setCompareOrigUrl(URL.createObjectURL(hideFile));
    setCompareStegoFile(stegoFile);
    setCompareStegoUrl(URL.createObjectURL(stegoFile));
    setComparisonResult(null);

    setActiveTab('compare');
    setStatus({
      type: 'info',
      message: 'Archivos cargados en el Comparador. Haz clic en «Comparar señales de audio» para evaluar las diferencias.',
    });
  };

  // ============================================================
  // MANEJADORES: MODO 2 (EXTRAER)
  // ============================================================
  const handleExtractFileSelected = (selected) => {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.wav')) {
      setStatus({
        type: 'warning',
        message: 'El archivo seleccionado debe ser un audio WAV (.wav).',
      });
      return;
    }

    if (extractAudioUrl) URL.revokeObjectURL(extractAudioUrl);

    setExtractFile(selected);
    setExtractAudioUrl(URL.createObjectURL(selected));
    setExtractedResult(null);
    setCopied(false);
    setStatus(null);
  };

  const handleRemoveExtractFile = () => {
    if (extractAudioUrl) URL.revokeObjectURL(extractAudioUrl);
    setExtractFile(null);
    setExtractAudioUrl(null);
    setExtractedResult(null);
    setCopied(false);
    if (extractInputRef.current) extractInputRef.current.value = '';
  };

  const handleExecuteExtract = async () => {
    if (!extractFile) {
      setStatus({ type: 'warning', message: 'Debes seleccionar un archivo de audio WAV con contenido esteganográfico.' });
      return;
    }
    if (!extractKey.trim()) {
      setStatus({ type: 'warning', message: 'Debes introducir la contraseña para descifrar el mensaje.' });
      return;
    }

    setExtractLoading(true);
    setStatus(null);
    setExtractedResult(null);
    setCopied(false);

    try {
      const data = await extractAudioMessage(extractFile, extractKey);
      setExtractedResult(data);
      setStatus({
        type: 'success',
        message: '¡Mensaje extraído y autenticado correctamente con AES-256-GCM!',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'No se pudo recuperar el mensaje del archivo de audio.',
      });
    } finally {
      setExtractLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (!extractedResult?.message) return;
    navigator.clipboard.writeText(extractedResult.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ============================================================
  // MANEJADORES: MODO 3 (ANALIZADOR)
  // ============================================================
  const handleAnalyzeFileSelected = async (selected) => {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.wav')) {
      setStatus({
        type: 'warning',
        message: 'El archivo seleccionado debe ser un audio WAV PCM (.wav).',
      });
      return;
    }

    if (analyzeAudioUrl) URL.revokeObjectURL(analyzeAudioUrl);

    setAnalyzeFile(selected);
    setAnalyzeAudioUrl(URL.createObjectURL(selected));
    setAnalysisResult(null);
    setStatus(null);
    setAnalyzeLoading(true);

    try {
      const res = await analyzeAudio(selected);
      setAnalysisResult(res);
      setStatus({
        type: 'success',
        message: `Análisis de ${selected.name} completado exitosamente.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: `Error al analizar el archivo: ${err.message}`,
      });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleRemoveAnalyzeFile = () => {
    if (analyzeAudioUrl) URL.revokeObjectURL(analyzeAudioUrl);
    setAnalyzeFile(null);
    setAnalyzeAudioUrl(null);
    setAnalysisResult(null);
    if (analyzeInputRef.current) analyzeInputRef.current.value = '';
  };

  // ============================================================
  // MANEJADORES: MODO 4 (COMPARADOR)
  // ============================================================
  const handleCompareOrigSelected = (selected) => {
    if (!selected) return;
    if (compareOrigUrl) URL.revokeObjectURL(compareOrigUrl);
    setCompareOrigFile(selected);
    setCompareOrigUrl(URL.createObjectURL(selected));
    setComparisonResult(null);
    setStatus(null);
  };

  const handleCompareStegoSelected = (selected) => {
    if (!selected) return;
    if (compareStegoUrl) URL.revokeObjectURL(compareStegoUrl);
    setCompareStegoFile(selected);
    setCompareStegoUrl(URL.createObjectURL(selected));
    setComparisonResult(null);
    setStatus(null);
  };

  const handleExecuteCompare = async () => {
    if (!compareOrigFile || !compareStegoFile) {
      setStatus({
        type: 'warning',
        message: 'Debes seleccionar tanto el archivo de audio original como el archivo modificado (stego).',
      });
      return;
    }

    setCompareLoading(true);
    setStatus(null);
    setComparisonResult(null);

    try {
      const res = await compareAudio(compareOrigFile, compareStegoFile);
      setComparisonResult(res);
      setStatus({
        type: 'success',
        message: 'Comparación acústica y cálculo de métricas DSP completados.',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Error durante la comparación de archivos de audio.',
      });
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="audio-stego-view animate-fade-in">
      {/* Selector de Sección Principal (5 Pestañas) */}
      <div className="as-top-bar">
        <div className="segmented-control as-segmented">
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => { setActiveTab('info'); setStatus(null); }}
          >
            <Info size={15} /> Conceptos
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'hide' ? 'active' : ''}`}
            onClick={() => { setActiveTab('hide'); setStatus(null); }}
          >
            <Lock size={15} /> Ocultar mensaje
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => { setActiveTab('extract'); setStatus(null); }}
          >
            <Unlock size={15} /> Extraer mensaje
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analyze'); setStatus(null); }}
          >
            <Search size={15} /> Analizador WAV
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => { setActiveTab('compare'); setStatus(null); }}
          >
            <GitCompare size={15} /> Comparador DSP
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PESTAÑA 0: CONCEPTOS (SECCIÓN INFORMATIVA)                   */}
      {/* ============================================================ */}
      {activeTab === 'info' && (
        <AudioStegoIntro onSelectTab={(tab) => { setActiveTab(tab); setStatus(null); }} />
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 1: OCULTAR MENSAJE                                   */}
      {/* ============================================================ */}
      {activeTab === 'hide' && (
        <div className="as-grid">
          {/* Columna Izquierda: Selección de audio y metadatos */}
          <div className="card as-card">
            <div className="tc-panel-title">
              <FileAudio size={16} /> 1. Archivo de audio portador (.wav)
            </div>

            <input
              type="file"
              ref={hideInputRef}
              accept=".wav,audio/wav,audio/x-wav"
              className="as-file-input-hidden"
              onChange={(e) => handleHideFileSelected(e.target.files?.[0])}
            />

            {!hideFile ? (
              <div
                className="as-dropzone"
                onClick={() => hideInputRef.current?.click()}
              >
                <Upload size={38} className="as-drop-icon" />
                <span className="as-drop-title">Arrastra tu audio WAV aquí</span>
                <span className="as-drop-sub">o haz clic para explorar en tu equipo</span>
                <button type="button" className="btn btn-secondary btn-sm as-browse-btn">
                  Seleccionar WAV
                </button>
              </div>
            ) : (
              <div className="as-file-selected-box">
                <div className="as-file-header">
                  <div className="as-file-meta-icon">
                    <AudioWaveform size={28} />
                  </div>
                  <div className="as-file-meta-text">
                    <span className="as-file-name" title={hideFile.name}>{hideFile.name}</span>
                    <span className="as-file-size">{formatBytes(hideFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost as-remove-btn"
                    onClick={handleRemoveHideFile}
                    title="Quitar audio"
                  >
                    <X size={18} />
                  </button>
                </div>

                {hideAudioUrl && (
                  <div className="as-player-wrapper">
                    <div className="as-player-label">
                      <Volume2 size={13} /> Audio original portador:
                    </div>
                    <audio controls src={hideAudioUrl} className="as-audio-player" />
                  </div>
                )}

                {capacityLoading ? (
                  <div className="as-capacity-loading">
                    <span className="spinner" /> Analizando muestras PCM y capacidad...
                  </div>
                ) : capacityInfo ? (
                  <div className="as-meta-grid">
                    <div className="as-meta-item">
                      <span className="as-meta-label">Formato</span>
                      <span className="as-meta-val">{capacityInfo.audioFormat}</span>
                    </div>
                    <div className="as-meta-item">
                      <span className="as-meta-label">Frecuencia</span>
                      <span className="as-meta-val">{capacityInfo.sampleRate.toLocaleString()} Hz</span>
                    </div>
                    <div className="as-meta-item">
                      <span className="as-meta-label">Duración</span>
                      <span className="as-meta-val">{formatDuration(capacityInfo.durationSeconds)}</span>
                    </div>
                    <div className="as-meta-item">
                      <span className="as-meta-label">Capacidad útil</span>
                      <span className="as-meta-val as-meta-val--highlight">
                        {formatBytes(capacityInfo.maxMessageBytes)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Columna Derecha: Mensaje Secreto, Contraseña y Acción */}
          <div className="card as-card">
            <div className="tc-panel-title">
              <Lock size={16} /> 2. Cifrado y mensaje secreto
            </div>

            <div className="form-group as-form-group">
              <div className="as-input-header">
                <label className="form-label" htmlFor="as-secret-message">
                  Mensaje de texto a ocultar
                </label>
                <span className="as-char-counter">
                  {message.length} caracteres ({formatBytes(messageBytes)})
                </span>
              </div>
              <textarea
                id="as-secret-message"
                className={`form-textarea as-textarea ${isOverCapacity ? 'as-input--error' : ''}`}
                rows={5}
                placeholder="Escribe aquí el mensaje confidencial que deseas incrustar en el audio..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={hideLoading}
              />
            </div>

            {capacityInfo && (
              <div className="as-capacity-container">
                <div className="as-capacity-labels">
                  <span className="as-cap-label-title">Ocupación de capacidad de audio</span>
                  <span className={`as-cap-label-val ${isOverCapacity ? 'as-cap--overflow' : ''}`}>
                    {formatBytes(messageBytes)} / {formatBytes(maxAvailableBytes)} ({capacityPercent}%)
                  </span>
                </div>
                <div className="as-progress-bar-track">
                  <div
                    className={`as-progress-bar-fill ${
                      isOverCapacity
                        ? 'as-fill--danger'
                        : capacityPercent > 85
                        ? 'as-fill--warning'
                        : 'as-fill--accent'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                {isOverCapacity && (
                  <div className="as-capacity-error-msg">
                    <AlertTriangle size={13} /> El mensaje excede la capacidad disponible de este archivo.
                  </div>
                )}
              </div>
            )}

            <div className="form-group as-form-group">
              <label className="form-label" htmlFor="as-hide-key">
                Contraseña criptográfica (PBKDF2 + AES-GCM)
              </label>
              <div className="as-password-field">
                <input
                  id="as-hide-key"
                  type={showHideKey ? 'text' : 'password'}
                  className="form-input as-password-input"
                  placeholder="Introduce una contraseña robusta..."
                  value={hideKey}
                  onChange={(e) => setHideKey(e.target.value)}
                  disabled={hideLoading}
                />
                <button
                  type="button"
                  className="btn btn-icon btn-ghost as-eye-btn"
                  onClick={() => setShowHideKey(!showHideKey)}
                  title={showHideKey ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showHideKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="as-btn-execute-hide"
              type="button"
              className="btn btn-primary btn-lg as-submit-btn"
              onClick={handleExecuteHide}
              disabled={hideLoading || !hideFile || !message.trim() || !hideKey.trim() || isOverCapacity}
            >
              {hideLoading ? (
                <>
                  <span className="spinner" /> Cifrando y ocultando en WAV...
                </>
              ) : (
                <>
                  <Sparkles size={17} /> Cifrar y Ocultar en Audio
                </>
              )}
            </button>

            {resultBlobUrl && (
              <div className="as-result-card animate-fade-in">
                <div className="as-result-header">
                  <div className="as-result-icon">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="as-result-meta">
                    <span className="as-result-title">¡Audio esteganográfico listo!</span>
                    <span className="as-result-filename mono">{resultFileName}</span>
                  </div>
                </div>

                <div className="as-player-wrapper as-player-result">
                  <div className="as-player-label">
                    <Volume2 size={13} /> Escuchar audio portador generado:
                  </div>
                  <audio controls src={resultBlobUrl} className="as-audio-player" />
                </div>

                <div className="as-result-actions">
                  <button
                    id="as-btn-download-wav"
                    type="button"
                    className="btn btn-primary as-download-btn"
                    onClick={handleDownloadResult}
                  >
                    <Download size={16} /> Descargar {resultFileName}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary as-compare-shortcut-btn"
                    onClick={handleSendToComparator}
                  >
                    <GitCompare size={16} /> Comparar con el original (DSP)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 2: EXTRAER MENSAJE                                   */}
      {/* ============================================================ */}
      {activeTab === 'extract' && (
        <div className="as-grid">
          <div className="card as-card">
            <div className="tc-panel-title">
              <FileAudio size={16} /> 1. Archivo de audio con mensaje (.wav)
            </div>

            <input
              type="file"
              ref={extractInputRef}
              accept=".wav,audio/wav,audio/x-wav"
              className="as-file-input-hidden"
              onChange={(e) => handleExtractFileSelected(e.target.files?.[0])}
            />

            {!extractFile ? (
              <div
                className="as-dropzone"
                onClick={() => extractInputRef.current?.click()}
              >
                <Upload size={38} className="as-drop-icon" />
                <span className="as-drop-title">Arrastra tu audio portador aquí</span>
                <span className="as-drop-sub">o haz clic para explorar en tu equipo</span>
                <button type="button" className="btn btn-secondary btn-sm as-browse-btn">
                  Seleccionar WAV
                </button>
              </div>
            ) : (
              <div className="as-file-selected-box">
                <div className="as-file-header">
                  <div className="as-file-meta-icon">
                    <AudioWaveform size={28} />
                  </div>
                  <div className="as-file-meta-text">
                    <span className="as-file-name" title={extractFile.name}>{extractFile.name}</span>
                    <span className="as-file-size">{formatBytes(extractFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost as-remove-btn"
                    onClick={handleRemoveExtractFile}
                    title="Quitar audio"
                  >
                    <X size={18} />
                  </button>
                </div>

                {extractAudioUrl && (
                  <div className="as-player-wrapper">
                    <div className="as-player-label">
                      <Volume2 size={13} /> Reproducir archivo de audio:
                    </div>
                    <audio controls src={extractAudioUrl} className="as-audio-player" />
                  </div>
                )}
              </div>
            )}

            <div className="form-group as-form-group" style={{ marginTop: '16px' }}>
              <label className="form-label" htmlFor="as-extract-key">
                Contraseña criptográfica de descifrado
              </label>
              <div className="as-password-field">
                <input
                  id="as-extract-key"
                  type={showExtractKey ? 'text' : 'password'}
                  className="form-input as-password-input"
                  placeholder="Introduce la contraseña correcta..."
                  value={extractKey}
                  onChange={(e) => setExtractKey(e.target.value)}
                  disabled={extractLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteExtract()}
                />
                <button
                  type="button"
                  className="btn btn-icon btn-ghost as-eye-btn"
                  onClick={() => setShowExtractKey(!showExtractKey)}
                  title={showExtractKey ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showExtractKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="as-btn-execute-extract"
              type="button"
              className="btn btn-primary btn-lg as-submit-btn"
              onClick={handleExecuteExtract}
              disabled={extractLoading || !extractFile || !extractKey.trim()}
            >
              {extractLoading ? (
                <>
                  <span className="spinner" /> Extrayendo y verificando integridad...
                </>
              ) : (
                <>
                  <Unlock size={17} /> Extraer y Descifrar Mensaje
                </>
              )}
            </button>
          </div>

          <div className="card as-card">
            <div className="tc-panel-title">
              <ShieldCheck size={16} /> 2. Mensaje recuperado
            </div>

            {extractedResult ? (
              <div className="as-extracted-container animate-fade-in">
                <div className="as-integrity-badge">
                  <ShieldCheck size={16} className="as-integrity-badge-icon" />
                  <span>Integridad y Autenticidad Verificadas (AES-256-GCM)</span>
                </div>

                <div className="as-extracted-meta-row">
                  <span className="as-extracted-meta-item">
                    Tamaño: <strong>{extractedResult.messageBytes} bytes</strong>
                  </span>
                  <span className="as-extracted-meta-item">
                    Algoritmo: <strong>{extractedResult.algorithm}</strong>
                  </span>
                </div>

                <div className="as-extracted-message-box">
                  <div className="as-extracted-box-header">
                    <span className="as-extracted-label">Texto en claro:</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm as-copy-btn"
                      onClick={handleCopyMessage}
                    >
                      {copied ? (
                        <>
                          <Check size={14} /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copiar texto
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="as-extracted-text">{extractedResult.message}</pre>
                </div>
              </div>
            ) : (
              <div className="as-extract-placeholder">
                <div className="as-placeholder-icon">
                  <AudioWaveform size={40} />
                </div>
                <span className="as-placeholder-title">Ningún mensaje extraído todavía</span>
                <p className="as-placeholder-desc">
                  Sube un archivo WAV generado por Cryptium e introduce la contraseña correspondiente para recuperar el contenido secreto.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 3: ANALIZADOR DE AUDIO WAV                           */}
      {/* ============================================================ */}
      {activeTab === 'analyze' && (
        <div className="as-analyze-view animate-fade-in">
          {/* Tarjeta de Carga */}
          <div className="card as-card">
            <div className="tc-panel-title">
              <Search size={16} /> Inspección técnica y forense de archivo WAV
            </div>

            <input
              type="file"
              ref={analyzeInputRef}
              accept=".wav,audio/wav,audio/x-wav"
              className="as-file-input-hidden"
              onChange={(e) => handleAnalyzeFileSelected(e.target.files?.[0])}
            />

            {!analyzeFile ? (
              <div
                className="as-dropzone"
                onClick={() => analyzeInputRef.current?.click()}
              >
                <Search size={38} className="as-drop-icon" />
                <span className="as-drop-title">Carga cualquier archivo WAV para auditarlo</span>
                <span className="as-drop-sub">Analiza parámetros de cuantificación, rango dinámico y busca marcas Cryptium</span>
                <button type="button" className="btn btn-secondary btn-sm as-browse-btn">
                  Seleccionar archivo WAV
                </button>
              </div>
            ) : (
              <div className="as-file-selected-box">
                <div className="as-file-header">
                  <div className="as-file-meta-icon">
                    <FileAudio size={28} />
                  </div>
                  <div className="as-file-meta-text">
                    <span className="as-file-name">{analyzeFile.name}</span>
                    <span className="as-file-size">{formatBytes(analyzeFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost as-remove-btn"
                    onClick={handleRemoveAnalyzeFile}
                    title="Quitar audio"
                  >
                    <X size={18} />
                  </button>
                </div>

                {analyzeAudioUrl && (
                  <div className="as-player-wrapper">
                    <div className="as-player-label">
                      <Volume2 size={13} /> Preescucha del audio analizado:
                    </div>
                    <audio controls src={analyzeAudioUrl} className="as-audio-player" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultados del Análisis Técnico */}
          {analyzeLoading && (
            <div className="card as-card as-loading-card">
              <span className="spinner" /> Procesando estructura de cabeceras RIFF y muestras de audio...
            </div>
          )}

          {analysisResult && (
            <div className="as-analysis-results-grid animate-fade-in">
              {/* Panel de Parámetros Acústicos */}
              <div className="card as-card">
                <div className="tc-panel-title">
                  <Sliders size={16} /> Parámetros Acústicos del Contenedor
                </div>

                <div className="as-specs-grid">
                  <div className="as-spec-card">
                    <span className="as-spec-label">Formato de Codificación</span>
                    <span className="as-spec-val">{analysisResult.audioFormat}</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Frecuencia de Muestreo</span>
                    <span className="as-spec-val">{analysisResult.sampleRate.toLocaleString()} Hz</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Canales Acústicos</span>
                    <span className="as-spec-val">{analysisResult.channels === 1 ? '1 (Mono)' : '2 (Estéreo)'}</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Profundidad de Muestra</span>
                    <span className="as-spec-val">{analysisResult.bitsPerSample} bits</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Duración Total</span>
                    <span className="as-spec-val">{analysisResult.durationSeconds} s ({formatDuration(analysisResult.durationSeconds)})</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Rango Dinámico Teórico</span>
                    <span className="as-spec-val as-highlight-cyan">{analysisResult.dynamicRangeDb} dB</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Total de Muestras Discretas</span>
                    <span className="as-spec-val mono">{analysisResult.totalSamples.toLocaleString()}</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Tasa de Transferencia (ByteRate)</span>
                    <span className="as-spec-val">{formatBytes(analysisResult.byteRate)}/s</span>
                  </div>
                </div>
              </div>

              {/* Panel de Diagnóstico Esteganográfico */}
              <div className="card as-card">
                <div className="tc-panel-title">
                  <Activity size={16} /> Diagnóstico Forense Esteganográfico
                </div>

                <div className={`as-stego-status-box ${analysisResult.hasCryptiumPayload ? 'as-stego-status--detected' : 'as-stego-status--clean'}`}>
                  <div className="as-stego-status-header">
                    {analysisResult.hasCryptiumPayload ? (
                      <CheckCircle2 size={20} className="as-status-icon--detected" />
                    ) : (
                      <ShieldCheck size={20} className="as-status-icon--clean" />
                    )}
                    <span className="as-stego-status-title">
                      {analysisResult.hasCryptiumPayload
                        ? 'Carga Esteganográfica Cryptium Detectada'
                        : 'Audio Limpio (Sin marca detectada)'}
                    </span>
                  </div>
                  <p className="as-stego-status-desc">{analysisResult.stegoStatusDescription}</p>
                </div>

                <div className="as-specs-grid" style={{ marginTop: '14px' }}>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Capacidad Máxima Bruta</span>
                    <span className="as-spec-val">{formatBytes(analysisResult.totalSamples / 8)}</span>
                  </div>
                  <div className="as-spec-card">
                    <span className="as-spec-label">Capacidad Neta Útil</span>
                    <span className="as-spec-val as-highlight-cyan">{formatBytes(analysisResult.maxMessageBytes)}</span>
                  </div>
                  {analysisResult.hasCryptiumPayload && (
                    <>
                      <div className="as-spec-card">
                        <span className="as-spec-label">Carga Ocupada</span>
                        <span className="as-spec-val as-highlight-purple">{formatBytes(analysisResult.payloadSizeBytes)}</span>
                      </div>
                      <div className="as-spec-card">
                        <span className="as-spec-label">Muestras Remanentes</span>
                        <span className="as-spec-val mono">{analysisResult.remainingSamples?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {analysisResult.hasCryptiumPayload && analysisResult.payloadCapacityPercentage !== null && (
                  <div className="as-capacity-container" style={{ marginTop: '16px' }}>
                    <div className="as-capacity-labels">
                      <span className="as-cap-label-title">Ocupación del Portador por el Payload</span>
                      <span className="as-cap-label-val">{analysisResult.payloadCapacityPercentage}%</span>
                    </div>
                    <div className="as-progress-bar-track">
                      <div
                        className="as-progress-bar-fill as-fill--accent"
                        style={{ width: `${Math.min(100, analysisResult.payloadCapacityPercentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 4: COMPARADOR DE AUDIO (ORIGINAL VS STEGO)           */}
      {/* ============================================================ */}
      {activeTab === 'compare' && (
        <div className="as-compare-view animate-fade-in">
          {/* Selectores de Doble Audio */}
          <div className="as-grid">
            {/* Audio Original */}
            <div className="card as-card">
              <div className="tc-panel-title">
                <FileAudio size={16} /> Señal de Referencia A (Audio Original)
              </div>

              <input
                type="file"
                ref={compareOrigInputRef}
                accept=".wav,audio/wav,audio/x-wav"
                className="as-file-input-hidden"
                onChange={(e) => handleCompareOrigSelected(e.target.files?.[0])}
              />

              {!compareOrigFile ? (
                <div
                  className="as-dropzone"
                  onClick={() => compareOrigInputRef.current?.click()}
                >
                  <Upload size={32} className="as-drop-icon" />
                  <span className="as-drop-title">Carga el audio WAV original</span>
                  <button type="button" className="btn btn-secondary btn-sm as-browse-btn">
                    Seleccionar Audio Original
                  </button>
                </div>
              ) : (
                <div className="as-file-selected-box">
                  <div className="as-file-header">
                    <div className="as-file-meta-icon" style={{ color: '#00d4ff' }}>
                      <AudioWaveform size={26} />
                    </div>
                    <div className="as-file-meta-text">
                      <span className="as-file-name">{compareOrigFile.name}</span>
                      <span className="as-file-size">{formatBytes(compareOrigFile.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost as-remove-btn"
                      onClick={() => {
                        if (compareOrigUrl) URL.revokeObjectURL(compareOrigUrl);
                        setCompareOrigFile(null);
                        setCompareOrigUrl(null);
                        setComparisonResult(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {compareOrigUrl && (
                    <audio controls src={compareOrigUrl} className="as-audio-player" />
                  )}
                </div>
              )}
            </div>

            {/* Audio Portador Stego */}
            <div className="card as-card">
              <div className="tc-panel-title">
                <Layers size={16} /> Señal B (Audio Portador Stego)
              </div>

              <input
                type="file"
                ref={compareStegoInputRef}
                accept=".wav,audio/wav,audio/x-wav"
                className="as-file-input-hidden"
                onChange={(e) => handleCompareStegoSelected(e.target.files?.[0])}
              />

              {!compareStegoFile ? (
                <div
                  className="as-dropzone"
                  onClick={() => compareStegoInputRef.current?.click()}
                >
                  <Upload size={32} className="as-drop-icon" style={{ color: '#a78bfa' }} />
                  <span className="as-drop-title">Carga el audio con esteganografía</span>
                  <button type="button" className="btn btn-secondary btn-sm as-browse-btn">
                    Seleccionar Audio Stego
                  </button>
                </div>
              ) : (
                <div className="as-file-selected-box">
                  <div className="as-file-header">
                    <div className="as-file-meta-icon" style={{ color: '#a78bfa' }}>
                      <AudioWaveform size={26} />
                    </div>
                    <div className="as-file-meta-text">
                      <span className="as-file-name">{compareStegoFile.name}</span>
                      <span className="as-file-size">{formatBytes(compareStegoFile.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost as-remove-btn"
                      onClick={() => {
                        if (compareStegoUrl) URL.revokeObjectURL(compareStegoUrl);
                        setCompareStegoFile(null);
                        setCompareStegoUrl(null);
                        setComparisonResult(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {compareStegoUrl && (
                    <audio controls src={compareStegoUrl} className="as-audio-player" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón de Ejecutar Comparación */}
          <div className="as-compare-action-bar">
            <button
              type="button"
              className="btn btn-primary btn-lg as-compare-btn"
              onClick={handleExecuteCompare}
              disabled={compareLoading || !compareOrigFile || !compareStegoFile}
            >
              {compareLoading ? (
                <>
                  <span className="spinner" /> Procesando comparación muestra a muestra...
                </>
              ) : (
                <>
                  <GitCompare size={18} /> Comparar señales de audio y calcular métricas DSP
                </>
              )}
            </button>
          </div>

          {/* Panel de Métricas DSP y Visualizador */}
          {comparisonResult && (
            <div className="as-comparison-dashboard animate-fade-in">
              {/* Tarjetas de Métricas Científicas */}
              <div className="as-dsp-metrics-grid">
                <div className="card as-metric-card">
                  <span className="as-metric-title">Muestras Modificadas</span>
                  <span className="as-metric-value as-highlight-cyan">
                    {comparisonResult.modifiedSamplesCount.toLocaleString()}
                  </span>
                  <span className="as-metric-sub">
                    {comparisonResult.modifiedSamplesPercentage}% de {comparisonResult.totalSamples.toLocaleString()}
                  </span>
                </div>

                <div className="card as-metric-card">
                  <span className="as-metric-title">Diferencia Absoluta Máxima</span>
                  <span className="as-metric-value as-highlight-purple">
                    {comparisonResult.maxAbsoluteDifference}
                  </span>
                  <span className="as-metric-sub">
                    {comparisonResult.maxAbsoluteDifference === 1
                      ? '✓ Exactamente ±1 (LSB 1-bit)'
                      : comparisonResult.isIdentical
                      ? '0 (Archivos idénticos)'
                      : 'Alteración mayor al LSB'}
                  </span>
                </div>

                <div className="card as-metric-card">
                  <span className="as-metric-title">Relación Señal-Ruido (SNR)</span>
                  <span className="as-metric-value as-highlight-green">
                    {comparisonResult.signalToNoiseRatioDb !== null
                      ? `${comparisonResult.signalToNoiseRatioDb} dB`
                      : '∞ dB'}
                  </span>
                  <span className="as-metric-sub">
                    {comparisonResult.signalToNoiseRatioDb !== null && comparisonResult.signalToNoiseRatioDb > 70
                      ? 'Inaudible (SNR > 70 dB)'
                      : 'Ruido esteganográfico'}
                  </span>
                </div>

                <div className="card as-metric-card">
                  <span className="as-metric-title">Pico Señal-Ruido (PSNR)</span>
                  <span className="as-metric-value">
                    {comparisonResult.peakSignalToNoiseRatioDb !== null
                      ? `${comparisonResult.peakSignalToNoiseRatioDb} dB`
                      : '∞ dB'}
                  </span>
                  <span className="as-metric-sub">Referencia sobre escala completa</span>
                </div>

                <div className="card as-metric-card">
                  <span className="as-metric-title">Error Cuadrático (MSE / RMSE)</span>
                  <span className="as-metric-value mono">
                    {comparisonResult.rootMeanSquaredError}
                  </span>
                  <span className="as-metric-sub">
                    MSE: {comparisonResult.meanSquaredError} | MAE: {comparisonResult.meanAbsoluteError}
                  </span>
                </div>

                <div className="card as-metric-card">
                  <span className="as-metric-title">Compatibilidad de Señal</span>
                  <span className="as-metric-value as-highlight-cyan">
                    {comparisonResult.sampleRate.toLocaleString()} Hz
                  </span>
                  <span className="as-metric-sub">
                    {comparisonResult.channels === 1 ? 'Mono' : 'Estéreo'} · {comparisonResult.bitsPerSample}-bit PCM
                  </span>
                </div>
              </div>

              {/* Evaluación Acústica */}
              <div className="card as-assessment-card">
                <div className="as-assessment-header">
                  <Activity size={18} className="as-assessment-icon" />
                  <span className="as-assessment-title">Dictamen Acústico-Esteganográfico</span>
                </div>
                <p className="as-assessment-text">{comparisonResult.snrQualityAssessment}</p>
              </div>

              {/* Visualizador de Ondas en Canvas */}
              <div className="card as-card as-visualizer-card">
                <AudioWaveformVisualizer
                  waveformOriginal={comparisonResult.waveformOriginal}
                  waveformStego={comparisonResult.waveformStego}
                  waveformDifference={comparisonResult.waveformDifference}
                  height={260}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerta de estado y notificaciones */}
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
