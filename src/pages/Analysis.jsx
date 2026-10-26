import { useState, useRef, Component } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  FlaskConical,
  BarChart2,
  Zap,
  Layers,
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Copy,
  Check,
  Upload,
  Trash2,
  HelpCircle,
  Sliders,
  RefreshCw,
  GitCompare,
  FileText,
  Binary,
  Play,
} from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import {
  analyzeText,
  testAvalanche,
  testAvalancheBatch,
  testBlockModes,
  testCiphertextStats,
  scanMalware,
} from '../services/api';
import './Analysis.css';
import './Cryptanalysis.css';

// ─── Componentes Auxiliares Compartidos ────────────────────────────────────

function MetricCard({ icon, label, value, description, highlight, badge }) {
  return (
    <div className={`card an-metric-card ${highlight ? 'an-metric-card--highlight' : ''}`}>
      <div className="an-metric-icon">{icon}</div>
      <div className="an-metric-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span className="an-metric-value mono">{value}</span>
          {badge && <span className={`badge ${badge.className}`}>{badge.text}</span>}
        </div>
        <span className="an-metric-label">{label}</span>
        <span className="an-metric-desc">{description}</span>
      </div>
    </div>
  );
}

// ─── Tooltip Personalizado para Gráfica de Frecuencias de Bytes ─────────────
function ByteFrequencyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { byteValue, count } = payload[0].payload;
  const hex = Number(byteValue).toString(16).toUpperCase().padStart(2, '0');
  return (
    <div className="an-chart-tooltip">
      <div className="an-tt-row">
        <span className="an-tt-label">Byte Decimal</span>
        <span className="an-tt-value mono">{byteValue}</span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Hexadecimal</span>
        <span className="an-tt-value mono" style={{ color: 'var(--clr-accent)' }}>0x{hex}</span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Frecuencia</span>
        <span className="an-tt-value" style={{ fontWeight: 700 }}>{count}</span>
      </div>
    </div>
  );
}

// ─── Tooltip Personalizado para Batería de Avalancha ───────────────────────
function BatchAvalancheTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="an-chart-tooltip">
      <div className="an-tt-row">
        <span className="an-tt-label">Muestra</span>
        <span className="an-tt-value mono">{data.sampleLabel}</span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Avalancha</span>
        <span className="an-tt-value mono" style={{ color: '#00d4ff', fontWeight: 800 }}>
          {data.percentage.toFixed(2)}%
        </span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Bits diferentes</span>
        <span className="an-tt-value mono">{data.differentBits} / {data.totalBits}</span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Desviación del 50%</span>
        <span className="an-tt-value mono">Δ {Math.abs(data.percentage - 50).toFixed(2)}%</span>
      </div>
    </div>
  );
}

// ─── Gauge Visual de Entropía de Shannon ───────────────────────────────────
function EntropyGauge({ entropy }) {
  const max = 8.0;
  const numEntropy = typeof entropy === 'number' && !isNaN(entropy) ? entropy : Number(entropy) || 0;
  const pct = Math.min((numEntropy / max) * 100, 100);
  const level =
    numEntropy >= 7.0
      ? { label: 'Muy alta (Óptima)', color: '#10d46e', tip: 'Distribución estadística cercana a aleatoriedad uniforme.' }
      : numEntropy >= 5.0
      ? { label: 'Alta', color: '#00d4ff', tip: 'Buena dispersión de bytes en el bloque analizado.' }
      : numEntropy >= 3.0
      ? { label: 'Moderada', color: '#f59e0b', tip: 'Dispersión irregular. Presencia de patrones o sesgos estadísticos.' }
      : { label: 'Baja (Peligro)', color: '#f43f5e', tip: 'Alta redundancia o texto sin cifrar. Estructuralmente débil.' };

  return (
    <div className="card an-gauge-card">
      <div className="an-gauge-header">
        <span className="an-gauge-title">Entropía de Shannon (0 a 8.0 bits / byte)</span>
        <span className="an-gauge-tip" title={level.tip}>
          <Info size={14} />
        </span>
      </div>

      <div className="an-gauge-value-row">
        <span className="an-gauge-number mono" style={{ color: level.color }}>
          {numEntropy.toFixed(4)}
        </span>
        <div className="an-gauge-meta">
          <span className="an-gauge-unit">bits / byte</span>
          <span
            className="an-gauge-badge"
            style={{ backgroundColor: `${level.color}20`, color: level.color, border: `1px solid ${level.color}40` }}
          >
            {level.label}
          </span>
        </div>
      </div>

      <div className="an-gauge-bar-track">
        <div className="an-gauge-bar-fill" style={{ width: `${pct}%`, backgroundColor: level.color }} />
        <div className="an-gauge-marker" style={{ left: '87.5%' }} title="7.0 - Umbral de alta entropía" />
      </div>

      <div className="an-gauge-scale mono">
        <span>0.0 (Predecible)</span>
        <span className="an-gauge-scale-mid">4.0 (Moderada)</span>
        <span>8.0 (Aleatorio Ideal)</span>
      </div>
    </div>
  );
}

// ─── Gauge Visual del Efecto Avalancha (SAC) ───────────────────────────────
function AvalancheGauge({ percentage, differentBits, totalBits }) {
  const numPct = typeof percentage === 'number' && !isNaN(percentage) ? percentage : Number(percentage) || 0;
  const isOptimal = numPct >= 40 && numPct <= 60;
  const isAcceptable = (numPct >= 30 && numPct < 40) || (numPct > 60 && numPct <= 70);

  const statusColor = isOptimal ? '#10d46e' : isAcceptable ? '#00d4ff' : '#f59e0b';
  const statusLabel = isOptimal
    ? 'Difusión Óptima (SAC Cumplido)'
    : isAcceptable
    ? 'Difusión Aceptable'
    : 'Dispersión Atípica';

  return (
    <div className="card an-av-gauge-card">
      <div className="an-av-gauge-header">
        <span className="an-av-gauge-title">Criterio Estricto de Avalancha (SAC)</span>
        <span className="an-av-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
          {statusLabel}
        </span>
      </div>

      <div className="an-av-main-row">
        <div className="an-av-val-col">
          <span className="an-av-percent mono" style={{ color: statusColor }}>
            {percentage.toFixed(2)}%
          </span>
          <span className="an-av-sublabel">de bits modificados en el criptograma</span>
        </div>

        <div className="an-av-track-container">
          <div className="an-av-bar-track">
            <div
              className="an-av-bar-fill"
              style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: statusColor }}
            />
            <div className="an-av-center-marker" title="50% - Objetivo Ideal del SAC" />
          </div>
          <div className="an-av-bar-ticks mono">
            <span>0% (Sin difusión)</span>
            <span className="an-av-tick-target">▲ 50% (Ideal SAC)</span>
            <span>100% (Inversión)</span>
          </div>
        </div>

        <div className="an-av-stats-pills">
          <div className="an-av-pill">
            <span className="an-av-pill-label">Bits diferentes:</span>
            <span className="an-av-pill-val mono">{differentBits}</span>
          </div>
          <div className="an-av-pill">
            <span className="an-av-pill-label">Bits evaluados:</span>
            <span className="an-av-pill-val mono">{totalBits}</span>
          </div>
          <div className="an-av-pill">
            <span className="an-av-pill-label">Desviación:</span>
            <span className="an-av-pill-val mono">Δ {Math.abs(percentage - 50).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scroll Vertical Seguro (Evita Desplazamiento Horizontal del Sidebar) ───
function safeScrollTo(ref) {
  if (ref?.current) {
    const yOffset = -80;
    const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
}

// ─── Error Boundary Local de Recuperación ──────────────────────────────────
class LocalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en el módulo Criptoanálisis:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ padding: '32px', textAlign: 'center', margin: '32px auto', maxWidth: '640px' }}>
          <h3 style={{ color: '#f43f5e', marginBottom: '12px' }}>Ocurrió un error en el módulo de Criptoanálisis</h3>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error inesperado durante el renderizado del módulo.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL: CRIPTOANÁLISIS
// ============================================================================
function AnalysisContent() {
  // Pestañas principales unificadas: 'stats' | 'avalanche' | 'blocks' | 'malware'
  const [activeTab, setActiveTab] = useState('stats');

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO SECCIÓN A: ESTADÍSTICAS Y FRECUENCIAS
  // ──────────────────────────────────────────────────────────────────────────
  const [statsInputMode, setStatsInputMode] = useState('text'); // 'text' | 'base64'
  const [statsText, setStatsText] = useState('Cryptium 2026 - Evaluacion de Criptoanalisis y Entropia');
  const [statsKey, setStatsKey] = useState('ClaveSeguraCryptium2026!');
  const [statsBase64, setStatsBase64] = useState('');
  const [statsHasIv, setStatsHasIv] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsStatus, setStatsStatus] = useState(null);
  const [statsResult, setStatsResult] = useState(null);
  const [statsCopied, setStatsCopied] = useState(false);
  const statsResultsRef = useRef(null);

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO SECCIÓN B: EFECTO AVALANCHA (INDIVIDUAL Y POR LOTES)
  // ──────────────────────────────────────────────────────────────────────────
  const [avMode, setAvMode] = useState('single'); // 'single' | 'batch'

  // Avalancha Individual
  const [avText, setAvText] = useState('Criptografia Cryptium 2026');
  const [avKey, setAvKey] = useState('ClaveExperimental2026!');
  const [avLoading, setAvLoading] = useState(false);
  const [avStatus, setAvStatus] = useState(null);
  const [avResult, setAvResult] = useState(null);
  const avResultsRef = useRef(null);

  // Avalancha por Lotes (Multimuestra)
  const [batchTarget, setBatchTarget] = useState('text'); // 'text' | 'key'
  const [batchSamplesCount, setBatchSamplesCount] = useState(10);
  const [batchText, setBatchText] = useState('Criptografia Avanzada Cryptium 2026 - Analisis AES');
  const [batchKey, setBatchKey] = useState('ClaveExperimentalSegura2026!');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchStatus, setBatchStatus] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const batchResultsRef = useRef(null);

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO SECCIÓN C: PATRONES DE BLOQUES (ECB vs CBC)
  // ──────────────────────────────────────────────────────────────────────────
  const [blocksText, setBlocksText] = useState(
    'CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1BLOQUE_DISTINTO'
  );
  const [blocksKey, setBlocksKey] = useState('ClaveExperimentalModos2026!');
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blocksStatus, setBlocksStatus] = useState(null);
  const [blocksResult, setBlocksResult] = useState(null);
  const blocksResultsRef = useRef(null);

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO SECCIÓN D: ANÁLISIS ANTIMALWARE
  // ──────────────────────────────────────────────────────────────────────────
  const [malwareFile, setMalwareFile] = useState(null);
  const [malwareLoading, setMalwareLoading] = useState(false);
  const [malwareResult, setMalwareResult] = useState(null);
  const [malwareError, setMalwareError] = useState(null);
  const malwareFileRef = useRef(null);
  const malwareResultsRef = useRef(null);

  // ─── Handlers Sección A: Estadísticas ─────────────────────────────────────
  const handleExecuteStats = async () => {
    setStatsLoading(true);
    setStatsStatus(null);
    setStatsResult(null);

    try {
      if (statsInputMode === 'text') {
        if (!statsText.trim()) {
          setStatsStatus({ type: 'error', message: 'El texto en claro no puede estar vacío.' });
          setStatsLoading(false);
          return;
        }
        if (!statsKey.trim()) {
          setStatsStatus({ type: 'error', message: 'Debes proporcionar una clave para cifrar y analizar.' });
          setStatsLoading(false);
          return;
        }

        const data = await analyzeText(statsText, statsKey);
        setStatsResult({
          source: 'text',
          encryptedText: data.encryptedText,
          entropy: data.entropy,
          totalBytes: data.totalBytes,
          uniqueBytes: data.uniqueBytes,
          frequency: data.frequency,
          duplicatedBlocksCount: 0,
        });
        setStatsStatus({
          type: 'success',
          message: `Análisis estadístico completado exitosamente: ${data.totalBytes} bytes evaluados con entropía de ${data.entropy.toFixed(4)} bits/byte.`,
        });
      } else {
        if (!statsBase64.trim()) {
          setStatsStatus({ type: 'error', message: 'Introduce un criptograma en Base64 para analizar.' });
          setStatsLoading(false);
          return;
        }

        const data = await testCiphertextStats({
          ciphertextBase64: statsBase64.trim(),
          hasIvPrefix: statsHasIv,
        });
        setStatsResult({
          source: 'base64',
          encryptedText: statsBase64.trim(),
          entropy: data.entropy,
          totalBytes: data.totalBytes,
          uniqueBytes: data.uniqueBytes,
          frequency: data.frequency,
          ivHex: data.ivHex,
          ciphertextHex: data.ciphertextHex,
          blockCount: data.blockCount,
          duplicatedBlocksCount: data.duplicatedBlocksCount,
          duplicatedBlocksIndices: data.duplicatedBlocksIndices,
          isSuspiciousLowEntropy: data.isSuspiciousLowEntropy,
        });
        setStatsStatus({
          type: 'success',
          message: `Criptograma Base64 evaluado: ${data.totalBytes} bytes, ${data.blockCount || 0} bloques y entropía de ${data.entropy.toFixed(4)} bits/byte.`,
        });
      }
      setTimeout(() => safeScrollTo(statsResultsRef), 100);
    } catch (err) {
      setStatsStatus({
        type: 'error',
        message: `Error durante el análisis estadístico: ${err.message}`,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCopyStatsCipher = async () => {
    if (!statsResult?.encryptedText) return;
    try {
      await navigator.clipboard.writeText(statsResult.encryptedText);
      setStatsCopied(true);
      setTimeout(() => setStatsCopied(false), 2000);
    } catch {
      setStatsStatus({ type: 'error', message: 'No se pudo copiar al portapapeles.' });
    }
  };

  // ─── Handlers Sección B: Efecto Avalancha ─────────────────────────────────
  const handleRunAvalancheSingle = async () => {
    if (!avText.trim() || !avKey.trim()) {
      setAvStatus({ type: 'error', message: 'Completa el texto y la clave experimental.' });
      return;
    }

    setAvLoading(true);
    setAvStatus(null);
    setAvResult(null);

    try {
      const data = await testAvalanche(avText, avKey);
      setAvResult(data);
      setAvStatus({
        type: 'success',
        message: `Prueba de avalancha individual completada. Se compararon ${data.totalBits} bits con una difusión del ${data.avalanchePercentage.toFixed(2)}%.`,
      });
      setTimeout(() => safeScrollTo(avResultsRef), 100);
    } catch (err) {
      setAvStatus({
        type: 'error',
        message: `Error al calcular avalancha: ${err.message}`,
      });
    } finally {
      setAvLoading(false);
    }
  };

  const handleRunAvalancheBatch = async () => {
    if (!batchText.trim() || !batchKey.trim()) {
      setBatchStatus({ type: 'error', message: 'Completa el texto y la clave para la batería.' });
      return;
    }

    setBatchLoading(true);
    setBatchStatus(null);
    setBatchResult(null);

    try {
      const data = await testAvalancheBatch({
        text: batchText,
        key: batchKey,
        target: batchTarget,
        sampleCount: Number(batchSamplesCount),
      });
      setBatchResult(data);
      setBatchStatus({
        type: 'success',
        message: `Batería completada: ${data.samples.length} muestras analizadas (variando ${
          batchTarget === 'text' ? 'texto plano' : 'clave'
        }). Promedio: ${data.summary.averagePercentage.toFixed(2)}%.`,
      });
      setTimeout(() => safeScrollTo(batchResultsRef), 100);
    } catch (err) {
      setBatchStatus({
        type: 'error',
        message: `Error al ejecutar batería por lotes: ${err.message}`,
      });
    } finally {
      setBatchLoading(false);
    }
  };

  // ─── Handlers Sección C: Patrones de Bloques ──────────────────────────────
  const handleRunBlockModes = async () => {
    if (!blocksText.trim() || !blocksKey.trim()) {
      setBlocksStatus({ type: 'error', message: 'Completa el texto estructurado y la clave.' });
      return;
    }

    setBlocksLoading(true);
    setBlocksStatus(null);
    setBlocksResult(null);

    try {
      const data = await testBlockModes({ text: blocksText, key: blocksKey });
      setBlocksResult(data);
      setBlocksStatus({
        type: 'success',
        message: `Análisis de modos de bloque completado: ${data.totalBlocks} bloques comparados entre ECB y CBC.`,
      });
      setTimeout(() => safeScrollTo(blocksResultsRef), 100);
    } catch (err) {
      setBlocksStatus({
        type: 'error',
        message: `Error en el análisis de modos de bloque: ${err.message}`,
      });
    } finally {
      setBlocksLoading(false);
    }
  };

  // ─── Handlers Sección D: Antimalware ──────────────────────────────────────
  const handleMalwareFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMalwareFile(file);
      setMalwareResult(null);
      setMalwareError(null);
    }
  };

  const handleExecuteMalwareScan = async () => {
    if (!malwareFile) return;
    setMalwareLoading(true);
    setMalwareResult(null);
    setMalwareError(null);

    try {
      const data = await scanMalware(malwareFile);
      setMalwareResult(data);
      setTimeout(() => safeScrollTo(malwareResultsRef), 100);
    } catch (err) {
      setMalwareError(
        err instanceof TypeError
          ? 'No se pudo conectar con el backend de escaneo. Comprueba que el servidor esté activo.'
          : `Error en el escaneo antivirus: ${err.message}`
      );
    } finally {
      setMalwareLoading(false);
    }
  };

  const handleClearMalware = () => {
    setMalwareFile(null);
    setMalwareResult(null);
    setMalwareError(null);
    if (malwareFileRef.current) malwareFileRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getMalwareStatusDisplay = (scanStatus) => {
    switch (scanStatus) {
      case 'clean':
        return { icon: <CheckCircle2 size={24} />, text: 'No se encontraron amenazas', className: 'ms-status--clean' };
      case 'detected':
        return { icon: <AlertTriangle size={24} />, text: 'Amenaza detectada en el archivo', className: 'ms-status--detected' };
      case 'error':
        return { icon: <XCircle size={24} />, text: 'No fue posible completar el análisis', className: 'ms-status--error' };
      case 'unavailable':
        return { icon: <AlertCircle size={24} />, text: 'Microsoft Defender no disponible en este entorno', className: 'ms-status--unavailable' };
      default:
        return { icon: <HelpCircle size={24} />, text: 'Estado desconocido', className: 'ms-status--error' };
    }
  };

  // Datos preparados para la gráfica de frecuencias (0 a 255)
  const frequencyChartData = statsResult?.frequency
    ? Object.entries(statsResult.frequency)
        .map(([byteValue, count]) => ({ byteValue: Number(byteValue), count }))
        .sort((a, b) => a.byteValue - b.byteValue)
    : [];

  // Datos preparados para la gráfica de avalancha por lotes
  const batchChartData = batchResult?.samples?.map((s) => ({
    sampleLabel: `M${s.sampleIndex}`,
    percentage: s.avalanchePercentage,
    differentBits: s.differentBits,
    totalBits: s.totalBits,
    isOptimal: s.avalanchePercentage >= 40 && s.avalanchePercentage <= 60,
  })) || [];

  return (
    <div className="analysis animate-fade-in" style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
      {/* ── Encabezado Unificado del Módulo ────────────────────────── */}
      <div className="an-hero-card card hex-bg">
        <div className="an-hero-content">
          <div className="an-hero-badge">
            <FlaskConical size={14} /> Criptoanálisis
          </div>
          <h2 className="an-hero-title">CRIPTOANÁLISIS</h2>
          <p className="an-hero-subtitle">
            Explora patrones, mide propiedades y analiza la seguridad de los cifrados en un entorno consolidado.
          </p>
        </div>
      </div>

      {/* ── Pestañas de Navegación del Laboratorio (4 Secciones Claras) ─ */}
      <div className="an-nav-tabs" style={{ width: '100%', minWidth: 0 }}>
        <button
          type="button"
          className={`an-nav-tab ${activeTab === 'stats' ? 'an-nav-tab--active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart2 size={16} /> 1. Estadísticas y Frecuencias
        </button>

        <button
          type="button"
          className={`an-nav-tab ${activeTab === 'avalanche' ? 'an-nav-tab--active' : ''}`}
          onClick={() => setActiveTab('avalanche')}
        >
          <Zap size={16} /> 2. Efecto Avalancha (SAC)
        </button>

        <button
          type="button"
          className={`an-nav-tab ${activeTab === 'blocks' ? 'an-nav-tab--active' : ''}`}
          onClick={() => setActiveTab('blocks')}
        >
          <Layers size={16} /> 3. Patrones de Bloques (ECB vs CBC)
        </button>

        <button
          type="button"
          className={`an-nav-tab ${activeTab === 'malware' ? 'an-nav-tab--active' : ''}`}
          onClick={() => setActiveTab('malware')}
        >
          <ShieldCheck size={16} /> 4. Análisis Antimalware
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 1: ESTADÍSTICAS Y FRECUENCIAS DE BYTES
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <section className="an-stats-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} className="an-icon-cyan" />
                <span>Análisis Estadístico de Dispersión y Entropía</span>
              </div>
              <div className="cr-switch-btn-group">
                <button
                  type="button"
                  className={`cr-switch-btn ${statsInputMode === 'text' ? 'cr-switch-btn--active' : ''}`}
                  onClick={() => { setStatsInputMode('text'); setStatsResult(null); }}
                >
                  Cifrar y Analizar Texto
                </button>
                <button
                  type="button"
                  className={`cr-switch-btn ${statsInputMode === 'base64' ? 'cr-switch-btn--active' : ''}`}
                  onClick={() => { setStatsInputMode('base64'); setStatsResult(null); }}
                >
                  Analizar Criptograma Base64
                </button>
              </div>
            </div>

            {statsInputMode === 'text' ? (
              <div className="an-input-grid">
                <div className="form-group">
                  <label className="form-label">Texto en claro a cifrar y evaluar:</label>
                  <textarea
                    className="form-input an-textarea"
                    value={statsText}
                    onChange={(e) => setStatsText(e.target.value)}
                    placeholder="Introduce el texto a analizar..."
                  />
                  <div className="an-counters">
                    <span>{statsText.length} caracteres</span>
                    <span>{new Blob([statsText]).size} bytes UTF-8</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clave de cifrado simétrico:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={statsKey}
                    onChange={(e) => setStatsKey(e.target.value)}
                    placeholder="Clave para generar el criptograma..."
                  />
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleExecuteStats}
                      disabled={statsLoading}
                    >
                      {statsLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                      Ejecutar Análisis Estadístico
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setStatsText(''); setStatsKey(''); setStatsResult(null); }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Criptograma en formato Base64:</label>
                  <textarea
                    className="form-input an-textarea mono"
                    value={statsBase64}
                    onChange={(e) => setStatsBase64(e.target.value)}
                    placeholder="Pega aquí el resultado cifrado en Base64..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={statsHasIv}
                      onChange={(e) => setStatsHasIv(e.target.checked)}
                    />
                    <span>El criptograma incluye prefijo IV de 16 bytes (Estándar Cryptium)</span>
                  </label>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleExecuteStats}
                      disabled={statsLoading}
                    >
                      {statsLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                      Analizar Criptograma Base64
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setStatsBase64(''); setStatsResult(null); }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {statsStatus && <StatusAlert status={statsStatus} />}

          {/* Resultados Estadísticos */}
          {statsResult && (
            <div ref={statsResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              {/* Tarjetas Métricas */}
              <div className="an-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
                <MetricCard
                  icon={<Zap size={20} className="text-accent" />}
                  label="Entropía de Shannon"
                  value={`${statsResult.entropy.toFixed(4)}`}
                  description="Bits de incertidumbre por byte (Máximo ideal: 8.0)"
                  highlight={statsResult.entropy >= 7.0}
                  badge={{
                    text: statsResult.entropy >= 7.0 ? 'Alta Aleatoriedad' : 'Baja Dispersión',
                    className: statsResult.entropy >= 7.0 ? 'badge-accent' : 'badge-amber',
                  }}
                />

                <MetricCard
                  icon={<FileText size={20} />}
                  label="Total de Bytes"
                  value={statsResult.totalBytes}
                  description="Longitud evaluada del criptograma binario"
                />

                <MetricCard
                  icon={<Binary size={20} />}
                  label="Bytes Únicos Presentes"
                  value={`${statsResult.uniqueBytes} / 256`}
                  description={`Cobertura de símbolos: ${Math.round((statsResult.uniqueBytes / 256) * 100)}%`}
                />

                <MetricCard
                  icon={<Layers size={20} />}
                  label="Bloques Repetidos"
                  value={statsResult.duplicatedBlocksCount || 0}
                  description={
                    statsResult.duplicatedBlocksCount > 0
                      ? 'Posible fuga de patrones estructurales'
                      : 'Ningún bloque duplicado detectado'
                  }
                  highlight={statsResult.duplicatedBlocksCount > 0}
                  badge={
                    statsResult.duplicatedBlocksCount > 0
                      ? { text: 'Alerta de Patrón', className: 'badge-rose' }
                      : { text: 'Uniforme', className: 'badge-green' }
                  }
                />
              </div>

              {/* Indicador Gráfico de Entropía */}
              <EntropyGauge entropy={statsResult.entropy} />

              {/* Criptograma Resultante (si proviene de texto) */}
              {statsResult.encryptedText && (
                <div className="card an-encrypted-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="an-card-title" style={{ margin: 0 }}>Criptograma Evaluado (Base64)</span>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={handleCopyStatsCipher}>
                      {statsCopied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                      {statsCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="an-encrypted-text mono">{statsResult.encryptedText}</div>
                </div>
              )}

              {/* Gráfica de Distribución de Frecuencias de Bytes */}
              <div className="card" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div className="cr-card-header">
                  <div className="cr-card-title-group">
                    <BarChart2 size={18} className="text-accent" />
                    <div>
                      <h4 className="cr-card-title">Distribución de Frecuencias por Byte (0x00 - 0xFF)</h4>
                      <span className="cr-card-sub">Conteo cuantitativo de apariciones para cada uno de los 256 valores de byte posibles.</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', height: 260, minWidth: 0, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frequencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="byteValue" tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} interval={31} />
                      <YAxis tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} />
                      <Tooltip content={<ByteFrequencyTooltip />} />
                      <Bar dataKey="count" fill="var(--clr-accent)" radius={[2, 2, 0, 0]}>
                        {frequencyChartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.byteValue}`}
                            fill={entry.count > 0 ? 'var(--clr-accent)' : 'rgba(255,255,255,0.05)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cuadro Pedagógico y Riguroso de Interpretación */}
              <div className="cr-edu-note hex-bg">
                <HelpCircle size={22} style={{ flexShrink: 0, color: 'var(--clr-accent)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Interpretación Rigurosa del Análisis Estadístico:</strong>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.86rem', lineHeight: '1.5' }}>
                    <li>
                      <strong>¿Qué representa esta métrica?</strong> La entropía mide la dispersión probabilística de bits en cada byte. Un valor de 8.0 representa una distribución perfectamente aleatoria y uniforme.
                    </li>
                    <li>
                      <strong>¿Qué patrón se observa?</strong> En un cifrado robusto, la gráfica de frecuencias es cuasi-uniforme (sin picos desproporcionados ni letras recurrentes legibles).
                    </li>
                    <li>
                      <strong>¿Qué NO se puede concluir?</strong> <em>Una alta entropía no demuestra por sí sola que un cifrado sea seguro.</em> Datos comprimidos (ZIP/JPEG) o generadores lineales débiles también exhiben alta entropía superficial. La seguridad depende de la resistencia matemática frente a criptoanálisis de clave, no únicamente de métricas de dispersión.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 2: EFECTO AVALANCHA (SAC)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'avalanche' && (
        <section className="an-avalanche-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#00d4ff' }} />
                <span>Criterio Estricto de Avalancha (Strict Avalanche Criterion - SAC)</span>
              </div>
              <div className="cr-switch-btn-group">
                <button
                  type="button"
                  className={`cr-switch-btn ${avMode === 'single' ? 'cr-switch-btn--active' : ''}`}
                  onClick={() => setAvMode('single')}
                >
                  Prueba Individual (1 bit)
                </button>
                <button
                  type="button"
                  className={`cr-switch-btn ${avMode === 'batch' ? 'cr-switch-btn--active' : ''}`}
                  onClick={() => setAvMode('batch')}
                >
                  Batería por Lotes (Multimuestra)
                </button>
              </div>
            </div>

            {avMode === 'single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Texto plano de prueba:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={avText}
                      onChange={(e) => setAvText(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clave experimental:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={avKey}
                      onChange={(e) => setAvKey(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRunAvalancheSingle}
                    disabled={avLoading}
                  >
                    {avLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                    Ejecutar Prueba de Avalancha (1 bit)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setAvText('Criptografia Cryptium 2026'); setAvKey('ClaveExperimental2026!'); }}
                  >
                    Restablecer Valores
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cr-controls-bar">
                  <div className="cr-target-switch">
                    <span className="cr-switch-label">Variación de 1 bit en:</span>
                    <div className="cr-switch-btn-group">
                      <button
                        type="button"
                        className={`cr-switch-btn ${batchTarget === 'text' ? 'cr-switch-btn--active' : ''}`}
                        onClick={() => setBatchTarget('text')}
                      >
                        Texto Plano (P)
                      </button>
                      <button
                        type="button"
                        className={`cr-switch-btn ${batchTarget === 'key' ? 'cr-switch-btn--active' : ''}`}
                        onClick={() => setBatchTarget('key')}
                      >
                        Clave Secreta (K)
                      </button>
                    </div>
                  </div>

                  <div className="cr-samples-group">
                    <span className="cr-switch-label">Muestras consecutivas:</span>
                    <select
                      className="cr-select"
                      value={batchSamplesCount}
                      onChange={(e) => setBatchSamplesCount(Number(e.target.value))}
                    >
                      <option value={5}>5 muestras</option>
                      <option value={10}>10 muestras (Estándar)</option>
                      <option value={20}>20 muestras (Detallado)</option>
                      <option value={50}>50 muestras (Extenso)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Texto base:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clave base:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={batchKey}
                      onChange={(e) => setBatchKey(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRunAvalancheBatch}
                    disabled={batchLoading}
                  >
                    {batchLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                    Ejecutar Batería por Lotes ({batchSamplesCount} muestras)
                  </button>
                </div>
              </div>
            )}
          </div>

          {avStatus && avMode === 'single' && <StatusAlert status={avStatus} />}
          {batchStatus && avMode === 'batch' && <StatusAlert status={batchStatus} />}

          {/* Resultados Avalancha Individual */}
          {avResult && avMode === 'single' && (
            <div ref={avResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              <AvalancheGauge
                percentage={avResult.avalanchePercentage}
                differentBits={avResult.differentBits}
                totalBits={avResult.totalBits}
              />

              {/* Comparación Visual del Bit Modificado */}
              <div className="card">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={16} className="text-accent" />
                  Inspección del Bit Invertido (Entrada P vs P')
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>Byte Original</span>
                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-accent)', marginTop: '4px' }}>
                      0x{avResult.originalByteHex}
                    </div>
                    <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', letterSpacing: '0.1em', marginTop: '2px' }}>
                      {avResult.originalByteBinary}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <span style={{ fontSize: '0.74rem', color: '#f43f5e', textTransform: 'uppercase' }}>Byte Alterado (1 Bit Invertido)</span>
                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
                      0x{avResult.modifiedByteHex}
                    </div>
                    <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', letterSpacing: '0.1em', marginTop: '2px' }}>
                      {avResult.modifiedByteBinary}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                  Detalle: {avResult.flippedBitInfo} · Mismo IV utilizado en ambos cifrados: <code className="mono">0x{avResult.ivHex}</code>
                </div>
              </div>
            </div>
          )}

          {/* Resultados Avalancha por Lotes (Multimuestra) */}
          {batchResult && avMode === 'batch' && (
            <div ref={batchResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              {/* Tarjetas Resumen */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', width: '100%' }}>
                <MetricCard
                  icon={<Zap size={18} className="text-accent" />}
                  label="Promedio de Difusión"
                  value={`${batchResult.summary.averagePercentage.toFixed(2)}%`}
                  description="Media de bits modificados"
                  highlight={batchResult.summary.averagePercentage >= 45 && batchResult.summary.averagePercentage <= 55}
                />
                <MetricCard
                  icon={<Sliders size={18} />}
                  label="Difusión Mínima"
                  value={`${batchResult.summary.minPercentage.toFixed(2)}%`}
                  description={`Muestra M${batchResult.summary.minSampleIndex}`}
                />
                <MetricCard
                  icon={<Sliders size={18} />}
                  label="Difusión Máxima"
                  value={`${batchResult.summary.maxPercentage.toFixed(2)}%`}
                  description={`Muestra M${batchResult.summary.maxSampleIndex}`}
                />
                <MetricCard
                  icon={<HelpCircle size={18} />}
                  label="Desviación Estándar (σ)"
                  value={`±${batchResult.summary.standardDeviation.toFixed(2)}%`}
                  description="Consistencia entre muestras"
                />
              </div>

              {/* Gráfica de Barras Multimuestra */}
              <div className="card" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div className="cr-card-header">
                  <div className="cr-card-title-group">
                    <BarChart2 size={18} style={{ color: '#00d4ff' }} />
                    <div>
                      <h4 className="cr-card-title">Comportamiento por Muestra vs Objetivo SAC (50%)</h4>
                      <span className="cr-card-sub">Cada barra representa la difusión producida al invertir un bit diferente.</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', height: 260, minWidth: 0, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={batchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="sampleLabel" tick={{ fill: 'var(--txt-muted)', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--txt-muted)', fontSize: 11 }} />
                      <Tooltip content={<BatchAvalancheTooltip />} />
                      <ReferenceLine y={50} stroke="#10d46e" strokeDasharray="4 4" label={{ value: '50% SAC Ideal', fill: '#10d46e', fontSize: 11 }} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {batchChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isOptimal ? '#00d4ff' : '#f59e0b'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabla Detallada de Muestras */}
              <div className="cr-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="cr-table">
                  <thead>
                    <tr>
                      <th>Muestra</th>
                      <th>Bit Alterado</th>
                      <th>Bits Cambiados</th>
                      <th>Avalancha (%)</th>
                      <th>Desviación (|% - 50%|)</th>
                      <th>Evaluación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResult.samples.map((s) => (
                      <tr key={s.sampleIndex}>
                        <td><strong>M{s.sampleIndex}</strong></td>
                        <td className="mono">{s.flippedBitInfo}</td>
                        <td className="mono">{s.differentBits} / {s.totalBits}</td>
                        <td className="mono" style={{ fontWeight: 700, color: s.avalanchePercentage >= 40 && s.avalanchePercentage <= 60 ? '#10d46e' : '#f59e0b' }}>
                          {s.avalanchePercentage.toFixed(2)}%
                        </td>
                        <td className="mono">Δ {Math.abs(s.avalanchePercentage - 50).toFixed(2)}%</td>
                        <td>
                          {s.avalanchePercentage >= 40 && s.avalanchePercentage <= 60 ? (
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Óptimo SAC</span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Aceptable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explicación Técnica y Rigor */}
          <div className="cr-edu-note hex-bg">
            <HelpCircle size={22} style={{ flexShrink: 0, color: '#00d4ff' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <strong style={{ fontSize: '0.95rem' }}>Fundamento Criptográfico del Efecto Avalancha:</strong>
              <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: '1.5' }}>
                El Criterio Estricto de Avalancha (SAC) evalúa la propiedad de <strong>difusión</strong> descrita por Claude Shannon. En un cifrado por bloques seguro como AES, las rondas de sustitución (S-Boxes) y permutación (ShiftRows / MixColumns) propagan la influencia de cada bit a través de toda la matriz. Para que la prueba sea justa, en cada par de prueba se preserva idéntico el vector de inicialización (IV), aislando el impacto del bit modificado.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 3: PATRONES DE BLOQUES (ECB vs CBC)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'blocks' && (
        <section className="an-blocks-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} className="text-accent" />
                <span>Propagación de Patrones Estructurales: Modo ECB vs Modo CBC</span>
              </div>
              <span className="badge badge-rose">Demostración Experimental</span>
            </div>

            <div className="cr-presets-bar">
              <span className="cr-preset-tag">Patrones de prueba rápidos:</span>
              <button
                type="button"
                className="cr-preset-btn"
                onClick={() => setBlocksText('CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1BLOQUE_DISTINTO')}
              >
                Bloques Idénticos Repetidos
              </button>
              <button
                type="button"
                className="cr-preset-btn"
                onClick={() => setBlocksText('111111111111111111111111111111112222222222222222')}
              >
                Patrón Numérico Repetitivo
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Texto estructurado de prueba (Múltiplos de 16 bytes):</label>
                <input
                  type="text"
                  className="form-input"
                  value={blocksText}
                  onChange={(e) => setBlocksText(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clave experimental:</label>
                <input
                  type="text"
                  className="form-input"
                  value={blocksKey}
                  onChange={(e) => setBlocksKey(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRunBlockModes}
                disabled={blocksLoading}
              >
                {blocksLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                Ejecutar Comparación ECB vs CBC
              </button>
            </div>
          </div>

          {blocksStatus && <StatusAlert status={blocksStatus} />}

          {/* Resultados de Modos de Bloque */}
          {blocksResult && (
            <div ref={blocksResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              {/* Métricas Resumen */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
                <MetricCard
                  icon={<Layers size={18} />}
                  label="Bloques Evaluados"
                  value={blocksResult.totalBlocks}
                  description="Bloques AES de 128 bits (16 bytes c/u)"
                />
                <MetricCard
                  icon={<FileText size={18} className="text-accent" />}
                  label="Bloques Repetidos en Claro"
                  value={blocksResult.duplicatedPlainBlocksCount}
                  description="Bloques con texto idéntico en la entrada"
                  highlight={blocksResult.duplicatedPlainBlocksCount > 0}
                />
                <MetricCard
                  icon={<AlertTriangle size={18} style={{ color: '#f43f5e' }} />}
                  label="Repeticiones en ECB"
                  value={blocksResult.duplicatedEcbBlocksCount}
                  description={
                    blocksResult.duplicatedEcbBlocksCount > 0
                      ? '¡Fuga de patrones! Bloques idénticos producen criptogramas idénticos'
                      : 'Sin duplicados detectados'
                  }
                  highlight={blocksResult.duplicatedEcbBlocksCount > 0}
                  badge={
                    blocksResult.duplicatedEcbBlocksCount > 0
                      ? { text: 'Inseguro (ECB)', className: 'badge-rose' }
                      : { text: 'Sin patrones', className: 'badge-muted' }
                  }
                />
                <MetricCard
                  icon={<ShieldCheck size={18} style={{ color: '#10d46e' }} />}
                  label="Repeticiones en CBC"
                  value={blocksResult.duplicatedCbcBlocksCount}
                  description="Cero repeticiones gracias al encadenamiento con IV"
                  highlight={blocksResult.duplicatedCbcBlocksCount === 0}
                  badge={{ text: 'Seguro (CBC)', className: 'badge-green' }}
                />
              </div>

              {/* Matriz Visual de Bloques */}
              <div className="card" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div className="cr-card-header">
                  <div className="cr-card-title-group">
                    <Layers size={18} className="text-accent" />
                    <div>
                      <h4 className="cr-card-title">Matriz Comparativa de Bloques (ECB vs CBC)</h4>
                      <span className="cr-card-sub">Observa cómo ECB preserva repeticiones mientras CBC las aleatoriza completamente.</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div className="cr-block-matrix" style={{ minWidth: '680px' }}>
                    {blocksResult.blocks.map((b) => (
                      <div key={b.index} className="cr-block-row">
                        <div className="cr-block-idx">
                          <span>Bloque</span>
                          <span className="mono" style={{ fontSize: '1rem', color: '#fff' }}>#{b.index}</span>
                        </div>

                        <div className={`cr-block-cell ${b.isPlainDuplicate ? 'cr-cell--dupe-plain' : ''}`}>
                          <span className="cr-cell-label">Texto Plano (16 bytes)</span>
                          <span className="cr-cell-val mono">"{b.plainText}"</span>
                          {b.isPlainDuplicate && (
                            <span className="cr-dupe-tag" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--clr-accent)' }}>
                              ★ Bloque de Entrada Repetido
                            </span>
                          )}
                        </div>

                        <div className={`cr-block-cell ${b.isEcbDuplicate ? 'cr-cell--dupe-ecb' : ''}`}>
                          <span className="cr-cell-label">Modo ECB (Cifrado Independiente)</span>
                          <span className="cr-cell-val mono">{b.ecbCipherHex}</span>
                          {b.isEcbDuplicate ? (
                            <span className="cr-dupe-tag cr-dupe-tag--bad">
                              ⚠ Criptograma ECB Idéntico (Fuga)
                            </span>
                          ) : (
                            <span className="cr-cell-sub">Único</span>
                          )}
                        </div>

                        <div className={`cr-block-cell ${b.isCbcDuplicate ? 'cr-cell--dupe-ecb' : 'cr-cell--ok-cbc'}`}>
                          <span className="cr-cell-label">Modo CBC (Encadenamiento con IV)</span>
                          <span className="cr-cell-val mono">{b.cbcCipherHex}</span>
                          <span className="cr-dupe-tag cr-dupe-tag--ok">
                            ✓ Difusión Completa (Diferente)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advertencia Técnica */}
              <div className="cr-edu-note hex-bg">
                <AlertTriangle size={22} style={{ flexShrink: 0, color: '#f59e0b' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Demostración Experimental Exclusiva:</strong>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: '1.5' }}>
                    El modo ECB nunca debe utilizarse para proteger información sensible, ya que preserva la estructura de los datos (como en el famoso ataque al pingüino Tux). Esta herramienta forma parte de un entorno pedagógico experimental. En los módulos habituales de texto y archivos, Cryptium utiliza siempre modos de cifrado robustos (CBC/GCM) con vectores de inicialización impredecibles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 4: ANÁLISIS ANTIMALWARE (MICROSOFT DEFENDER)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'malware' && (
        <section className="an-malware-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} className="text-accent" />
                <span>Analizador de Seguridad de Archivos (Microsoft Defender)</span>
              </div>
              <span className="badge badge-accent">POST /api/Malware/scan</span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)', lineHeight: '1.5', margin: 0 }}>
              Inspecciona archivos antes o después del cifrado mediante el motor antivirus nativo del sistema operativo Windows.
            </p>

            {/* Zona de Selección de Archivo */}
            <div
              className="card"
              style={{
                border: '2px dashed var(--clr-border)',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => malwareFileRef.current?.click()}
            >
              <input
                ref={malwareFileRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleMalwareFileSelect}
              />
              <Upload size={32} style={{ color: 'var(--clr-accent)', margin: '0 auto 10px' }} />
              <strong style={{ display: 'block', fontSize: '1rem', color: '#fff' }}>
                {malwareFile ? malwareFile.name : 'Haz clic o arrastra un archivo aquí'}
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                {malwareFile
                  ? `Tamaño: ${formatFileSize(malwareFile.size)}`
                  : 'Soporta ejecutables, documentos, archivos comprimidos y binarios (hasta 100 MB).'}
              </span>
            </div>

            {malwareFile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExecuteMalwareScan}
                  disabled={malwareLoading}
                >
                  {malwareLoading ? <RefreshCw size={16} className="spinner" /> : <ShieldCheck size={16} />}
                  Ejecutar Escaneo Antivirus
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearMalware}
                >
                  <Trash2 size={16} /> Quitar Archivo
                </button>
              </div>
            )}
          </div>

          {malwareError && <StatusAlert status={{ type: 'error', message: malwareError }} />}

          {/* Resultado del Escaneo Antivirus */}
          {malwareResult && (
            <div ref={malwareResultsRef} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const display = getMalwareStatusDisplay(malwareResult.status);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      background: malwareResult.status === 'clean' ? 'rgba(16,212,110,0.1)' : 'rgba(244,63,94,0.1)',
                      border: `1px solid ${malwareResult.status === 'clean' ? '#10d46e' : '#f43f5e'}`,
                    }}
                  >
                    <div style={{ color: malwareResult.status === 'clean' ? '#10d46e' : '#f43f5e' }}>
                      {display.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: malwareResult.status === 'clean' ? '#10d46e' : '#f43f5e' }}>
                        {display.text}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--txt-primary)' }}>
                        {malwareResult.message}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="an-av-pill">
                  <span className="an-av-pill-label">Archivo:</span>
                  <span className="an-av-pill-val mono">{malwareResult.fileName}</span>
                </div>
                <div className="an-av-pill">
                  <span className="an-av-pill-label">Tamaño:</span>
                  <span className="an-av-pill-val mono">{formatFileSize(malwareResult.fileSize)}</span>
                </div>
                <div className="an-av-pill">
                  <span className="an-av-pill-label">Motor de Análisis:</span>
                  <span className="an-av-pill-val">{malwareResult.engine || 'Microsoft Defender'}</span>
                </div>
                <div className="an-av-pill">
                  <span className="an-av-pill-label">Código de Retorno:</span>
                  <span className="an-av-pill-val mono">{malwareResult.exitCode}</span>
                </div>
              </div>

              {/* Explicación y Limitaciones */}
              <div className="cr-edu-note hex-bg">
                <HelpCircle size={22} style={{ flexShrink: 0, color: 'var(--clr-accent)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Alcance y Limitaciones del Análisis Antimalware:</strong>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: '1.5' }}>
                    El escaneo evalúa firmas conocidas y análisis heurístico mediante Microsoft Defender en un entorno temporal aislado. Es una medida preventiva fundamental antes de descifrar archivos de procedencia desconocida. No obstante, ninguna herramienta antivirus garantiza la detección de amenazas de día cero (zero-day) no catalogadas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function Analysis() {
  return (
    <LocalErrorBoundary>
      <AnalysisContent />
    </LocalErrorBoundary>
  );
}
