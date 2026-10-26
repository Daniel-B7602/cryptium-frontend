import { useState, useRef, Component } from 'react';
import {
  FlaskConical,
  Zap,
  ArrowRight,
  ArrowRightLeft,
  ArrowDown,
  ArrowUp,
  Trash2,
  Plus,
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Sparkles,
  GitBranch,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import {
  TRANSFORMATION_TYPES,
  CIPHER_PRESETS,
  executeEncryptionPipeline,
  executeDecryptionPipeline,
  calculateShannonEntropy,
  countDifferentBytes,
  stringToUtf8Bytes,
  bytesToHex,
} from '../utils/experimentalCipherEngine';
import './Experiments.css';
import './Analysis.css';

function ExperimentsContent() {
  // ─── Estado del Constructor (Zona 1) ─────────────────────────────────────
  const [cipherName, setCipherName] = useState('MiCifradoSPN-01');
  const [pipeline, setPipeline] = useState(() =>
    CIPHER_PRESETS[0].pipeline.map(op => ({
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      params: { ...(op.params || {}) },
    }))
  );

  // ─── Estado del Laboratorio (Zona 2) ─────────────────────────────────────
  const [inputText, setInputText] = useState('Cryptium 2026: Construccion Experimental');
  const [execResult, setExecResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const resultsRef = useRef(null);

  // ─── Manejadores del Pipeline ────────────────────────────────────────────

  const handleAddOperation = (type) => {
    const def = TRANSFORMATION_TYPES[type];
    if (!def) return;
    const newOp = {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      params: { ...(def.defaultParams || {}) },
    };
    setPipeline(prev => [...prev, newOp]);
    setExecResult(null);
    setStatus(null);
  };

  const handleRemoveOperation = (index) => {
    setPipeline(prev => prev.filter((_, i) => i !== index));
    setExecResult(null);
    setStatus(null);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    setPipeline(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
    setExecResult(null);
  };

  const handleMoveDown = (index) => {
    setPipeline(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
    setExecResult(null);
  };

  const handleParamChange = (index, paramKey, value) => {
    setPipeline(prev => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = {
        ...next[index],
        params: {
          ...(next[index].params || {}),
          [paramKey]: value,
        },
      };
      return next;
    });
    setExecResult(null);
  };

  const handleLoadPreset = (presetId) => {
    const found = CIPHER_PRESETS.find(p => p.id === presetId);
    if (!found) return;
    setCipherName(found.name.split(' (')[0]);
    setPipeline(found.pipeline.map(op => ({
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      params: { ...(op.params || {}) },
    })));
    setExecResult(null);
    setStatus({
      type: 'info',
      message: `Se cargó el preset "${found.name}". Puedes modificar sus operaciones o probarlo directamente.`,
    });
  };

  // ─── Ejecución del Cifrado y Descifrado ───────────────────────────────────

  const handleExecute = () => {
    if (!inputText) {
      setStatus({ type: 'error', message: 'El mensaje de entrada no puede estar vacío.' });
      return;
    }
    if (pipeline.length === 0) {
      setStatus({ type: 'error', message: 'Debes agregar al menos una transformación a la secuencia.' });
      return;
    }

    try {
      // 1. Ejecutar Cifrado (Forward)
      const encData = executeEncryptionPipeline(inputText, pipeline);

      // 2. Ejecutar Descifrado (Backward en orden inverso)
      const decData = executeDecryptionPipeline(encData.finalBytes, pipeline);

      // 3. Verificación estricta de reversibilidad byte a byte
      const isExactMatch =
        encData.originalBytes.length === decData.recoveredBytes.length &&
        encData.originalBytes.every((b, i) => b === decData.recoveredBytes[i]);

      // 4. Métricas analíticas básicas
      const originalEntropy = calculateShannonEntropy(encData.originalBytes);
      const cipherEntropy = calculateShannonEntropy(encData.finalBytes);
      const diffBytes = countDifferentBytes(encData.originalBytes, encData.finalBytes);
      const diffPercentage =
        encData.originalBytes.length > 0
          ? Number(((diffBytes / encData.originalBytes.length) * 100).toFixed(1))
          : 0;

      setExecResult({
        enc: encData,
        dec: decData,
        isExactMatch,
        metrics: {
          totalBytes: encData.originalBytes.length,
          operationsCount: pipeline.length,
          diffBytes,
          diffPercentage,
          originalEntropy,
          cipherEntropy,
        },
      });

      setStatus({
        type: 'success',
        message: isExactMatch
          ? `¡Construcción ejecutada con éxito! Reversibilidad 100% verificada (${encData.originalBytes.length} bytes restaurados fielmente).`
          : 'Atención: Se detectó una discrepancia entre la entrada y la salida descifrada.',
      });

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setStatus({
        type: 'error',
        message: `Error al ejecutar la construcción experimental: ${err.message}`,
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setExecResult(null);
    setStatus(null);
  };

  const handleCopyText = async (textToCopy, fieldName) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setStatus({ type: 'error', message: 'No se pudo copiar al portapapeles.' });
    }
  };

  const inputBytes = stringToUtf8Bytes(inputText);

  return (
    <div className="exp-container animate-fade-in">
      {/* ── Hero Principal ────────────────────────────────────────── */}
      <div className="exp-hero hex-bg">
        <div className="exp-hero-content">
          <div className="exp-hero-badge">
            <FlaskConical size={14} /> Laboratorio de Cifrados Propios
          </div>
          <h1 className="exp-hero-title">CONSTRUCTOR EXPERIMENTAL DE CIFRADOS</h1>
          <p className="exp-hero-subtitle">
            Diseña, compone y pon a prueba tus propias construcciones criptográficas modulares.
            Encadena transformaciones reversibles de confusión (sustitución), difusión (permutación)
            y mezcla (XOR), verificando paso a paso la recuperación exacta del mensaje.
          </p>
        </div>
      </div>

      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          onDismiss={() => setStatus(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
           ZONA 1: CONSTRUCTOR (DISEÑO Y SECUENCIA DE OPERACIONES)
         ════════════════════════════════════════════════════════════════ */}
      <section className="card exp-builder-card">
        <div className="exp-card-header">
          <div className="exp-card-title-group">
            <Sliders size={20} className="an-icon-cyan" />
            <div>
              <h3 className="exp-card-title">1. Configuración de la Construcción</h3>
              <span className="exp-card-sub">
                Define el nombre, selecciona transformaciones reversibles y organiza la secuencia de ejecución
              </span>
            </div>
          </div>
          <span className="badge badge-accent">{pipeline.length} operaciones activas</span>
        </div>

        {/* Barra de Nombre y Presets */}
        <div className="exp-meta-bar">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="exp-name">Nombre de tu construcción experimental:</label>
            <input
              id="exp-name"
              type="text"
              className="form-input"
              value={cipherName}
              onChange={e => setCipherName(e.target.value)}
              placeholder="Ej. MiCifradoSPN-01"
            />
          </div>

          <div className="exp-presets-menu">
            <label className="exp-palette-label">Cargar arquitectura predefinida:</label>
            <select
              className="exp-presets-select"
              onChange={e => e.target.value && handleLoadPreset(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Selecciona un preset...</option>
              {CIPHER_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paleta de Transformaciones Disponibles */}
        <div className="exp-palette-box">
          <span className="exp-palette-label">Haz clic para agregar una transformación al final de la secuencia:</span>
          <div className="exp-palette-grid">
            {Object.values(TRANSFORMATION_TYPES).map(t => (
              <button
                key={t.id}
                type="button"
                className="exp-palette-btn"
                onClick={() => handleAddOperation(t.id)}
              >
                <div className="exp-palette-btn-header">
                  <span className="exp-palette-btn-title">{t.name}</span>
                  <span className={`badge badge-sm ${t.badgeClass}`}><Plus size={12} /> Añadir</span>
                </div>
                <span className="exp-palette-btn-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Operaciones en el Pipeline */}
        <div className="exp-pipeline-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="exp-palette-label">Secuencia de Cifrado (Orden de aplicación):</span>
            {pipeline.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPipeline([])}
                style={{ fontSize: '0.75rem', color: '#f43f5e' }}
              >
                <Trash2 size={12} /> Vaciar secuencia
              </button>
            )}
          </div>

          {pipeline.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--clr-border)', color: 'var(--txt-muted)', fontSize: '0.86rem' }}>
              No hay transformaciones en la secuencia. Agrega una desde la paleta superior para comenzar.
            </div>
          ) : (
            <div className="exp-pipeline-list">
              {pipeline.map((op, index) => {
                const def = TRANSFORMATION_TYPES[op.type];
                return (
                  <div key={op.id} className="exp-pipe-item">
                    <div className="exp-pipe-num">#{index + 1}</div>

                    <div className="exp-pipe-body">
                      <div className="exp-pipe-header">
                        <span className="exp-pipe-title">{def?.name || op.type}</span>
                        <span className={`badge badge-sm ${def?.badgeClass}`}>{def?.tag}</span>
                      </div>
                      <span className="exp-pipe-desc">{def?.description}</span>

                      {/* Parámetros específicos según la operación */}
                      <div className="exp-pipe-params">
                        {op.type === 'XOR' && (
                          <>
                            <label className="exp-param-label">Clave cíclica:</label>
                            <input
                              type="text"
                              className="exp-param-input mono"
                              value={op.params?.key || ''}
                              onChange={e => handleParamChange(index, 'key', e.target.value)}
                              placeholder="Ej. KEY123"
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>
                              ({(op.params?.key || '').length} bytes)
                            </span>
                          </>
                        )}

                        {op.type === 'PERMUTATION' && (
                          <>
                            <label className="exp-param-label">Tipo de permutación:</label>
                            <select
                              className="exp-presets-select"
                              value={op.params?.mode || 'rotate_left'}
                              onChange={e => handleParamChange(index, 'mode', e.target.value)}
                            >
                              <option value="rotate_left">Rotación circular a la izquierda</option>
                              <option value="reverse">Inversión completa de bytes (Reverso)</option>
                              <option value="swap_pairs">Intercambio de bytes por pares adyacentes</option>
                            </select>

                            {(op.params?.mode || 'rotate_left') === 'rotate_left' && (
                              <>
                                <label className="exp-param-label">Desplazamiento (k):</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="32"
                                  className="exp-param-input exp-param-input--number mono"
                                  value={op.params?.shift ?? 3}
                                  onChange={e => handleParamChange(index, 'shift', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>posiciones</span>
                              </>
                            )}
                          </>
                        )}

                        {op.type === 'SUBSTITUTION' && (
                          <>
                            <label className="exp-param-label">Tipo de sustitución:</label>
                            <select
                              className="exp-presets-select"
                              value={op.params?.mode || 'modulo_add'}
                              onChange={e => handleParamChange(index, 'mode', e.target.value)}
                            >
                              <option value="modulo_add">Suma Modular (Byte + offset mod 256)</option>
                              <option value="invert_bits">Inversión Bit a Bit (Complemento a 1)</option>
                            </select>

                            {(op.params?.mode || 'modulo_add') === 'modulo_add' && (
                              <>
                                <label className="exp-param-label">Offset (k):</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="255"
                                  className="exp-param-input exp-param-input--number mono"
                                  value={op.params?.offset ?? 42}
                                  onChange={e => handleParamChange(index, 'offset', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                />
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Controles de Reordenamiento y Eliminación */}
                    <div className="exp-pipe-actions">
                      <button
                        type="button"
                        className="exp-btn-icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Subir operación en la secuencia"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="exp-btn-icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === pipeline.length - 1}
                        title="Bajar operación en la secuencia"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="exp-btn-icon exp-btn-icon--del"
                        onClick={() => handleRemoveOperation(index)}
                        title="Eliminar operación de la secuencia"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Diagrama Conceptual de Flujo */}
          {pipeline.length > 0 && (
            <div className="exp-diagram-flow">
              <span className="exp-palette-label" style={{ marginRight: '8px' }}>Flujo:</span>
              <span className="exp-diag-node">Entrada (M)</span>
              {pipeline.map((op, idx) => (
                <div key={op.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className="exp-diag-arrow">→</span>
                  <span className="exp-diag-node" style={{ borderColor: 'var(--clr-accent)' }}>
                    Paso {idx + 1}: {TRANSFORMATION_TYPES[op.type]?.tag || op.type}
                  </span>
                </div>
              ))}
              <span className="exp-diag-arrow">→</span>
              <span className="exp-diag-node" style={{ borderColor: 'var(--clr-purple)', color: 'var(--clr-purple)' }}>
                Salida Cifrada (C)
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           ZONA 2: LABORATORIO (MENSAJE Y CONTROLES DE EJECUCIÓN)
         ════════════════════════════════════════════════════════════════ */}
      <section className="card exp-lab-card">
        <div className="exp-card-header">
          <div className="exp-card-title-group">
            <FlaskConical size={20} className="an-icon-purple" />
            <div>
              <h3 className="exp-card-title">2. Laboratorio de Pruebas</h3>
              <span className="exp-card-sub">
                Introduce el mensaje de prueba y ejecuta simultáneamente el cifrado y descifrado inverso
              </span>
            </div>
          </div>
          <span className="badge badge-accent">{inputBytes.length} bytes UTF-8</span>
        </div>

        {/* Presets de Mensaje de Entrada */}
        <div className="cr-presets-bar">
          <span className="cr-preset-tag">Ejemplos rápidos:</span>
          <button
            type="button"
            className="cr-preset-btn"
            onClick={() => setInputText('Cryptium 2026: Construccion Experimental')}
          >
            Texto Estándar
          </button>
          <button
            type="button"
            className="cr-preset-btn"
            onClick={() => setInputText('MENSAJE_SECRETO_CON_REPETICION_MENSAJE_SECRETO_CON_REPETICION')}
          >
            Texto Largo Repetitivo (60B)
          </button>
          <button
            type="button"
            className="cr-preset-btn"
            onClick={() => setInputText('A')}
          >
            Carácter Único (1B)
          </button>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="exp-input-text">Mensaje en claro a cifrar:</label>
          <textarea
            id="exp-input-text"
            className="form-textarea an-textarea mono"
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              setExecResult(null);
            }}
            placeholder="Introduce el texto que deseas procesar con tu secuencia de transformaciones..."
            rows={3}
          />
          <div className="an-counters">
            <span>{inputText.length} caracteres ({inputBytes.length} bytes UTF-8)</span>
            <span className="mono">Bytes iniciales: {bytesToHex(inputBytes.slice(0, 16))}{inputBytes.length > 16 ? '...' : ''}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="an-input-actions">
          <button
            id="exp-btn-run"
            className="btn btn-primary btn-lg"
            onClick={handleExecute}
            disabled={pipeline.length === 0 || !inputText}
          >
            <Zap size={18} /> Ejecutar Cifrado y Descifrado Experimental
          </button>
          <button className="btn btn-ghost" onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
           ZONA 3: RESULTADOS (PASOS, SALIDA FINAL, INVERSA Y MÉTRICAS)
         ════════════════════════════════════════════════════════════════ */}
      {execResult && (
        <section className="card exp-results-card animate-fade-in" ref={resultsRef}>
          <div className="exp-card-header">
            <div className="exp-card-title-group">
              <CheckCircle2 size={20} className="an-icon-green" />
              <div>
                <h3 className="exp-card-title">3. Resultados y Verificación del Cifrado</h3>
                <span className="exp-card-sub">
                  Inspección de pasos intermedios, salida final, proceso inverso y análisis estadístico
                </span>
              </div>
            </div>
            <span className="badge badge-accent">{cipherName}</span>
          </div>

          {/* Banner de Verificación de Integridad y Reversibilidad */}
          <div className={`exp-match-banner ${execResult.isExactMatch ? 'exp-match-banner--ok' : 'exp-match-banner--bad'}`}>
            <div>
              <div className="exp-match-title">
                {execResult.isExactMatch ? <Check size={20} /> : <AlertTriangle size={20} />}
                <span>
                  {execResult.isExactMatch
                    ? '✓ 100% RECUPERADO EXACTAMENTE — REVERSIBILIDAD COMPROBADA'
                    : '✕ ERROR DE REVERSIBILIDAD: El mensaje recuperado no coincide con el original'}
                </span>
              </div>
              <p className="exp-match-sub" style={{ margin: '4px 0 0' }}>
                {execResult.isExactMatch
                  ? `Se aplicaron ${pipeline.length} transformaciones hacia adelante y sus inversas en orden contrario. Los ${execResult.metrics.totalBytes} bytes originales se reconstruyeron con fidelidad matemática absoluta.`
                  : 'Una o más transformaciones en la secuencia no fueron invertidas adecuadamente.'}
              </p>
            </div>
            <span className="badge badge-sm" style={{ borderColor: 'currentColor', color: 'currentColor' }}>
              {execResult.isExactMatch ? 'Biyectivo' : 'Discrepancia'}
            </span>
          </div>

          {/* Métricas Básicas del Cifrado Experimental */}
          <div className="grid-4 an-metrics-grid">
            <div className="card an-metric-card">
              <div className="an-metric-icon"><Layers size={22} className="an-icon-cyan" /></div>
              <div className="an-metric-body">
                <span className="an-metric-value mono">{execResult.metrics.totalBytes} bytes</span>
                <span className="an-metric-label">Longitud de Datos</span>
                <span className="an-metric-desc">Longitud idéntica en entrada y salida (sin padding)</span>
              </div>
            </div>

            <div className="card an-metric-card">
              <div className="an-metric-icon"><GitBranch size={22} className="an-icon-purple" /></div>
              <div className="an-metric-body">
                <span className="an-metric-value mono">{execResult.metrics.operationsCount} pasos</span>
                <span className="an-metric-label">Profundidad del Pipeline</span>
                <span className="an-metric-desc">Operaciones encadenadas en la ronda</span>
              </div>
            </div>

            <div className="card an-metric-card an-metric-card--highlight">
              <div className="an-metric-icon"><ArrowRightLeft size={22} className="an-icon-cyan" /></div>
              <div className="an-metric-body">
                <span className="an-metric-value mono">{execResult.metrics.diffBytes} / {execResult.metrics.totalBytes}</span>
                <span className="an-metric-label">Bytes Alterados</span>
                <span className="an-metric-desc">{execResult.metrics.diffPercentage}% de bytes modificaron su valor inicial</span>
              </div>
            </div>

            <div className="card an-metric-card">
              <div className="an-metric-icon"><Sparkles size={22} className="an-icon-green" /></div>
              <div className="an-metric-body">
                <span className="an-metric-value mono">{execResult.metrics.cipherEntropy}</span>
                <span className="an-metric-label">Entropía de Shannon</span>
                <span className="an-metric-desc">Entropía original: {execResult.metrics.originalEntropy} bits/byte</span>
              </div>
            </div>
          </div>

          {/* Salidas Finales (Hexadecimal y Base64) */}
          <div className="exp-final-outputs">
            <div className="exp-output-box">
              <div className="exp-output-label">
                <span>Salida Cifrada Final (Hexadecimal):</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopyText(execResult.enc.finalHex, 'hex')}
                  style={{ fontSize: '0.74rem', padding: '2px 8px' }}
                >
                  {copiedField === 'hex' ? <Check size={12} className="an-icon-green" /> : <Copy size={12} />}
                  {copiedField === 'hex' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="exp-output-val mono">{execResult.enc.finalHex}</p>
            </div>

            <div className="exp-output-box">
              <div className="exp-output-label">
                <span>Salida Cifrada Final (Base64):</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopyText(execResult.enc.finalBase64, 'b64')}
                  style={{ fontSize: '0.74rem', padding: '2px 8px' }}
                >
                  {copiedField === 'b64' ? <Check size={12} className="an-icon-green" /> : <Copy size={12} />}
                  {copiedField === 'b64' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="exp-output-val mono">{execResult.enc.finalBase64}</p>
            </div>
          </div>

          {/* Secuencia Paso a Paso de Cifrado (Forward) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ArrowRight size={18} className="an-icon-cyan" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                A. Secuencia de Cifrado Paso a Paso (Transformaciones Directas)
              </h4>
            </div>

            <div className="exp-steps-list">
              {/* Paso Inicial */}
              <div className="exp-step-item">
                <div className="exp-step-header">
                  <span className="exp-step-title mono">Paso 0: Entrada en Claro Original</span>
                  <span className="badge badge-sm badge-accent">{execResult.enc.originalBytes.length} bytes</span>
                </div>
                <div className="exp-step-hex mono">{execResult.enc.originalHex}</div>
                <div className="exp-step-meta">
                  <span>Representación de texto: "{inputText}"</span>
                  <span>Estado inicial antes de las rondas</span>
                </div>
              </div>

              {/* Pasos Intermedios */}
              {execResult.enc.steps.map(step => (
                <div key={step.stepNumber} className="exp-step-item">
                  <div className="exp-step-header">
                    <span className="exp-step-title mono">
                      Paso {step.stepNumber}: {step.opName}
                    </span>
                    <span className="badge badge-sm badge-purple">
                      {step.bytesChanged} bytes modificados en este paso
                    </span>
                  </div>
                  <div className="exp-step-hex mono">{step.outputHex}</div>
                  <div className="exp-step-meta">
                    <span>Parámetros aplicados: <code className="mono">{JSON.stringify(step.params)}</code></span>
                    <span>{step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secuencia Paso a Paso de Descifrado (Backward en orden inverso) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <RotateCcw size={18} className="an-icon-purple" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                B. Secuencia de Descifrado Inverso (Aplicación en Orden Inverso: N → 1)
              </h4>
            </div>

            <div className="exp-steps-list">
              {execResult.dec.steps.map(step => (
                <div key={step.stepNumber} className="exp-step-item exp-step-item--inverse">
                  <div className="exp-step-header">
                    <span className="exp-step-title mono">
                      Paso {step.stepNumber}: {step.opName} (Reversión del Paso {step.inverseOfStep})
                    </span>
                    <span className="badge badge-sm badge-accent">Operación Inversa</span>
                  </div>
                  <div className="exp-step-hex mono">{step.outputHex}</div>
                  <div className="exp-step-meta">
                    <span>Parámetros inversos: <code className="mono">{JSON.stringify(step.params)}</code></span>
                    <span>{step.description}</span>
                  </div>
                </div>
              ))}

              {/* Mensaje Final Recuperado */}
              <div className="exp-step-item" style={{ borderLeft: '3px solid #10d46e' }}>
                <div className="exp-step-header">
                  <span className="exp-step-title mono" style={{ color: '#10d46e' }}>
                    Resultado Final del Descifrado
                  </span>
                  <span className="badge badge-sm badge-accent">Recuperado</span>
                </div>
                <div className="exp-step-hex mono" style={{ color: '#10d46e' }}>
                  {execResult.dec.recoveredHex}
                </div>
                <div className="exp-step-meta" style={{ color: 'var(--txt-primary)', fontWeight: 600 }}>
                  <span>Texto en claro recuperado: "{execResult.dec.recoveredText}"</span>
                  <span>Coincidencia con entrada: {execResult.isExactMatch ? '✓ EXACTA' : '✕ DISCREPANCIA'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso Metodológico y Educativo */}
          <div className="exp-edu-notice">
            <HelpCircle size={22} />
            <div>
              <strong>Aviso Metodológico sobre Construcciones Experimentales:</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.55 }}>
                Este constructor permite comprender cómo se componen operaciones algebraicas elementales para generar
                <strong> confusión</strong> (cajas de sustitución que rompen relaciones lineales) y <strong>difusión</strong>
                (permutaciones y transposiciones que dispersan la posición de los bytes). Sin embargo, un cifrado compuesto
                manualmente mediante estas primitivas básicas <strong>NO es criptográficamente seguro</strong> contra criptoanálisis
                avanzado (ataques diferenciales, lineales o de clave relacionada). Esta herramienta tiene un propósito
                estrictamente didáctico y no debe utilizarse para proteger información sensible ni sustituye a algoritmos
                estandarizados y auditados como AES-256.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * ─── Error Boundary Protector ────────────────────────────────────────────────
 * Previene pantallas negras completas si ocurre un error inesperado de renderizado
 * en cualquier subcomponente o cálculo del constructor experimental.
 */
class ExperimentsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cryptium ErrorBoundary capturó un error en Experiments:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="exp-container animate-fade-in" style={{ padding: '24px 0' }}>
          <div className="card" style={{ border: '1px solid var(--clr-danger, #ef4444)', padding: '24px', background: 'var(--clr-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#f43f5e' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Error controlado en el Constructor Experimental
              </h3>
            </div>
            <p style={{ color: 'var(--txt-secondary)', fontSize: '0.88rem', margin: '0 0 12px' }}>
              Se interceptó una excepción para prevenir la pantalla negra. Puedes reintentar o recargar el constructor:
            </p>
            <pre style={{
              background: 'var(--clr-surface-2)',
              border: '1px solid var(--clr-border)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.82rem',
              overflowX: 'auto',
              marginBottom: '16px',
              fontFamily: 'monospace'
            }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleReset}
            >
              <RotateCcw size={16} /> Reintentar Constructor
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Experiments() {
  return (
    <ExperimentsErrorBoundary>
      <ExperimentsContent />
    </ExperimentsErrorBoundary>
  );
}
