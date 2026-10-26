import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Hash,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Info,
  AlertTriangle,
  RotateCcw,
  Layers,
  Key,
  Lock,
  Unlock,
  Cpu,
  Fingerprint,
  Zap,
  HelpCircle,
  Eye,
  FileText,
  Binary,
} from 'lucide-react';
import {
  computeSHA256,
  compareHashesBitwise,
  analyzeTextDifference,
  isWebCryptoSupported,
} from '../utils/hashUtils';
import './Learning.css';
import './LearningHash.css';

export default function LearningHash() {
  const navigate = useNavigate();

  // Compatibilidad con Web Crypto
  const webCryptoAvailable = isWebCryptoSupported();

  // Sección activa para navegación rápida
  const [activeSection, setActiveSection] = useState('lab');

  // ─── Estado del Laboratorio SHA-256 ──────────────────────────────
  const [textA, setTextA] = useState('Hola mundo');
  const [textB, setTextB] = useState('Hola Mundo');
  const [hashA, setHashA] = useState(null);
  const [hashB, setHashB] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'hex' | 'bits'
  const [errorMsg, setErrorMsg] = useState(null);

  // ─── Estado del Desafío Educativo ─────────────────────────────────
  const [challengeRefText, setChallengeRefText] = useState('La seguridad es prioridad');
  const [challengeInputText, setChallengeInputText] = useState('La seguridad es prioridad.');
  const [challengeHashRef, setChallengeHashRef] = useState(null);
  const [challengeHashUser, setChallengeHashUser] = useState(null);
  const [challengeQuizAnswer, setChallengeQuizAnswer] = useState(null); // 'A' | 'B' | 'C'
  const [challengeStep, setChallengeStep] = useState(1);

  // ─── Milestones de Progreso ────────────────────────────────────────
  const [milestones, setMilestones] = useState({
    exploredConcepts: true,
    calculatedHash: false,
    testedAvalanche: false,
    solvedChallenge: false,
  });

  const progressPercent = useMemo(() => {
    let count = 0;
    if (milestones.exploredConcepts) count += 25;
    if (milestones.calculatedHash) count += 25;
    if (milestones.testedAvalanche) count += 25;
    if (milestones.solvedChallenge) count += 25;
    return count;
  }, [milestones]);

  // ─── Cálculo reactivo del laboratorio ─────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function updateHashes() {
      if (!webCryptoAvailable) {
        setErrorMsg('Web Crypto API no disponible. Ejecuta en HTTPS o localhost.');
        return;
      }
      setLabLoading(true);
      setErrorMsg(null);
      try {
        const [resA, resB] = await Promise.all([
          computeSHA256(textA),
          computeSHA256(textB),
        ]);
        if (isMounted) {
          setHashA(resA);
          setHashB(resB);
          setMilestones((prev) => ({
            ...prev,
            calculatedHash: true,
            testedAvalanche: textA !== textB ? true : prev.testedAvalanche,
          }));
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'Error calculando SHA-256');
        }
      } finally {
        if (isMounted) setLabLoading(false);
      }
    }
    updateHashes();
    return () => { isMounted = false; };
  }, [textA, textB, webCryptoAvailable]);

  // ─── Comparación Bit a Bit entre Hash A y Hash B ───────────────────
  const comparison = useMemo(() => {
    if (!hashA?.bytes || !hashB?.bytes) return null;
    return compareHashesBitwise(hashA.bytes, hashB.bytes);
  }, [hashA, hashB]);

  // ─── Cálculo del Desafío Educativo ────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function updateChallenge() {
      if (!webCryptoAvailable) return;
      try {
        const [refRes, userRes] = await Promise.all([
          computeSHA256(challengeRefText),
          computeSHA256(challengeInputText),
        ]);
        if (isMounted) {
          setChallengeHashRef(refRes);
          setChallengeHashUser(userRes);
        }
      } catch (e) {
        // Ignorar errores en desafío
      }
    }
    updateChallenge();
    return () => { isMounted = false; };
  }, [challengeRefText, challengeInputText, webCryptoAvailable]);

  const challengeDiff = useMemo(() => {
    return analyzeTextDifference(challengeRefText, challengeInputText);
  }, [challengeRefText, challengeInputText]);

  const challengeComparison = useMemo(() => {
    if (!challengeHashRef?.bytes || !challengeHashUser?.bytes) return null;
    return compareHashesBitwise(challengeHashRef.bytes, challengeHashUser.bytes);
  }, [challengeHashRef, challengeHashUser]);

  // ─── Acciones del Laboratorio ─────────────────────────────────────
  const copyText = (str, isA) => {
    navigator.clipboard.writeText(str);
    if (isA) {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
  };

  const loadExample = (exA, exB) => {
    setTextA(exA);
    setTextB(exB);
  };

  const handleClearLab = () => {
    setTextA('');
    setTextB('');
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Breadcrumb / Volver al catálogo ── */}
      <button className="btn btn-ghost lm-back-link" onClick={() => navigate('/aprendizaje')}>
        <ArrowLeft size={16} /> Volver al catálogo de módulos
      </button>

      {/* ── Cabecera del Módulo ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
            Módulo 4
          </div>
          <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>· Criptografía Moderna</span>
        </div>
        <h1 style={{ marginTop: '8px' }}>Funciones Hash Criptográficas</h1>
        <p>
          Descubre las matemáticas de la integridad digital, la irreversibilidad, la resistencia a colisiones
          y el efecto avalancha utilizando el algoritmo estándar de la industria <strong>SHA-256</strong>.
        </p>
      </div>

      {/* ── Tarjeta de Progreso ── */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title-wrap">
            <Sparkles size={18} style={{ color: 'var(--clr-accent)' }} />
            <h3>Progreso del Módulo</h3>
          </div>
          <div className="progress-percentage">{progressPercent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="progress-milestones">
          <span className={`milestone-chip ${milestones.exploredConcepts ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 1. Conceptos y propiedades
          </span>
          <span className={`milestone-chip ${milestones.calculatedHash ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 2. Cálculo real SHA-256
          </span>
          <span className={`milestone-chip ${milestones.testedAvalanche ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 3. Efecto avalancha
          </span>
          <span className={`milestone-chip ${milestones.solvedChallenge ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 4. Desafío completado
          </span>
        </div>
      </div>

      {/* ── Navegación rápida entre secciones ── */}
      <div className="lh-nav-pills">
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--txt-muted)', marginRight: '6px' }}>
          SECCIONES:
        </span>
        <button
          className={`lh-nav-btn ${activeSection === 'sec-que-es' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-que-es')}
        >
          <Fingerprint size={14} /> ¿Qué es un hash?
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'sec-propiedades' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-propiedades')}
        >
          <Shield size={14} /> Propiedades
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'sec-sha256' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-sha256')}
        >
          <Cpu size={14} /> Arquitectura SHA-256
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'sec-avalancha' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-avalancha')}
        >
          <Zap size={14} /> Efecto Avalancha
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'sec-vs-cifrado' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-vs-cifrado')}
        >
          <Lock size={14} /> Hash vs Cifrado
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'lab' ? 'active' : ''}`}
          onClick={() => scrollToSection('lab')}
        >
          <Binary size={14} /> Laboratorio Interactivo
        </button>
        <button
          className={`lh-nav-btn ${activeSection === 'reto' ? 'active' : ''}`}
          onClick={() => scrollToSection('reto')}
        >
          <Sparkles size={14} /> Reto Educativo
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 1 — ¿Qué es una función hash?
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-que-es">
        <div className="lm-section-head">
          <span className="lm-section-num">1</span>
          <h2>¿Qué es una función hash criptográfica?</h2>
        </div>

        <div className="alert alert-info">
          <Fingerprint size={20} />
          <span>
            Una función hash criptográfica es un algoritmo matemático <strong>determinista y unidireccional</strong>{' '}
            que transforma cualquier volumen de datos de entrada (desde una sola letra hasta gigabytes de información)
            en una cadena alfanumérica de <strong>longitud fija</strong> denominada resumen, <em>digest</em> o huella digital.
          </span>
        </div>

        {/* Diagrama conceptual: Entrada de cualquier tamaño -> HASH -> Salida fija */}
        <div className="lm-diagram-box">
          <div className="lm-diagram-key-badge">
            <Hash size={16} /> <strong>TRANSFORMACIÓN DETERMINISTA UNIDIRECCIONAL</strong>
          </div>
          <div className="lm-flow-horizontal">
            <div className="lm-flow-item">
              <span className="lm-flow-sub">Entrada (Cualquier tamaño)</span>
              <div className="lm-flow-card" style={{ maxWidth: '170px' }}>
                Texto, archivo, contrato o contraseña
              </div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">Algoritmo</span>
              <div className="lm-flow-card active-op">
                ⚡ SHA-256 (H)
              </div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">Salida (Longitud Fija)</span>
              <div className="lm-flow-card cipher-card mono" style={{ fontSize: '0.78rem' }}>
                256 bits (64 hex chars)
              </div>
            </div>
          </div>
        </div>

        {/* Cuadrícula de Usos Prácticos en Seguridad */}
        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon cyan">
              <CheckCircle2 size={18} />
            </div>
            <h4>Verificación de Integridad</h4>
            <p>
              Permite comprobar que un archivo o mensaje descargado no ha sido corrompido ni manipulado por un
              tercero durante la transmisión. Si el hash coincide, los datos son idénticos bit por bit.
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-icon purple">
              <Fingerprint size={18} />
            </div>
            <h4>Huellas Digitales de Datos</h4>
            <p>
              Se utiliza en sistemas de control de versiones como <strong>Git</strong> (identificando commits) y
              en redes <strong>Blockchain</strong> (vinculando bloques inmutables mediante el hash del bloque previo).
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-icon amber">
              <Lock size={18} />
            </div>
            <h4>Almacenamiento de Credenciales</h4>
            <p>
              Los sistemas seguros nunca guardan contraseñas en claro. Almacenan su resumen junto a una sal (salt)
              empleando funciones de derivación lentas para verificar inicios de sesión sin exponer el secreto.
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-icon green">
              <Key size={18} />
            </div>
            <h4>Cimiento de Firmas Digitales</h4>
            <p>
              La criptografía asimétrica es computacionalmente costosa. Por eso, las firmas digitales no firman el
              documento completo, sino su hash de 256 bits, garantizando autenticidad y no repudio velozmente.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 2 — Propiedades Criptográficas Fundamentales
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-propiedades">
        <div className="lm-section-head">
          <span className="lm-section-num">2</span>
          <h2>Propiedades Criptográficas Esenciales</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          No cualquier función matemática sirve para seguridad. Mientras que funciones como CRC32 o MurmurHash solo
          detectan errores fortuitos de red, las <strong>funciones hash criptográficas</strong> deben satisfacer seis
          rigurosas propiedades formales:
        </p>

        <div className="lh-props-grid">
          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Check size={16} style={{ color: '#10d46e' }} /> Determinismo estricto
              </div>
            </div>
            <p className="lh-prop-desc">
              Para un mismo mensaje de entrada exacto, la función producirá siempre y de forma reproducible
              el mismo resumen, sin importar el hardware, el sistema operativo o el momento de ejecución.
            </p>
          </div>

          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Binary size={16} style={{ color: 'var(--clr-accent)' }} /> Longitud de salida fija
              </div>
              <span className="lh-prop-complexity">256 bits</span>
            </div>
            <p className="lh-prop-desc">
              Ya sea que proceses una sola letra o un archivo de video de 50 GB, el hash generado por SHA-256 tendrá
              invariablemente 256 bits (32 bytes / 64 dígitos hexadecimales).
            </p>
          </div>

          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Zap size={16} style={{ color: '#ec4899' }} /> Eficiencia computacional
              </div>
              <span className="lh-prop-complexity">O(n)</span>
            </div>
            <p className="lh-prop-desc">
              Calcular el hash debe ser una operación rápida y de bajo coste de procesamiento en cualquier equipo moderno,
              permitiendo calcular resúmenes de flujos masivos de datos en milisegundos.
            </p>
          </div>

          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Lock size={16} style={{ color: '#f59e0b' }} /> Resistencia a la preimagen
              </div>
              <span className="lh-prop-complexity">Dificultad ~ 2²⁵⁶</span>
            </div>
            <p className="lh-prop-desc">
              <strong>Unidireccionalidad:</strong> Dado un valor de hash <em>h</em>, debe ser computacionalmente imposible
              encontrar el mensaje original <em>m</em> tal que <em>H(m) = h</em>. No existe una función «des-hash».
            </p>
          </div>

          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Layers size={16} style={{ color: '#a855f7' }} /> Resistencia a 2ª preimagen
              </div>
              <span className="lh-prop-complexity">Dificultad ~ 2²⁵⁶</span>
            </div>
            <p className="lh-prop-desc">
              Dado un mensaje específico <em>m₁</em> y su hash <em>H(m₁)</em>, es inviable encontrar un segundo mensaje
              distinto <em>m₂ ≠ m₁</em> que produzca exactamente el mismo resumen <em>H(m₁) = H(m₂)</em>.
            </p>
          </div>

          <div className="lh-prop-card">
            <div className="lh-prop-header">
              <div className="lh-prop-title">
                <Shield size={16} style={{ color: '#00d4ff' }} /> Resistencia a colisiones
              </div>
              <span className="lh-prop-complexity">Paradoja ~ 2¹²⁸</span>
            </div>
            <p className="lh-prop-desc">
              Debe ser computacionalmente inviable encontrar <em>cualquier par</em> de mensajes arbitrarios <em>m₁ ≠ m₂</em> tales
              que colisionen en el mismo hash.
            </p>
            <div className="lh-prop-note">
              <strong>Aclaración matemática rigurosa:</strong> Las colisiones <strong>no son matemáticamente imposibles</strong>;
              por el <em>Principio del Palomar</em>, al haber infinitas entradas posibles y solo 2²⁵⁶ salidas finitas, las colisiones
              existen por necesidad matemática. La seguridad reside en que encontrar una deliberadamente requeriría ~2¹²⁸ operaciones
              (inviable para toda la capacidad de cómputo del planeta).
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 3 — Arquitectura y Proceso de SHA-256
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-sha256">
        <div className="lm-section-head">
          <span className="lm-section-num">3</span>
          <h2>¿Cómo funciona internamente SHA-256?</h2>
        </div>

        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          SHA-256 (diseñado por la NSA y estandarizado por NIST en FIPS 180-4) utiliza la construcción de compresión
          <strong> Merkle-Damgård</strong>. Procesa el texto dividido en bloques ordenados mediante el siguiente flujo:
        </p>

        {/* Pipeline Merkle-Damgård */}
        <div className="lh-pipeline">
          <div className="lh-pipe-step">
            <span className="lh-pipe-step-num">Paso 1</span>
            <h4>Relleno (Padding)</h4>
            <p>
              Se agrega un bit '1' (byte 0x80), seguido de ceros ('0'), y al final se incrusta un entero de 64 bits con
              la longitud original del mensaje. El total resulta múltiplo exacto de 512 bits.
            </p>
            <span className="lh-pipe-badge">Múltiplo de 512 bits</span>
          </div>

          <div className="lh-pipe-step">
            <span className="lh-pipe-step-num">Paso 2</span>
            <h4>División en Bloques</h4>
            <p>
              El flujo de bytes se segmenta en bloques de <strong>512 bits</strong>. Cada bloque se interpreta como 16 palabras
              de 32 bits (M₀ hasta M₁₅).
            </p>
            <span className="lh-pipe-badge">Bloques de 512 bits</span>
          </div>

          <div className="lh-pipe-step">
            <span className="lh-pipe-step-num">Paso 3</span>
            <h4>Expansión (Message Schedule)</h4>
            <p>
              Las 16 palabras iniciales se expanden matemáticamente mediante rotaciones lógicas (rotaciones y desplazamientos
              σ₀ y σ₁) para generar <strong>64 palabras</strong> de 32 bits (W₀ a W₆₃).
            </p>
            <span className="lh-pipe-badge">64 palabras (W₀..W₆₃)</span>
          </div>

          <div className="lh-pipe-step">
            <span className="lh-pipe-step-num">Paso 4</span>
            <h4>64 Rondas de Compresión</h4>
            <p>
              Se inicializan 8 registros de estado de 32 bits (A, B, C, D, E, F, G, H). En cada ronda se mezclan con las constantes
              Kₜ (derivadas de números primos) y funciones lógicas (Ch, Maj, Σ₀, Σ₁).
            </p>
            <span className="lh-pipe-badge">8 registros (A..H)</span>
          </div>

          <div className="lh-pipe-step">
            <span className="lh-pipe-step-num">Paso 5</span>
            <h4>Concatenación Final</h4>
            <p>
              Los 8 registros finales se suman al estado acumulado y se concatenan para producir el resumen de{' '}
              <strong>256 bits</strong> (32 bytes), formateado en 64 caracteres hexadecimales.
            </p>
            <span className="lh-pipe-badge">256 bits / 64 hex</span>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--txt-muted)', fontStyle: 'italic' }}>
          * Esta descripción presenta la arquitectura formal por bloques de Merkle-Damgård a nivel conceptual riguroso.
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 4 — Efecto Avalancha (Avalanche Effect)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-avalancha">
        <div className="lm-section-head">
          <span className="lm-section-num">4</span>
          <h2>El Efecto Avalancha (Avalanche Effect)</h2>
        </div>

        <div className="alert alert-warning" style={{ alignItems: 'flex-start' }}>
          <Zap size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Propiedad clave de difusión:</strong> Si modificas un solo bit en el mensaje de entrada (por ejemplo,
            cambiar una letra minúscula por mayúscula, o añadir un punto final), el hash resultante cambia de forma
            drástica e impredecible, alternando aproximadamente el <strong>50% de los 256 bits</strong> de salida.
          </div>
        </div>

        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon cyan">
              <Zap size={18} />
            </div>
            <h4>¿Por qué ocurre?</h4>
            <p>
              Cada ronda de compresión mezcla y rota los bits de forma no lineal. Un cambio en un solo bit en la ronda 1
              se propaga a dos registros en la ronda 2, a cuatro en la ronda 3, y tras 64 rondas ha impregnado completamente
              los 8 registros de estado.
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-icon purple">
              <HelpCircle size={18} />
            </div>
            <h4>Importancia Criptográfica</h4>
            <p>
              Impide el <em>criptoanálisis diferencial</em>: un atacante no puede deducir la proximidad de dos mensajes
              comparando la similitud de sus hashes, ya que dos textos con 99.9% de similitud tendrán resúmenes
              estadísticamente independientes.
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-icon amber">
              <AlertTriangle size={18} />
            </div>
            <h4>Aclaración Teórica Rigurosa</h4>
            <p>
              El efecto avalancha es una <strong>propiedad observada y deseable</strong> producto de una alta difusión, pero
              <strong> no constituye una prueba suficiente de seguridad por sí sola</strong>. Un algoritmo puede tener avalancha
              y ser vulnerable a ataques algebraicos si su función de compresión tiene debilidades estructurales.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 5 — Hash frente a Cifrado
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-vs-cifrado">
        <div className="lm-section-head">
          <span className="lm-section-num">5</span>
          <h2>Comparativa: Función Hash vs Cifrado</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          Es común confundir «hashear» con «cifrar». Aunque ambos son herramientas criptográficas primarias, resuelven
          problemas fundamentalmente opuestos:
        </p>

        <div className="lh-compare-table-wrapper">
          <table className="lh-compare-table">
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Función Hash (ej. SHA-256)</th>
                <th>Cifrado Simétrico / Asimétrico (ej. AES, RSA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Objetivo Principal</strong></td>
                <td>Garantizar <strong>Integridad</strong> y autenticidad (huella digital).</td>
                <td>Garantizar <strong>Confidencialidad</strong> (ocultar el mensaje).</td>
              </tr>
              <tr>
                <td><strong>Reversibilidad</strong></td>
                <td><span className="badge badge-danger">Unidireccional</span> (Nunca se puede descifrar).</td>
                <td><span className="badge badge-accent">Bidireccional</span> (Se descifra con la clave adecuada).</td>
              </tr>
              <tr>
                <td><strong>Uso de Claves</strong></td>
                <td>No utiliza claves (salvo en esquemas de autenticación HMAC).</td>
                <td>Obligatorio: requiere clave secreta o par público/privado.</td>
              </tr>
              <tr>
                <td><strong>Tamaño de Salida</strong></td>
                <td>Longitud fija predecible (siempre 256 bits en SHA-256).</td>
                <td>Proporcional a la longitud del mensaje + relleno (padding).</td>
              </tr>
              <tr>
                <td><strong>Casos de Uso Típicos</strong></td>
                <td>Checksums de software, Git commits, bloques blockchain, firmas.</td>
                <td>Cifrado de discos, HTTPS (TLS), mensajería privada, bases de datos.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Advertencia técnica sobre almacenamiento de contraseñas */}
        <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #f59e0b', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 700 }}>
            <AlertTriangle size={18} />
            <span>Regla de Oro en Seguridad: SHA-256 NO debe usarse directamente para contraseñas</span>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            Debido a que SHA-256 fue diseñado para ser computacionalmente muy rápido, una tarjeta gráfica (GPU) moderna
            puede calcular <strong>decenas de miles de millones de hashes SHA-256 por segundo</strong>, haciendo viables los ataques
            de fuerza bruta y tablas rainbow. Para contraseñas se deben emplear exclusivamente funciones de derivación de claves
            deliberadamente lentas y resistentes a memoria (memory-hard KDFs) como <strong>Argon2id</strong>, <strong>bcrypt</strong>,
            <strong> scrypt</strong> o <strong>PBKDF2</strong> con sal única por usuario.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 6 — LABORATORIO SHA-256 FUNCIONAL
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="lab">
        <div className="lm-section-head">
          <span className="lm-section-num">6</span>
          <h2>Laboratorio Interactivo SHA-256 y Comparador</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          Escribe texto en los paneles inferiores. La aplicación calculará los hashes SHA-256 reales en tu navegador
          mediante la <strong>Web Crypto API nativa</strong> (codificación UTF-8) y comparará bit a bit ambos resultados
          en tiempo real para demostrar el efecto avalancha.
        </p>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="lh-lab-container">
          {/* Ejemplos de Carga Rápida */}
          <div className="lh-quick-examples">
            <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Cargar ejemplos:</span>
            <button
              type="button"
              className="lh-example-btn"
              onClick={() => loadExample('Hola mundo', 'Hola Mundo')}
            >
              Mayúscula: "Hola mundo" vs "Hola Mundo"
            </button>
            <button
              type="button"
              className="lh-example-btn"
              onClick={() => loadExample('El secreto está a salvo.', 'El secreto está a salvo!')}
            >
              Puntuación: "." vs "!"
            </button>
            <button
              type="button"
              className="lh-example-btn"
              onClick={() => loadExample('', 'a')}
            >
              Hash vacío vs 'a'
            </button>
            <button
              type="button"
              className="lh-example-btn"
              onClick={() => loadExample('Cryptium 2026', 'Cryptium 2027')}
            >
              Dígito: '2026' vs '2027'
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 'auto', fontSize: '0.78rem' }}
              onClick={handleClearLab}
            >
              <RotateCcw size={13} /> Limpiar entradas
            </button>
          </div>

          {/* Grilla dual de entradas A y B */}
          <div className="lh-dual-grid">
            {/* Entrada A */}
            <div className="lh-box box-active">
              <div className="lh-box-header">
                <div className="lh-box-title">
                  <span className="badge badge-accent">Mensaje A</span>
                </div>
                <div className="lh-box-meta">
                  <span>{hashA ? `${hashA.inputCharLength} caracteres` : '0 caracteres'}</span>
                  <span>·</span>
                  <span>{hashA ? `${hashA.inputByteLength} bytes UTF-8` : '0 bytes'}</span>
                </div>
              </div>

              <textarea
                className="lh-textarea"
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Escribe el primer mensaje aquí..."
              />

              <div className="lh-hash-display">
                <div className="lh-hash-header">
                  <span>HASH SHA-256 (256 bits · 64 caracteres hexadecimales)</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                    onClick={() => copyText(hashA?.hex || '', true)}
                    disabled={!hashA}
                  >
                    {copiedA ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
                {labLoading ? (
                  <span style={{ color: 'var(--txt-muted)' }}>Calculando SHA-256...</span>
                ) : (
                  hashA?.hex || '—'
                )}
              </div>
            </div>

            {/* Entrada B */}
            <div className="lh-box">
              <div className="lh-box-header">
                <div className="lh-box-title">
                  <span className="badge badge-warning" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899', borderColor: '#ec4899' }}>
                    Mensaje B (Comparativo)
                  </span>
                </div>
                <div className="lh-box-meta">
                  <span>{hashB ? `${hashB.inputCharLength} caracteres` : '0 caracteres'}</span>
                  <span>·</span>
                  <span>{hashB ? `${hashB.inputByteLength} bytes UTF-8` : '0 bytes'}</span>
                </div>
              </div>

              <textarea
                className="lh-textarea"
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Escribe el segundo mensaje con una mínima variación..."
              />

              <div className="lh-hash-display hash-b">
                <div className="lh-hash-header">
                  <span>HASH SHA-256 (256 bits · 64 caracteres hexadecimales)</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                    onClick={() => copyText(hashB?.hex || '', false)}
                    disabled={!hashB}
                  >
                    {copiedB ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
                {labLoading ? (
                  <span style={{ color: 'var(--txt-muted)' }}>Calculando SHA-256...</span>
                ) : (
                  hashB?.hex || '—'
                )}
              </div>
            </div>
          </div>

          {/* Medidor de Avalancha y Estadísticas Bit a Bit */}
          {comparison && (
            <div className="lh-avalanche-meter">
              <div className="lh-meter-header">
                <div className="lh-meter-title-wrap">
                  <Zap size={22} style={{ color: '#ec4899' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--txt-primary)' }}>
                      Medición del Efecto Avalancha (Distancia de Hamming)
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                      Comparación exacta de los 256 bits que componen ambos resúmenes
                    </span>
                  </div>
                </div>

                <div className="lh-meter-stats">
                  <span className="lh-meter-diff-num">{comparison.diffBits}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)' }}>/ 256 bits cambiaron</span>
                  <span className="lh-meter-diff-pct">({comparison.diffPercentage}%)</span>
                </div>
              </div>

              {/* Barra de progreso con marca del 50% */}
              <div className="lh-meter-track">
                <div
                  className="lh-meter-fill"
                  style={{ width: `${comparison.diffPercentage}%` }}
                />
                <div className="lh-meter-mark-50" title="50% Difusión Óptima Teórica" />
              </div>

              <div className="lh-meter-labels">
                <span>0% (Hashes idénticos)</span>
                <span style={{ color: 'var(--txt-primary)', fontWeight: 600 }}>| 50% (Difusión aleatoria óptima)</span>
                <span>100% (Hashes invertidos)</span>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--txt-secondary)', lineHeight: 1.5, background: 'var(--clr-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                {textA === textB ? (
                  <span>Ambas entradas son exactamente iguales: 0 bits diferentes (100% determinista).</span>
                ) : comparison.diffPercentage >= 40 && comparison.diffPercentage <= 60 ? (
                  <span>
                    🎯 <strong>Efecto avalancha óptimo detectado:</strong> Con solo alterar la entrada, el{' '}
                    <strong>{comparison.diffPercentage}%</strong> de los bits del hash se invirtieron aleatoriamente.
                    Esto confirma la excelente dispersión de las 64 rondas de SHA-256.
                  </span>
                ) : (
                  <span>
                    El <strong>{comparison.diffPercentage}%</strong> de los bits del hash cambiaron ({comparison.diffBits} de 256).
                    La naturaleza pseudoaleatoria de SHA-256 genera fluctuaciones normales alrededor de la media del 50%.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visualizador interactivo de los 256 bits */}
          {comparison && (
            <div className="lh-bit-matrix-container">
              <div className="lh-bit-matrix-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Binary size={16} style={{ color: 'var(--clr-accent)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                    Matriz Visual de los 256 Bits de SHA-256 (32 bytes × 8 bits)
                  </span>
                </div>

                <div className="lh-bit-legend">
                  <div className="lh-legend-item">
                    <span className="lh-dot changed" />
                    <span>Bit diferente ({comparison.diffBits})</span>
                  </div>
                  <div className="lh-legend-item">
                    <span className="lh-dot same" />
                    <span>Bit idéntico ({comparison.sameBits})</span>
                  </div>
                </div>
              </div>

              <div className="lh-bits-grid">
                {comparison.byteDiffs.flatMap((b) => b.bits).map((bit) => (
                  <div
                    key={bit.bitIndex}
                    className={`lh-bit-cell ${bit.changed ? 'is-changed' : 'is-same'}`}
                    title={`Bit #${bit.bitIndex} | Hash A: ${bit.valA} | Hash B: ${bit.valB} | ${bit.changed ? 'CAMBIÓ' : 'IGUAL'}`}
                  >
                    {bit.changed ? '1' : '0'}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bit 0 (MSB del byte 0)</span>
                <span>Pasa el cursor sobre cualquier celda para inspeccionar el valor de ese bit en ambos hashes</span>
                <span>Bit 255 (LSB del byte 31)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 7 — DESAFÍO EDUCATIVO
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="reto">
        <div className="lm-section-head">
          <span className="lm-section-num">7</span>
          <h2>Desafío: El Reto del Cambio Mínimo</h2>
        </div>

        <div className="lh-challenge-card">
          <div className="lh-challenge-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} style={{ color: '#ec4899' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--txt-primary)' }}>
                  Misión: Modifica exactamente 1 carácter y analiza la avalancha
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                  Aplica el método científico: controla la variable de entrada y mide la divergencia de bits.
                </span>
              </div>
            </div>

            <span className={`badge ${challengeDiff.isExactlyOne ? 'badge-accent' : 'badge-warning'}`}>
              {challengeDiff.isExactlyOne ? '✓ Variación exacta de 1 carácter' : 'Ajusta tu edición'}
            </span>
          </div>

          {/* Entradas del desafío */}
          <div className="lh-dual-grid">
            <div className="lh-box" style={{ background: 'var(--clr-surface-2)' }}>
              <div className="lh-box-header">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                  1. Mensaje de Referencia
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Fijo</span>
              </div>
              <input
                type="text"
                className="form-input mono"
                value={challengeRefText}
                onChange={(e) => setChallengeRefText(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', wordBreak: 'break-all' }}>
                Hash Ref: <span className="mono text-accent">{challengeHashRef?.hex.slice(0, 32)}...</span>
              </div>
            </div>

            <div className="lh-box" style={{ background: 'var(--clr-surface-2)' }}>
              <div className="lh-box-header">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                  2. Tu Edición (Cambia solo 1 carácter)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#ec4899' }}>Tu turno</span>
              </div>
              <input
                type="text"
                className="form-input mono"
                value={challengeInputText}
                onChange={(e) => setChallengeInputText(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', wordBreak: 'break-all' }}>
                Tu Hash: <span className="mono" style={{ color: '#ec4899' }}>{challengeHashUser?.hex.slice(0, 32)}...</span>
              </div>
            </div>
          </div>

          {/* Retroalimentación basada en la acción real del estudiante */}
          <div className={`lh-challenge-feedback ${
            challengeDiff.isExactlyOne ? 'lh-feedback-success' : 'lh-feedback-warning'
          }`}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Diagnóstico de tu edición: </strong>
              {challengeDiff.description}
              {challengeDiff.isExactlyOne && challengeComparison && (
                <div style={{ marginTop: '6px' }}>
                  Con este cambio de un solo carácter, se invirtieron exactamente{' '}
                  <strong>{challengeComparison.diffBits} de los 256 bits</strong> ({challengeComparison.diffPercentage}%) en el hash resultante.
                </div>
              )}
            </div>
          </div>

          {/* Pregunta de reflexión con retroalimentación explicativa */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--txt-primary)' }}>
              Pregunta de afianzamiento: ¿Por qué un cambio tan diminuto altera aproximadamente la mitad de los bits del hash?
            </h4>

            <div className="lh-quiz-options">
              <button
                type="button"
                className={`lh-quiz-btn ${
                  challengeQuizAnswer === 'A' ? 'selected-correct' : ''
                }`}
                onClick={() => {
                  setChallengeQuizAnswer('A');
                  setMilestones((prev) => ({ ...prev, solvedChallenge: true }));
                }}
              >
                <span>
                  <strong>A)</strong> Por la difusión y confusión en 64 rondas lógicas donde cada bit interviene en rotaciones y sumas sucesivas.
                </span>
                {challengeQuizAnswer === 'A' && <CheckCircle2 size={16} />}
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${
                  challengeQuizAnswer === 'B' ? 'selected-wrong' : ''
                }`}
                onClick={() => setChallengeQuizAnswer('B')}
              >
                <span>
                  <strong>B)</strong> Porque el algoritmo utiliza una clave aleatoria secreta distinta cada vez que calcula un hash.
                </span>
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${
                  challengeQuizAnswer === 'C' ? 'selected-wrong' : ''
                }`}
                onClick={() => setChallengeQuizAnswer('C')}
              >
                <span>
                  <strong>C)</strong> Porque el hash intenta reconstruir la frase buscando sinónimos en un diccionario interno.
                </span>
              </button>
            </div>

            {challengeQuizAnswer === 'A' && (
              <div className="lh-challenge-feedback lh-feedback-success" style={{ marginTop: '12px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>¡Respuesta rigurosa y correcta!</strong> El algoritmo SHA-256 es 100% determinista (no usa claves aleatorias).
                  La enorme variación observada en tu prueba ({challengeComparison?.diffPercentage || '50'}%) es el resultado de la
                  acumulación de rotaciones circulares (ROTR), desplazamientos (SHR) y operaciones booleanas no lineales (Ch y Maj) a lo
                  largo de las 64 rondas de Merkle-Damgård.
                </div>
              </div>
            )}

            {challengeQuizAnswer === 'B' && (
              <div className="lh-challenge-feedback lh-feedback-warning" style={{ marginTop: '12px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Incorrecto:</strong> Las funciones hash son estrictamente deterministas y <strong>no utilizan claves</strong>.
                  Si probaras con la misma entrada mañana en otro ordenador, el resultado sería exactamente el mismo.
                </div>
              </div>
            )}

            {challengeQuizAnswer === 'C' && (
              <div className="lh-challenge-feedback lh-feedback-warning" style={{ marginTop: '12px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Incorrecto:</strong> SHA-256 opera sobre flujos de bits crudos (0 y 1); no tiene noción semántica, de lenguaje
                  ni diccionarios lingüísticos.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 8 — Conclusión y Siguiente Módulo
         ═══════════════════════════════════════════════════════════════ */}
      <div className="card lm-conclusion">
        <div className="lm-conclusion-content">
          <Sparkles size={20} style={{ color: 'var(--clr-accent)' }} />
          <div>
            <p>
              <strong>¡Excelente progreso!</strong> Has dominado las funciones hash criptográficas y comprobado el efecto avalancha con SHA-256 real.
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
              En el siguiente módulo combinaremos el <strong>par de claves asimétricas</strong> con las <strong>funciones hash</strong> para construir{' '}
              <strong>Firmas Digitales</strong> con autenticidad y no repudio.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/aprendizaje')}
          >
            <ArrowLeft size={16} /> Catálogo
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/aprendizaje/firmas')}
          >
            Continuar con Firmas Digitales <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
