import { useState, useRef, Component } from 'react';
import {
  FlaskConical,
  Zap,
  ArrowRight,
  ArrowLeft,
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
  BookOpen,
  Info,
  ShieldCheck,
  Eye,
  Lock,
  CheckCheck,
  Key,
  Binary,
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
  formatBytesForVisualizer,
  normalizeOperationType,
  getTransformationDef,
} from '../utils/experimentalCipherEngine';
import './Experiments.css';
import './Analysis.css';

/**
 * Componente principal del Laboratorio de Cifrados Propios de Cryptium.
 * Diseñado bajo un enfoque pedagógico de 4 pasos guiados:
 * 1. Conoce tu cifrado (Conceptos y Arquitecturas)
 * 2. Configura tu método (Constructor Visual de Capas)
 * 3. Prueba tu cifrado (Laboratorio de Ejecución)
 * 4. Comprende el resultado (Verificación, Métricas y Desglose Paso a Paso)
 */
function ExperimentsContent() {
  // ─── Estado de Navegación Guía ───────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set([1]));

  // ─── Estado del Cifrado (Pasos 1 y 2) ────────────────────────────────────
  const [cipherName, setCipherName] = useState('Mi Cifrado SPN Educativo');
  const [selectedPresetId, setSelectedPresetId] = useState('spn_classic');
  const [pipeline, setPipeline] = useState(() => {
    const defaultPreset = CIPHER_PRESETS.find(p => p.id === 'spn_classic') || CIPHER_PRESETS[0];
    return defaultPreset.pipeline.map(op => ({
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      params: { ...(op.params || {}) },
    }));
  });

  // ─── Estado del Laboratorio y Pruebas (Paso 3) ────────────────────────────
  const [inputText, setInputText] = useState('Cryptium 2026: Seguridad Criptológica');
  const [execResult, setExecResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // ─── Estado del Desglose de Resultados (Paso 4) ───────────────────────────
  const [activeResultView, setActiveResultView] = useState('both'); // 'both' | 'forward' | 'backward'
  const [showByteHex, setShowByteHex] = useState(true);

  const resultsRef = useRef(null);

  // ─── Utilidad para marcar pasos completados ──────────────────────────────
  const markStepComplete = (stepNum) => {
    setCompletedSteps(prev => new Set([...prev, stepNum]));
  };

  const goToStep = (stepNum) => {
    setActiveStep(stepNum);
    markStepComplete(stepNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Carga de Arquitecturas Predefinidas (Paso 1) ─────────────────────────
  const handleLoadPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCipherName(preset.name);
    const newPipeline = preset.pipeline.map(op => ({
      ...op,
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      params: { ...(op.params || {}) },
    }));
    setPipeline(newPipeline);
    if (preset.testMessage) {
      setInputText(preset.testMessage);
    }
    setExecResult(null);
    setStatus({
      type: 'info',
      message: `Se ha cargado la arquitectura "${preset.name}". Avanza al Paso 2 para personalizarla o al Paso 3 para probarla.`,
    });
    markStepComplete(1);
  };

  const handleCreateFromScratch = () => {
    setSelectedPresetId('custom');
    setCipherName('Mi Cifrado Personalizado');
    setPipeline([]);
    setExecResult(null);
    setStatus({
      type: 'info',
      message: 'Lienzo en blanco creado. Agrega tus transformaciones en el Paso 2.',
    });
    goToStep(2);
  };

  // ─── Manejadores del Pipeline (Paso 2) ────────────────────────────────────
  const handleAddOperation = (type) => {
    const normType = normalizeOperationType(type);
    const def = getTransformationDef(normType);
    const newOp = {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: normType,
      params: { ...(def.defaultParams || {}) },
    };
    setPipeline(prev => [...prev, newOp]);
    setExecResult(null);
    setStatus({
      type: 'info',
      message: `Se agregó la transformación "${def.name}" a la secuencia.`,
    });
    markStepComplete(2);
  };

  const handleRemoveOperation = (index) => {
    setPipeline(prev => {
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      const def = removed ? getTransformationDef(removed.type) : null;
      setStatus({
        type: 'info',
        message: def ? `Se retiró "${def.name}" de la secuencia.` : 'Transformación eliminada.',
      });
      return next;
    });
    setExecResult(null);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    setPipeline(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      const movedDef = getTransformationDef(next[index - 1].type);
      setStatus({
        type: 'info',
        message: `Se movió "${movedDef.name}" a la posición ${index}.`,
      });
      return next;
    });
    setExecResult(null);
  };

  const handleMoveDown = (index) => {
    setPipeline(prev => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      const movedDef = getTransformationDef(next[index + 1].type);
      setStatus({
        type: 'info',
        message: `Se movió "${movedDef.name}" a la posición ${index + 2}.`,
      });
      return next;
    });
    setExecResult(null);
  };

  const handleParamChange = (index, paramKey, value) => {
    setPipeline(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        params: {
          ...next[index].params,
          [paramKey]: value,
        },
      };
      return next;
    });
    setExecResult(null);
  };

  const handleResetToPreset = () => {
    const preset = CIPHER_PRESETS.find(p => p.id === selectedPresetId) || CIPHER_PRESETS[0];
    handleLoadPreset(preset);
  };

  // ─── Ejecución del Cifrado y Descifrado (Paso 3) ──────────────────────────
  const handleExecute = () => {
    setStatus(null);

    if (!inputText || inputText.trim() === '') {
      setStatus({ type: 'error', message: 'Por favor ingresa un mensaje de texto para realizar la prueba.' });
      return;
    }

    if (pipeline.length === 0) {
      setStatus({ type: 'error', message: 'El método no contiene operaciones. Agrega al menos una transformación en el Paso 2.' });
      return;
    }

    try {
      // 1. Ejecutar pipeline de Cifrado (Ida)
      const encResult = executeEncryptionPipeline(inputText, pipeline);

      // 2. Ejecutar pipeline de Descifrado (Retorno)
      const decResult = executeDecryptionPipeline(encResult.finalBytes, pipeline);

      // 3. Cálculos analíticos complementarios
      const entropy = calculateShannonEntropy(encResult.finalBytes);
      const mutatedCount = countDifferentBytes(encResult.originalBytes, encResult.finalBytes);
      const mutationRate = encResult.originalBytes.length > 0
        ? Math.round((mutatedCount / encResult.originalBytes.length) * 100)
        : 0;

      // 4. Verificación de reversibilidad exacta
      const isMatch = inputText === decResult.recoveredText;

      setExecResult({
        ...encResult,
        decryption: decResult,
        entropy,
        mutatedCount,
        mutationRate,
        isMatch,
      });

      markStepComplete(3);
      markStepComplete(4);

      setStatus({
        type: 'success',
        message: '¡Cifrado y descifrado completados exitosamente! Revisa los resultados detallados a continuación.',
      });

      // Avanzar automáticamente al Paso 4 para que el usuario aprenda del resultado
      setActiveStep(4);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Error al ejecutar cifrado experimental:', err);
      setStatus({
        type: 'error',
        message: `Error durante la ejecución del algoritmo: ${err.message || 'Verifica los parámetros de tus transformaciones.'}`,
      });
    }
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Conteo rápido de bytes y caracteres
  const textBytesCount = stringToUtf8Bytes(inputText).length;

  return (
    <div className="exp-container animate-fade-in">
      {/* ─── Encabezado Principal ─────────────────────────────────────────── */}
      <section className="exp-hero">
        <div className="exp-hero-content">
          <div className="exp-hero-badge">
            <FlaskConical size={14} /> Laboratorio de Aprendizaje Activo
          </div>
          <h1 className="exp-hero-title">Laboratorio de Cifrados Propios</h1>
          <p className="exp-hero-subtitle">
            Diseña, ensambla y experimenta con tus propios métodos criptográficos. Observa cómo cada letra y cada bit
            se transforman paso a paso mediante reglas matemáticas reales de confusión, difusión y compuertas lógicas.
          </p>
        </div>
      </section>

      {/* ─── Barra Guía de 4 Pasos ────────────────────────────────────────── */}
      <nav className="exp-steps-nav" aria-label="Pasos del laboratorio">
        <button
          type="button"
          className={`exp-step-tab-btn ${activeStep === 1 ? 'exp-step-tab-btn--active' : ''} ${completedSteps.has(1) ? 'exp-step-tab-btn--done' : ''}`}
          onClick={() => goToStep(1)}
        >
          <div className="exp-step-badge-num">
            {completedSteps.has(1) && activeStep !== 1 ? <Check size={14} /> : '1'}
          </div>
          <div className="exp-step-text-col">
            <span className="exp-step-num-label">Paso 1</span>
            <span className="exp-step-name-label">Conoce tu cifrado</span>
          </div>
        </button>

        <button
          type="button"
          className={`exp-step-tab-btn ${activeStep === 2 ? 'exp-step-tab-btn--active' : ''} ${completedSteps.has(2) ? 'exp-step-tab-btn--done' : ''}`}
          onClick={() => goToStep(2)}
        >
          <div className="exp-step-badge-num">
            {completedSteps.has(2) && activeStep !== 2 ? <Check size={14} /> : '2'}
          </div>
          <div className="exp-step-text-col">
            <span className="exp-step-num-label">Paso 2</span>
            <span className="exp-step-name-label">Configura tu método</span>
          </div>
        </button>

        <button
          type="button"
          className={`exp-step-tab-btn ${activeStep === 3 ? 'exp-step-tab-btn--active' : ''} ${completedSteps.has(3) ? 'exp-step-tab-btn--done' : ''}`}
          onClick={() => goToStep(3)}
        >
          <div className="exp-step-badge-num">
            {completedSteps.has(3) && activeStep !== 3 ? <Check size={14} /> : '3'}
          </div>
          <div className="exp-step-text-col">
            <span className="exp-step-num-label">Paso 3</span>
            <span className="exp-step-name-label">Prueba tu cifrado</span>
          </div>
        </button>

        <button
          type="button"
          className={`exp-step-tab-btn ${activeStep === 4 ? 'exp-step-tab-btn--active' : ''} ${completedSteps.has(4) ? 'exp-step-tab-btn--done' : ''}`}
          onClick={() => goToStep(4)}
        >
          <div className="exp-step-badge-num">
            {completedSteps.has(4) && activeStep !== 4 ? <Check size={14} /> : '4'}
          </div>
          <div className="exp-step-text-col">
            <span className="exp-step-num-label">Paso 4</span>
            <span className="exp-step-name-label">Comprende el resultado</span>
          </div>
        </button>
      </nav>

      {/* ─── Alertas Globales de Estado ────────────────────────────────────── */}
      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          onClose={() => setStatus(null)}
        />
      )}

      {/* ====================================================================
          PASO 1: CONOCE TU CIFRADO (CONCEPTOS Y ARQUITECTURAS)
          ==================================================================== */}
      {activeStep === 1 && (
        <section className="card animate-fade-in" style={{ padding: '24px' }}>
          <div className="exp-card-header">
            <div className="exp-card-title-group">
              <BookOpen size={22} style={{ color: 'var(--clr-accent)' }} />
              <div>
                <h2 className="exp-card-title">Paso 1: Fundamentos y Arquitecturas de Cifrado</h2>
                <p className="exp-card-sub">
                  Antes de crear tu algoritmo, comprende los bloques de construcción elementales que utiliza toda la criptografía moderna.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCreateFromScratch}
              style={{ fontSize: '0.82rem' }}
            >
              <Plus size={15} /> Comenzar desde cero
            </button>
          </div>

          {/* 4 Tarjetas Conceptuales con Analogías Cotidianas */}
          <div className="exp-concepts-grid">
            <div className="exp-concept-card">
              <div className="exp-concept-header">
                <div className="exp-concept-title">
                  <Sparkles size={16} style={{ color: '#00d4ff' }} /> Confusión
                </div>
                <span className="badge badge-accent">Sustitución</span>
              </div>
              <div className="exp-concept-analogy">
                <strong>Analogía:</strong> Como un código secreto donde cada letra se cambia por otra según una regla predeterminada.
              </div>
              <p className="exp-concept-desc">
                Oculta la relación entre el texto original y el texto cifrado. Si ves la letra "X", no puedes deducir
                si originalmente era una "A", "E" u otra letra.
              </p>
            </div>

            <div className="exp-concept-card">
              <div className="exp-concept-header">
                <div className="exp-concept-title">
                  <GitBranch size={16} style={{ color: '#a855f7' }} /> Difusión
                </div>
                <span className="badge badge-purple">Permutación</span>
              </div>
              <div className="exp-concept-analogy">
                <strong>Analogía:</strong> Como barajar cartas: las cartas no cambian de valor, pero se intercambian de lugar en el mazo.
              </div>
              <p className="exp-concept-desc">
                Dispersa la posición de los datos. Si dos letras estaban juntas en el mensaje original (ej. "SE"),
                la permutación las separa a posiciones distantes.
              </p>
            </div>

            <div className="exp-concept-card">
              <div className="exp-concept-header">
                <div className="exp-concept-title">
                  <Key size={16} style={{ color: '#10d46e' }} /> Mezcla XOR
                </div>
                <span className="badge badge-success">Compuerta</span>
              </div>
              <div className="exp-concept-analogy">
                <strong>Analogía:</strong> Un candado digital reversible: la misma clave abre y cierra la compuerta binaria bit a bit.
              </div>
              <p className="exp-concept-desc">
                Aplica la operación lógica binaria <code>A ⊕ K</code>. Si aplicas la misma clave dos veces,
                recuperas exactamente el dato original sin distorsión.
              </p>
            </div>

            <div className="exp-concept-card">
              <div className="exp-concept-header">
                <div className="exp-concept-title">
                  <Layers size={16} style={{ color: '#f59e0b' }} /> Rondas
                </div>
                <span className="badge badge-warning">Capas</span>
              </div>
              <div className="exp-concept-analogy">
                <strong>Analogía:</strong> Como meter un documento dentro de 3 cajas con candados sucesivos antes de guardarlo.
              </div>
              <p className="exp-concept-desc">
                Una sola transformación es fácil de descifrar. Encadenar Sustitución + Permutación + XOR en rondas sucesivas
                multiplica la seguridad exponencialmente.
              </p>
            </div>
          </div>

          {/* Selector de Arquitecturas Predefinidas */}
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '4px' }}>
              Selecciona una Arquitectura de Referencia
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--txt-secondary)', margin: '0 0 16px' }}>
              Puedes elegir una estructura pedagógica según tu nivel de curiosidad, o personalizar sus parámetros en el siguiente paso:
            </p>

            <div className="exp-presets-grid">
              {CIPHER_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const levelColor =
                  preset.level === 'beginner' ? 'badge-success' :
                  preset.level === 'intermediate' ? 'badge-accent' :
                  preset.level === 'advanced' ? 'badge-purple' : 'badge-warning';

                return (
                  <div
                    key={preset.id}
                    className={`exp-preset-card ${isSelected ? 'exp-preset-card--active' : ''}`}
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <div>
                      <div className="exp-preset-card-header">
                        <span className="exp-preset-title">{preset.name}</span>
                        <span className={`badge ${levelColor}`} style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                          {preset.levelLabel}
                        </span>
                      </div>
                      <p className="exp-preset-desc">{preset.description}</p>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', marginBottom: '6px' }}>
                        Transformaciones incluidas ({preset.pipeline.length}):
                      </div>
                      <div className="exp-preset-pipeline-preview">
                        {preset.pipeline.map((op, idx) => (
                          <span key={idx} className="badge badge-outline" style={{ fontSize: '0.68rem' }}>
                            {TRANSFORMATION_TYPES[op.type]?.name || op.type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="exp-preset-footer">
                      <span style={{ fontSize: '0.74rem', color: isSelected ? 'var(--clr-accent)' : 'var(--txt-muted)', fontWeight: 600 }}>
                        {isSelected ? '✓ Arquitectura Seleccionada' : 'Click para seleccionar'}
                      </span>
                      <button
                        type="button"
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadPreset(preset);
                          goToStep(2);
                        }}
                      >
                        Usar y Configurar <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navegación al Siguiente Paso */}
          <div className="exp-nav-buttons-bar">
            <span style={{ fontSize: '0.82rem', color: 'var(--txt-muted)' }}>
              Arquitectura actual: <strong style={{ color: 'var(--clr-accent)' }}>{cipherName}</strong> ({pipeline.length} operaciones)
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => goToStep(2)}
            >
              Continuar al Paso 2: Configura tu Método <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          PASO 2: CONFIGURA TU MÉTODO (CONSTRUCTOR VISUAL)
          ==================================================================== */}
      {activeStep === 2 && (
        <section className="card animate-fade-in" style={{ padding: '24px' }}>
          <div className="exp-card-header">
            <div className="exp-card-title-group">
              <Sliders size={22} style={{ color: 'var(--clr-accent)' }} />
              <div>
                <h2 className="exp-card-title">Paso 2: Constructor Visual de Transformaciones</h2>
                <p className="exp-card-sub">
                  Ensambla las capas de tu cifrado. Puedes agregar nuevas operaciones, reordenarlas o modificar sus parámetros.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetToPreset}
              style={{ fontSize: '0.82rem' }}
              title="Restablecer transformaciones a la plantilla seleccionada"
            >
              <RotateCcw size={14} /> Restablecer a Plantilla
            </button>
          </div>

          {/* Barra de Nombre del Cifrado */}
          <div className="exp-meta-bar" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="cipher-name-input" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--txt-secondary)' }}>
                Nombre de tu Cifrado Experimental:
              </label>
              <input
                id="cipher-name-input"
                type="text"
                className="input-field"
                value={cipherName}
                onChange={(e) => setCipherName(e.target.value)}
                placeholder="Ej. Mi Cifrado SPN Educativo"
                style={{ maxWidth: '420px', fontWeight: 600 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.78rem' }}>
                {pipeline.length} {pipeline.length === 1 ? 'Capa activa' : 'Capas activas'}
              </span>
            </div>
          </div>

          {/* Diagrama de Flujo del Proceso en Tiempo Real */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Flujo de Cifrado en Cascada:
            </div>
            <div className="exp-diagram-flow">
              <span className="exp-diag-node" style={{ borderColor: 'var(--clr-accent)', color: 'var(--clr-accent)' }}>
                📥 Entrada (Texto)
              </span>
              <span className="exp-diag-arrow">➔</span>

              {pipeline.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', fontStyle: 'italic' }}>
                  Sin transformaciones (agrega una abajo)
                </span>
              ) : (
                pipeline.map((op, idx) => {
                  const norm = normalizeOperationType(op.type);
                  const def = getTransformationDef(norm);
                  let paramSummary = '';
                  if (norm === 'SUBSTITUTION') {
                    paramSummary = op.params?.mode === 'invert_bits' ? '(NOT)' : `(+${op.params?.offset ?? 15})`;
                  } else if (norm === 'PERMUTATION') {
                    paramSummary = op.params?.mode === 'reverse' ? '(Reversa)' : op.params?.mode === 'swap_pairs' ? '(Pares)' : `(Rotar ${op.params?.shift ?? 3})`;
                  } else if (norm === 'XOR') {
                    paramSummary = `("${op.params?.key || 'CRYPTIUM'}")`;
                  }
                  return (
                    <span key={op.id || idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span className="exp-diag-node">
                        Paso {idx + 1}: {def.name} <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>{paramSummary}</span>
                      </span>
                      <span className="exp-diag-arrow">➔</span>
                    </span>
                  );
                })
              )}

              <span className="exp-diag-node" style={{ borderColor: 'var(--clr-purple)', color: 'var(--clr-purple)' }}>
                🔒 Salida (Cifrado)
              </span>
            </div>
          </div>

          {/* Paleta para Agregar Operaciones */}
          <div className="exp-palette-box" style={{ marginBottom: '24px' }}>
            <div className="exp-palette-label">Agregar una nueva transformación:</div>
            <div className="exp-palette-grid">
              <button
                type="button"
                className="exp-palette-btn"
                onClick={() => handleAddOperation('SUBSTITUTION')}
              >
                <div className="exp-palette-btn-header">
                  <span className="exp-palette-btn-title">
                    <Sparkles size={16} style={{ color: '#00d4ff', marginRight: '6px' }} />
                    + Sustitución
                  </span>
                  <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Confusión</span>
                </div>
                <p className="exp-palette-btn-desc">
                  Reemplaza cada byte sumando un desplazamiento modular o invirtiendo bits. Altera los valores individuales.
                </p>
              </button>

              <button
                type="button"
                className="exp-palette-btn"
                onClick={() => handleAddOperation('PERMUTATION')}
              >
                <div className="exp-palette-btn-header">
                  <span className="exp-palette-btn-title">
                    <GitBranch size={16} style={{ color: '#a855f7', marginRight: '6px' }} />
                    + Permutación
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Difusión</span>
                </div>
                <p className="exp-palette-btn-desc">
                  Baraja y reorganiza las posiciones de los bytes en el mensaje (rotación circular, reversa o pares).
                </p>
              </button>

              <button
                type="button"
                className="exp-palette-btn"
                onClick={() => handleAddOperation('XOR')}
              >
                <div className="exp-palette-btn-header">
                  <span className="exp-palette-btn-title">
                    <Key size={16} style={{ color: '#10d46e', marginRight: '6px' }} />
                    + Mezcla XOR
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Candado Binario</span>
                </div>
                <p className="exp-palette-btn-desc">
                  Aplica una compuerta XOR bit a bit con una clave secreta repetitiva (A ⊕ K ⊕ K = A).
                </p>
              </button>
            </div>
          </div>

          {/* Lista de Transformaciones en el Pipeline */}
          <div className="exp-pipeline-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="exp-palette-label">Secuencia de Transformaciones Configuradas:</div>
              {pipeline.length > 0 && (
                <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)' }}>
                  Las operaciones se aplican en orden descendente (1 ➔ {pipeline.length})
                </span>
              )}
            </div>

            {pipeline.length === 0 ? (
              <div style={{
                padding: '32px 20px',
                textAlign: 'center',
                background: 'var(--clr-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--clr-border)',
              }}>
                <AlertTriangle size={32} style={{ color: 'var(--clr-warning)', marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--txt-primary)' }}>El método no contiene operaciones</h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--txt-secondary)' }}>
                  Haz clic en cualquiera de los botones de arriba (+ Sustitución, + Permutación, + Mezcla XOR) para comenzar a diseñar tu método.
                </p>
              </div>
            ) : (
              <div className="exp-pipeline-list">
                {pipeline.map((op, index) => {
                  const normType = normalizeOperationType(op.type);
                  const def = getTransformationDef(normType);
                  const currentParams = op.params || {};

                  return (
                    <div key={op.id || index} className="exp-pipe-item">
                      <div className="exp-pipe-num">{index + 1}</div>

                      <div className="exp-pipe-body">
                        <div className="exp-pipe-header">
                          <span className="exp-pipe-title">{def.name}</span>
                          <span className={`badge ${
                            normType === 'SUBSTITUTION' ? 'badge-accent' :
                            normType === 'PERMUTATION' ? 'badge-purple' : 'badge-success'
                          }`} style={{ fontSize: '0.68rem' }}>
                            {def.tag}
                          </span>
                          <span className="exp-pipe-desc">{def.description}</span>
                        </div>

                        {/* Parámetros interactivos según el tipo de operación */}
                        <div className="exp-pipe-params">
                          {normType === 'SUBSTITUTION' && (
                            <>
                              <label className="exp-param-label">Modo:</label>
                              <select
                                className="exp-param-input"
                                value={currentParams.mode || 'modulo_add'}
                                onChange={(e) => handleParamChange(index, 'mode', e.target.value)}
                              >
                                <option value="modulo_add">Desplazamiento Modular (+offset mod 256)</option>
                                <option value="invert_bits">Inversión de bits (NOT ~B)</option>
                              </select>

                              {currentParams.mode !== 'invert_bits' && (
                                <>
                                  <label className="exp-param-label">Desplazamiento (1-255):</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="255"
                                    className="exp-param-input exp-param-input--number"
                                    value={currentParams.offset ?? 15}
                                    onChange={(e) => handleParamChange(index, 'offset', parseInt(e.target.value, 10) || 1)}
                                  />
                                  <span className="exp-param-hint">
                                    Fórmula: (byte + {currentParams.offset ?? 15}) mod 256
                                  </span>
                                </>
                              )}

                              {currentParams.mode === 'invert_bits' && (
                                <span className="exp-param-hint">
                                  Invierte cada bit individualmente (0 ↔ 1). Es su propia inversa.
                                </span>
                              )}
                            </>
                          )}

                          {normType === 'PERMUTATION' && (
                            <>
                              <label className="exp-param-label">Modo:</label>
                              <select
                                className="exp-param-input"
                                value={currentParams.mode || 'rotate_left'}
                                onChange={(e) => handleParamChange(index, 'mode', e.target.value)}
                              >
                                <option value="rotate_left">Rotación Circular (Mover posiciones)</option>
                                <option value="reverse">Invertir Orden (Espejo completo)</option>
                                <option value="swap_pairs">Intercambiar Parejas Adyacentes (0 ↔ 1)</option>
                              </select>

                              {(!currentParams.mode || currentParams.mode === 'rotate_left') && (
                                <>
                                  <label className="exp-param-label">Posiciones (1-16):</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="16"
                                    className="exp-param-input exp-param-input--number"
                                    value={currentParams.shift ?? 3}
                                    onChange={(e) => handleParamChange(index, 'shift', parseInt(e.target.value, 10) || 1)}
                                  />
                                  <span className="exp-param-hint">
                                    Mueve cada byte {currentParams.shift ?? 3} posiciones a la izquierda cíclicamente.
                                  </span>
                                </>
                              )}

                              {currentParams.mode === 'reverse' && (
                                <span className="exp-param-hint">
                                  Invierte todo el arreglo de bytes de principio a fin.
                                </span>
                              )}

                              {currentParams.mode === 'swap_pairs' && (
                                <span className="exp-param-hint">
                                  Intercambia los bytes adyacentes de 2 en 2.
                                </span>
                              )}
                            </>
                          )}

                          {normType === 'XOR' && (
                            <>
                              <label className="exp-param-label">Clave Secreta:</label>
                              <input
                                type="text"
                                className="exp-param-input"
                                value={currentParams.key ?? 'CRYPTIUM'}
                                onChange={(e) => handleParamChange(index, 'key', e.target.value || 'K')}
                                placeholder="Ej. SECRETO"
                                style={{ minWidth: '160px' }}
                              />
                              <span className="exp-param-hint">
                                Aplica XOR con la clave "{currentParams.key || 'CRYPTIUM'}" cíclicamente (A ⊕ K).
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción (Subir, Bajar, Eliminar) */}
                      <div className="exp-pipe-actions">
                        <button
                          type="button"
                          className="exp-btn-icon"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          title="Mover esta operación hacia arriba"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          className="exp-btn-icon"
                          disabled={index === pipeline.length - 1}
                          onClick={() => handleMoveDown(index)}
                          title="Mover esta operación hacia abajo"
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          className="exp-btn-icon exp-btn-icon--del"
                          onClick={() => handleRemoveOperation(index)}
                          title="Eliminar esta operación de la secuencia"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navegación entre Pasos */}
          <div className="exp-nav-buttons-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => goToStep(1)}
            >
              <ArrowLeft size={16} /> Volver a Conoce tu Cifrado
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={pipeline.length === 0}
              onClick={() => goToStep(3)}
            >
              Continuar al Paso 3: Prueba tu Cifrado <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          PASO 3: PRUEBA TU CIFRADO (LABORATORIO DE EJECUCIÓN)
          ==================================================================== */}
      {activeStep === 3 && (
        <section className="card animate-fade-in exp-lab-card" style={{ padding: '24px' }}>
          <div className="exp-card-header">
            <div className="exp-card-title-group">
              <Play size={22} style={{ color: 'var(--clr-accent)' }} />
              <div>
                <h2 className="exp-card-title">Paso 3: Laboratorio de Pruebas</h2>
                <p className="exp-card-sub">
                  Introduce cualquier mensaje para probar tu algoritmo. El sistema ejecutará el cifrado y posteriormente el descifrado simétrico para comprobar su reversibilidad.
                </p>
              </div>
            </div>
            <span className="badge badge-accent">
              Método: {cipherName} ({pipeline.length} {pipeline.length === 1 ? 'operación' : 'operaciones'})
            </span>
          </div>

          {/* Mensajes de Prueba Rápidos */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Ejemplos Rápidos para Experimentar:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => setInputText('Hola Mundo')}
              >
                "Hola Mundo" (Texto corto)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => setInputText('Cryptium 2026: Seguridad Criptológica')}
              >
                "Cryptium 2026: Seguridad..." (Estándar)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => setInputText('AAAAAAAAAAAAAAAAAAAA')}
              >
                "AAAAAAAA..." (Repetitivo para ver difusión)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => setInputText('¡Alerta! Clave: $4,850.00 @2026')}
              >
                "¡Alerta! Clave: $4,850..." (Símbolos)
              </button>
            </div>
          </div>

          {/* Área de Entrada de Texto */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="exp-input-textarea" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                Mensaje de Entrada a Procesar:
              </label>
              <span style={{ fontSize: '0.76rem', color: 'var(--txt-muted)' }}>
                {inputText.length} caracteres | {textBytesCount} bytes UTF-8
              </span>
            </div>
            <textarea
              id="exp-input-textarea"
              className="input-field"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe aquí el texto que deseas cifrar..."
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Botón Principal de Ejecución */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 800 }}
              onClick={handleExecute}
            >
              <Zap size={18} /> Ejecutar Cifrado y Descifrado Experimental
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setInputText('')}
              style={{ fontSize: '0.82rem' }}
            >
              Limpiar Texto
            </button>
          </div>

          {/* Navegación entre Pasos */}
          <div className="exp-nav-buttons-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => goToStep(2)}
            >
              <ArrowLeft size={16} /> Volver al Constructor (Paso 2)
            </button>

            {execResult && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => goToStep(4)}
              >
                Ver Resultados y Desglose (Paso 4) <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          PASO 4: COMPRENDE EL RESULTADO (VERIFICACIÓN Y DESGLOSE)
          ==================================================================== */}
      {activeStep === 4 && (
        <div ref={resultsRef} className="exp-results-card animate-fade-in">
          {!execResult ? (
            <section className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <HelpCircle size={40} style={{ color: 'var(--clr-accent)', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px', color: 'var(--txt-primary)' }}>Aún no se ha realizado ninguna prueba</h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                Ingresa un texto en el Paso 3 y presiona "Ejecutar Cifrado y Descifrado Experimental" para ver el análisis completo.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => goToStep(3)}
              >
                <Play size={16} /> Ir al Paso 3 para Probar
              </button>
            </section>
          ) : (
            <>
              {/* 1. Banner de Verificación de Reversibilidad 100% */}
              <div className={`exp-match-banner ${execResult.isMatch ? 'exp-match-banner--ok' : 'exp-match-banner--bad'}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="exp-match-title">
                    {execResult.isMatch ? (
                      <>
                        <ShieldCheck size={24} />
                        Reversibilidad Matemática Verificada: 100% Exacto
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={24} />
                        Discrepancia en Descifrado: Revisa tus Operaciones
                      </>
                    )}
                  </div>
                  <p className="exp-match-sub">
                    {execResult.isMatch
                      ? 'El texto original fue completamente reconstruido sin perder ningún carácter ni byte. Esto demuestra que todas las transformaciones utilizadas son funciones biyectivas (poseen inversa matemática exacta).'
                      : 'El texto recuperado no coincide exactamente con el original. Asegúrate de que las operaciones no provoquen desbordamiento o truncamiento no invertible.'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.88rem', padding: '6px 14px' }}>
                    {execResult.isMatch ? '✓ Reversibilidad OK' : '✗ Falló Reversibilidad'}
                  </span>
                </div>
              </div>

              {/* 2. Métricas Didácticas Explicadas */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Bytes Procesados</div>
                  <div className="stat-value" style={{ color: 'var(--clr-accent)' }}>
                    {execResult.originalBytes.length} <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>bytes</span>
                  </div>
                  <div className="stat-sub">Longitud conservada intacta</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Profundidad del Cifrado</div>
                  <div className="stat-value" style={{ color: 'var(--clr-purple)' }}>
                    {execResult.steps.length} <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>capas</span>
                  </div>
                  <div className="stat-sub">Transformaciones en cascada</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Tasa de Mutación</div>
                  <div className="stat-value" style={{ color: 'var(--clr-success)' }}>
                    {execResult.mutationRate}%
                  </div>
                  <div className="stat-sub">{execResult.mutatedCount} de {execResult.originalBytes.length} bytes cambiaron</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Entropía de Shannon</div>
                  <div className="stat-value" style={{ color: '#f59e0b' }}>
                    {execResult.entropy.toFixed(3)} <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>bits/B</span>
                  </div>
                  <div className="stat-sub">
                    {execResult.entropy > 4.5 ? 'Excelente aleatoriedad aparente' : 'Entropía moderada (patrones visibles)'}
                  </div>
                </div>
              </div>

              {/* 3. Salidas Finales (Hexadecimal y Base64) */}
              <div className="exp-final-outputs">
                <div className="exp-output-box">
                  <div className="exp-output-label">
                    <span>Cifrado Final en Hexadecimal (Bytes)</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => handleCopy(execResult.finalHex, 'hex')}
                    >
                      {copiedField === 'hex' ? <Check size={13} /> : <Copy size={13} />} Copiar Hex
                    </button>
                  </div>
                  <pre className="exp-output-val">{execResult.finalHex}</pre>
                </div>

                <div className="exp-output-box">
                  <div className="exp-output-label">
                    <span>Cifrado Final en Base64 (Transporte)</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => handleCopy(execResult.finalBase64, 'base64')}
                    >
                      {copiedField === 'base64' ? <Check size={13} /> : <Copy size={13} />} Copiar Base64
                    </button>
                  </div>
                  <pre className="exp-output-val">{execResult.finalBase64}</pre>
                </div>
              </div>

              {/* 4. Visualizador Paso a Paso Dual (Texto / Hexadecimal) */}
              <section className="card" style={{ padding: '24px' }}>
                <div className="exp-card-header">
                  <div className="exp-card-title-group">
                    <Binary size={20} style={{ color: 'var(--clr-accent)' }} />
                    <div>
                      <h3 className="exp-card-title">Inspección Paso a Paso de las Transformaciones</h3>
                      <p className="exp-card-sub">
                        Observa exactamente cómo cambia cada letra y su representación hexadecimal en cada etapa.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {/* Switch para Mostrar/Ocultar Códigos Hexadecimales */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--txt-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={showByteHex}
                        onChange={(e) => setShowByteHex(e.target.checked)}
                      />
                      Mostrar Códigos Hex en Chips
                    </label>

                    {/* Selector de Vistas: Ambos, Solo Cifrado, Solo Descifrado */}
                    <div className="exp-view-tabs" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className={`exp-view-tab-btn ${activeResultView === 'both' ? 'exp-view-tab-btn--active' : ''}`}
                        onClick={() => setActiveResultView('both')}
                      >
                        Ambos Caminos
                      </button>
                      <button
                        type="button"
                        className={`exp-view-tab-btn ${activeResultView === 'forward' ? 'exp-view-tab-btn--active' : ''}`}
                        onClick={() => setActiveResultView('forward')}
                      >
                        Solo Cifrado (Ida)
                      </button>
                      <button
                        type="button"
                        className={`exp-view-tab-btn ${activeResultView === 'backward' ? 'exp-view-tab-btn--active' : ''}`}
                        onClick={() => setActiveResultView('backward')}
                      >
                        Solo Descifrado (Retorno)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Camino de IDA (Cifrado Paso a Paso) */}
                {(activeResultView === 'both' || activeResultView === 'forward') && (
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: 'var(--clr-accent)',
                      marginBottom: '14px',
                    }}>
                      <ArrowRight size={16} /> Camino de Ida: Proceso de Cifrado (Transformaciones 1 ➔ {execResult.steps.length})
                    </div>

                    <div className="exp-steps-list">
                      {execResult.steps.map((step) => (
                        <div key={step.stepNumber} className="exp-step-item">
                          <div className="exp-step-header">
                            <span className="exp-step-title">
                              Paso {step.stepNumber}: {step.operationName}
                            </span>
                            <span className={`badge ${
                              normalizeOperationType(step.opType || step.operationType) === 'SUBSTITUTION' ? 'badge-accent' :
                              normalizeOperationType(step.opType || step.operationType) === 'PERMUTATION' ? 'badge-purple' : 'badge-success'
                            }`} style={{ fontSize: '0.68rem' }}>
                              {step.concept || step.opType || step.operationType}
                            </span>
                          </div>

                          {/* Explicación en Español Sencillo */}
                          <div className="exp-step-explanation-box">
                            <strong>¿Qué sucedió en este paso?</strong> {step.explanation}
                          </div>

                          {/* Visualizador de Bytes Chips */}
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                              Estado resultante de los bytes tras este paso:
                            </div>
                            <div className="exp-byte-chips-row">
                              {step.outputFormatted.map((b, bIdx) => (
                                <div key={bIdx} className="exp-byte-chip" title={`Posición: ${b.index} | Carácter: ${b.char} | Hex: ${b.hex}`}>
                                  <span className="exp-byte-chip-char">{b.char}</span>
                                  {showByteHex && <span className="exp-byte-chip-hex">{b.hex}</span>}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="exp-step-meta">
                            <span>Cadena Hexadecimal Intermedia:</span>
                            <code className="exp-step-hex">{step.outputHex}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camino de RETORNO (Descifrado Paso a Paso) */}
                {(activeResultView === 'both' || activeResultView === 'backward') && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: 'var(--clr-purple)',
                      marginBottom: '14px',
                    }}>
                      <RotateCcw size={16} /> Camino de Retorno: Proceso de Descifrado Inverso (Deshaciendo {execResult.decryption.steps.length} ➔ 1)
                    </div>

                    <div className="exp-steps-list">
                      {execResult.decryption.steps.map((step) => (
                        <div key={step.stepNumber} className="exp-step-item exp-step-item--inverse">
                          <div className="exp-step-header">
                            <span className="exp-step-title" style={{ color: 'var(--clr-purple)' }}>
                              Paso Inverso {step.stepNumber}: {step.operationName}
                            </span>
                            <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                              Inversa
                            </span>
                          </div>

                          <div className="exp-step-explanation-box exp-step-explanation-box--inverse">
                            <strong>¿Cómo se revierte este paso?</strong> {step.explanation}
                          </div>

                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                              Bytes en proceso de recuperación:
                            </div>
                            <div className="exp-byte-chips-row">
                              {step.outputFormatted.map((b, bIdx) => (
                                <div key={bIdx} className="exp-byte-chip" title={`Posición: ${b.index} | Carácter: ${b.char} | Hex: ${b.hex}`}>
                                  <span className="exp-byte-chip-char" style={{ color: 'var(--clr-purple)' }}>{b.char}</span>
                                  {showByteHex && <span className="exp-byte-chip-hex">{b.hex}</span>}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="exp-step-meta">
                            <span>Hexadecimal Parcial Revertido:</span>
                            <code className="exp-step-hex">{step.outputHex}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 5. Tres Preguntas Clave de Comprensión (Educativas) */}
              <section className="card" style={{ padding: '24px' }}>
                <div className="exp-card-header">
                  <div className="exp-card-title-group">
                    <HelpCircle size={20} style={{ color: 'var(--clr-accent)' }} />
                    <h3 className="exp-card-title">Preguntas Clave para Afianzar tu Aprendizaje</h3>
                  </div>
                </div>

                <div className="exp-qa-grid">
                  <div className="exp-qa-card">
                    <div className="exp-qa-title">
                      <CheckCircle2 size={18} style={{ color: '#10d46e' }} />
                      1. ¿Por qué el mensaje se recupera al 100% sin perder letras?
                    </div>
                    <p className="exp-qa-ans">
                      Porque cada transformación seleccionada es una <strong>función matemática biyectiva</strong> (1 a 1).
                      La suma modular se invierte restando exactamente la misma cantidad; la permutación se invierte volviendo
                      a barajar en sentido contrario; y la compuerta lógica XOR es su propia inversa (<code>A ⊕ K ⊕ K = A</code>).
                      No se destruyen ni descartan bits en ningún momento.
                    </p>
                  </div>

                  <div className="exp-qa-card">
                    <div className="exp-qa-title">
                      <Sparkles size={18} style={{ color: '#00d4ff' }} />
                      2. ¿Qué aporta combinar Sustitución + Permutación + XOR?
                    </div>
                    <p className="exp-qa-ans">
                      La sustitución aporta <strong>Confusión</strong> (disfraza los caracteres), la permutación aporta{' '}
                      <strong>Difusión</strong> (dispersa patrones a lo largo del bloque), y el XOR liga el texto a una clave secreta.
                      Esta combinación forma una <strong>Red de Sustitución-Permutación (SPN)</strong>, el principio fundamental
                      sobre el que se construyen los estándares mundiales modernos como AES y DES.
                    </p>
                  </div>

                  <div className="exp-qa-card">
                    <div className="exp-qa-title">
                      <ShieldAlert size={18} style={{ color: '#f59e0b' }} />
                      3. ¿Por qué este cifrado es educativo y NO apto para producción?
                    </div>
                    <p className="exp-qa-ans">
                      Los algoritmos comerciales como <strong>AES-256</strong> utilizan bloques grandes de 128 bits, matrices
                      algebraicas en Cuerpos de Galois finitos, un calendario de subclaves criptográfico seguro y entre 10 y 14 rondas
                      iteradas para resistir ataques por criptoanálisis lineal y diferencial. Un cifrado artesanal con pocas capas
                      puede ser vulnerado fácilmente con análisis de frecuencias.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. Aviso Metodológico */}
              <div className="exp-edu-notice">
                <Info size={22} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--txt-primary)' }}>Aviso Pedagógico de Cryptium:</strong> Este laboratorio está diseñado
                  exclusivamente con fines didácticos para la enseñanza de criptografía en Ingeniería de Sistemas. Para proteger información confidencial,
                  archivos o comunicaciones reales, utiliza siempre los algoritmos estandarizados disponibles en Cryptium (AES-256-GCM o AES-256-CBC).
                </div>
              </div>

              {/* Navegación al Final del Paso 4 */}
              <div className="exp-nav-buttons-bar">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goToStep(3)}
                >
                  <ArrowLeft size={16} /> Probar Otro Texto (Paso 3)
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goToStep(2)}
                >
                  <Sliders size={16} /> Modificar Transformaciones (Paso 2)
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => goToStep(1)}
                >
                  <BookOpen size={16} /> Explorar Otra Arquitectura (Paso 1)
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Error Boundary Protector ──────────────────────────────────────────────
class ExperimentsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Experiments caught an unhandled error:', error, errorInfo);
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
