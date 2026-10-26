import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Key,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  XCircle,
  RotateCcw,
  BookOpen,
  Radio,
  Share2,
} from 'lucide-react';
import { encryptText, decryptText } from '../services/api';
import { getGamifiedProgress, recordMissionCompletion } from '../utils/learningProgress';
import './Learning.css';

// ─── Browser Native Web Crypto AES-CBC Fallback (100% Real Cryptography) ────
async function fallbackAesEncrypt(plainText, keyStr) {
  const enc = new TextEncoder();
  const keyHash = await crypto.subtle.digest('SHA-256', enc.encode(keyStr));
  const key = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-CBC' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, enc.encode(plainText));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function fallbackAesDecrypt(cipherB64, keyStr) {
  const binary = atob(cipherB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const iv = bytes.slice(0, 16);
  const data = bytes.slice(16);
  const enc = new TextEncoder();
  const keyHash = await crypto.subtle.digest('SHA-256', enc.encode(keyStr));
  const key = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-CBC' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export default function LearningSymmetric() {
  const navigate = useNavigate();

  // ─── Lesson Navigation & Mode State ─────────────────────────────────────────
  // 1: Lección A, 2: Lección B, 3: Lección C, 4: VICTORY
  const [activeLesson, setActiveLesson] = useState(1);
  const [lessonMode, setLessonMode] = useState('practice'); // 'practice' | 'learn'

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [earnedXpNotice, setEarnedXpNotice] = useState(0);

  const [completedLessons, setCompletedLessons] = useState({
    1: false,
    2: false,
    3: false,
  });

  // ─── Lección A State: Una clave, dos operaciones ──────────────────────────
  const [plainMessageA, setPlainMessageA] = useState('OPERACION CRYPTIUM');
  const [secretKeyA, setSecretKeyA] = useState('clave-secreta-2026');
  const [showKeyA, setShowKeyA] = useState(false);
  const [cipherResultA, setCipherResultA] = useState('');
  const [decryptedResultA, setDecryptedResultA] = useState('');
  const [loadingEncryptA, setLoadingEncryptA] = useState(false);
  const [loadingDecryptA, setLoadingDecryptA] = useState(false);
  const [copiedCipherA, setCopiedCipherA] = useState(false);
  const [lessonAFeedback, setLessonAFeedback] = useState(null);

  const handlePerformEncryptA = async () => {
    if (!plainMessageA.trim() || !secretKeyA.trim()) return;
    setLoadingEncryptA(true);
    setDecryptedResultA('');

    try {
      const res = await encryptText(plainMessageA, secretKeyA);
      const text = res.encryptedText || res.data || '';
      setCipherResultA(text);
    } catch {
      try {
        const text = await fallbackAesEncrypt(plainMessageA, secretKeyA);
        setCipherResultA(text);
      } catch (err) {
        console.error('Error cifrado:', err);
      }
    } finally {
      setLoadingEncryptA(false);
    }
  };

  const handlePerformDecryptA = async () => {
    if (!cipherResultA.trim() || !secretKeyA.trim()) return;
    setLoadingDecryptA(true);

    try {
      const res = await decryptText(cipherResultA, secretKeyA);
      const text = res.decryptedText || res.data || '';
      setDecryptedResultA(text);
      setLessonAFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 1: true }));
    } catch {
      try {
        const text = await fallbackAesDecrypt(cipherResultA, secretKeyA);
        setDecryptedResultA(text);
        setLessonAFeedback('correct');
        setCompletedLessons((prev) => ({ ...prev, 1: true }));
      } catch (err) {
        console.error('Error descifrado:', err);
      }
    } finally {
      setLoadingDecryptA(false);
    }
  };

  const handleCopyCipherA = () => {
    if (!cipherResultA) return;
    navigator.clipboard.writeText(cipherResultA);
    setCopiedCipherA(true);
    setTimeout(() => setCopiedCipherA(false), 2000);
  };

  // ─── Lección B State: Recupera el mensaje (Clave errónea) ──────────────────
  const [testKeyB, setTestKeyB] = useState('clave-secreta-2026');
  const [decryptResultB, setDecryptResultB] = useState('');
  const [decryptStatusB, setDecryptStatusB] = useState(null); // 'success' | 'failure' | null
  const [decryptErrorDetailB, setDecryptErrorDetailB] = useState('');
  const [loadingDecryptB, setLoadingDecryptB] = useState(false);
  const [testedWrongKeyB, setTestedWrongKeyB] = useState(false);
  const [testedCorrectKeyB, setTestedCorrectKeyB] = useState(false);
  const [lessonBFeedback, setLessonBFeedback] = useState(null);

  const handlePerformDecryptB = async (keyToUse) => {
    const cipherToUse = cipherResultA || 'u7G3vL8m9Qz2W4x1K...';
    setLoadingDecryptB(true);
    setDecryptStatusB(null);
    setDecryptResultB('');
    setDecryptErrorDetailB('');

    const isKeyCorrect = keyToUse === secretKeyA;

    try {
      const res = await decryptText(cipherToUse, keyToUse);
      const text = res.decryptedText || res.data || '';
      setDecryptResultB(text);
      setDecryptStatusB('success');
      setTestedCorrectKeyB(true);
    } catch {
      try {
        const text = await fallbackAesDecrypt(cipherToUse, keyToUse);
        setDecryptResultB(text);
        setDecryptStatusB('success');
        setTestedCorrectKeyB(true);
      } catch (err) {
        setDecryptStatusB('failure');
        setDecryptResultB('');
        setDecryptErrorDetailB(
          'Fallo Criptográfico: Padding PKCS#7 inválido o datos corruptos. Los bloques descifrados con una clave incorrecta no coinciden con la estructura del algoritmo AES.'
        );
        if (!isKeyCorrect) {
          setTestedWrongKeyB(true);
        }
      }
    } finally {
      setLoadingDecryptB(false);
    }
  };

  const handleVerifyLessonB = () => {
    if (testedWrongKeyB && testedCorrectKeyB) {
      setLessonBFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 2: true }));
    } else {
      setLessonBFeedback('incomplete');
    }
  };

  // ─── Lección C State: El intercambio de claves (Interactivo) ───────────────
  const [selectedChannelMethodC, setSelectedChannelMethodC] = useState(null); // 'insecure' | 'secure_oob'
  const [eveInterceptedC, setEveInterceptedC] = useState(false);
  const [keyTransferStepC, setKeyTransferStepC] = useState('idle'); // 'idle' | 'transmitting' | 'done'
  const [lessonCFeedback, setLessonCFeedback] = useState(null);

  const handleSimulateKeyTransferC = (method) => {
    setSelectedChannelMethodC(method);
    setKeyTransferStepC('transmitting');
    setLessonCFeedback(null);

    setTimeout(() => {
      setKeyTransferStepC('done');
      if (method === 'insecure') {
        setEveInterceptedC(true);
      } else {
        setEveInterceptedC(false);
        setLessonCFeedback('correct');
        setCompletedLessons((prev) => ({ ...prev, 3: true }));
        // Record mission completion
        const { updated, earnedXp } = recordMissionCompletion('simetrica', 100);
        if (updated) setProgressState(updated);
        setEarnedXpNotice(earnedXp);
      }
    }, 600);
  };

  // ─── Progression Helpers ───────────────────────────────────────────────────
  const progressPercent =
    activeLesson === 4
      ? 100
      : Math.round(
          (Object.values(completedLessons).filter(Boolean).length / 3) * 100
        );

  const handleNextLesson = () => {
    if (activeLesson < 3) {
      setActiveLesson((prev) => prev + 1);
      setLessonMode('practice');
    } else {
      setActiveLesson(4); // Victory debrief
    }
  };

  const handleRestartMission = () => {
    setActiveLesson(1);
    setLessonMode('practice');
    setCipherResultA('');
    setDecryptedResultA('');
    setLessonAFeedback(null);
    setTestKeyB('clave-secreta-2026');
    setDecryptResultB('');
    setDecryptStatusB(null);
    setTestedWrongKeyB(false);
    setTestedCorrectKeyB(false);
    setLessonBFeedback(null);
    setSelectedChannelMethodC(null);
    setEveInterceptedC(false);
    setKeyTransferStepC('idle');
    setLessonCFeedback(null);
  };

  return (
    <div className="learning-page animate-fade-in">
      <div className="mission-game-shell">
        {/* ── Top HUD Navigation ── */}
        <div className="mission-top-hud">
          <div className="mission-hud-left">
            <button
              type="button"
              className="mission-exit-btn"
              onClick={() => navigate('/aprendizaje')}
              title="Volver a la ruta general"
            >
              <ArrowLeft size={16} /> Salir a la ruta
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
              Misión: La Llave Compartida
            </span>
          </div>

          <div className="mission-progress-container">
            <div className="mission-progress-meta">
              <span>{activeLesson === 4 ? '¡Completada!' : `Lección ${activeLesson} de 3`}</span>
              <span className="mono">{progressPercent}%</span>
            </div>
            <div className="mission-progress-bar-track">
              <div className="mission-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="mission-hud-badges">
            <div className="mission-xp-pill" title="Puntos de experiencia acumulados">
              <Zap size={14} /> <span className="mono">{progressState.xp || 0} XP</span>
            </div>
          </div>
        </div>

        {/* ── Stepper Header: Lecciones A, B, C ── */}
        {activeLesson <= 3 && (
          <div className="lesson-nav-stepper">
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 1 ? 'active' : ''} ${completedLessons[1] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(1); }}
            >
              {completedLessons[1] ? <Check size={14} /> : <span>A.</span>}
              <span>Una Clave, Dos Operaciones</span>
            </button>
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 2 ? 'active' : ''} ${completedLessons[2] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(2); }}
            >
              {completedLessons[2] ? <Check size={14} /> : <span>B.</span>}
              <span>Recupera el Mensaje</span>
            </button>
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 3 ? 'active' : ''} ${completedLessons[3] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(3); }}
            >
              {completedLessons[3] ? <Check size={14} /> : <span>C.</span>}
              <span>Intercambio de Claves</span>
            </button>
          </div>
        )}

        {/* ── Dual Mode Switch: APRENDER / PRACTICAR ── */}
        {activeLesson <= 3 && (
          <div className="lesson-mode-toggle-bar">
            <div className="lesson-mode-switch-group">
              <button
                type="button"
                className={`lesson-mode-btn learn ${lessonMode === 'learn' ? 'active' : ''}`}
                onClick={() => setLessonMode('learn')}
                title="Ver explicación breve y diagramas visuales"
              >
                <BookOpen size={16} />
                <span>APRENDER</span>
              </button>
              <button
                type="button"
                className={`lesson-mode-btn practice ${lessonMode === 'practice' ? 'active' : ''}`}
                onClick={() => setLessonMode('practice')}
                title="Misión interactiva con cifrado real"
              >
                <Zap size={16} />
                <span>PRACTICAR</span>
              </button>
            </div>

            <div className="lesson-status-indicator">
              {completedLessons[activeLesson] ? (
                <span style={{ color: '#10d46e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Lección dominada
                </span>
              ) : (
                <span style={{ color: 'var(--txt-muted)' }}>
                  {lessonMode === 'learn' ? 'Modo de estudio breve' : 'Reto práctico en curso'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN A: UNA CLAVE, DOS OPERACIONES
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 1 && (
          <div className="mission-exercise-card animate-fade-in">
            {lessonMode === 'learn' ? (
              /* ─── VISTA APRENDER ─── */
              <div className="learn-view-container">
                <div className="learn-hero-box">
                  <div className="mission-card-badge">
                    <BookOpen size={14} /> Lección A · Concepto Esencial
                  </div>
                  <h2 className="learn-hero-title">El Principio Simétrico</h2>
                  <p className="learn-hero-summary">
                    La criptografía simétrica utiliza <strong>la misma clave secreta compartida</strong> tanto para cifrar el mensaje original como para descifrarlo. Si ambas partes tienen la misma clave, la comunicación es privada y sumamente rápida.
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <Key size={16} /> Flujo Simétrico Bidireccional
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', overflowX: 'auto', padding: '12px 0' }}>
                    <div style={{ textAlign: 'center', minWidth: '90px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>1. Claro</span>
                      <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-accent)' }}>"HOLA"</div>
                    </div>
                    <span style={{ color: 'var(--txt-muted)' }}>➔</span>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>🔐 Clave Secreta</span>
                      <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cifrado AES</div>
                    </div>
                    <span style={{ color: 'var(--txt-muted)' }}>➔</span>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>2. Criptograma</span>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#10d46e' }}>8xK9...Base64</div>
                    </div>
                    <span style={{ color: 'var(--txt-muted)' }}>➔</span>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>🔓 Misma Clave</span>
                      <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Descifrado</div>
                    </div>
                    <span style={{ color: 'var(--txt-muted)' }}>➔</span>
                    <div style={{ textAlign: 'center', minWidth: '90px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>3. Recuperado</span>
                      <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-accent)' }}>"HOLA"</div>
                    </div>
                  </div>
                </div>

                <div className="learn-examples-grid">
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">1. Cifrado de Discos (BitLocker / LUKS)</h4>
                    <p className="learn-example-text">
                      Utilizan AES-XTS con una clave simétrica derivada de tu contraseña para proteger millones de archivos a velocidades de gigabytes por segundo.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">2. Túneles VPN y TLS</h4>
                    <p className="learn-example-text">
                      Todo el tráfico web HTTPS se cifra con AES-GCM o ChaCha20 simétrico una vez acordada la clave inicial.
                    </p>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Zap size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>¿Por qué se usa?</strong>
                    <p>
                      Es miles de veces más rápida que la criptografía asimétrica. En la práctica cifrarás y descifrarás un mensaje con el motor real.
                    </p>
                  </div>
                </div>

                <div className="learn-footer-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/aprendizaje')}>
                    ← Volver a la ruta
                  </button>
                  <button type="button" className="mission-action-btn next" onClick={() => setLessonMode('practice')}>
                    Practicar ahora <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ─── VISTA PRACTICAR ─── */
              <div className="practice-view-container">
                <div className="practice-instruction-bar">
                  <span>
                    <strong>Misión Práctica:</strong> Ingresa un texto y una clave. Cifra el mensaje con el motor AES real y luego descífralo para comprobar la simetría.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">1. Mensaje en Claro (Texto plano):</label>
                      <input
                        type="text"
                        className="form-input"
                        value={plainMessageA}
                        onChange={(e) => {
                          setPlainMessageA(e.target.value);
                          setCipherResultA('');
                          setDecryptedResultA('');
                          setLessonAFeedback(null);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ margin: 0 }}>2. Clave Secreta Compartida:</label>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '0 6px', fontSize: '0.75rem', height: 'auto' }}
                          onClick={() => setShowKeyA(!showKeyA)}
                        >
                          {showKeyA ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                      <input
                        type={showKeyA ? 'text' : 'password'}
                        className="form-input"
                        value={secretKeyA}
                        onChange={(e) => {
                          setSecretKeyA(e.target.value);
                          setCipherResultA('');
                          setDecryptedResultA('');
                          setLessonAFeedback(null);
                        }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Visual Pipeline */}
                  <div className="mission-pipeline">
                    <div className="mission-pipeline-node">
                      <div className={`mission-pipeline-icon ${plainMessageA ? 'active' : ''}`}>
                        <Radio size={18} />
                      </div>
                      <span className="mission-pipeline-label">Emisor</span>
                      <span className="mission-pipeline-value">"{plainMessageA}"</span>
                    </div>
                    <span className="mission-pipeline-arrow">➔</span>
                    <div className="mission-pipeline-node">
                      <div className={`mission-pipeline-icon ${cipherResultA ? 'active' : ''}`} style={{ color: '#f59e0b' }}>
                        <Cpu size={18} />
                      </div>
                      <span className="mission-pipeline-label">Motor AES</span>
                      <span className="mission-pipeline-value" style={{ color: '#f59e0b' }}>
                        {cipherResultA ? 'Cifrado OK' : 'Pendiente'}
                      </span>
                    </div>
                    <span className="mission-pipeline-arrow">➔</span>
                    <div className="mission-pipeline-node">
                      <div className={`mission-pipeline-icon ${cipherResultA ? 'active' : ''}`} style={{ color: '#10d46e' }}>
                        <Shield size={18} />
                      </div>
                      <span className="mission-pipeline-label">Criptograma</span>
                      <span className="mission-pipeline-value mono">
                        {cipherResultA ? `${cipherResultA.slice(0, 10)}...` : 'Sin datos'}
                      </span>
                    </div>
                    <span className="mission-pipeline-arrow">➔</span>
                    <div className="mission-pipeline-node">
                      <div className={`mission-pipeline-icon ${decryptedResultA ? 'active' : ''}`} style={{ color: 'var(--clr-accent)' }}>
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="mission-pipeline-label">Receptor</span>
                      <span className="mission-pipeline-value">
                        {decryptedResultA ? `"${decryptedResultA}"` : 'Esperando'}
                      </span>
                    </div>
                  </div>

                  {/* Action 1: Cifrar */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="mission-action-btn check"
                      onClick={handlePerformEncryptA}
                      disabled={loadingEncryptA || !plainMessageA.trim() || !secretKeyA.trim()}
                    >
                      {loadingEncryptA ? <RefreshCw size={16} className="spinner" /> : <Lock size={16} />}
                      Paso 1: Cifrar con AES
                    </button>
                  </div>

                  {/* Ciphertext Output Card */}
                  {cipherResultA && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>Criptograma Base64:</span>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={handleCopyCipherA}>
                          {copiedCipherA ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                          {copiedCipherA ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <div className="mono" style={{ fontSize: '0.88rem', wordBreak: 'break-all', color: '#10d46e' }}>
                        {cipherResultA}
                      </div>

                      {/* Action 2: Descifrar */}
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handlePerformDecryptA}
                          disabled={loadingDecryptA}
                        >
                          {loadingDecryptA ? <RefreshCw size={16} className="spinner" /> : <Unlock size={16} />}
                          Paso 2: Descifrar con la Misma Clave
                        </button>
                      </div>

                      {decryptedResultA && (
                        <div style={{ marginTop: '14px', textAlign: 'center', padding: '12px', background: 'rgba(16, 212, 110, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid #10d46e' }}>
                          <span style={{ fontSize: '0.8rem', color: '#10d46e', fontWeight: 700 }}>✓ Mensaje original recuperado nítidamente:</span>
                          <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                            "{decryptedResultA}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonAFeedback === 'correct' ? 'correct' : 'idle'}`}>
                  {lessonAFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Ciclo Simétrico Completado!</h4>
                          <p className="mission-feedback-text">
                            Has comprobado que la misma clave secreta invierte exactamente las rondas de AES y recupera la información.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={handleNextLesson}>
                        Siguiente Lección <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="mission-feedback-info">
                      <HelpCircle size={20} className="text-accent" />
                      <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                        Completa el cifrado (Paso 1) y el descifrado (Paso 2) para continuar.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN B: RECUPERA EL MENSAJE (CLAVE ERRÓNEA)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 2 && (
          <div className="mission-exercise-card animate-fade-in">
            {lessonMode === 'learn' ? (
              /* ─── VISTA APRENDER ─── */
              <div className="learn-view-container">
                <div className="learn-hero-box">
                  <div className="mission-card-badge">
                    <BookOpen size={14} /> Lección B · Concepto Esencial
                  </div>
                  <h2 className="learn-hero-title">Sensibilidad a la Clave Exacta</h2>
                  <p className="learn-hero-summary">
                    En la criptografía simétrica por bloques (como AES con padding PKCS#7), usar una clave distinta aunque solo difiera en un carácter produce bytes pseudoaleatorios que destruyen la estructura esperada del mensaje.
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <AlertTriangle size={16} /> ¿Qué ocurre con una clave incorrecta?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '14px', background: 'rgba(16, 212, 110, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid #10d46e' }}>
                      <strong style={{ color: '#10d46e' }}>Con Clave Correcta</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--txt-primary)' }}>
                        Las operaciones matemáticas de sustitución y permutación se revierten limpiamente y el padding PKCS#7 se valida.
                      </p>
                    </div>
                    <div style={{ padding: '14px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid #f43f5e' }}>
                      <strong style={{ color: '#f43f5e' }}>Con Clave Incorrecta</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--txt-primary)' }}>
                        Se produce ruido binario sin sentido y la verificación de padding falla, lanzando una <strong>excepción criptográfica</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Shield size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>Comportamiento Real</strong>
                    <p>
                      El algoritmo no "adivina" ni entrega texto casi legible: o se tiene la clave exacta o no se recupera nada.
                    </p>
                  </div>
                </div>

                <div className="learn-footer-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setLessonMode('practice')}>
                    Practicar ahora <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ─── VISTA PRACTICAR ─── */
              <div className="practice-view-container">
                <div className="practice-instruction-bar">
                  <span>
                    <strong>Misión Práctica:</strong> Prueba descifrar el criptograma usando tanto una <strong>clave errónea</strong> como la <strong>clave correcta</strong> para observar el comportamiento real del motor criptográfico.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Quick test buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`btn ${testKeyB === 'clave-falsa-atacante' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setTestKeyB('clave-falsa-atacante');
                        setDecryptStatusB(null);
                      }}
                    >
                      <Key size={14} /> Seleccionar Clave Errónea ("clave-falsa-atacante")
                    </button>
                    <button
                      type="button"
                      className={`btn ${testKeyB === secretKeyA ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setTestKeyB(secretKeyA);
                        setDecryptStatusB(null);
                      }}
                    >
                      <Key size={14} /> Seleccionar Clave Correcta ("{secretKeyA}")
                    </button>
                  </div>

                  {/* Input field */}
                  <div className="form-group">
                    <label className="form-label">Clave para ejecutar el descifrado:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={testKeyB}
                      onChange={(e) => {
                        setTestKeyB(e.target.value);
                        setDecryptStatusB(null);
                      }}
                    />
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    className="mission-action-btn check"
                    onClick={() => handlePerformDecryptB(testKeyB)}
                    disabled={loadingDecryptB || !testKeyB.trim()}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {loadingDecryptB ? <RefreshCw size={16} className="spinner" /> : <Unlock size={16} />}
                    Ejecutar Descifrado con Clave Seleccionada
                  </button>

                  {/* Real outputs */}
                  {decryptStatusB === 'success' && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(16, 212, 110, 0.12)', border: '1px solid #10d46e', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <CheckCircle2 size={26} style={{ color: '#10d46e', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#10d46e' }}>¡Descifrado Exitoso!</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--txt-primary)' }}>
                          Texto plano recuperado: <span className="mono">"{decryptResultB}"</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {decryptStatusB === 'failure' && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <XCircle size={26} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: '#f43f5e' }}>Excepción Criptográfica Real</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--txt-primary)', lineHeight: '1.45' }}>
                          {decryptErrorDetailB}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Experiment checklist */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem', marginTop: '8px' }}>
                    <span style={{ color: testedWrongKeyB ? '#10d46e' : 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {testedWrongKeyB ? <Check size={14} /> : '○'} 1. Comprobar fallo con clave errónea
                    </span>
                    <span style={{ color: testedCorrectKeyB ? '#10d46e' : 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {testedCorrectKeyB ? <Check size={14} /> : '○'} 2. Comprobar éxito con clave correcta
                    </span>
                  </div>
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonBFeedback === 'correct' ? 'correct' : lessonBFeedback === 'incomplete' ? 'incorrect' : 'idle'}`}>
                  {lessonBFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Prueba Experimental Completada!</h4>
                          <p className="mission-feedback-text">
                            Has presenciado el comportamiento estricto del algoritmo: sin la clave exacta, el descifrado falla de raíz.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={handleNextLesson}>
                        Siguiente Lección <ArrowRight size={16} />
                      </button>
                    </>
                  ) : lessonBFeedback === 'incomplete' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><AlertTriangle size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">Faltan pruebas</h4>
                          <p className="mission-feedback-text">
                            Debes probar tanto la clave errónea como la clave correcta para validar la lección.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn retry" onClick={() => setLessonBFeedback(null)}>
                        Seguir probando
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mission-feedback-info">
                        <HelpCircle size={20} className="text-accent" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                          Ejecuta ambas pruebas y presiona el botón para verificar.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mission-action-btn check"
                        onClick={handleVerifyLessonB}
                      >
                        Validar Experimento
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN C: EL INTERCAMBIO DE CLAVES
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 3 && (
          <div className="mission-exercise-card animate-fade-in">
            {lessonMode === 'learn' ? (
              /* ─── VISTA APRENDER ─── */
              <div className="learn-view-container">
                <div className="learn-hero-box">
                  <div className="mission-card-badge">
                    <BookOpen size={14} /> Lección C · Concepto Esencial
                  </div>
                  <h2 className="learn-hero-title">El Dilema del Intercambio</h2>
                  <p className="learn-hero-summary">
                    Si Alice y Bob nunca se han reunido en persona y necesitan comunicarse por internet mediante AES, ¿cómo le hace llegar Alice la clave secreta a Bob sin que un atacante en la red la intercepte?
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <Share2 size={16} /> La Paradoja de la Clave Compartida
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--txt-primary)', lineHeight: '1.6', margin: 0 }}>
                    Para enviar un mensaje confidencial necesitas una clave secreta.
                    Pero para enviar la clave secreta... ¡necesitas un canal confidencial previo!
                    Este dilema histórico impulsó la creación de la <strong>Criptografía Asimétrica (Clave Pública)</strong>.
                  </p>
                </div>

                <div className="learn-examples-grid">
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">La Solución Histórica Antigua</h4>
                    <p className="learn-example-text">
                      Bancos y gobiernos enviaban oficiales de seguridad armados con maletines encadenados a su muñeca para transportar cuadernos de claves simétricas.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">La Solución Moderna (Diffie-Hellman)</h4>
                    <p className="learn-example-text">
                      Matemáticas con funciones trampa que permiten acordar un secreto compartido a través de un canal abierto sin que el espía pueda deducirlo.
                    </p>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Zap size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>Conexión con el Siguiente Módulo</strong>
                    <p>
                      Comprender este límite es el paso natural hacia la Etapa 3 (Criptografía Asimétrica y RSA).
                    </p>
                  </div>
                </div>

                <div className="learn-footer-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setLessonMode('practice')}>
                    Practicar ahora <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ─── VISTA PRACTICAR (SIMULADOR DE INTERCAMBIO, NO ABCD) ─── */
              <div className="practice-view-container">
                <div className="practice-instruction-bar">
                  <span>
                    <strong>Misión Práctica:</strong> Simula la transmisión de la clave secreta por el canal público para observar cómo actúa el espía Eve y descubre por qué la simetría requiere un canal protegido.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Visual Channel Network */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '24px 16px', background: 'rgba(10, 15, 26, 0.8)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                    {/* Node Alice */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '1.2rem', fontWeight: 800 }}>
                        A
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Alice (Emisor)</span>
                    </div>

                    {/* Channel Wire */}
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Eve listening node */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-42px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '6px 14px',
                          background: eveInterceptedC ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                          border: eveInterceptedC ? '1px solid #f43f5e' : '1px dashed rgba(255,255,255,0.2)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: eveInterceptedC ? '#f43f5e' : 'var(--txt-muted)' }}>
                          🕵️ Eve (Espía en Canal)
                        </span>
                        <span style={{ fontSize: '0.7rem', color: eveInterceptedC ? '#f43f5e' : 'var(--txt-muted)' }}>
                          {eveInterceptedC ? '¡CLAVE CAPTURADA!' : 'Escuchando tráfico...'}
                        </span>
                      </div>
                    </div>

                    {/* Node Bob */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#10d46e', color: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '1.2rem', fontWeight: 800 }}>
                        B
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Bob (Receptor)</span>
                    </div>
                  </div>

                  {/* Interactive Action Triggers */}
                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`btn ${selectedChannelMethodC === 'insecure' ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleSimulateKeyTransferC('insecure')}
                    >
                      <Share2 size={16} /> 1. Transmitir Clave en Claro por Internet
                    </button>
                    <button
                      type="button"
                      className={`btn ${selectedChannelMethodC === 'secure_oob' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleSimulateKeyTransferC('secure_oob')}
                    >
                      <Shield size={16} /> 2. Acordar Clave por Canal Protegido
                    </button>
                  </div>

                  {/* Dynamic Simulation Outcome */}
                  {selectedChannelMethodC === 'insecure' && keyTransferStepC === 'done' && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)' }}>
                      <strong style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircle size={18} /> Vulnerabilidad Confirmada: Interceptación Total
                      </strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--txt-primary)', lineHeight: '1.5' }}>
                        Al enviar la clave secreta por el canal público sin protección, Eve la copió de inmediato.
                        A partir de ahora, todo mensaje cifrado con esa clave podrá ser descifrado por Eve.
                        ¡Ahora prueba la opción 2 para resolver el reto!
                      </p>
                    </div>
                  )}

                  {selectedChannelMethodC === 'secure_oob' && keyTransferStepC === 'done' && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(16, 212, 110, 0.12)', border: '1px solid #10d46e', borderRadius: 'var(--radius-md)' }}>
                      <strong style={{ color: '#10d46e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} /> Comunicación Segura Garantizada
                      </strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--txt-primary)', lineHeight: '1.5' }}>
                        Al usar un canal protegido (o funciones de intercambio matemático Diffie-Hellman), Eve solo ve ruido.
                        Bob tiene la clave y la confidencialidad es absoluta.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonCFeedback === 'correct' ? 'correct' : 'idle'}`}>
                  {lessonCFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Misión 2 Completada con Éxito!</h4>
                          <p className="mission-feedback-text">
                            Has dominado el funcionamiento simétrico y comprendido por qué el intercambio seguro de claves es el gran reto de la seguridad.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={() => setActiveLesson(4)}>
                        Ver Debrief y Recompensas <Sparkles size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="mission-feedback-info">
                      <HelpCircle size={20} className="text-accent" />
                      <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                        Experimenta con los métodos de transmisión para completar la lección.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            PANTALLA DE VICTORIA (FINAL DE MISIÓN 2)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 4 && (
          <div className="mission-victory-card animate-fade-in">
            <div className="mission-victory-badge">
              <Sparkles size={40} style={{ color: '#10d46e' }} />
            </div>

            <h2 className="mission-victory-title">¡MISIÓN 2 CUMPLIDA: LA LLAVE COMPARTIDA!</h2>
            <p className="mission-victory-subtitle">
              Has experimentado la combinación de <strong>APRENDER</strong> y <strong>PRACTICAR</strong> con algoritmos reales como AES.
            </p>

            <div className="mission-stats-strip">
              <div className="mission-stat-box">
                <span className="mission-stat-val">3 / 3</span>
                <span className="mission-stat-lbl">Lecciones Prácticas</span>
              </div>
              <div className="mission-stat-box">
                <span className="mission-stat-val" style={{ color: '#fbbf24' }}>
                  +{earnedXpNotice > 0 ? earnedXpNotice : 100} XP
                </span>
                <span className="mission-stat-lbl">Experiencia Obtenida</span>
              </div>
              <div className="mission-stat-box">
                <span className="mission-stat-val" style={{ color: '#10d46e' }}>100%</span>
                <span className="mission-stat-lbl">Módulo 2 Dominado</span>
              </div>
            </div>

            <div className="mission-takeaways-box">
              <div className="mission-takeaways-title">
                <Shield size={16} /> Lo que dominaste en esta misión
              </div>
              <ul className="mission-takeaways-list">
                <li>
                  <span className="bullet">✓</span>
                  <span>
                    <strong>Simetría Estricta:</strong> Una sola clave compartida gobierna el cifrado y el descifrado en ambas direcciones.
                  </span>
                </li>
                <li>
                  <span className="bullet">✓</span>
                  <span>
                    <strong>Sensibilidad Criptográfica:</strong> Una clave errónea en AES con padding PKCS#7 falla de raíz y genera una excepción real.
                  </span>
                </li>
                <li>
                  <span className="bullet">✓</span>
                  <span>
                    <strong>El Reto del Intercambio:</strong> Transmitir claves simétricas por canales abiertos las expone ante atacantes, requiriendo el salto a la Criptografía Asimétrica.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mission-victory-actions">
              <button type="button" className="btn btn-secondary" onClick={handleRestartMission}>
                <RotateCcw size={16} /> Repetir misión
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/aprendizaje')}>
                Volver a la ruta
              </button>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/aprendizaje/asimetrica')}>
                Explorar Etapa 3: Criptografía Asimétrica <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
