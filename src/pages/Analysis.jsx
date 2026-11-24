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
  Sparkles,
  Eye,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
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

// ─── Presets Demostrativos Pedagógicos (Frecuencias y Entropía) ─────────────
const STATS_PRESETS = [
  {
    id: 'repetitive',
    title: 'Texto Repetitivo',
    subtitle: 'Mínima entropía',
    badge: 'H ≈ 0.0 bits',
    text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    key: 'ClaveDemoCryptium2026!',
    explanation:
      "Un único byte repetido (100% letra 'A'). Permite observar una barra solitaria del 100% con entropía 0.0 en el texto original, y cómo AES-256 la transforma en un espectro disperso con entropía elevada.",
  },
  {
    id: 'spanish',
    title: 'Frase en Español',
    subtitle: 'Lenguaje natural',
    badge: 'H ≈ 4.1 bits',
    text: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo.',
    key: 'ClaveQuijote2026!',
    explanation:
      "Prosa real en español con picos notables en vocales ('e', 'a') y espacios (entropía ~4.1 bits/byte). Ilustra cómo el cifrado rompe por completo el sesgo lingüístico del idioma.",
  },
  {
    id: 'symbols',
    title: 'Caracteres Variados',
    subtitle: 'Mayor diversidad',
    badge: 'H ≈ 4.8 bits',
    text: 'Cryptium#2026! Criptoanalisis: [AES-256 + CBC] -> Seguridad y Criptologia.',
    key: 'ClaveSimbolos2026!',
    explanation:
      'Mezcla de mayúsculas, minúsculas, números y símbolos de puntuación. Demuestra una muestra heterogénea con mayor dispersión inicial y cómo el cifrado borra la distinción de símbolos.',
  },
];

// ─── Presets Demostrativos Pedagógicos (Efecto Avalancha - SAC) ────────────
const SAC_PRESETS = [
  {
    id: 'sac-char',
    title: "Texto: Invertir Bit en 'C'",
    subtitle: '1 carácter modificado',
    badge: 'Byte 0, Bit 0',
    text: 'Criptografia Cryptium 2026',
    key: 'ClaveExperimental2026!',
    byteIndex: 0,
    bitIndex: 0,
    targetChar: 'C',
    explanation:
      "Invierte el bit menos significativo (Bit 0) del primer carácter ('C', 0x43 -> 0x42, 'B'). Observa cómo un cambio imperceptible de 1 solo bit propaga una mutación masiva en ~50% de los bits del criptograma.",
  },
  {
    id: 'sac-repetitive',
    title: 'Texto Repetitivo',
    subtitle: 'Ruptura de redundancia',
    badge: 'Byte 0, Bit 1',
    text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    key: 'ClaveSegura2026!',
    byteIndex: 0,
    bitIndex: 1,
    targetChar: 'A',
    explanation:
      "Mensaje de 32 letras 'A' idénticas (2 bloques AES de 16 bytes). Al invertir el Bit 1 de la primera letra ('A', 0x41 -> 0x43, 'C'), AES propaga la alteración a través del bloque y del encadenamiento.",
  },
  {
    id: 'sac-extended',
    title: 'Mensaje Multi-Bloque',
    subtitle: 'Propagación profunda',
    badge: 'Byte 1, Bit 3',
    text: 'Mensaje Confidencial Universitario Cryptium 2026',
    key: 'ClaveMaestraA2026!',
    byteIndex: 1,
    bitIndex: 3,
    targetChar: 'e',
    explanation:
      "Mensaje largo de varios bloques. Invertimos el Bit 3 en el segundo byte ('e', 0x65 -> 0x6D, 'm'). Demuestra que sin importar qué bit o byte se altere, el efecto avalancha se mantiene cercano al 50%.",
  },
];

// ─── Presets Demostrativos Pedagógicos (Patrones de Bloques ECB vs CBC) ─────
const BLOCK_PRESETS = [
  {
    id: 'blocks-repeated',
    title: '3 Bloques Idénticos + 1 Distinto',
    subtitle: 'Fuga evidente en ECB',
    badge: '4 bloques (64 bytes)',
    text: 'CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1CRYPTIUM_BLOCK_1BLOQUE_DISTINTO',
    key: 'ClaveExperimentalModos2026!',
    explanation:
      "Los primeros 3 bloques de 16 bytes son exactamente iguales ('CRYPTIUM_BLOCK_1'). En modo ECB, los 3 bloques cifrados resultan 100% IDÉNTICOS, revelando el patrón repetitivo. En CBC, cada bloque cifrado es completamente ÚNICO.",
  },
  {
    id: 'blocks-alternating',
    title: 'Secuencia Alternada A-B-A-B',
    subtitle: 'Patrón cíclico',
    badge: '4 bloques (64 bytes)',
    text: 'BLOQUE_ALFA_0001BLOQUE_BETA_0002BLOQUE_ALFA_0001BLOQUE_BETA_0002',
    key: 'ClaveAlternada2026!',
    explanation:
      "Patrón de bloques alternados: Bloque 1 y 3 son 'BLOQUE_ALFA_0001', mientras 2 y 4 son 'BLOQUE_BETA_0002'. ECB replica la alternancia exacta en los criptogramas. CBC destruye la correlación cíclica.",
  },
  {
    id: 'blocks-varied',
    title: 'Texto Continuo Variado',
    subtitle: 'Sin bloques idénticos',
    badge: 'Texto en prosa',
    text: 'Seguridad Informatica Cryptium: Evaluando Modos de Operacion por Bloques',
    key: 'ClaveVariada2026!',
    explanation:
      "Texto sin repeticiones de bloques exactos de 16 bytes. Ni ECB ni CBC muestran bloques duplicados superficiales, pero ECB sigue siendo vulnerable a ataques de reordenamiento de bloques o reemplazo.",
  },
];

// ─── Utilidad: Decodificación de Base64 a Matriz de Bits (0 y 1) ───────────
function decodeBase64ToBits(b64) {
  if (!b64) return { bytes: new Uint8Array(0), bits: [] };
  try {
    const binaryStr = atob(b64);
    const bytes = new Uint8Array(binaryStr.length);
    const bits = [];
    for (let i = 0; i < binaryStr.length; i++) {
      const byteVal = binaryStr.charCodeAt(i);
      bytes[i] = byteVal;
      for (let b = 7; b >= 0; b--) {
        bits.push((byteVal >> b) & 1);
      }
    }
    return { bytes, bits };
  } catch (err) {
    console.error('Error al decodificar Base64 a bits:', err);
    return { bytes: new Uint8Array(0), bits: [] };
  }
}

// ─── Utilidad: Formateo de Símbolos y Bytes para Humanos ───────────────────
function formatByteSymbol(byteVal) {
  const num = Number(byteVal);
  if (num === 32) return { char: 'Espacio (␣)', glyph: '␣', hex: '0x20', dec: 32, isPrintable: true };
  if (num === 10) return { char: 'Salto de línea (\\n)', glyph: '\\n', hex: '0x0A', dec: 10, isPrintable: false };
  if (num === 9)  return { char: 'Tabulación (\\t)', glyph: '\\t', hex: '0x09', dec: 9, isPrintable: false };
  if (num === 13) return { char: 'Retorno (\\r)', glyph: '\\r', hex: '0x0D', dec: 13, isPrintable: false };
  if (num >= 33 && num <= 126) {
    const ch = String.fromCharCode(num);
    return { char: `'${ch}'`, glyph: ch, hex: `0x${num.toString(16).toUpperCase().padStart(2, '0')}`, dec: num, isPrintable: true };
  }
  const hexStr = `0x${num.toString(16).toUpperCase().padStart(2, '0')}`;
  return { char: hexStr, glyph: hexStr, hex: hexStr, dec: num, isPrintable: false };
}

// ─── Utilidad: Cálculo Local de Estadísticas de Bytes ──────────────────────
function computeLocalByteStats(text) {
  if (!text) return { entropy: 0, totalBytes: 0, uniqueBytes: 0, frequency: {} };
  const bytes = new TextEncoder().encode(text);
  const freq = {};
  for (const b of bytes) {
    freq[b] = (freq[b] || 0) + 1;
  }
  let entropy = 0;
  const len = bytes.length;
  if (len > 0) {
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
  }
  return {
    entropy: Number(entropy.toFixed(4)),
    totalBytes: bytes.length,
    uniqueBytes: Object.keys(freq).length,
    frequency: freq,
  };
}

// ─── Utilidad: Interpretación Dinámica de Resultados ───────────────────────
function getDynamicInterpretation(plainStats, cipherStats) {
  if (!plainStats || !cipherStats) return null;

  const pEntropy = plainStats.entropy;
  const cEntropy = cipherStats.entropy;
  const pTotal = plainStats.totalBytes;
  const cTotal = cipherStats.totalBytes;
  const pUnique = plainStats.uniqueBytes;
  const cUnique = cipherStats.uniqueBytes;

  // Encontrar el byte más repetido en el texto original
  let topPlainByte = null;
  let topPlainCount = 0;
  for (const [byteVal, count] of Object.entries(plainStats.frequency || {})) {
    if (count > topPlainCount) {
      topPlainCount = count;
      topPlainByte = byteVal;
    }
  }
  const topPlainPct = pTotal > 0 ? ((topPlainCount / pTotal) * 100).toFixed(1) : '0';
  const topPlainSymbol = topPlainByte !== null ? formatByteSymbol(topPlainByte).char : 'N/A';

  // Encontrar el byte más repetido en el cifrado
  let topCipherCount = 0;
  for (const count of Object.values(cipherStats.frequency || {})) {
    if (count > topCipherCount) topCipherCount = count;
  }
  const topCipherPct = cTotal > 0 ? ((topCipherCount / cTotal) * 100).toFixed(1) : '0';

  // 1. ¿Qué estás viendo?
  let whatSeeing = '';
  if (pEntropy < 1.0) {
    whatSeeing = `El texto original presenta una redundancia extrema con una entropía casi nula (${pEntropy.toFixed(4)} bits/byte), donde el símbolo ${topPlainSymbol} concentra el ${topPlainPct}% de todas las apariciones en apenas ${pUnique} valor(es) de byte. En marcado contraste, el texto cifrado alcanza una entropía de ${cEntropy.toFixed(4)} bits/byte distribuida en ${cUnique} bytes únicos, donde ningún byte supera el ${topCipherPct}% del total.`;
  } else if (pEntropy < 4.5) {
    whatSeeing = `El texto original refleja la redundancia típica del lenguaje natural (${pEntropy.toFixed(4)} bits/byte), con picos estadísticos prominentes liderados por ${topPlainSymbol} (${topPlainPct}% del mensaje) sobre ${pUnique} símbolos únicos. Tras el cifrado, esos picos lingüísticos desaparecen por completo, alcanzando una entropía de ${cEntropy.toFixed(4)} bits/byte repartida sobre ${cUnique} valores distintos.`;
  } else {
    whatSeeing = `El texto original ya contaba con una variedad apreciable (${pEntropy.toFixed(4)} bits/byte sobre ${pUnique} símbolos). Sin embargo, el cifrado AES-256 homogeniza aún más los datos, elevando la entropía a ${cEntropy.toFixed(4)} bits/byte y extendiendo la dispersión a ${cUnique} valores de byte.`;
  }

  // 2. ¿Por qué ocurre?
  const whyOccurs = `El algoritmo AES-256 aplica los principios criptográficos fundamentales de confusión y difusión. Mediante transformaciones de sustitución (Cajas-S) y mezclas algebraicas de columnas (MixColumns), cada bit del mensaje se combina con los 256 bits de la clave. Esto elimina la estructura sintáctica y la frecuencia original de las letras, convirtiendo las frecuencias desiguales en una distribución cuasi-uniforme indistinguible de ruido estadístico aleatorio.`;

  // 3. ¿Qué debes tener en cuenta?
  const caveats = [
    'Una entropía alta indica una distribución más uniforme de los datos, pero no garantiza por sí sola que un cifrado sea seguro.',
    'Archivos comprimidos (como .zip o .mp3) o secuencias seudoaleatorias generadas por algoritmos débiles también pueden exhibir alta entropía superficial sin ofrecer verdadera resistencia criptográfica.',
    'La seguridad depende de la robustez matemática del algoritmo y de la confidencialidad de la clave, no únicamente de métricas de dispersión estadística.',
  ];

  return { whatSeeing, whyOccurs, caveats, topPlainSymbol, topPlainPct, topCipherPct };
}

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
  const data = payload[0].payload;
  const isPlain = data.type === 'plain';
  const num = Number(data.byteValue !== undefined ? data.byteValue : data.dec);
  const sym = formatByteSymbol(num);
  const count = data.count || 0;
  const pct = data.percentage !== undefined ? `${data.percentage}%` : null;

  return (
    <div className="an-chart-tooltip" style={{ minWidth: '190px' }}>
      <div
        className="an-tt-row"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '5px',
          marginBottom: '5px',
        }}
      >
        <span
          className="an-tt-label"
          style={{ fontWeight: 700, color: isPlain ? '#c084fc' : '#00d4ff' }}
        >
          {isPlain ? 'Texto Original' : 'Texto Cifrado'}
        </span>
        <span className="an-tt-value mono" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
          {sym.char}
        </span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Hexadecimal</span>
        <span
          className="an-tt-value mono"
          style={{ color: isPlain ? '#c084fc' : 'var(--clr-accent)' }}
        >
          {sym.hex}
        </span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Decimal</span>
        <span className="an-tt-value mono">{num}</span>
      </div>
      <div className="an-tt-row">
        <span className="an-tt-label">Apariciones</span>
        <span className="an-tt-value" style={{ fontWeight: 700 }}>
          {count}
        </span>
      </div>
      {pct && (
        <div className="an-tt-row">
          <span className="an-tt-label">Frecuencia Relativa</span>
          <span className="an-tt-value mono">{pct}</span>
        </div>
      )}
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

// ─── Gauge Visual Comparativo de Entropía Dual (Texto Original vs Cifrado) ──
function DualEntropyGauge({ plainEntropy, cipherEntropy }) {
  const max = 8.0;
  const pVal = typeof plainEntropy === 'number' && !isNaN(plainEntropy) ? plainEntropy : Number(plainEntropy) || 0;
  const cVal = typeof cipherEntropy === 'number' && !isNaN(cipherEntropy) ? cipherEntropy : Number(cipherEntropy) || 0;
  const pPct = Math.min((pVal / max) * 100, 100);
  const cPct = Math.min((cVal / max) * 100, 100);
  const delta = cVal - pVal;
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="card an-dual-entropy-card">
      <div className="an-dual-entropy-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={18} className="text-accent" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
            Comparativa de Entropía de Shannon (0.0 a 8.0 bits / byte)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="an-delta-badge">
            <ArrowRight size={14} /> Salto de Incertidumbre: {delta >= 0 ? `+${delta.toFixed(4)}` : delta.toFixed(4)} bits/byte
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.74rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setShowFormula(!showFormula)}
          >
            <BookOpen size={13} /> {showFormula ? 'Ocultar Concepto' : '¿Por qué máx 8.0?'}
          </button>
        </div>
      </div>

      {/* Explicación didáctica colapsable de los 8 bits */}
      {showFormula && (
        <div className="an-preset-explanation animate-fade-in" style={{ margin: '4px 0 10px 0' }}>
          <strong>Fundamento Matemático y Teórico:</strong> La entropía de Shannon mide la incertidumbre promedio por símbolo en bits:{' '}
          <code>H = -Σ p(x) · log₂(p(x))</code>. Dado que un byte está compuesto por exactamente 8 bits, existen{' '}
          <code>2⁸ = 256</code> valores posibles (0 a 255). Si los 256 valores se presentaran con probabilidad idéntica y uniforme (1/256 cada uno), la incertidumbre máxima es{' '}
          <code>log₂(256) = 8.0 bits por byte</code>. Un texto con alta redundancia o repetición tiene entropía baja, mientras que un cifrado simétrico robusto como AES-256 eleva la dispersión hacia el límite teórico de 8.0.
        </div>
      )}

      {/* Pista gráfica con ambos marcadores superpuestos */}
      <div className="an-entropy-track-wrapper">
        <div className="an-entropy-track">
          <div className="an-entropy-gradient-bar" />

          {/* Marcador Texto Original (Púrpura) */}
          <div
            className="an-entropy-pin an-entropy-pin--plain"
            style={{ left: `${pPct}%` }}
            title={`Texto Original: ${pVal.toFixed(4)} bits/byte`}
          >
            <div className="an-entropy-pin-head" />
            <span className="an-entropy-pin-label mono">
              Original: {pVal.toFixed(2)}
            </span>
          </div>

          {/* Marcador Texto Cifrado (Cian) */}
          <div
            className="an-entropy-pin an-entropy-pin--cipher"
            style={{ left: `${cPct}%` }}
            title={`Texto Cifrado: ${cVal.toFixed(4)} bits/byte`}
          >
            <div className="an-entropy-pin-head" />
            <span className="an-entropy-pin-label mono">
              Cifrado: {cVal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="an-entropy-legend-row mono">
          <span>0.0 (Predecible / Redundante)</span>
          <span>4.0 (Lenguaje Natural)</span>
          <span>7.0 (Umbral Criptográfico)</span>
          <span>8.0 (Límite Teórico Máx)</span>
        </div>
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

// ─── Visualizador Matricial de Bits del Criptograma (Bit Matrix Visualizer) ──
function BitMatrixVisualizer({ originalBase64, modifiedBase64, differentBits, totalBits, percentage }) {
  const origDecoded = decodeBase64ToBits(originalBase64);
  const modDecoded = decodeBase64ToBits(modifiedBase64);
  const total = totalBits || origDecoded.bits.length;

  if (!total || origDecoded.bits.length === 0 || modDecoded.bits.length === 0) {
    return null;
  }

  // Agrupar en filas de 32 bits (4 bytes por fila) para legibilidad óptima
  const rowSize = 32;
  const rowsCount = Math.ceil(total / rowSize);
  const rows = [];

  for (let r = 0; r < rowsCount; r++) {
    const startIdx = r * rowSize;
    const endIdx = Math.min(startIdx + rowSize, total);
    const rowBits = [];
    for (let i = startIdx; i < endIdx; i++) {
      const origBit = origDecoded.bits[i] ?? 0;
      const modBit = modDecoded.bits[i] ?? 0;
      const isFlipped = origBit !== modBit;
      const byteIdx = Math.floor(i / 8);
      const bitInByte = 7 - (i % 8);
      rowBits.push({
        index: i,
        byteIdx,
        bitInByte,
        origBit,
        modBit,
        isFlipped,
      });
    }
    rows.push({
      rowIndex: r,
      startIdx,
      endIdx: endIdx - 1,
      bits: rowBits,
    });
  }

  const diffCount = differentBits !== undefined ? differentBits : rows.flatMap((r) => r.bits).filter((b) => b.isFlipped).length;
  const sameCount = total - diffCount;
  const diffPct = percentage !== undefined ? percentage : (diffCount / total) * 100;

  return (
    <div className="an-bitgrid-card">
      <div className="an-bitgrid-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: '#00d4ff' }} />
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
            Visualizador Matricial de Bits del Criptograma (C vs C')
          </h4>
        </div>
        <div className="an-bitgrid-legend">
          <div className="an-bitgrid-legend-item">
            <span className="an-bitgrid-dot an-bitgrid-dot--flipped" />
            <span style={{ color: '#00d4ff', fontWeight: 600 }}>Bit Mutado ({diffCount})</span>
          </div>
          <div className="an-bitgrid-legend-item">
            <span className="an-bitgrid-dot an-bitgrid-dot--same" />
            <span style={{ color: 'var(--txt-muted)' }}>Bit Idéntico ({sameCount})</span>
          </div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--txt-secondary)' }}>
        Pasa el cursor sobre cualquier casilla para inspeccionar la posición exacta del bit y su transición. Cada celda iluminada en cian neón representa un bit del criptograma que cambió como resultado del bit invertido en la entrada.
      </p>

      <div className="an-bitgrid-container">
        {rows.map((row) => (
          <div key={`row-${row.rowIndex}`} className="an-bitgrid-row">
            <span className="an-bitgrid-row-label">
              B{String(row.startIdx).padStart(3, '0')}-{String(row.endIdx).padStart(3, '0')}
            </span>
            <div className="an-bitgrid-cells">
              {row.bits.map((b) => (
                <div
                  key={`bit-${b.index}`}
                  className={`an-bit-cell ${b.isFlipped ? 'an-bit-cell--flipped' : 'an-bit-cell--same'}`}
                  title={`Bit #${b.index} (Byte ${b.byteIdx}, Bit ${b.bitInByte}): ${b.origBit} → ${b.modBit} ${
                    b.isFlipped ? '★ ¡MUTÓ!' : '(Sin cambio)'
                  }`}
                >
                  {b.modBit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="an-bitgrid-stats-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span>
            Total analizado: <strong className="mono" style={{ color: '#fff' }}>{total} bits</strong> ({total / 8} bytes)
          </span>
          <span>
            Mutados: <strong className="mono" style={{ color: '#00d4ff' }}>{diffCount} ({diffPct.toFixed(2)}%)</strong>
          </span>
          <span>
            Conservados: <strong className="mono" style={{ color: 'var(--txt-secondary)' }}>{sameCount} ({(100 - diffPct).toFixed(2)}%)</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)' }}>Objetivo SAC:</span>
          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>50% Difusión Uniforme</span>
        </div>
      </div>
    </div>
  );
}

// ─── Selector Interactivo del Bit a Invertir (BitInputInspectCard) ─────────
function BitInputInspectCard({ text, byteIndex, bitIndex, onByteChange, onBitChange }) {
  const safeText = text || ' ';
  const maxByte = Math.max(0, safeText.length - 1);
  const safeByteIdx = Math.min(Math.max(0, byteIndex), maxByte);
  const origChar = safeText[safeByteIdx] || ' ';
  const origByte = safeText.charCodeAt(safeByteIdx) || 0;
  const origHex = origByte.toString(16).toUpperCase().padStart(2, '0');

  // Cálculo simulado del byte mutado
  const mask = 1 << bitIndex;
  const modByte = origByte ^ mask;
  const modChar = modByte >= 32 && modByte <= 126 ? String.fromCharCode(modByte) : '·';
  const modHex = modByte.toString(16).toUpperCase().padStart(2, '0');

  return (
    <div className="card" style={{ padding: '18px 20px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} style={{ color: 'var(--clr-accent)' }} />
          <strong style={{ fontSize: '0.94rem', color: '#fff' }}>
            Selector Interactivo del Bit a Invertir
          </strong>
        </div>
        <div className="an-sac-byte-select-row">
          <label style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>
            Posición del carácter (Byte):
          </label>
          <input
            type="number"
            min={0}
            max={maxByte}
            value={safeByteIdx}
            onChange={(e) => onByteChange(Math.min(Math.max(0, Number(e.target.value) || 0), maxByte))}
            className="form-input mono"
            style={{ width: '68px', padding: '4px 8px', fontSize: '0.82rem', textAlign: 'center' }}
          />
          <span className="an-sac-byte-idx-badge">
            Carácter: '{origChar}' (0x{origHex})
          </span>
        </div>
      </div>

      <div className="an-sac-input-compare">
        {/* Byte Original */}
        <div className="an-sac-byte-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Byte Original (Entrada P)
            </span>
            <span className="badge badge-accent mono">0x{origHex}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-accent)' }}>
              '{origChar}'
            </span>
            <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--txt-secondary)' }}>
              Decimal: {origByte}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>
              Haz clic en cualquiera de los 8 bits para seleccionarlo:
            </span>
            <div className="an-sac-bits-row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => {
                const bitVal = (origByte >> b) & 1;
                const isSelected = b === bitIndex;
                const isMsb = b === 7;
                const isLsb = b === 0;
                return (
                  <button
                    key={`bit-btn-${b}`}
                    type="button"
                    className={`an-sac-bit-pill ${isSelected ? 'an-sac-bit-pill--selected' : ''} ${
                      isMsb ? 'an-sac-bit-pill--msb' : isLsb ? 'an-sac-bit-pill--lsb' : ''
                    }`}
                    onClick={() => onBitChange(b)}
                    title={`Bit ${b} (${isMsb ? 'MSB - Más significativo' : isLsb ? 'LSB - Menos significativo' : 'Bit intermedio'}). Clic para invertir.`}
                  >
                    <span style={{ color: isSelected ? '#f43f5e' : '#fff' }}>{bitVal}</span>
                    <span className="an-sac-bit-idx">{isMsb ? 'M' : isLsb ? 'L' : b}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--txt-muted)', marginTop: '2px' }}>
              <span>← MSB (Bit 7, peso 128)</span>
              <span>LSB (Bit 0, peso 1) →</span>
            </div>
          </div>
        </div>

        {/* Byte Alterado */}
        <div className="an-sac-byte-card an-sac-byte-card--mod">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Byte Resultante (Entrada P')
            </span>
            <span className="badge badge-rose mono">0x{modHex}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>
              '{modChar}'
            </span>
            <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--txt-secondary)' }}>
              Decimal: {modByte}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#f43f5e' }}>
              Bit #{bitIndex} invertido ({((origByte >> bitIndex) & 1)} → {((modByte >> bitIndex) & 1)}):
            </span>
            <div className="an-sac-bits-row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => {
                const bitVal = (modByte >> b) & 1;
                const isFlipped = b === bitIndex;
                return (
                  <div
                    key={`mod-bit-${b}`}
                    className={`an-sac-bit-pill ${isFlipped ? 'an-sac-bit-pill--flipped' : ''}`}
                  >
                    <span>{bitVal}</span>
                    <span className="an-sac-bit-idx">{b}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', marginTop: '4px' }}>
              Diferencia binaria exacta: <strong>1 solo bit alterado</strong> en todo el mensaje.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Diagrama Didáctico Comparativo ECB vs CBC (BlockOperationDiagram) ─────
function BlockOperationDiagram() {
  return (
    <div className="card" style={{ padding: '20px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <GitCompare size={18} className="text-accent" />
        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
          Mecanismo Interno: ¿Por qué ECB filtra patrones y CBC los destruye?
        </h4>
      </div>

      <div className="an-block-diagram">
        {/* Columna ECB */}
        <div className="an-diagram-card an-diagram-card--ecb">
          <div className="an-diagram-title">
            <span style={{ color: '#f43f5e' }}>Modo ECB (Electronic Codebook)</span>
            <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>Inseguro / Sin Memoria</span>
          </div>

          <p className="an-diagram-subtext">
            Cada bloque de 16 bytes se cifra de forma <strong>estrictamente aislada</strong> con la clave. No existe ningún vector de inicialización ni enlace entre bloques.
          </p>

          <div className="an-diagram-flow">
            <div className="an-diagram-step">
              <span>Bloque 1 ("BLOQUE_A")</span>
              <span>──► [AES(K)] ──►</span>
              <strong style={{ color: '#f43f5e' }}>Cifrado X</strong>
            </div>
            <div className="an-diagram-step an-diagram-step--match">
              <span>Bloque 2 ("BLOQUE_A")</span>
              <span>──► [AES(K)] ──►</span>
              <strong>Cifrado X (¡Idéntico!)</strong>
            </div>
            <div className="an-diagram-step">
              <span>Bloque 3 ("BLOQUE_B")</span>
              <span>──► [AES(K)] ──►</span>
              <span>Cifrado Y</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(244,63,94,0.25)' }}>
            ⚠ <strong>Fuga de Información:</strong> Si el mensaje tiene bloques repetidos, el criptograma replica exactamente esa misma silueta (famoso caso Tux).
          </div>
        </div>

        {/* Columna CBC */}
        <div className="an-diagram-card an-diagram-card--cbc">
          <div className="an-diagram-title">
            <span style={{ color: '#10d46e' }}>Modo CBC (Cipher Block Chaining)</span>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Seguro / Con Encadenamiento</span>
          </div>

          <p className="an-diagram-subtext">
            Cada bloque se combina con <strong>XOR (⊕)</strong> con el bloque cifrado anterior antes de cifrarse. El primer bloque se combina con un <strong>IV aleatorio único</strong>.
          </p>

          <div className="an-diagram-flow">
            <div className="an-diagram-step">
              <span>Bloque 1 ⊕ [IV Aleat]</span>
              <span>──► [AES(K)] ──►</span>
              <strong style={{ color: '#10d46e' }}>Cifrado A</strong>
            </div>
            <div className="an-diagram-step an-diagram-step--diff">
              <span>Bloque 2 ⊕ [Cifrado A]</span>
              <span>──► [AES(K)] ──►</span>
              <strong>Cifrado B (¡Diferente!)</strong>
            </div>
            <div className="an-diagram-step">
              <span>Bloque 3 ⊕ [Cifrado B]</span>
              <span>──► [AES(K)] ──►</span>
              <span>Cifrado C (¡Diferente!)</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#10d46e', background: 'rgba(16,212,110,0.1)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(16,212,110,0.25)' }}>
            ✓ <strong>Difusión Total:</strong> Aunque "BLOQUE_A" se repita 100 veces, cada bloque cifrado es matemáticamente impredecible y diferente a todos los demás.
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
  const [statsActivePreset, setStatsActivePreset] = useState(null);
  const [statsChartTab, setStatsChartTab] = useState('compare'); // 'compare' | 'plain' | 'cipher'
  const [statsFilterMode, setStatsFilterMode] = useState('active'); // 'active' | 'all'
  const statsResultsRef = useRef(null);

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO SECCIÓN B: EFECTO AVALANCHA (INDIVIDUAL Y POR LOTES)
  // ──────────────────────────────────────────────────────────────────────────
  const [avMode, setAvMode] = useState('single'); // 'single' | 'batch'

  // Avalancha Individual
  const [avText, setAvText] = useState('Criptografia Cryptium 2026');
  const [avKey, setAvKey] = useState('ClaveExperimental2026!');
  const [avByteIndex, setAvByteIndex] = useState(0);
  const [avBitIndex, setAvBitIndex] = useState(0);
  const [avActivePreset, setAvActivePreset] = useState(null);
  const [avCopiedOrig, setAvCopiedOrig] = useState(false);
  const [avCopiedMod, setAvCopiedMod] = useState(false);
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
  const [blocksActivePreset, setBlocksActivePreset] = useState(null);
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
        const localPlain = computeLocalByteStats(statsText);
        setStatsResult({
          source: 'text',
          originalText: statsText,
          originalKey: statsKey,
          encryptedText: data.encryptedText,
          entropy: data.entropy,
          totalBytes: data.totalBytes,
          uniqueBytes: data.uniqueBytes,
          frequency: data.frequency,
          duplicatedBlocksCount: 0,
          plaintext: data.plaintext || localPlain,
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

  // ─── Handlers de Selección de Presets Pedagógicos ─────────────────────────
  const handleSelectSacPreset = (preset) => {
    setAvActivePreset(preset.id);
    setAvText(preset.text);
    setAvKey(preset.key);
    setAvByteIndex(preset.byteIndex ?? 0);
    setAvBitIndex(preset.bitIndex ?? 0);
    setAvStatus(null);
    setAvResult(null);
  };

  const handleSelectBlocksPreset = (preset) => {
    setBlocksActivePreset(preset.id);
    setBlocksText(preset.text);
    setBlocksKey(preset.key);
    setBlocksStatus(null);
    setBlocksResult(null);
  };

  const handleCopyCiphertext = async (text, target) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'orig') {
        setAvCopiedOrig(true);
        setTimeout(() => setAvCopiedOrig(false), 2000);
      } else {
        setAvCopiedMod(true);
        setTimeout(() => setAvCopiedMod(false), 2000);
      }
    } catch {
      setAvStatus({ type: 'error', message: 'No se pudo copiar al portapapeles.' });
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
      const data = await testAvalanche(avText, avKey, avByteIndex, avBitIndex);
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

  // ─── Preparación de Datos: Texto Original (Entrada en Claro) ──────────────
  const plainFreqMap = statsResult?.plaintext?.frequency || {};
  const plainTotal = statsResult?.plaintext?.totalBytes || 0;

  const plainChartDataActive = Object.entries(plainFreqMap)
    .map(([byteValue, count]) => {
      const num = Number(byteValue);
      const sym = formatByteSymbol(num);
      const percentage = plainTotal > 0 ? Number(((count / plainTotal) * 100).toFixed(1)) : 0;
      return {
        byteValue: num,
        label: sym.glyph,
        fullLabel: sym.char,
        hex: sym.hex,
        dec: num,
        count,
        percentage,
        type: 'plain',
      };
    })
    .sort((a, b) => b.count - a.count || a.byteValue - b.byteValue);

  const plainChartDataFull = Array.from({ length: 256 }, (_, i) => {
    const count = plainFreqMap[i] || 0;
    const sym = formatByteSymbol(i);
    const percentage = plainTotal > 0 ? Number(((count / plainTotal) * 100).toFixed(1)) : 0;
    return {
      byteValue: i,
      label: i % 32 === 0 ? `0x${i.toString(16).toUpperCase().padStart(2, '0')}` : '',
      fullLabel: sym.char,
      hex: sym.hex,
      dec: i,
      count,
      percentage,
      type: 'plain',
    };
  });

  // ─── Preparación de Datos: Texto Cifrado (Salida AES-256) ──────────────────
  const cipherFreqMap = statsResult?.frequency || {};
  const cipherTotal = statsResult?.totalBytes || 0;

  const cipherChartDataActive = Object.entries(cipherFreqMap)
    .map(([byteValue, count]) => {
      const num = Number(byteValue);
      const sym = formatByteSymbol(num);
      const percentage = cipherTotal > 0 ? Number(((count / cipherTotal) * 100).toFixed(1)) : 0;
      return {
        byteValue: num,
        label: sym.hex,
        fullLabel: sym.char,
        hex: sym.hex,
        dec: num,
        count,
        percentage,
        type: 'cipher',
      };
    })
    .sort((a, b) => b.count - a.count || a.byteValue - b.byteValue);

  const cipherChartDataFull = Array.from({ length: 256 }, (_, i) => {
    const count = cipherFreqMap[i] || 0;
    const sym = formatByteSymbol(i);
    const percentage = cipherTotal > 0 ? Number(((count / cipherTotal) * 100).toFixed(1)) : 0;
    return {
      byteValue: i,
      label: i % 32 === 0 ? `0x${i.toString(16).toUpperCase().padStart(2, '0')}` : '',
      fullLabel: sym.char,
      hex: sym.hex,
      dec: i,
      count,
      percentage,
      type: 'cipher',
    };
  });

  // Top 5 Símbolos del Texto Original (Picos de Frecuencia Lingüística)
  const topPlainChips = plainChartDataActive.slice(0, 5);

  // Top 5 Bytes del Cifrado (Aplanamiento y Uniformidad)
  const topCipherChips = cipherChartDataActive.slice(0, 5);

  // Interpretación dinámica estructurada según resultados reales
  const dynamicInterp = statsResult?.plaintext
    ? getDynamicInterpretation(statsResult.plaintext, statsResult)
    : null;

  // Datos de compatibilidad para gráfica individual de 256 barras
  const frequencyChartData = statsFilterMode === 'active'
    ? cipherChartDataActive
    : cipherChartDataFull;

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Barra de Presets Demostrativos con Explicación Pedagógica */}
                <div className="an-presets-wrapper">
                  <div className="an-presets-bar">
                    <span className="an-presets-label">
                      <Sparkles size={14} className="text-accent" /> Ejemplos de prueba:
                    </span>
                    {STATS_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`an-preset-pill ${statsActivePreset === p.id ? 'an-preset-pill--active' : ''}`}
                        onClick={() => {
                          setStatsText(p.text);
                          setStatsKey(p.key);
                          setStatsActivePreset(p.id);
                          setStatsResult(null);
                        }}
                      >
                        <span>{p.title}</span>
                        <span className="an-preset-badge">{p.badge}</span>
                      </button>
                    ))}
                  </div>
                  {statsActivePreset && (
                    <div className="an-preset-explanation animate-fade-in">
                      <strong>Propósito didáctico:</strong>{' '}
                      {STATS_PRESETS.find((p) => p.id === statsActivePreset)?.explanation}
                    </div>
                  )}
                </div>

                <div className="an-input-grid">
                  <div className="form-group">
                    <label className="form-label">Texto en claro a cifrar y evaluar:</label>
                    <textarea
                      className="form-input an-textarea"
                      value={statsText}
                      onChange={(e) => {
                        setStatsText(e.target.value);
                        setStatsActivePreset(null);
                      }}
                      placeholder="Introduce el texto a analizar..."
                    />
                    <div className="an-counters">
                      <span>{statsText.length} caracteres</span>
                      <span>{new Blob([statsText]).size} bytes UTF-8</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clave de cifrado simétrico (AES-256):</label>
                    <input
                      type="text"
                      className="form-input"
                      value={statsKey}
                      onChange={(e) => {
                        setStatsKey(e.target.value);
                        setStatsActivePreset(null);
                      }}
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
                        onClick={() => {
                          setStatsText('');
                          setStatsKey('');
                          setStatsActivePreset(null);
                          setStatsResult(null);
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
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

          {/* ════════════ RESULTADOS ESTADÍSTICOS COMPARATIVOS ════════════ */}
          {statsResult && (
            <div ref={statsResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0, width: '100%' }}>

              {/* 1. COMPARATIVA DUAL DE ESTADOS: TEXTO ORIGINAL VS TEXTO CIFRADO */}
              {statsResult.plaintext ? (
                <div className="an-dual-metrics-grid">
                  {/* Tarjeta Estado Original */}
                  <div className="an-state-card an-state-card--plain">
                    <div className="an-state-header">
                      <div className="an-state-title-group">
                        <FileText size={18} style={{ color: '#c084fc' }} />
                        <span className="an-state-title">1. Mensaje Original en Claro</span>
                      </div>
                      <span className="an-state-badge an-state-badge--plain">Entrada</span>
                    </div>

                    <div className="an-state-metrics-row">
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Entropía Shannon</span>
                        <span className="an-mini-metric-val mono" style={{ color: '#c084fc' }}>
                          {statsResult.plaintext.entropy.toFixed(4)}
                        </span>
                        <span className="an-mini-metric-sub">bits / byte</span>
                      </div>
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Total Bytes UTF-8</span>
                        <span className="an-mini-metric-val mono">{statsResult.plaintext.totalBytes}</span>
                        <span className="an-mini-metric-sub">longitud del texto</span>
                      </div>
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Símbolos Únicos</span>
                        <span className="an-mini-metric-val mono">{statsResult.plaintext.uniqueBytes} / 256</span>
                        <span className="an-mini-metric-sub">
                          {Math.round((statsResult.plaintext.uniqueBytes / 256) * 100)}% del espacio
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Estado Cifrado */}
                  <div className="an-state-card an-state-card--cipher">
                    <div className="an-state-header">
                      <div className="an-state-title-group">
                        <Shield size={18} style={{ color: '#00d4ff' }} />
                        <span className="an-state-title">2. Criptograma Cifrado (AES-256-CBC)</span>
                      </div>
                      <span className="an-state-badge an-state-badge--cipher">Salida AES</span>
                    </div>

                    <div className="an-state-metrics-row">
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Entropía Shannon</span>
                        <span className="an-mini-metric-val mono" style={{ color: '#00d4ff' }}>
                          {statsResult.entropy.toFixed(4)}
                        </span>
                        <span className="an-mini-metric-sub">bits / byte (máx 8.0)</span>
                      </div>
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Bytes Cifrados</span>
                        <span className="an-mini-metric-val mono">{statsResult.totalBytes}</span>
                        <span className="an-mini-metric-sub">bloques con padding</span>
                      </div>
                      <div className="an-mini-metric">
                        <span className="an-mini-metric-label">Bytes Únicos</span>
                        <span className="an-mini-metric-val mono">{statsResult.uniqueBytes} / 256</span>
                        <span className="an-mini-metric-sub">
                          {Math.round((statsResult.uniqueBytes / 256) * 100)}% del espacio
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Base64 Aislado (sin texto en claro disponible) */
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
              )}

              {/* 2. INDICADOR COMPARATIVO DE ENTROPÍA (DUAL GAUGE) */}
              {statsResult.plaintext ? (
                <DualEntropyGauge
                  plainEntropy={statsResult.plaintext.entropy}
                  cipherEntropy={statsResult.entropy}
                />
              ) : (
                <EntropyGauge entropy={statsResult.entropy} />
              )}

              {/* 3. HISTOGRAMAS DE FRECUENCIA CON VISTAS COMPARATIVAS */}
              <div className="card" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div className="cr-card-header">
                  <div className="cr-card-title-group">
                    <BarChart2 size={18} className="text-accent" />
                    <div>
                      <h4 className="cr-card-title">Distribución y Frecuencia de Aparición de Bytes</h4>
                      <span className="cr-card-sub">
                        Compara cómo los picos característicos del mensaje en claro se aplanan en una distribución homogénea tras el cifrado.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles de Vista y Filtro */}
                <div className="an-hist-controls-bar">
                  {statsResult.plaintext && (
                    <div className="an-view-tabs">
                      <button
                        type="button"
                        className={`an-view-tab-btn ${statsChartTab === 'compare' ? 'an-view-tab-btn--active' : ''}`}
                        onClick={() => setStatsChartTab('compare')}
                      >
                        <GitCompare size={14} /> Frente a Frente
                      </button>
                      <button
                        type="button"
                        className={`an-view-tab-btn ${statsChartTab === 'plain' ? 'an-view-tab-btn--active' : ''}`}
                        onClick={() => setStatsChartTab('plain')}
                      >
                        <FileText size={14} /> Solo Texto Original
                      </button>
                      <button
                        type="button"
                        className={`an-view-tab-btn ${statsChartTab === 'cipher' ? 'an-view-tab-btn--active' : ''}`}
                        onClick={() => setStatsChartTab('cipher')}
                      >
                        <Shield size={14} /> Solo Cifrado
                      </button>
                    </div>
                  )}

                  <div className="an-filter-switch">
                    <span className="cr-switch-label">Filtrar:</span>
                    <div className="cr-switch-btn-group">
                      <button
                        type="button"
                        className={`cr-switch-btn ${statsFilterMode === 'active' ? 'cr-switch-btn--active' : ''}`}
                        onClick={() => setStatsFilterMode('active')}
                        title="Muestra únicamente los bytes presentes con barras legibles y espaciadas"
                      >
                        Solo Bytes Activos
                      </button>
                      <button
                        type="button"
                        className={`cr-switch-btn ${statsFilterMode === 'all' ? 'cr-switch-btn--active' : ''}`}
                        onClick={() => setStatsFilterMode('all')}
                        title="Muestra el rango completo de 256 bytes (0x00 a 0xFF)"
                      >
                        Espectro Completo (0 a 255)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tiras de Top 5 Bytes Frecuentes */}
                {statsResult.plaintext && (
                  <div style={{ display: 'grid', gridTemplateColumns: statsChartTab === 'compare' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' }}>
                    {(statsChartTab === 'compare' || statsChartTab === 'plain') && (
                      <div className="an-top-bytes-strip">
                        <span className="an-top-bytes-label" style={{ color: '#c084fc' }}>
                          Top Caracteres en Claro:
                        </span>
                        {topPlainChips.map((c) => (
                          <div key={`plain-chip-${c.byteValue}`} className="an-top-byte-chip an-top-byte-chip--plain">
                            <span className="an-top-byte-char">{c.fullLabel}</span>
                            <span className="an-top-byte-count">
                              {c.count} ({c.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(statsChartTab === 'compare' || statsChartTab === 'cipher') && (
                      <div className="an-top-bytes-strip">
                        <span className="an-top-bytes-label" style={{ color: '#00d4ff' }}>
                          Top Bytes Cifrados:
                        </span>
                        {topCipherChips.map((c) => (
                          <div key={`cipher-chip-${c.byteValue}`} className="an-top-byte-chip an-top-byte-chip--cipher">
                            <span className="an-top-byte-char">{c.hex}</span>
                            <span className="an-top-byte-count">
                              {c.count} ({c.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VISTA 1: COMPARATIVA FRENTE A FRENTE (DUAL CARDS) */}
                {statsResult.plaintext && statsChartTab === 'compare' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
                    {/* Gráfica Original */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c084fc' }}>
                          Histograma Original (Sesgo Lingüístico)
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)' }}>
                          {plainChartDataActive.length} símbolos presentes
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 240, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statsFilterMode === 'active' ? plainChartDataActive : plainChartDataFull}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: 'var(--txt-muted)', fontSize: 10 }}
                              interval={statsFilterMode === 'active' ? 0 : 31}
                            />
                            <YAxis tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} />
                            <Tooltip content={<ByteFrequencyTooltip />} />
                            <Bar dataKey="count" fill="#a855f7" radius={[2, 2, 0, 0]}>
                              {(statsFilterMode === 'active' ? plainChartDataActive : plainChartDataFull).map((entry) => (
                                <Cell
                                  key={`plain-cell-${entry.byteValue}`}
                                  fill={entry.count > 0 ? '#a855f7' : 'rgba(255,255,255,0.04)'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gráfica Cifrada */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00d4ff' }}>
                          Histograma Cifrado (Dispersión Homogénea AES)
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)' }}>
                          {cipherChartDataActive.length} bytes presentes
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 240, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statsFilterMode === 'active' ? cipherChartDataActive : cipherChartDataFull}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: 'var(--txt-muted)', fontSize: 10 }}
                              interval={statsFilterMode === 'active' ? (cipherChartDataActive.length > 20 ? 1 : 0) : 31}
                            />
                            <YAxis tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} />
                            <Tooltip content={<ByteFrequencyTooltip />} />
                            <Bar dataKey="count" fill="var(--clr-accent)" radius={[2, 2, 0, 0]}>
                              {(statsFilterMode === 'active' ? cipherChartDataActive : cipherChartDataFull).map((entry) => (
                                <Cell
                                  key={`cipher-cell-${entry.byteValue}`}
                                  fill={entry.count > 0 ? 'var(--clr-accent)' : 'rgba(255,255,255,0.04)'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 2: SOLO TEXTO ORIGINAL (ANCHO COMPLETO) */}
                {statsChartTab === 'plain' && statsResult.plaintext && (
                  <div style={{ width: '100%', height: 280, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsFilterMode === 'active' ? plainChartDataActive : plainChartDataFull}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: 'var(--txt-muted)', fontSize: 11 }}
                          interval={statsFilterMode === 'active' ? 0 : 31}
                        />
                        <YAxis tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} />
                        <Tooltip content={<ByteFrequencyTooltip />} />
                        <Bar dataKey="count" fill="#a855f7" radius={[2, 2, 0, 0]}>
                          {(statsFilterMode === 'active' ? plainChartDataActive : plainChartDataFull).map((entry) => (
                            <Cell
                              key={`p-full-cell-${entry.byteValue}`}
                              fill={entry.count > 0 ? '#a855f7' : 'rgba(255,255,255,0.04)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* VISTA 3: SOLO CIFRADO (ANCHO COMPLETO) O MODO BASE64 */}
                {(statsChartTab === 'cipher' || !statsResult.plaintext) && (
                  <div style={{ width: '100%', height: 280, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsFilterMode === 'active' ? cipherChartDataActive : cipherChartDataFull}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: 'var(--txt-muted)', fontSize: 10 }}
                          interval={statsFilterMode === 'active' ? (cipherChartDataActive.length > 25 ? 1 : 0) : 31}
                        />
                        <YAxis tick={{ fill: 'var(--txt-muted)', fontSize: 10 }} />
                        <Tooltip content={<ByteFrequencyTooltip />} />
                        <Bar dataKey="count" fill="var(--clr-accent)" radius={[2, 2, 0, 0]}>
                          {(statsFilterMode === 'active' ? cipherChartDataActive : cipherChartDataFull).map((entry) => (
                            <Cell
                              key={`c-full-cell-${entry.byteValue}`}
                              fill={entry.count > 0 ? 'var(--clr-accent)' : 'rgba(255,255,255,0.04)'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* 4. CRIPTOGRAMA EVALUADO (BASE64) */}
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

              {/* 5. INTERPRETACIÓN DINÁMICA DE RESULTADOS (3 PREGUNTAS CLAVE) */}
              <div className="an-interp-container">
                <div className="an-interp-header">
                  <HelpCircle size={20} className="text-accent" />
                  <span className="an-interp-title">Interpretación Pedagógica del Análisis Estadístico</span>
                </div>

                <div className="an-interp-grid">
                  {/* Pregunta 1 */}
                  <div className="an-interp-card">
                    <div className="an-interp-card-q">
                      <Eye size={16} /> 1. ¿Qué estás viendo?
                    </div>
                    <div className="an-interp-card-ans">
                      {dynamicInterp
                        ? dynamicInterp.whatSeeing
                        : `El criptograma analizado de ${statsResult.totalBytes} bytes exhibe una entropía de ${statsResult.entropy.toFixed(4)} bits/byte distribuida en ${statsResult.uniqueBytes} valores de byte únicos.`}
                    </div>
                  </div>

                  {/* Pregunta 2 */}
                  <div className="an-interp-card">
                    <div className="an-interp-card-q">
                      <Zap size={16} /> 2. ¿Por qué ocurre?
                    </div>
                    <div className="an-interp-card-ans">
                      {dynamicInterp
                        ? dynamicInterp.whyOccurs
                        : 'El algoritmo AES utiliza operaciones iterativas de sustitución (Cajas-S) y mezcla lineal (MixColumns) para disolver cualquier correlación entre las entradas y las salidas, aplanando las frecuencias estadísticas.'}
                    </div>
                  </div>

                  {/* Pregunta 3 */}
                  <div className="an-interp-card">
                    <div className="an-interp-card-q">
                      <ShieldCheck size={16} /> 3. ¿Qué debes tener en cuenta?
                    </div>
                    <div className="an-interp-card-ans">
                      <ul>
                        <li>Una distribución plana de frecuencias dificulta los ataques clásicos por análisis de frecuencias (como los usados contra César o Vigenère).</li>
                        <li>Las métricas estadísticas no miden la fortaleza de la clave elegida ni previenen ataques de fuerza bruta si la contraseña es débil.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 6. AVISO DE SEGURIDAD OBLIGATORIO DESTACADO */}
                <div className="an-security-disclaimer">
                  <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Aclaración Criptográfica Esencial:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      &laquo;Una entropía alta indica una distribución más uniforme de los datos, pero no garantiza por sí sola que un cifrado sea seguro.&raquo;
                      <br />
                      Archivos comprimidos (como ZIP o JPEG) o algoritmos rotos también pueden exhibir alta entropía superficial sin ofrecer verdadera protección confidencial.
                    </p>
                  </div>
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
          {/* 1. INTRODUCCIÓN DIDÁCTICA AL EFECTO AVALANCHA */}
          <div className="card" style={{ padding: '22px 24px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Zap size={20} style={{ color: '#00d4ff' }} />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#fff' }}>
                ¿Qué es el Efecto Avalancha y por qué el 50% es el objetivo ideal?
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: '1.55' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: 'var(--clr-accent)', display: 'block', marginBottom: '4px' }}>
                  1. El Bit como Interruptor
                </strong>
                En computación digital, un bit es la unidad mínima de información. Solo puede estar en dos estados: <code>0</code> (apagado) o <code>1</code> (encendido). Cada carácter de texto se compone de 8 de estos bits.
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: '#c084fc', display: 'block', marginBottom: '4px' }}>
                  2. La Avalancha (Difusión)
                </strong>
                El Criterio Estricto de Avalancha (SAC) establece que si alteras un <strong>único bit</strong> en el mensaje o en la clave, aproximadamente la mitad de los bits del texto cifrado deben cambiar en cascada.
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: '#10d46e', display: 'block', marginBottom: '4px' }}>
                  3. ¿Por qué 50% y no 100%?
                </strong>
                Equivale a lanzar una moneda al aire por cada bit. Si cambiara siempre el 100% o el 0%, habría un patrón predecible invertible. El 50% garantiza que no existe ninguna correlación explotable para un atacante.
              </div>
            </div>
          </div>

          {/* 2. BARRA DE PRESETS PEDAGÓGICOS DEL SAC */}
          <div className="cr-presets-bar">
            <span className="cr-preset-tag">
              <Sparkles size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Casos de prueba guiados:
            </span>
            {SAC_PRESETS.map((p) => {
              const isActive = avActivePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cr-preset-btn ${isActive ? 'cr-preset-btn--active' : ''}`}
                  onClick={() => handleSelectSacPreset(p)}
                  title={p.subtitle}
                >
                  <span style={{ fontWeight: 700 }}>{p.title}</span>
                  <span className="badge badge-accent mono" style={{ fontSize: '0.66rem' }}>
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner Explicativo del Preset Activo */}
          {avActivePreset && (
            <div className="an-preset-explanation animate-fade-in">
              <strong>Objetivo del Caso:</strong>{' '}
              {SAC_PRESETS.find((p) => p.id === avActivePreset)?.explanation}
            </div>
          )}

          {/* 3. TARJETA DE ENTRADA Y CONTROLES */}
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#00d4ff' }} />
                <span>Laboratorio Experimental de Avalancha (SAC)</span>
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
                      onChange={(e) => {
                        setAvText(e.target.value);
                        setAvActivePreset(null);
                      }}
                      placeholder="Escribe el mensaje a evaluar..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clave experimental:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={avKey}
                      onChange={(e) => {
                        setAvKey(e.target.value);
                        setAvActivePreset(null);
                      }}
                      placeholder="Clave de 256 bits..."
                    />
                  </div>
                </div>

                {/* Selector Interactivo de Byte y Bit */}
                <BitInputInspectCard
                  text={avText}
                  byteIndex={avByteIndex}
                  bitIndex={avBitIndex}
                  onByteChange={(idx) => setAvByteIndex(idx)}
                  onBitChange={(b) => setAvBitIndex(b)}
                />

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRunAvalancheSingle}
                    disabled={avLoading}
                  >
                    {avLoading ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
                    Ejecutar Prueba de Avalancha (Invertir Bit {avBitIndex})
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setAvText('Criptografia Cryptium 2026');
                      setAvKey('ClaveExperimental2026!');
                      setAvByteIndex(0);
                      setAvBitIndex(0);
                      setAvActivePreset(null);
                      setAvResult(null);
                      setAvStatus(null);
                    }}
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
                      <option value={5}>5 muestras (Rápido)</option>
                      <option value={10}>10 muestras (Estándar)</option>
                      <option value={20}>20 muestras (Detallado)</option>
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

          {/* 4. RESULTADOS: AVALANCHA INDIVIDUAL */}
          {avResult && avMode === 'single' && (
            <div ref={avResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              {/* Velocímetro Semicircular de Avalancha */}
              <AvalancheGauge
                percentage={avResult.avalanchePercentage}
                differentBits={avResult.differentBits}
                totalBits={avResult.totalBits}
              />

              {/* Matriz Matricial Visual de Bits (C vs C') */}
              <BitMatrixVisualizer
                originalBase64={avResult.originalCiphertextBase64}
                modifiedBase64={avResult.modifiedCiphertextBase64}
                differentBits={avResult.differentBits}
                totalBits={avResult.totalBits}
                percentage={avResult.avalanchePercentage}
              />

              {/* Comparación Visual del Bit Modificado e Inspección Criptográfica */}
              <div className="card">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={16} className="text-accent" />
                  Inspección Criptográfica de Salida (C vs C')
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Criptograma Original */}
                  <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>
                        Criptograma Original (C)
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                        onClick={() => handleCopyCiphertext(avResult.originalCiphertextBase64, 'orig')}
                      >
                        {avCopiedOrig ? <Check size={12} style={{ color: '#10d46e' }} /> : <Copy size={12} />}
                        {avCopiedOrig ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--clr-accent)', lineHeight: '1.4' }}>
                      {avResult.originalCiphertextBase64 || 'N/A'}
                    </div>
                  </div>

                  {/* Criptograma Modificado */}
                  <div style={{ padding: '14px', background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#f43f5e', textTransform: 'uppercase' }}>
                        Criptograma Modificado (C')
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                        onClick={() => handleCopyCiphertext(avResult.modifiedCiphertextBase64, 'mod')}
                      >
                        {avCopiedMod ? <Check size={12} style={{ color: '#10d46e' }} /> : <Copy size={12} />}
                        {avCopiedMod ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: '#f43f5e', lineHeight: '1.4' }}>
                      {avResult.modifiedCiphertextBase64 || 'N/A'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                  Detalle del bit invertido: <strong>{avResult.flippedBitInfo}</strong> · Mismo Vector de Inicialización (IV) de 128 bits utilizado en ambas pruebas:{' '}
                  <code className="mono">0x{avResult.ivHex}</code>
                </div>
              </div>

              {/* Interpretación Dinámica en 3 Preguntas para Avalancha */}
              <div className="an-interp-grid">
                {/* Pregunta 1 */}
                <div className="an-interp-card">
                  <div className="an-interp-card-q">
                    <Eye size={16} /> 1. ¿Qué estás viendo?
                  </div>
                  <div className="an-interp-card-ans">
                    Se evaluaron <strong>{avResult.totalBits} bits</strong> en total. Al alterar exactamente <strong>1 bit</strong> en la entrada ({avResult.flippedBitInfo}), cambiaron <strong>{avResult.differentBits} bits</strong> en el criptograma, logrando una difusión del <strong>{avResult.avalanchePercentage.toFixed(2)}%</strong> (con una diferencia de apenas Δ {Math.abs(avResult.avalanchePercentage - 50).toFixed(2)}% respecto al 50% ideal).
                  </div>
                </div>

                {/* Pregunta 2 */}
                <div className="an-interp-card">
                  <div className="an-interp-card-q">
                    <Zap size={16} /> 2. ¿Por qué ocurre?
                  </div>
                  <div className="an-interp-card-ans">
                    El diseño por capas de AES (Sustitución mediante Cajas-S, Permutación ShiftRows y Mezcla Lineal MixColumns) actúa como un multiplicador de cascada. En cada ronda de cifrado, la alteración de 1 bit contamina todos los bytes de la columna, dispersándose exponencialmente por toda la matriz de 128 bits.
                  </div>
                </div>

                {/* Pregunta 3 */}
                <div className="an-interp-card">
                  <div className="an-interp-card-q">
                    <ShieldCheck size={16} /> 3. ¿Qué debes tener en cuenta?
                  </div>
                  <div className="an-interp-card-ans">
                    <ul>
                      <li>Si el efecto avalancha fuera muy bajo (por ejemplo &lt; 20%), un atacante podría deducir la clave probando bits uno a uno mediante criptoanálisis diferencial.</li>
                      <li>Una difusión cercana al 50% garantiza que la salida se comporta como un generador de ruido seudoaleatorio perfecto sin correlación detectable.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. RESULTADOS: AVALANCHA POR LOTES (MULTIMUESTRA) */}
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

              {/* Explicación didáctica de por qué se evalúa por lotes */}
              <div className="an-preset-explanation">
                <strong>¿Por qué evaluar múltiples muestras y medir la desviación estándar (σ)?</strong> Una sola prueba puede arrojar 47% o 54% debido a pequeñas fluctuaciones probabilísticas normales. Sin embargo, evaluar múltiples bits distintos permite comprobar que la media de difusión converge de forma consistente hacia el 50% con una dispersión reducida (σ &lt; 5%), descartando sesgos ocultos.
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
          {/* 1. INTRODUCCIÓN DIDÁCTICA A LOS MODOS DE BLOQUE */}
          <div className="card" style={{ padding: '22px 24px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Layers size={20} className="text-accent" />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#fff' }}>
                ¿Cómo procesa AES los datos en bloques y qué peligro tiene el modo ECB?
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: '1.55' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: 'var(--clr-accent)', display: 'block', marginBottom: '4px' }}>
                  1. Bloques Fijos de 16 Bytes
                </strong>
                AES divide los mensajes en paquetes cerrados de exactamente 16 bytes (128 bits). Si un mensaje no es múltiplo de 16, se le añade un relleno normalizado (PKCS7).
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.3)' }}>
                <strong style={{ color: '#f43f5e', display: 'block', marginBottom: '4px' }}>
                  2. Modo ECB (Sin Memoria)
                </strong>
                Cifra cada bloque por separado. Si dos bloques tienen exactamente el mismo texto, sus salidas cifradas serán <strong>100% idénticas</strong>, revelando la estructura interna (como la silueta del pingüino Tux).
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(16,212,110,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,212,110,0.3)' }}>
                <strong style={{ color: '#10d46e', display: 'block', marginBottom: '4px' }}>
                  3. Modo CBC (Con Encadenamiento)
                </strong>
                Combina cada bloque con el resultado del anterior mediante XOR y utiliza un Vector de Inicialización (IV) impredecible. Aunque haya bloques repetidos, cada criptograma es completamente único.
              </div>
            </div>
          </div>

          {/* 2. BARRA DE PRESETS PEDAGÓGICOS DE MODOS DE BLOQUE */}
          <div className="cr-presets-bar">
            <span className="cr-preset-tag">
              <Sparkles size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> Patrones de prueba estructurados:
            </span>
            {BLOCK_PRESETS.map((p) => {
              const isActive = blocksActivePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cr-preset-btn ${isActive ? 'cr-preset-btn--active' : ''}`}
                  onClick={() => handleSelectBlocksPreset(p)}
                  title={p.subtitle}
                >
                  <span style={{ fontWeight: 700 }}>{p.title}</span>
                  <span className="badge badge-accent mono" style={{ fontSize: '0.66rem' }}>
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner Explicativo del Preset Activo */}
          {blocksActivePreset && (
            <div className="an-preset-explanation animate-fade-in">
              <strong>Objetivo del Caso:</strong>{' '}
              {BLOCK_PRESETS.find((p) => p.id === blocksActivePreset)?.explanation}
            </div>
          )}

          {/* 3. ENTRADA Y CONTROLES */}
          <div className="card an-input-card">
            <div className="an-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} className="text-accent" />
                <span>Propagación de Patrones Estructurales: Modo ECB vs Modo CBC</span>
              </div>
              <span className="badge badge-rose">Demostración Experimental</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Texto estructurado de prueba (Múltiplos de 16 bytes):</label>
                <input
                  type="text"
                  className="form-input"
                  value={blocksText}
                  onChange={(e) => {
                    setBlocksText(e.target.value);
                    setBlocksActivePreset(null);
                  }}
                  placeholder="Texto repetitivo o estructurado..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clave experimental:</label>
                <input
                  type="text"
                  className="form-input"
                  value={blocksKey}
                  onChange={(e) => {
                    setBlocksKey(e.target.value);
                    setBlocksActivePreset(null);
                  }}
                  placeholder="Clave para ambos modos..."
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

          {/* 4. RESULTADOS DE MODOS DE BLOQUE */}
          {blocksResult && (
            <div ref={blocksResultsRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
              {/* Diagrama Didáctico Comparativo */}
              <BlockOperationDiagram />

              {/* Métricas Resumen */}
              {(() => {
                const plainDupes = blocksResult.plaintextDuplicatesCount ?? blocksResult.duplicatedPlainBlocksCount ?? 0;
                const ecbDupes = blocksResult.ecbDuplicateBlockCount ?? blocksResult.duplicatedEcbBlocksCount ?? 0;
                const cbcDupes = blocksResult.cbcDuplicateBlockCount ?? blocksResult.duplicatedCbcBlocksCount ?? 0;

                return (
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
                      value={plainDupes}
                      description="Bloques con texto idéntico en la entrada"
                      highlight={plainDupes > 0}
                    />
                    <MetricCard
                      icon={<AlertTriangle size={18} style={{ color: '#f43f5e' }} />}
                      label="Repeticiones en ECB"
                      value={ecbDupes}
                      description={
                        ecbDupes > 0
                          ? '¡Fuga de patrones! Bloques idénticos producen criptogramas idénticos'
                          : 'Sin duplicados detectados'
                      }
                      highlight={ecbDupes > 0}
                      badge={
                        ecbDupes > 0
                          ? { text: 'Inseguro (ECB)', className: 'badge-rose' }
                          : { text: 'Sin patrones', className: 'badge-muted' }
                      }
                    />
                    <MetricCard
                      icon={<ShieldCheck size={18} style={{ color: '#10d46e' }} />}
                      label="Repeticiones en CBC"
                      value={cbcDupes}
                      description="Cero repeticiones gracias al encadenamiento con IV"
                      highlight={cbcDupes === 0}
                      badge={{ text: 'Seguro (CBC)', className: 'badge-green' }}
                    />
                  </div>
                );
              })()}

              {/* Matriz Visual Comparativa de Bloques */}
              <div className="card" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div className="cr-card-header">
                  <div className="cr-card-title-group">
                    <Layers size={18} className="text-accent" />
                    <div>
                      <h4 className="cr-card-title">Matriz Comparativa de Bloques (ECB vs CBC)</h4>
                      <span className="cr-card-sub">
                        Observa cómo ECB preserva repeticiones mientras CBC las aleatoriza completamente con el IV{' '}
                        <code className="mono">0x{blocksResult.cbcIvHex}</code>.
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div className="cr-block-matrix" style={{ minWidth: '720px' }}>
                    {blocksResult.blocks.map((b) => {
                      const isPlainDupe = b.isPlaintextDuplicate ?? b.isPlainDuplicate;
                      const isEcbDupe = b.isEcbDuplicate;
                      const isCbcDupe = b.isCbcDuplicate;
                      const plainTextContent = b.plaintextAscii || b.plainText || '';

                      return (
                        <div key={b.index} className="cr-block-row">
                          <div className="cr-block-idx">
                            <span>Bloque</span>
                            <span className="mono" style={{ fontSize: '1rem', color: '#fff' }}>#{b.index}</span>
                            {b.plaintextDuplicateGroup && (
                              <span className={`an-block-group-pill ${isPlainDupe ? 'an-block-group-pill--dupe' : ''}`}>
                                G{b.plaintextDuplicateGroup}
                              </span>
                            )}
                          </div>

                          <div className={`cr-block-cell ${isPlainDupe ? 'cr-cell--dupe-plain' : ''}`}>
                            <span className="cr-cell-label">Texto Plano (16 bytes)</span>
                            <span className="cr-cell-val mono">"{plainTextContent}"</span>
                            {b.plaintextHex && (
                              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--txt-muted)' }}>
                                Hex: {b.plaintextHex}
                              </span>
                            )}
                            {isPlainDupe && (
                              <span className="cr-dupe-tag" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--clr-accent)' }}>
                                ★ Bloque de Entrada Repetido
                              </span>
                            )}
                          </div>

                          <div className={`cr-block-cell ${isEcbDupe ? 'cr-cell--dupe-ecb' : ''}`}>
                            <span className="cr-cell-label">Modo ECB (Cifrado Independiente)</span>
                            <span className="cr-cell-val mono">{b.ecbCipherHex}</span>
                            {isEcbDupe ? (
                              <span className="cr-dupe-tag cr-dupe-tag--bad">
                                ⚠ Criptograma ECB Idéntico (Fuga)
                              </span>
                            ) : (
                              <span className="cr-cell-sub">Único</span>
                            )}
                          </div>

                          <div className={`cr-block-cell ${isCbcDupe ? 'cr-cell--dupe-ecb' : 'cr-cell--ok-cbc'}`}>
                            <span className="cr-cell-label">Modo CBC (Encadenamiento con IV)</span>
                            <span className="cr-cell-val mono">{b.cbcCipherHex}</span>
                            <span className="cr-dupe-tag cr-dupe-tag--ok">
                              ✓ Difusión Completa (Diferente)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interpretación Didáctica en 3 Preguntas para Modos de Bloque */}
              {(() => {
                const plainDupes = blocksResult.plaintextDuplicatesCount ?? blocksResult.duplicatedPlainBlocksCount ?? 0;
                const ecbDupes = blocksResult.ecbDuplicateBlockCount ?? blocksResult.duplicatedEcbBlocksCount ?? 0;

                return (
                  <div className="an-interp-grid">
                    {/* Pregunta 1 */}
                    <div className="an-interp-card">
                      <div className="an-interp-card-q">
                        <Eye size={16} /> 1. ¿Qué estás viendo?
                      </div>
                      <div className="an-interp-card-ans">
                        De los <strong>{blocksResult.totalBlocks} bloques</strong> analizados, se encontraron <strong>{plainDupes} bloques repetidos</strong> en el texto original. En modo ECB, se generaron <strong>{ecbDupes} bloques cifrados idénticos</strong>, replicando la estructura del mensaje. En cambio, en modo CBC se obtuvieron <strong>0 repeticiones</strong>.
                      </div>
                    </div>

                    {/* Pregunta 2 */}
                    <div className="an-interp-card">
                      <div className="an-interp-card-q">
                        <Zap size={16} /> 2. ¿Por qué ocurre?
                      </div>
                      <div className="an-interp-card-ans">
                        El modo ECB es estrictamente determinista: <code>Cᵢ = AES(Pᵢ)</code>. Sin vector de inicialización ni memoria, el mismo bloque en claro siempre produce el mismo bloque cifrado. En modo CBC, cada bloque se combina mediante XOR con el bloque cifrado anterior (<code>Cᵢ = AES(Pᵢ ⊕ Cᵢ₋₁)</code>), lo que propaga una mutación continua que rompe cualquier repetición.
                      </div>
                    </div>

                    {/* Pregunta 3 */}
                    <div className="an-interp-card">
                      <div className="an-interp-card-q">
                        <ShieldCheck size={16} /> 3. ¿Qué debes tener en cuenta?
                      </div>
                      <div className="an-interp-card-ans">
                        <ul>
                          <li>El modo ECB está prohibido en criptografía aplicada moderna porque filtra patrones y permite ataques de reemplazo o reordenamiento de bloques.</li>
                          <li>El modo CBC proporciona confidencialidad sólida si se usa con un IV impredecible, y en aplicaciones modernas se combina con autenticación (o se sustituye por AES-GCM).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Advertencia Técnica de Seguridad Cryptium */}
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
