import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Key,
  Shield,
  SearchCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Unlock,
  Sliders,
  RotateCcw,
  Zap,
  Check,
  XCircle,
  Copy,
  BookOpen,
  Eye,
  AlertTriangle,
  Radio,
  FileCheck,
} from 'lucide-react';
import { getGamifiedProgress, recordMissionCompletion } from '../utils/learningProgress';
import './Learning.css';

// ─── Caesar math helpers (Real cryptographic computations) ───────────────────
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function shiftChar(char, shift) {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + ((shift % 26) + 26) % 26) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + ((shift % 26) + 26) % 26) % 26) + 97);
  }
  return char;
}

function caesarTransform(text, shift) {
  return text.split('').map((c) => shiftChar(c, shift)).join('');
}

export default function LearningFundamentos() {
  const navigate = useNavigate();

  // ─── Lesson Navigation & Mode State ─────────────────────────────────────────
  // Active lesson: 1 = 'A', 2 = 'B', 3 = 'C', 4 = 'D', 5 = 'VICTORY'
  const [activeLesson, setActiveLesson] = useState(1);
  // Mode for each lesson: 'practice' | 'learn'
  const [lessonMode, setLessonMode] = useState('practice');

  // Stored XP & progress
  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [earnedXpNotice, setEarnedXpNotice] = useState(0);

  // Completed lessons checklist within this mission
  const [completedLessons, setCompletedLessons] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // ─── Lección A State: Tu primer mensaje cifrado ────────────────────────────
  const [lessonAMessage, setLessonAMessage] = useState('HOLA');
  const [lessonAShift, setLessonAShift] = useState(3);
  // Interactive chips assembly: user places ciphertext chips into slots
  const targetCipherA = useMemo(() => caesarTransform(lessonAMessage, lessonAShift), [lessonAMessage, lessonAShift]);
  const [assembledSlotsA, setAssembledSlotsA] = useState([]);
  const [lessonAFeedback, setLessonAFeedback] = useState(null);
  const [isDecryptedDemoA, setIsDecryptedDemoA] = useState(false);

  // Available chips for assembly (shuffled target letters + a couple random distractors)
  const availableChipsA = useMemo(() => {
    const letters = targetCipherA.split('');
    return letters.map((l, idx) => ({ id: `${l}-${idx}`, letter: l }));
  }, [targetCipherA]);

  const handleAddChipA = (chip) => {
    if (assembledSlotsA.length < lessonAMessage.length) {
      setAssembledSlotsA((prev) => [...prev, chip]);
      setLessonAFeedback(null);
    }
  };

  const handleRemoveSlotA = (index) => {
    setAssembledSlotsA((prev) => prev.filter((_, i) => i !== index));
    setLessonAFeedback(null);
  };

  const handleVerifyAssemblyA = () => {
    const currentText = assembledSlotsA.map((s) => s.letter).join('');
    if (currentText.toUpperCase() === targetCipherA.toUpperCase()) {
      setLessonAFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 1: true }));
    } else {
      setLessonAFeedback('incorrect');
    }
  };

  // ─── Lección B State: Descifra el mensaje ──────────────────────────────────
  const interceptedCipherB = 'KROD PXQGR';
  const targetPlainB = 'HOLA MUNDO';
  const [lessonBShift, setLessonBShift] = useState(0);
  const [reconstructedTextB, setReconstructedTextB] = useState('');
  const [lessonBFeedback, setLessonBFeedback] = useState(null);

  const liveDecryptedB = useMemo(() => {
    return caesarTransform(interceptedCipherB, 26 - lessonBShift);
  }, [interceptedCipherB, lessonBShift]);

  const handleVerifyDecryptionB = () => {
    const isShiftSolved = liveDecryptedB.toUpperCase() === targetPlainB;
    const isTextSolved = reconstructedTextB.trim().toUpperCase() === targetPlainB;

    if (isShiftSolved || isTextSolved) {
      setLessonBFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 2: true }));
    } else {
      setLessonBFeedback('incorrect');
    }
  };

  // ─── Lección C State: Encuentra la clave (Fuerza bruta) ────────────────────
  const cipherC = 'PHQVDMH VHFUHWR'; // "MENSAJE SECRETO" with k=3
  const targetPlainC = 'MENSAJE SECRETO';
  const [selectedShiftC, setSelectedShiftC] = useState(null);
  const [lessonCFeedback, setLessonCFeedback] = useState(null);

  const bruteForceListC = useMemo(() => {
    const list = [];
    for (let k = 0; k < 26; k++) {
      const dec = caesarTransform(cipherC, 26 - k);
      list.push({ shift: k, result: dec, isTarget: dec.toUpperCase() === targetPlainC });
    }
    return list;
  }, [cipherC, targetPlainC]);

  const handleVerifyShiftC = () => {
    if (selectedShiftC === 3) {
      setLessonCFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 3: true }));
    } else {
      setLessonCFeedback('incorrect');
    }
  };

  // ─── Lección D State: Protege el mensaje (Acciones CIA) ───────────────────
  // Step 1: Confidentiality action (Apply encryption shield)
  const [isShieldApplied, setIsShieldApplied] = useState(false);
  // Step 2: Integrity action (Detect tampered transaction)
  const [tamperedTransaction, setTamperedTransaction] = useState({
    original: 'Transferir $500 USD a Bob',
    received: 'Transferir $900 USD a Eve',
    verified: false,
    tamperedDetected: null,
  });
  // Step 3: Authenticity action (Verify digital signature token)
  const [signatureChecked, setSignatureChecked] = useState(false);
  const [lessonDFeedback, setLessonDFeedback] = useState(null);

  const handleVerifyIntegrityD = (isTampered) => {
    if (isTampered) {
      setTamperedTransaction((prev) => ({ ...prev, verified: true, tamperedDetected: true }));
    } else {
      setTamperedTransaction((prev) => ({ ...prev, verified: true, tamperedDetected: false }));
    }
  };

  const handleCheckAllActionsD = () => {
    if (isShieldApplied && tamperedTransaction.tamperedDetected && signatureChecked) {
      setLessonDFeedback('correct');
      setCompletedLessons((prev) => ({ ...prev, 4: true }));
      // Finalize mission and record XP
      const { updated, earnedXp } = recordMissionCompletion('fundamentos', 100);
      if (updated) setProgressState(updated);
      setEarnedXpNotice(earnedXp);
    } else {
      setLessonDFeedback('incomplete');
    }
  };

  // ─── Progression Helpers ───────────────────────────────────────────────────
  const progressPercent =
    activeLesson === 5
      ? 100
      : Math.round(
          (Object.values(completedLessons).filter(Boolean).length / 4) * 100
        );

  const handleNextLesson = () => {
    if (activeLesson < 4) {
      setActiveLesson((prev) => prev + 1);
      setLessonMode('practice');
    } else {
      setActiveLesson(5); // Victory debrief
    }
  };

  const handleRestartMission = () => {
    setActiveLesson(1);
    setLessonMode('practice');
    setAssembledSlotsA([]);
    setLessonAFeedback(null);
    setIsDecryptedDemoA(false);
    setLessonBShift(0);
    setReconstructedTextB('');
    setLessonBFeedback(null);
    setSelectedShiftC(null);
    setLessonCFeedback(null);
    setIsShieldApplied(false);
    setTamperedTransaction({
      original: 'Transferir $500 USD a Bob',
      received: 'Transferir $900 USD a Eve',
      verified: false,
      tamperedDetected: null,
    });
    setSignatureChecked(false);
    setLessonDFeedback(null);
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
              Operación: Mensaje Secreto
            </span>
          </div>

          <div className="mission-progress-container">
            <div className="mission-progress-meta">
              <span>{activeLesson === 5 ? '¡Completada!' : `Lección ${activeLesson} de 4`}</span>
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

        {/* ── Stepper Header: Lecciones A, B, C, D ── */}
        {activeLesson <= 4 && (
          <div className="lesson-nav-stepper">
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 1 ? 'active' : ''} ${completedLessons[1] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(1); }}
            >
              {completedLessons[1] ? <Check size={14} /> : <span>A.</span>}
              <span>Primer Cifrado</span>
            </button>
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 2 ? 'active' : ''} ${completedLessons[2] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(2); }}
            >
              {completedLessons[2] ? <Check size={14} /> : <span>B.</span>}
              <span>Descifra</span>
            </button>
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 3 ? 'active' : ''} ${completedLessons[3] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(3); }}
            >
              {completedLessons[3] ? <Check size={14} /> : <span>C.</span>}
              <span>Encuentra Clave</span>
            </button>
            <button
              type="button"
              className={`lesson-step-tab ${activeLesson === 4 ? 'active' : ''} ${completedLessons[4] ? 'completed' : ''}`}
              onClick={() => { setActiveLesson(4); }}
            >
              {completedLessons[4] ? <Check size={14} /> : <span>D.</span>}
              <span>Tríada CIA</span>
            </button>
          </div>
        )}

        {/* ── Dual Mode Switch: APRENDER / PRACTICAR ── */}
        {activeLesson <= 4 && (
          <div className="lesson-mode-toggle-bar">
            <div className="lesson-mode-switch-group">
              <button
                type="button"
                className={`lesson-mode-btn learn ${lessonMode === 'learn' ? 'active' : ''}`}
                onClick={() => setLessonMode('learn')}
                title="Ver explicación breve y ejemplos visuales"
              >
                <BookOpen size={16} />
                <span>APRENDER</span>
              </button>
              <button
                type="button"
                className={`lesson-mode-btn practice ${lessonMode === 'practice' ? 'active' : ''}`}
                onClick={() => setLessonMode('practice')}
                title="Misión práctica interactiva"
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
            LECCIÓN A: TU PRIMER MENSAJE CIFRADO
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
                  <h2 className="learn-hero-title">¿Cómo funciona un cifrado?</h2>
                  <p className="learn-hero-summary">
                    Un <strong>algoritmo de cifrado</strong> transforma un mensaje legible (texto plano)
                    en un criptograma ininteligible mediante un procedimiento matemático y un parámetro secreto: <strong>la clave</strong>.
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <Sliders size={16} /> Ejemplo Visual: Desplazamiento César (+3)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>Texto Plano</span>
                      <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--clr-accent)' }}>HOLA</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f59e0b' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+3 letras</span>
                      <span style={{ fontSize: '1.4rem' }}>➔</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>Texto Cifrado</span>
                      <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10d46e' }}>KROD</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--txt-secondary)', textAlign: 'center' }}>
                    Cada letra avanza 3 posiciones: H(+3)→K, O(+3)→R, L(+3)→O, A(+3)→D. Regla: <code className="mono">C = (P + k) mod 26</code>.
                  </div>
                </div>

                <div className="learn-examples-grid">
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">1. Cifrado Militar Clásico</h4>
                    <p className="learn-example-text">
                      Julio César usaba un desplazamiento de 3 posiciones para que los mensajeros romanos no revelaran órdenes si eran capturados.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">2. ROT13 en Informática</h4>
                    <p className="learn-example-text">
                      Variante con desplazamiento 13 usada históricamente en foros de software para ocultar soluciones o spoilers temporalmente.
                    </p>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Shield size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>¿Para qué sirve?</strong>
                    <p>
                      Evita que ojos curiosos o espías lean información en tránsito. En la práctica siguiente armarás tu propio criptograma letra por letra.
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
                    <strong>Misión Práctica:</strong> Cambia el desplazamiento, observa cómo gira cada letra y <strong>construye el resultado cifrado</strong> seleccionando las fichas.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Controls: message & shift */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Mensaje a Cifrar:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={lessonAMessage}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
                          setLessonAMessage(val || 'HOLA');
                          setAssembledSlotsA([]);
                          setLessonAFeedback(null);
                        }}
                        maxLength={6}
                      />
                    </div>
                    <div className="shift-control-box">
                      <div className="shift-header">
                        <span className="form-label" style={{ margin: 0 }}>Desplazamiento (k):</span>
                        <span className="shift-value-badge">+{lessonAShift}</span>
                      </div>
                      <div className="shift-slider-row">
                        <button type="button" className="shift-step-btn" onClick={() => { setLessonAShift((p) => Math.max(1, p - 1)); setAssembledSlotsA([]); }}>-</button>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={lessonAShift}
                          onChange={(e) => { setLessonAShift(Number(e.target.value)); setAssembledSlotsA([]); }}
                          className="shift-slider"
                        />
                        <button type="button" className="shift-step-btn" onClick={() => { setLessonAShift((p) => Math.min(15, p + 1)); setAssembledSlotsA([]); }}>+</button>
                      </div>
                    </div>
                  </div>

                  {/* Visual letter shift helper track */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
                    {lessonAMessage.split('').map((char, idx) => (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--txt-muted)' }}>P={char}</span>
                        <div style={{ color: 'var(--clr-accent)', fontWeight: 800, fontSize: '0.9rem' }}>↓ (+{lessonAShift})</div>
                        <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10d46e' }}>
                          {shiftChar(char, lessonAShift)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Target Slots for Assembly */}
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', display: 'block', textAlign: 'center', marginBottom: '8px' }}>
                      Haz clic en las fichas para armar el texto cifrado ({assembledSlotsA.length}/{lessonAMessage.length}):
                    </span>
                    <div className="assembly-slots-row">
                      {lessonAMessage.split('').map((char, idx) => {
                        const filled = assembledSlotsA[idx];
                        const isCorrectLetter = filled?.letter === shiftChar(char, lessonAShift);
                        return (
                          <div
                            key={idx}
                            className={`assembly-slot ${filled ? 'filled' : ''} ${lessonAFeedback === 'correct' && isCorrectLetter ? 'correct' : ''}`}
                            onClick={() => handleRemoveSlotA(idx)}
                            style={{ cursor: filled ? 'pointer' : 'default' }}
                            title={filled ? 'Clic para retirar' : ''}
                          >
                            <span className="assembly-slot-orig">{char}</span>
                            <span>{filled ? filled.letter : '?'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chips Pool */}
                  <div className="assembly-chips-pool">
                    {availableChipsA.map((chip, idx) => {
                      const isUsed = assembledSlotsA.some((s) => s.id === chip.id);
                      return (
                        <button
                          key={idx}
                          type="button"
                          className="assembly-chip-btn"
                          disabled={isUsed || assembledSlotsA.length >= lessonAMessage.length}
                          onClick={() => handleAddChipA(chip)}
                        >
                          {chip.letter}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setAssembledSlotsA([])}
                      disabled={assembledSlotsA.length === 0}
                    >
                      Limpiar
                    </button>
                  </div>

                  {/* Decrypt verification option */}
                  {lessonAFeedback === 'correct' && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(16, 212, 110, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid #10d46e' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <strong style={{ color: '#10d46e' }}>¡Criptograma completado correctamente!</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--txt-primary)' }}>
                            Ahora aplica la operación inversa para descifrar: <code className="mono">({targetCipherA} - {lessonAShift}) mod 26</code>.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-accent"
                          onClick={() => setIsDecryptedDemoA(!isDecryptedDemoA)}
                        >
                          <Unlock size={14} /> {isDecryptedDemoA ? 'Ocultar descifrado' : 'Probar descifrado'}
                        </button>
                      </div>
                      {isDecryptedDemoA && (
                        <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 800, color: '#10d46e', textAlign: 'center' }} className="mono animate-fade-in">
                          Texto recuperado: "{lessonAMessage}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonAFeedback === 'correct' ? 'correct' : lessonAFeedback === 'incorrect' ? 'incorrect' : 'idle'}`}>
                  {lessonAFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Desafío A Superado!</h4>
                          <p className="mission-feedback-text">
                            Has generado y verificado el cifrado de cada letra. Cada símbolo rotó exactamente <strong>k={lessonAShift}</strong> posiciones.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={handleNextLesson}>
                        Siguiente Lección <ArrowRight size={16} />
                      </button>
                    </>
                  ) : lessonAFeedback === 'incorrect' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><XCircle size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">Las fichas no coinciden</h4>
                          <p className="mission-feedback-text">
                            Revisa el orden o el valor de las letras desplazadas. Puedes hacer clic en una casilla para retirar una ficha.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn retry" onClick={() => setLessonAFeedback(null)}>
                        Reintentar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mission-feedback-info">
                        <HelpCircle size={20} className="text-accent" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                          Coloca todas las fichas en orden para verificar tu criptograma.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mission-action-btn check"
                        disabled={assembledSlotsA.length < lessonAMessage.length}
                        onClick={handleVerifyAssemblyA}
                      >
                        Comprobar Criptograma
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN B: DESCIFRA EL MENSAJE
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
                  <h2 className="learn-hero-title">¿Qué significa descifrar?</h2>
                  <p className="learn-hero-summary">
                    Descifrar es el proceso de <strong>recuperar el texto plano legible</strong> a partir de un criptograma.
                    Requiere aplicar la transformación inversa utilizando la misma clave que gobernó el cifrado.
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <Unlock size={16} /> El Ciclo Completo de Transformación
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Criptograma</span>
                      <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>KROD</div>
                    </div>
                    <div style={{ color: 'var(--clr-accent)', fontWeight: 800 }}>➔ Operación Inversa (-3) ➔</div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Texto Plano</span>
                      <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10d46e' }}>HOLA</div>
                    </div>
                  </div>
                  <p style={{ margin: '14px 0 0 0', fontSize: '0.85rem', color: 'var(--txt-secondary)', textAlign: 'center' }}>
                    En la rotación monoalfabética: <code className="mono">P = (C - k) mod 26</code>.
                  </p>
                </div>

                <div className="learn-examples-grid">
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">1. Descifrado con Clave Correcta</h4>
                    <p className="learn-example-text">
                      Al restar exactamente el desplazamiento usado, todas las posiciones se alinean y el lenguaje natural emerge nítidamente.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">2. Descifrado con Clave Errónea</h4>
                    <p className="learn-example-text">
                      Si pruebas un desplazamiento equivocado (ej. k=2 o k=5), obtendrás palabras incoherentes como "IPMB" o "FMIY".
                    </p>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Shield size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>¿Para qué sirve?</strong>
                    <p>
                      Permite al destinatario legítimo leer la orden o comunicación. En la práctica ajustarás el desplazamiento hasta descifrar un mensaje interceptado.
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
                    <strong>Misión Práctica:</strong> Interceptaste <code className="mono">"{interceptedCipherB}"</code>.
                    Mueve el control de desplazamiento hasta que el texto en pantalla sea legible y confirma el mensaje.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Slider Control */}
                  <div className="shift-control-box">
                    <div className="shift-header">
                      <span className="form-label" style={{ margin: 0 }}>Prueba Desplazamiento inverso (k):</span>
                      <span className="shift-value-badge" style={{ color: liveDecryptedB.toUpperCase() === targetPlainB ? '#10d46e' : 'var(--clr-accent)' }}>
                        k = {lessonBShift}
                      </span>
                    </div>
                    <div className="shift-slider-row">
                      <button type="button" className="shift-step-btn" onClick={() => setLessonBShift((p) => Math.max(0, p - 1))}>-</button>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={lessonBShift}
                        onChange={(e) => setLessonBShift(Number(e.target.value))}
                        className="shift-slider"
                      />
                      <button type="button" className="shift-step-btn" onClick={() => setLessonBShift((p) => Math.min(25, p + 1))}>+</button>
                    </div>
                  </div>

                  {/* Real-time Decryption Canvas */}
                  <div style={{ background: 'rgba(10, 15, 26, 0.95)', border: liveDecryptedB.toUpperCase() === targetPlainB ? '2px solid #10d46e' : '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>
                      Resultado del descifrado con k = {lessonBShift}:
                    </span>
                    <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, margin: '10px 0', letterSpacing: '0.08em', color: liveDecryptedB.toUpperCase() === targetPlainB ? '#10d46e' : 'var(--txt-primary)' }}>
                      {liveDecryptedB}
                    </div>
                    {liveDecryptedB.toUpperCase() === targetPlainB ? (
                      <span className="badge badge-success" style={{ gap: '6px' }}>
                        <CheckCircle2 size={14} /> ¡Texto en claro identificado!
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                        Continúa rotando hasta encontrar palabras legibles en español
                      </span>
                    )}
                  </div>

                  {/* User confirmation text box */}
                  <div className="form-group">
                    <label className="form-label">Escribe el mensaje recuperado para validarlo:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Escribe el texto que ves (ej. HOLA MUNDO)..."
                      value={reconstructedTextB}
                      onChange={(e) => { setReconstructedTextB(e.target.value); setLessonBFeedback(null); }}
                    />
                  </div>
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonBFeedback === 'correct' ? 'correct' : lessonBFeedback === 'incorrect' ? 'incorrect' : 'idle'}`}>
                  {lessonBFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Descifrado confirmado!</h4>
                          <p className="mission-feedback-text">
                            Con <strong>k=3</strong> invertiste el cifrado y recuperaste <strong>"HOLA MUNDO"</strong>.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={handleNextLesson}>
                        Siguiente Lección <ArrowRight size={16} />
                      </button>
                    </>
                  ) : lessonBFeedback === 'incorrect' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><XCircle size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">No coincide</h4>
                          <p className="mission-feedback-text">
                            Asegúrate de ajustar el control a <strong>k=3</strong> y escribir "HOLA MUNDO".
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn retry" onClick={() => setLessonBFeedback(null)}>
                        Reintentar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mission-feedback-info">
                        <HelpCircle size={20} className="text-accent" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                          Presiona para comprobar si el mensaje fue recuperado legítimamente.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mission-action-btn check"
                        onClick={handleVerifyDecryptionB}
                      >
                        Validar Descifrado
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN C: ENCUENTRA LA CLAVE (FUERZA BRUTA)
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
                  <h2 className="learn-hero-title">El Espacio de Claves y Fuerza Bruta</h2>
                  <p className="learn-hero-summary">
                    La <strong>clave</strong> es el secreto que parametriza la transformación.
                    En el cifrado César, la clave es únicamente el número de desplazamiento.
                    Como el alfabeto sólo tiene 26 letras, existen apenas <strong>25 claves útiles</strong>.
                  </p>
                </div>

                <div className="learn-visual-card">
                  <div className="learn-visual-header">
                    <SearchCode size={16} /> ¿Qué es un Ataque por Fuerza Bruta?
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--txt-primary)', lineHeight: '1.5', margin: 0 }}>
                    Consiste en probar <strong>exhaustivamente todas las claves posibles</strong> una por una hasta que el mensaje tenga sentido.
                    Si el espacio de claves es pequeño, el sistema se rompe casi al instante.
                  </p>
                </div>

                <div className="learn-examples-grid">
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">César: 25 Claves</h4>
                    <p className="learn-example-text">
                      Un humano tarda 2 minutos en probar las 25 variantes en un papel; una máquina tarda menos de 1 milisegundo.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <h4 className="learn-example-title">AES-256: 2<sup>256</sup> Claves</h4>
                    <p className="learn-example-text">
                      Un número de 78 dígitos: probar todas requeriría más energía y tiempo que la edad del universo visible.
                    </p>
                  </div>
                </div>

                <div className="learn-why-box">
                  <Shield size={20} style={{ color: '#10d46e', flexShrink: 0 }} />
                  <div className="learn-why-text">
                    <strong>¿Para qué sirve?</strong>
                    <p>
                      Demuestra la regla de oro: un algoritmo solo es seguro si su espacio de claves es demasiado grande para ser inspeccionado.
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
                    <strong>Misión Práctica:</strong> Interceptaste el criptograma militar <code className="mono">"{cipherC}"</code>.
                    Ejecuta el escaneo de fuerza bruta, identifica cuál de las 26 claves genera español legible y selecciónala.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                      Tabla de Fuerza Bruta Generada en Tiempo Real (26 Posibilidades):
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Haz clic en la fila correcta</span>
                  </div>

                  <div className="bruteforce-table-wrap" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <table className="bruteforce-table">
                      <thead>
                        <tr>
                          <th>Clave (k)</th>
                          <th>Resultado</th>
                          <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bruteForceListC.map(({ shift: k, result }) => {
                          const isSelected = selectedShiftC === k;
                          return (
                            <tr
                              key={k}
                              className={`bruteforce-row ${isSelected ? 'target-match' : ''}`}
                              onClick={() => { setSelectedShiftC(k); setLessonCFeedback(null); }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td><strong className="mono">k = {k}</strong></td>
                              <td className="mono" style={{ letterSpacing: '0.06em' }}>{result}</td>
                              <td style={{ textAlign: 'right' }}>
                                <span className={`badge ${isSelected ? 'badge-accent' : ''}`} style={{ fontSize: '0.72rem' }}>
                                  {isSelected ? 'Seleccionada' : 'Seleccionar'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {selectedShiftC !== null && (
                    <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Has marcado: <strong className="mono">k = {selectedShiftC}</strong></span>
                      <span className="mono" style={{ color: 'var(--clr-accent)' }}>
                        "{caesarTransform(cipherC, 26 - selectedShiftC)}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonCFeedback === 'correct' ? 'correct' : lessonCFeedback === 'incorrect' ? 'incorrect' : 'idle'}`}>
                  {lessonCFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Criptograma Quebrado!</h4>
                          <p className="mission-feedback-text">
                            Descubriste la clave <strong>k = 3</strong> recuperando <strong>"MENSAJE SECRETO"</strong>.
                            Demostraste en la práctica la debilidad del espacio de claves reducido.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={handleNextLesson}>
                        Última Lección <ArrowRight size={16} />
                      </button>
                    </>
                  ) : lessonCFeedback === 'incorrect' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><XCircle size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">Clave errónea</h4>
                          <p className="mission-feedback-text">
                            La fila que seleccionaste no produce un texto con sentido en español. Busca "MENSAJE SECRETO".
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn retry" onClick={() => setLessonCFeedback(null)}>
                        Revisar tabla
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mission-feedback-info">
                        <HelpCircle size={20} className="text-accent" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                          {selectedShiftC !== null ? `¿Confirmas k=${selectedShiftC}?` : 'Selecciona una fila de la tabla.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mission-action-btn check"
                        disabled={selectedShiftC === null}
                        onClick={handleVerifyShiftC}
                      >
                        Comprobar Clave
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LECCIÓN D: PROTEGE EL MENSAJE (TRÍADA CIA)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 4 && (
          <div className="mission-exercise-card animate-fade-in">
            {lessonMode === 'learn' ? (
              /* ─── VISTA APRENDER ─── */
              <div className="learn-view-container">
                <div className="learn-hero-box">
                  <div className="mission-card-badge">
                    <BookOpen size={14} /> Lección D · Concepto Esencial
                  </div>
                  <h2 className="learn-hero-title">Los Tres Objetivos: Tríada CIA</h2>
                  <p className="learn-hero-summary">
                    La seguridad de la información no es solo "ocultar". La criptografía moderna garantiza tres propiedades distintas y fundamentales:
                  </p>
                </div>

                <div className="learn-examples-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="learn-example-item">
                    <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>🔒</div>
                    <h4 className="learn-example-title" style={{ color: 'var(--clr-accent)' }}>Confidencialidad</h4>
                    <p className="learn-example-text">
                      Ocultar la lectura para que solo los receptores autorizados conozcan el contenido.
                      <br /><br />
                      <strong>Ejemplo:</strong> Tu expediente médico enviado a un laboratorio por la red.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>🛡️</div>
                    <h4 className="learn-example-title" style={{ color: '#10d46e' }}>Integridad</h4>
                    <p className="learn-example-text">
                      Detectar si los datos fueron modificados o corrompidos en el camino.
                      <br /><br />
                      <strong>Ejemplo:</strong> Una transferencia bancaria donde nadie pueda alterar el monto $500 a $50,000.
                    </p>
                  </div>
                  <div className="learn-example-item">
                    <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>✓</div>
                    <h4 className="learn-example-title" style={{ color: '#a855f7' }}>Autenticidad</h4>
                    <p className="learn-example-text">
                      Comprobar con certeza quién generó y autorizó el mensaje.
                      <br /><br />
                      <strong>Ejemplo:</strong> Una actualización oficial de Windows firmada digitalmente por Microsoft.
                    </p>
                  </div>
                </div>

                <div className="learn-footer-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setLessonMode('practice')}>
                    Ejecutar acciones prácticas <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ─── VISTA PRACTICAR (ACCIONES REALES, NO ABCD) ─── */
              <div className="practice-view-container">
                <div className="practice-instruction-bar">
                  <span>
                    <strong>Misión Práctica (Sin cuestionarios):</strong> Ejecuta las tres acciones operativas para proteger la confidencialidad, detectar alteraciones de integridad y validar autenticidad.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '2px 8px' }} onClick={() => setLessonMode('learn')}>
                    📖 Ver teoría
                  </button>
                </div>

                <div className="interactive-assembly-board">
                  {/* Action 1: Confidentiality Shield */}
                  <div className="action-scenario-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--clr-accent)' }}>
                        1. Acción de Confidencialidad (Ocultamiento de datos)
                      </span>
                      <span className={`action-status-badge ${isShieldApplied ? 'secure' : 'exposed'}`}>
                        {isShieldApplied ? '🔒 Blindaje Cifrado Activo' : '⚠️ Mensaje en Claro Expuesto'}
                      </span>
                    </div>
                    <div className="action-trigger-row">
                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>Mensaje de Coordenadas:</span>
                        <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                          {isShieldApplied ? '9F#8X@L%2!QZ90...' : '41.40338 N, 2.17403 E'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn ${isShieldApplied ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setIsShieldApplied(!isShieldApplied)}
                      >
                        <Shield size={16} />
                        {isShieldApplied ? 'Desactivar Blindaje' : 'Aplicar Blindaje Criptográfico'}
                      </button>
                    </div>
                  </div>

                  {/* Action 2: Integrity Detection */}
                  <div className="action-scenario-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#10d46e' }}>
                        2. Acción de Integridad (Detección de alteración)
                      </span>
                      {tamperedTransaction.verified && (
                        <span className="action-status-badge secure">
                          ✓ Alteración Detectada con Hash
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--txt-secondary)' }}>
                      Emisor envió: <strong className="mono">"{tamperedTransaction.original}"</strong>.
                      <br />
                      Receptor recibió: <strong className="mono" style={{ color: '#f43f5e' }}>"{tamperedTransaction.received}"</strong>.
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleVerifyIntegrityD(true)}
                      >
                        🔍 Escanear y Rechazar por Alteración de Integridad
                      </button>
                    </div>
                  </div>

                  {/* Action 3: Authenticity Verification */}
                  <div className="action-scenario-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#a855f7' }}>
                        3. Acción de Autenticidad (Validación de identidad del emisor)
                      </span>
                      {signatureChecked && (
                        <span className="action-status-badge secure">
                          ✓ Emisor Legítimo Verificado
                        </span>
                      )}
                    </div>
                    <div className="action-trigger-row">
                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>Firma Criptográfica:</span>
                        <div className="mono" style={{ fontSize: '0.9rem' }}>
                          Certificado: "Comandante-Alice::ID#9902"
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn ${signatureChecked ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setSignatureChecked(true)}
                        disabled={signatureChecked}
                      >
                        <FileCheck size={16} />
                        {signatureChecked ? 'Autenticidad Validada' : 'Comprobar Certificado de Autoría'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Feedback Dock */}
                <div className={`mission-feedback-dock ${lessonDFeedback === 'correct' ? 'correct' : lessonDFeedback === 'incomplete' ? 'incorrect' : 'idle'}`}>
                  {lessonDFeedback === 'correct' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><Check size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">¡Misión 1 Completada con Éxito!</h4>
                          <p className="mission-feedback-text">
                            Has protegido la confidencialidad, interceptado la corrupción de datos y validado la autoría.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn next" onClick={() => setActiveLesson(5)}>
                        Ver Debrief y Recompensas <Sparkles size={16} />
                      </button>
                    </>
                  ) : lessonDFeedback === 'incomplete' ? (
                    <>
                      <div className="mission-feedback-info">
                        <div className="mission-feedback-icon"><AlertTriangle size={24} /></div>
                        <div>
                          <h4 className="mission-feedback-heading">Faltan acciones por completar</h4>
                          <p className="mission-feedback-text">
                            Debes: 1) Activar el blindaje, 2) Escanear la integridad y 3) Comprobar el certificado.
                          </p>
                        </div>
                      </div>
                      <button type="button" className="mission-action-btn retry" onClick={() => setLessonDFeedback(null)}>
                        Completar acciones
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mission-feedback-info">
                        <HelpCircle size={20} className="text-accent" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
                          Ejecuta las tres comprobaciones para finalizar el módulo.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mission-action-btn check"
                        onClick={handleCheckAllActionsD}
                      >
                        Validar Práctica CIA
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            PANTALLA DE VICTORIA (DEBRIEF COMPLETO)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeLesson === 5 && (
          <div className="mission-victory-card animate-fade-in">
            <div className="mission-victory-badge">
              <Sparkles size={40} style={{ color: '#10d46e' }} />
            </div>

            <h2 className="mission-victory-title">¡MISIÓN 1 COMPLETADA, OPERATIVO!</h2>
            <p className="mission-victory-subtitle">
              Has experimentado la dualidad entre <strong>APRENDER</strong> y <strong>PRACTICAR</strong> en los fundamentos de la criptografía.
            </p>

            <div className="mission-stats-strip">
              <div className="mission-stat-box">
                <span className="mission-stat-val">4 / 4</span>
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
                <span className="mission-stat-lbl">Dominio Demostrado</span>
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
                    <strong>Cifrado y Descifrado:</strong> Operaciones inversas guiadas por un desplazamiento modular sobre el alfabeto.
                  </span>
                </li>
                <li>
                  <span className="bullet">✓</span>
                  <span>
                    <strong>Espacio de Claves:</strong> La vulnerabilidad crítica de los métodos clásicos ante la inspección por fuerza bruta.
                  </span>
                </li>
                <li>
                  <span className="bullet">✓</span>
                  <span>
                    <strong>Tríada CIA en Acción:</strong> Confidencialidad (ocultar), Integridad (detectar cambios) y Autenticidad (validar identidad).
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
              <button type="button" className="btn btn-primary" onClick={() => navigate('/aprendizaje/simetrica')}>
                Siguiente Misión: Criptografía Simétrica <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
