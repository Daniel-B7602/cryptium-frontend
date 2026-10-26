import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchCode,
  Shield,
  Key,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Fingerprint,
  Layers,
  HelpCircle,
  FileText,
  BarChart2,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import {
  caesarShift,
  bruteForceCaesar,
  calculateFrequencies,
  generateAESGCMKey,
  encryptAESGCM,
  compareBytesDifference,
} from '../utils/cryptanalysisUtils';
import './Learning.css';
import './LearningCryptanalysis.css';

// Textos de ejemplo predefinidos
const EXAMPLES_CAESAR = {
  es: 'Krod pxqgr, od folswrjudild hvd hyroxflrqdqgr.', // Shift 3 de "Hola mundo, la criptografia esa evolucionando."
  en: 'Wklv phvvdjh lv frqilghqwldo dqg vhfuhw.',       // Shift 3 de "This message is confidential and secret."
};

const SAMPLE_TEXT_FREQ = {
  es: 'La criptografía es la disciplina que se ocupa de las técnicas de cifrado o codificado destinadas a alterar las representaciones lingüísticas de ciertos mensajes con el fin de hacerlos ininteligibles a receptores no autorizados.',
  en: 'Cryptanalysis is the study of analyzing information systems in order to study the hidden aspects of the systems. It is used to breach cryptographic security systems and gain access to the contents of encrypted messages.',
};

export default function LearningCryptanalysis() {
  const navigate = useNavigate();

  // Navegación rápida por secciones
  const [activeSection, setActiveSection] = useState('bf-caesar');

  // Idioma de trabajo en los laboratorios
  const [lang, setLang] = useState('es'); // 'es' | 'en'

  // ─── Estado del Experimento A: Fuerza Bruta César ──────────────────
  const [caesarInput, setCaesarInput] = useState(EXAMPLES_CAESAR.es);
  const [bruteForceResults, setBruteForceResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [bfExecuted, setBfExecuted] = useState(false);

  // ─── Estado del Experimento B: Frecuencias ─────────────────────────
  const [freqInput, setFreqInput] = useState(SAMPLE_TEXT_FREQ.es);

  // ─── Estado del Experimento C: Sensibilidad y Difusión ─────────────
  const [diffTextA, setDiffTextA] = useState('Transferir 100 USD a Alice.');
  const [diffTextB, setDiffTextB] = useState('Transferir 900 USD a Alice.');
  const [caesarShiftKey, setCaesarShiftKey] = useState(5);
  const [aesKey, setAesKey] = useState(null);
  const [aesIvMode, setAesIvMode] = useState('controlled'); // 'controlled' (mismo IV) | 'random' (IV aleatorio)
  const [aesResults, setAesResults] = useState(null);
  const [aesLoading, setAesLoading] = useState(false);

  // ─── Estado del Desafío Final ─────────────────────────────────────
  const challengeCipher = 'Krod phqvdmh vhfuhwr gh folswlxp'; // César shift 3 de "Hola mensaje secreto de cryptium"
  const [challengeShiftSelected, setChallengeShiftSelected] = useState(null);
  const [challengeQuestionAnswer, setChallengeQuestionAnswer] = useState(null); // 'A' | 'B' | 'C'

  // ─── Milestones de Progreso ────────────────────────────────────────
  const [milestones, setMilestones] = useState({
    reviewedModels: true,
    executedBruteForce: false,
    analyzedFrequencies: false,
    testedDiffusion: false,
    completedChallenge: false,
  });

  const progressPercent = useMemo(() => {
    let count = 0;
    if (milestones.reviewedModels) count += 20;
    if (milestones.executedBruteForce) count += 20;
    if (milestones.analyzedFrequencies) count += 20;
    if (milestones.testedDiffusion) count += 20;
    if (milestones.completedChallenge) count += 20;
    return count;
  }, [milestones]);

  // Generación inicial de clave AES-GCM
  useEffect(() => {
    let isMounted = true;
    async function initKey() {
      try {
        const k = await generateAESGCMKey();
        if (isMounted) setAesKey(k);
      } catch (e) {
        // Ignorar si Web Crypto no está disponible
      }
    }
    initKey();
    return () => { isMounted = false; };
  }, []);

  // ─── Acciones Experimento A: Fuerza Bruta ──────────────────────────
  const handleRunBruteForce = () => {
    if (!caesarInput.trim()) return;
    const results = bruteForceCaesar(caesarInput, lang);
    setBruteForceResults(results);
    setBfExecuted(true);
    const best = results.find((r) => r.isBest) || results[0];
    setSelectedCandidate(best);
    setMilestones((prev) => ({ ...prev, executedBruteForce: true }));
  };

  const handleLoadCaesarExample = () => {
    const ex = EXAMPLES_CAESAR[lang];
    setCaesarInput(ex);
    setBruteForceResults([]);
    setSelectedCandidate(null);
    setBfExecuted(false);
  };

  // ─── Cálculo Experimento B: Frecuencias ────────────────────────────
  const frequencyAnalysis = useMemo(() => {
    return calculateFrequencies(freqInput, lang);
  }, [freqInput, lang]);

  useEffect(() => {
    if (freqInput.trim().length > 10) {
      setMilestones((prev) => ({ ...prev, analyzedFrequencies: true }));
    }
  }, [freqInput]);

  // ─── Acciones Experimento C: Sensibilidad y Difusión ───────────────
  // 1. Difusión César
  const caesarCipherA = useMemo(() => caesarShift(diffTextA, caesarShiftKey), [diffTextA, caesarShiftKey]);
  const caesarCipherB = useMemo(() => caesarShift(diffTextB, caesarShiftKey), [diffTextB, caesarShiftKey]);
  const caesarDiffCount = useMemo(() => {
    let diff = 0;
    const maxLen = Math.max(caesarCipherA.length, caesarCipherB.length);
    for (let i = 0; i < maxLen; i++) {
      if (caesarCipherA[i] !== caesarCipherB[i]) diff++;
    }
    return {
      diff,
      maxLen,
      pct: maxLen > 0 ? Number(((diff / maxLen) * 100).toFixed(2)) : 0,
    };
  }, [caesarCipherA, caesarCipherB]);

  // 2. Difusión AES-GCM
  const handleRunAESDiffusion = async () => {
    if (!aesKey) return;
    setAesLoading(true);
    try {
      let ivA, ivB;
      if (aesIvMode === 'controlled') {
        // Mismo IV de 96 bits exclusivamente para la demostración pedagógica controlada
        ivA = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        ivB = ivA;
      } else {
        // IVs aleatorios seguros independientes
        ivA = window.crypto.getRandomValues(new Uint8Array(12));
        ivB = window.crypto.getRandomValues(new Uint8Array(12));
      }

      const [resA, resB] = await Promise.all([
        encryptAESGCM(diffTextA, aesKey, ivA),
        encryptAESGCM(diffTextB, aesKey, ivB),
      ]);

      const byteComp = compareBytesDifference(resA.fullBytes, resB.fullBytes);

      setAesResults({
        resA,
        resB,
        ivHexA: Array.from(ivA).map((b) => b.toString(16).padStart(2, '0')).join(''),
        ivHexB: Array.from(ivB).map((b) => b.toString(16).padStart(2, '0')).join(''),
        byteComp,
      });

      setMilestones((prev) => ({ ...prev, testedDiffusion: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setAesLoading(false);
    }
  };

  useEffect(() => {
    if (aesKey) {
      handleRunAESDiffusion();
    }
  }, [diffTextA, diffTextB, aesKey, aesIvMode]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Breadcrumb ── */}
      <button className="btn btn-ghost lm-back-link" onClick={() => navigate('/aprendizaje')}>
        <ArrowLeft size={16} /> Volver al catálogo de módulos
      </button>

      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderColor: '#a855f7' }}>
            Módulo 6
          </div>
          <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>· Evaluación y Seguridad</span>
        </div>
        <h1 style={{ marginTop: '8px' }}>Criptoanálisis</h1>
        <p>
          Explora los modelos formales de ataque, el ataque por fuerza bruta contra espacios de claves pequeños,
          el análisis estadístico de frecuencias y la comparación de difusión entre cifrados clásicos y modernos.
        </p>
      </div>

      {/* ── Tarjeta de Progreso ── */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title-wrap">
            <Sparkles size={18} style={{ color: '#c084fc' }} />
            <h3>Progreso del Módulo</h3>
          </div>
          <div className="progress-percentage">{progressPercent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #a855f7, #00d4ff)' }} />
        </div>
        <div className="progress-milestones">
          <span className={`milestone-chip ${milestones.reviewedModels ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 1. Modelos de ataque
          </span>
          <span className={`milestone-chip ${milestones.executedBruteForce ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 2. Fuerza bruta a César
          </span>
          <span className={`milestone-chip ${milestones.analyzedFrequencies ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 3. Análisis de frecuencias
          </span>
          <span className={`milestone-chip ${milestones.testedDiffusion ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 4. Difusión y sensibilidad
          </span>
          <span className={`milestone-chip ${milestones.completedChallenge ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 5. Desafío final
          </span>
        </div>
      </div>

      {/* ── Navegación rápida entre secciones ── */}
      <div className="lca-nav-pills">
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--txt-muted)', marginRight: '6px' }}>
          SECCIONES:
        </span>
        <button
          className={`lca-nav-btn ${activeSection === 'sec-intro' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-intro')}
        >
          <SearchCode size={14} /> Introducción
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'sec-modelos' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-modelos')}
        >
          <Layers size={14} /> Modelos de Ataque
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'bf-caesar' ? 'active' : ''}`}
          onClick={() => scrollToSection('bf-caesar')}
        >
          <RotateCcw size={14} /> Fuerza Bruta César
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'sec-freq' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-freq')}
        >
          <BarChart2 size={14} /> Análisis de Frecuencias
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'sec-difusion' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-difusion')}
        >
          <Zap size={14} /> Difusión (César vs AES)
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'sec-limites' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-limites')}
        >
          <Shield size={14} /> Límites de Ataque
        </button>
        <button
          className={`lca-nav-btn ${activeSection === 'reto' ? 'active' : ''}`}
          onClick={() => scrollToSection('reto')}
        >
          <Sparkles size={14} /> Desafío Final
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 1 — Introducción al Criptoanálisis
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-intro">
        <div className="lm-section-head">
          <span className="lm-section-num">1</span>
          <h2>¿Qué es el Criptoanálisis y cuál es su Objetivo?</h2>
        </div>

        <div className="alert alert-info">
          <SearchCode size={20} />
          <span>
            El <strong>criptoanálisis</strong> es la ciencia y el arte de evaluar, analizar y romper sistemas criptográficos
            estudiando sus propiedades matemáticas, estadísticas e implementaciones de código, con el fin de hallar debilidades
            sin conocer la clave secreta previamente.
          </span>
        </div>

        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon purple">
              <Shield size={18} />
            </div>
            <h4>El Principio de Kerckhoffs</h4>
            <p>
              La seguridad de un sistema debe residir <strong>únicamente en el secreto de la clave</strong>, no en mantener
              oculto el algoritmo. Un buen diseño criptográfico es público y resiste el escrutinio de la comunidad global.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon cyan">
              <Zap size={18} />
            </div>
            <h4>Auditoría y Mejora Continua</h4>
            <p>
              El criptoanálisis constructivo permite a los investigadores descubrir vulnerabilidades teóricas antes de que
              un adversario las explote, impulsando estándares más robustos como AES o SHA-3.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon green">
              <Fingerprint size={18} />
            </div>
            <h4>De lo Teórico a lo Práctico</h4>
            <p>
              Mientras que los algoritmos antiguos caen ante análisis de frecuencias o fuerza bruta inmediata, los algoritmos
              modernos suelen atacarse mediante fallos de implementación (canales laterales, oráculos de relleno o reutilización de nonces).
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 2 — Modelos de Ataque
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-modelos">
        <div className="lm-section-head">
          <span className="lm-section-num">2</span>
          <h2>Modelos Clásicos de Ataque Criptográfico</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          En criptografía formal, los ataques se clasifican según el nivel de acceso y control que tiene el adversario
          sobre el sistema. A mayor capacidad de elegir entradas o salidas, más poderoso es el modelo:
        </p>

        <div className="lca-models-grid">
          <div className="lca-model-card">
            <div className="lca-model-header">
              <div className="lca-model-title">
                <FileText size={16} style={{ color: 'var(--clr-accent)' }} /> 1. Ciphertext-Only (COA)
              </div>
              <span className="badge badge-muted">Texto Cifrado</span>
            </div>
            <div className="lca-model-field">
              <strong>Información que posee:</strong> Uno o varios textos cifrados interceptados.
            </div>
            <div className="lca-model-field">
              <strong>Control del atacante:</strong> Pasivo (no puede elegir mensajes ni claves).
            </div>
            <div className="lca-model-field">
              <strong>Debilidad aprovechada:</strong> Redundancia estadística del lenguaje y frecuencias.
            </div>
            <div className="lca-model-field">
              <strong>Ejemplo educativo:</strong> Análisis de frecuencia contra sustitución monoalfabética.
            </div>
            <div className="lca-model-field">
              <strong>Limitación:</strong> El escenario más difícil para el atacante si el cifrado es moderno.
            </div>
          </div>

          <div className="lca-model-card">
            <div className="lca-model-header">
              <div className="lca-model-title">
                <FileText size={16} style={{ color: '#10d46e' }} /> 2. Known-Plaintext (KPA)
              </div>
              <span className="badge badge-accent">Texto Plano Conocido</span>
            </div>
            <div className="lca-model-field">
              <strong>Información que posee:</strong> Pares de (texto plano, texto cifrado) con la misma clave.
            </div>
            <div className="lca-model-field">
              <strong>Control del atacante:</strong> Pasivo pero con muestras conocidas (e.g. cabeceras fijas de archivos como PDF o PNG).
            </div>
            <div className="lca-model-field">
              <strong>Debilidad aprovechada:</strong> Deducir la clave matemática mediante álgebra o correlación.
            </div>
            <div className="lca-model-field">
              <strong>Ejemplo educativo:</strong> Conocer que un mensaje empieza por «Estimado señor:» y deducir la clave César.
            </div>
            <div className="lca-model-field">
              <strong>Limitación:</strong> Algoritmos como AES resisten KPA incluso con petabytes de pares conocidos.
            </div>
          </div>

          <div className="lca-model-card">
            <div className="lca-model-header">
              <div className="lca-model-title">
                <Zap size={16} style={{ color: '#ec4899' }} /> 3. Chosen-Plaintext (CPA)
              </div>
              <span className="badge badge-warning" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899', borderColor: '#ec4899' }}>
                Texto Plano Elegido
              </span>
            </div>
            <div className="lca-model-field">
              <strong>Información que posee:</strong> Acceso como usuario a la función de cifrado (caja negra).
            </div>
            <div className="lca-model-field">
              <strong>Control del atacante:</strong> Activo: puede introducir textos estructurados y obtener sus cifrados.
            </div>
            <div className="lca-model-field">
              <strong>Debilidad aprovechada:</strong> Criptoanálisis diferencial: comparar textos que difieren en 1 bit.
            </div>
            <div className="lca-model-field">
              <strong>Ejemplo educativo:</strong> Medir la difusión enviando textos idénticos excepto por un carácter.
            </div>
            <div className="lca-model-field">
              <strong>Limitación:</strong> Requiere acceso a la máquina cifradora.
            </div>
          </div>

          <div className="lca-model-card">
            <div className="lca-model-header">
              <div className="lca-model-title">
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> 4. Chosen-Ciphertext (CCA)
              </div>
              <span className="badge badge-danger">Texto Cifrado Elegido</span>
            </div>
            <div className="lca-model-field">
              <strong>Información que posee:</strong> Acceso a un oráculo de descifrado.
            </div>
            <div className="lca-model-field">
              <strong>Control del atacante:</strong> Puede enviar textos cifrados manipulados y observar el texto descifrado o errores.
            </div>
            <div className="lca-model-field">
              <strong>Debilidad aprovechada:</strong> Ataques de oráculo de relleno (*Padding Oracle*) en modos CBC sin HMAC.
            </div>
            <div className="lca-model-field">
              <strong>Ejemplo educativo:</strong> Modificar bytes del vector IV para deducir bytes en claro mediante mensajes de error.
            </div>
            <div className="lca-model-field">
              <strong>Limitación:</strong> Se mitiga usando cifrado autenticado (AEAD) como AES-GCM.
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 3 — Experimento A: Fuerza Bruta a César
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="bf-caesar">
        <div className="lm-section-head">
          <span className="lm-section-num">3</span>
          <h2>Experimento A: Ataque por Fuerza Bruta contra César</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          El espacio de claves del cifrado César está acotado por las 26 letras del alfabeto. Al haber únicamente 26
          desplazamientos posibles ($k \in [0..25]$), una computadora puede probar todas las alternativas de forma instantánea.
        </p>

        <div className="card" style={{ marginTop: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-primary)' }}>Idioma del análisis:</span>
              <button
                type="button"
                className={`btn btn-sm ${lang === 'es' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setLang('es'); setCaesarInput(EXAMPLES_CAESAR.es); setBfExecuted(false); }}
              >
                Español
              </button>
              <button
                type="button"
                className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setLang('en'); setCaesarInput(EXAMPLES_CAESAR.en); setBfExecuted(false); }}
              >
                English
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLoadCaesarExample}
            >
              <RotateCcw size={14} /> Cargar ejemplo cifrado
            </button>
          </div>

          <label style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Texto cifrado a quebrar:</label>
          <textarea
            className="form-textarea"
            style={{ width: '100%', minHeight: '65px', fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '12px' }}
            value={caesarInput}
            onChange={(e) => {
              setCaesarInput(e.target.value);
              setBfExecuted(false);
            }}
            placeholder="Introduce texto cifrado con César..."
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRunBruteForce}
              disabled={!caesarInput.trim()}
            >
              <RotateCcw size={16} /> Ejecutar Fuerza Bruta (26 Claves)
            </button>

            {bfExecuted && (
              <span style={{ fontSize: '0.8rem', color: '#10d46e', fontWeight: 600 }}>
                ✓ 26 claves examinadas en &lt; 2 ms.
              </span>
            )}
          </div>

          {/* Tabla de Resultados de Fuerza Bruta */}
          {bfExecuted && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                  Las 26 hipótesis de descifrado (haz clic en cualquier fila para inspeccionarla):
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                  ⭐ = Candidata con mayor coherencia estadística heurística
                </span>
              </div>

              <div className="lca-table-scroll">
                <table className="lca-bf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Clave (k)</th>
                      <th>Texto resultante</th>
                      <th style={{ width: '120px' }}>Plausibilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bruteForceResults.map((item) => (
                      <tr
                        key={item.shift}
                        className={`clickable ${item.isBest ? 'best-match' : ''} ${selectedCandidate?.shift === item.shift ? 'selected' : ''}`}
                        onClick={() => setSelectedCandidate(item)}
                      >
                        <td className="mono">k = {item.shift}</td>
                        <td style={{ wordBreak: 'break-all' }}>{item.plaintext}</td>
                        <td>
                          {item.isBest ? (
                            <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                              ⭐ {item.score}% (Óptima)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                              {item.score}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detalle de la candidata seleccionada */}
              {selectedCandidate && (
                <div className="card" style={{ marginTop: '12px', background: 'var(--clr-surface-2)', padding: '14px 18px', borderLeft: '4px solid #10d46e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--txt-primary)' }}>
                      Candidata seleccionada: Desplazamiento k = {selectedCandidate.shift}
                    </span>
                    <span className="badge badge-accent">
                      Coherencia: {selectedCandidate.score}%
                    </span>
                  </div>
                  <p style={{ marginTop: '6px', fontSize: '0.9rem', color: 'var(--txt-secondary)', fontStyle: 'italic' }}>
                    «{selectedCandidate.plaintext}»
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                    * Nota metodológica: El puntaje de plausibilidad lingüística es una heurística estadística de apoyo basada en frecuencias de letras y palabras comunes; no constituye una prueba infalible y en textos muy breves requiere verificación humana.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 4 — Experimento B: Análisis de Frecuencias
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-freq">
        <div className="lm-section-head">
          <span className="lm-section-num">4</span>
          <h2>Experimento B: Análisis Estadístico de Frecuencias</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          En los cifrados de sustitución monoalfabética, cada letra se reemplaza siempre por el mismo símbolo.
          Como resultado, <strong>la distribución estadística del idioma original se conserva intacta</strong> en el texto cifrado.
        </p>

        <div className="card" style={{ marginTop: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
              Muestra de texto para análisis:
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFreqInput(SAMPLE_TEXT_FREQ[lang])}
            >
              <RotateCcw size={14} /> Restaurar muestra recomendada
            </button>
          </div>

          <textarea
            className="form-textarea"
            style={{ width: '100%', minHeight: '75px', fontFamily: 'inherit', fontSize: '0.88rem', marginBottom: '10px' }}
            value={freqInput}
            onChange={(e) => setFreqInput(e.target.value)}
            placeholder="Pega o escribe cualquier texto aquí para calcular su distribución de letras..."
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.82rem', color: 'var(--txt-muted)' }}>
            <span>Total letras alfabéticas procesadas: <strong>{frequencyAnalysis.totalLetters}</strong></span>
            <span>Idioma de referencia: <strong>{lang === 'es' ? 'Español' : 'English'}</strong></span>
          </div>

          {/* Top 5 letras observadas */}
          <div className="lca-freq-top-chips">
            <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Letras más frecuentes observadas:</span>
            {frequencyAnalysis.topObserved.map((item, idx) => (
              <span key={item.letter} className="lca-freq-chip">
                #{idx + 1} {item.letter} ({item.observed}%)
              </span>
            ))}
          </div>

          {/* Gráfico Recharts de Frecuencias */}
          <div style={{ width: '100%', height: 260, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyAnalysis.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="letter" stroke="var(--txt-muted)" fontSize={11} />
                <YAxis stroke="var(--txt-muted)" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0d1421', border: '1px solid var(--clr-border)', borderRadius: '6px', fontSize: '0.78rem' }}
                  formatter={(val, name) => [`${val}%`, name === 'observed' ? 'Frecuencia Observada' : 'Frecuencia Típica del Idioma']}
                />
                <Legend
                  formatter={(value) => (value === 'observed' ? 'Frecuencia Observada en la Muestra' : 'Frecuencia Típica del Idioma')}
                  wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }}
                />
                <Bar dataKey="observed" fill="#00d4ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="reference" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="alert alert-warning" style={{ marginTop: '16px' }}>
            <Info size={18} />
            <span>
              <strong>Limitación del análisis monoalfabético:</strong> Las frecuencias dependen en gran medida del tamaño de la muestra.
              En oraciones cortas, letras inusuales pueden tener picos anormales. Por ello, la correspondencia directa de las letras más frecuentes
              no basta por sí sola para recuperar textos sin analizar bigramas (pares como DE, EN, TH) y el contexto lingüístico.
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 5 — Experimento C: Sensibilidad y Difusión
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-difusion">
        <div className="lm-section-head">
          <span className="lm-section-num">5</span>
          <h2>Experimento C: Sensibilidad y Difusión (César vs AES-GCM)</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          Compara cómo se comporta un cifrado débil monoalfabético frente al estándar moderno <strong>AES-GCM</strong> (Web Crypto API)
          cuando dos mensajes difieren en un único carácter (por ejemplo, cambiar "100" por "900"):
        </p>

        <div className="lca-diff-dual-grid">
          {/* Lado 1: César */}
          <div className="lca-diff-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f59e0b' }}>1. Cifrado Débil (César)</h3>
              <span className="badge badge-warning">Cero Difusión</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
              Desplazamiento k = {caesarShiftKey}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Texto A cifrado:</div>
              <div className="mono" style={{ background: 'var(--clr-bg)', padding: '8px', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--txt-primary)' }}>
                {caesarCipherA}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Texto B cifrado:</div>
              <div className="mono" style={{ background: 'var(--clr-bg)', padding: '8px', borderRadius: '4px', fontSize: '0.82rem', color: '#f59e0b' }}>
                {caesarCipherB}
              </div>
            </div>

            <div className="lca-diff-meter">
              <div className="lca-diff-meter-header">
                <span>Posiciones que cambiaron en la salida:</span>
                <strong style={{ color: '#f59e0b' }}>{caesarDiffCount.diff} de {caesarDiffCount.maxLen} caracteres ({caesarDiffCount.pct}%)</strong>
              </div>
              <div className="lca-diff-track">
                <div className="lca-diff-fill" style={{ width: `${caesarDiffCount.pct}%`, background: '#f59e0b' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                En César, cambiar 1 carácter altera únicamente ese mismo carácter en el resultado. No existe difusión.
              </span>
            </div>
          </div>

          {/* Lado 2: AES-GCM */}
          <div className="lca-diff-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#10d46e' }}>2. Cifrado Moderno (AES-256-GCM)</h3>
              <span className="badge badge-accent">AEAD Moderno</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--txt-muted)' }}>Modo de IV:</span>
              <button
                type="button"
                className={`btn btn-sm ${aesIvMode === 'controlled' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={() => setAesIvMode('controlled')}
              >
                Mismo IV (Demostración)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${aesIvMode === 'random' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={() => setAesIvMode('random')}
              >
                IVs Aleatorios (Estándar)
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Texto A cifrado (Ciphertext + Tag 16B):</div>
              <div className="mono" style={{ background: 'var(--clr-bg)', padding: '8px', borderRadius: '4px', fontSize: '0.74rem', color: 'var(--clr-accent)', wordBreak: 'break-all', maxHeight: '50px', overflowY: 'auto' }}>
                {aesResults?.resA.fullHex || 'Calculando...'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Texto B cifrado (Ciphertext + Tag 16B):</div>
              <div className="mono" style={{ background: 'var(--clr-bg)', padding: '8px', borderRadius: '4px', fontSize: '0.74rem', color: '#10d46e', wordBreak: 'break-all', maxHeight: '50px', overflowY: 'auto' }}>
                {aesResults?.resB.fullHex || 'Calculando...'}
              </div>
            </div>

            {aesResults && (
              <div className="lca-diff-meter">
                <div className="lca-diff-meter-header">
                  <span>Diferencia en bytes (Ciphertext + Tag):</span>
                  <strong style={{ color: '#10d46e' }}>{aesResults.byteComp.diffCount} de {aesResults.byteComp.totalLength} bytes ({aesResults.byteComp.diffPercentage}%)</strong>
                </div>
                <div className="lca-diff-track">
                  <div className="lca-diff-fill" style={{ width: `${aesResults.byteComp.diffPercentage}%`, background: '#10d46e' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                  {aesIvMode === 'controlled' ? (
                    'En modo CTR con el mismo IV, el byte modificado cambia en el texto cifrado, y la etiqueta de autenticación GHASH (16 bytes) varía íntegramente.'
                  ) : (
                    'Con IVs aleatorios independientes, el 100% de la salida difiere debido a la unicidad del nonce por mensaje.'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Advertencia técnica obligatoria sobre reutilización de IV */}
        <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #f59e0b', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 700 }}>
            <AlertTriangle size={18} />
            <span>Aclaración Metodológica y Riesgo de Reutilización de IV en Producción</span>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            1. <strong>Peligro en producción:</strong> Reutilizar el mismo IV bajo la misma clave en AES-GCM es un fallo catastrófico en sistemas reales (permite ataques XOR de textos planos y falsificación de etiquetas GHASH). En esta demostración se utiliza de forma estrictamente aislada y local en tu navegador con fines didácticos.
          </p>
          <p style={{ marginTop: '4px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            2. <strong>Efecto avalancha interno:</strong> Esta comparación mide la diferencia en la salida de AES-GCM, que es un modo de operación autenticado (CTR + GHASH). No debe confundirse con una medición criptográfica aislada del efecto avalancha interno de las 10 o 14 rondas de Rijndael a nivel de bloque puro.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 6 — Límites de los Ataques y Comparativa
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-limites">
        <div className="lm-section-head">
          <span className="lm-section-num">6</span>
          <h2>Espacios de Claves y Límites Computacionales</h2>
        </div>

        <div className="lh-compare-table-wrapper">
          <table className="lh-compare-table">
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Tamaño de Clave</th>
                <th>Espacio de Claves</th>
                <th>Resistencia a Fuerza Bruta</th>
                <th>Estado Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>César</strong></td>
                <td>26 valores (~4.7 bits)</td>
                <td>26</td>
                <td><span className="badge badge-danger">Instantáneo (&lt; 1 ms)</span></td>
                <td>Vulnerable por diseño (histórico).</td>
              </tr>
              <tr>
                <td><strong>DES</strong></td>
                <td>56 bits</td>
                <td>2⁵⁶ (~7.2 × 10¹⁶)</td>
                <td><span className="badge badge-danger">Roto (&lt; 1 día con ASIC)</span></td>
                <td>Obsoleto e inseguro desde 1999.</td>
              </tr>
              <tr>
                <td><strong>3DES (Triple DES)</strong></td>
                <td>112 o 168 bits</td>
                <td>2¹¹² a 2¹⁶⁸</td>
                <td><span className="badge badge-warning">Vulnerable a Sweet32</span></td>
                <td>Retirado por NIST en 2023.</td>
              </tr>
              <tr>
                <td><strong>AES-128</strong></td>
                <td>128 bits</td>
                <td>2¹²⁸ (~3.4 × 10³⁸)</td>
                <td><span className="badge badge-accent">Inviable computacionalmente</span></td>
                <td>Estándar global seguro.</td>
              </tr>
              <tr>
                <td><strong>AES-256</strong></td>
                <td>256 bits</td>
                <td>2²⁵⁶ (~1.15 × 10⁷⁷)</td>
                <td><span className="badge badge-accent">Inviable (seguridad poscuántica)</span></td>
                <td>Máximo estándar militar y gubernamental.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 7 — Desafío Final Interactivo
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="reto">
        <div className="lm-section-head">
          <span className="lm-section-num">7</span>
          <h2>Desafío: Ruptura y Análisis Crítico</h2>
        </div>

        <div className="lca-challenge-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--txt-primary)' }}>
                Misión: Quebrar el criptograma interceptado y responder la pregunta teórica
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                Se interceptó el siguiente mensaje: <code className="mono text-accent">"{challengeCipher}"</code>
              </span>
            </div>

            <span className={`badge ${challengeShiftSelected === 3 && challengeQuestionAnswer === 'A' ? 'badge-accent' : 'badge-warning'}`}>
              {challengeShiftSelected === 3 && challengeQuestionAnswer === 'A' ? '✓ Desafío Superado' : 'Pendiente de resolución'}
            </span>
          </div>

          {/* Paso 1 del Desafío: Elegir la clave correcta */}
          <div style={{ background: 'var(--clr-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
              Paso 1: ¿Cuál es el desplazamiento (k) que descifra el mensaje con sentido en español?
            </span>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              {[1, 2, 3, 4, 5, 7].map((k) => {
                const dec = caesarShift(challengeCipher, 26 - k);
                return (
                  <button
                    key={k}
                    type="button"
                    className={`btn btn-sm ${challengeShiftSelected === k ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setChallengeShiftSelected(k)}
                  >
                    k = {k} («{dec.slice(0, 15)}...»)
                  </button>
                );
              })}
            </div>

            {challengeShiftSelected === 3 && (
              <div style={{ marginTop: '10px', color: '#10d46e', fontSize: '0.82rem', fontWeight: 600 }}>
                ✓ ¡Correcto! k = 3 revela: «Hola mensaje secreto de cryptium».
              </div>
            )}
            {challengeShiftSelected && challengeShiftSelected !== 3 && (
              <div style={{ marginTop: '10px', color: '#f43f5e', fontSize: '0.82rem' }}>
                ✕ Ese desplazamiento no produce texto inteligible en español. Prueba otra opción.
              </div>
            )}
          </div>

          {/* Paso 2 del Desafío: Pregunta conceptual sobre AES */}
          <div style={{ background: 'var(--clr-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
              Paso 2: ¿Por qué este ataque de fuerza bruta que funcionó contra César es completamente inútil contra AES-256?
            </span>

            <div className="lh-quiz-options" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className={`lh-quiz-btn ${challengeQuestionAnswer === 'A' ? 'selected-correct' : ''}`}
                onClick={() => {
                  setChallengeQuestionAnswer('A');
                  if (challengeShiftSelected === 3) {
                    setMilestones((prev) => ({ ...prev, completedChallenge: true }));
                  }
                }}
              >
                <span>
                  <strong>A)</strong> Porque el espacio de claves de AES-256 tiene 2²⁵⁶ posibilidades (~1.15 × 10⁷⁷); probarlas todas requeriría más energía y tiempo que la vida entera del universo observable.
                </span>
                {challengeQuestionAnswer === 'A' && <CheckCircle2 size={16} />}
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${challengeQuestionAnswer === 'B' ? 'selected-wrong' : ''}`}
                onClick={() => setChallengeQuestionAnswer('B')}
              >
                <span>
                  <strong>B)</strong> Porque AES-256 borra el disco duro de la persona que intenta ejecutar una fuerza bruta.
                </span>
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${challengeQuestionAnswer === 'C' ? 'selected-wrong' : ''}`}
                onClick={() => setChallengeQuestionAnswer('C')}
              >
                <span>
                  <strong>C)</strong> Porque AES solo funciona si el emisor y el receptor están conectados a la misma red Wi-Fi.
                </span>
              </button>
            </div>

            {challengeQuestionAnswer === 'A' && (
              <div className="lh-challenge-feedback lh-feedback-success" style={{ marginTop: '12px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>¡Respuesta rigurosa y correcta!</strong> La fuerza bruta depende exclusivamente del tamaño del espacio de claves.
                  En César hay 26 claves posibles (quebrando el mensaje en microsegundos). En AES-256, el número de claves supera
                  la cantidad estimada de átomos en la Vía Láctea, haciendo que la búsqueda exhaustiva sea físicamente imposible con cualquier tecnología convencional o supercomputador concebible.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 8 — Conclusión de la Sección de Aprendizaje
         ═══════════════════════════════════════════════════════════════ */}
      <div className="card lm-conclusion">
        <div className="lm-conclusion-content">
          <Sparkles size={20} style={{ color: 'var(--clr-accent)' }} />
          <div>
            <p>
              <strong>¡Felicitaciones! Has completado el catálogo completo de Aprendizaje de Cryptium.</strong>
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
              Has recorrido los 6 pilares esenciales: Fundamentos, Simétrica, Asimétrica, Funciones Hash, Firmas Digitales y Criptoanálisis.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/aprendizaje')}
        >
          <ArrowLeft size={16} /> Volver al catálogo de aprendizaje
        </button>
      </div>
    </div>
  );
}
