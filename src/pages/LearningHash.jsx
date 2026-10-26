import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Hash,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Binary,
  Layers,
  HelpCircle,
  Eye,
  FileCheck,
} from 'lucide-react';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import {
  computeSHA256,
  compareHashesBitwise,
} from '../utils/hashUtils';
import '../components/learning/ExerciseWidgets.css';

export default function LearningHash() {
  const navigate = useNavigate();

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);

  const completedSteps = progressState.completedExercises.hash || [];

  // =========================================================================
  // EJERCICIO 1 — Genera la huella digital (SHA-256 real)
  // =========================================================================
  const [inputMessage1, setInputMessage1] = useState('Cryptium Security 2026');
  const [computedHash1, setComputedHash1] = useState(null);

  const handleComputeHash1 = async () => {
    if (!inputMessage1) return;
    setIsLoadingCrypto(true);
    try {
      const res = await computeSHA256(inputMessage1);
      setComputedHash1(res);
      setFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise1 = () => {
    if (computedHash1 && computedHash1.hex) {
      const res = recordExerciseCompletion('hash', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Huella digital calculada con éxito!',
        message: `Has generado el hash SHA-256 oficial de 256 bits (64 caracteres hexadecimales). Propiedad esencial: es una función unidireccional estricta. No existe ninguna clave de descifrado ni función inversa para recuperar "${inputMessage1}" a partir del hash.`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Huella no calculada',
        message: 'Por favor, haz clic en "Calcular SHA-256" para generar la huella con Web Crypto.',
        hint: 'El navegador procesará tu texto en tiempo real con hardware criptográfico nativo.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Encuentra el cambio (Efecto Avalancha)
  // Dos textos que difieren en solo 1 carácter
  // =========================================================================
  const [textA2, setTextA2] = useState('Transfiere 1000 USD a Bob');
  const [textB2, setTextB2] = useState('Transfiere 1001 USD a Bob');
  const [hashResultA2, setHashResultA2] = useState(null);
  const [hashResultB2, setHashResultB2] = useState(null);
  const [diffStats2, setDiffStats2] = useState(null);

  const handleRunAvalanche2 = async () => {
    setIsLoadingCrypto(true);
    try {
      const resA = await computeSHA256(textA2);
      const resB = await computeSHA256(textB2);
      const comparison = compareHashesBitwise(resA.bytes, resB.bytes);
      setHashResultA2(resA);
      setHashResultB2(resB);
      setDiffStats2(comparison);
      setFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise2 = () => {
    if (diffStats2) {
      const res = recordExerciseCompletion('hash', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Efecto avalancha verificado matemáticamente!',
        message: `A pesar de que los mensajes difieren en solo 1 carácter ('0' vs '1'), ${diffStats2.diffBits} de los 256 bits del hash cambiaron (${diffStats2.diffPercentage}% de divergencia). En una función hash criptográfica de calidad, cambiar un solo bit de entrada debe voltear cerca del 50% de los bits de salida.`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Comparación no realizada',
        message: 'Haz clic en "Analizar Efecto Avalancha" para calcular y comparar ambos hashes bit a bit.',
        hint: 'Observa la distancia de Hamming entre ambos digests calculados.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — Verifica la integridad
  // Comparar paquete original vs recibido
  // =========================================================================
  const originalFileName3 = 'firmware_v2.4.bin';
  const expectedHash3 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const [receivedText3, setReceivedText3] = useState('Actualizacion de firmware v2.4 (MODIFICADO POR MALWARE)');
  const [computedReceivedHash3, setComputedReceivedHash3] = useState(null);
  const [integrityDecision3, setIntegrityDecision3] = useState(null); // 'tampered' | 'authentic'

  const handleComputeIntegrity3 = async () => {
    setIsLoadingCrypto(true);
    try {
      const res = await computeSHA256(receivedText3);
      setComputedReceivedHash3(res.hex);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise3 = () => {
    if (!computedReceivedHash3) {
      setFeedback({
        status: 'error',
        title: 'Hash del archivo no calculado',
        message: 'Primero calcula el hash de la versión recibida para compararlo con el valor esperado.',
      });
      return;
    }

    if (integrityDecision3 === 'tampered') {
      const res = recordExerciseCompletion('hash', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Alteración detectada con éxito!',
        message: `Correcto: el hash recibido (${computedReceivedHash3.slice(0, 16)}...) no coincide en absoluto con el hash oficial esperado (${expectedHash3.slice(0, 16)}...). La función hash garantiza que cualquier modificación no autorizada sea inmediatamente evidente.`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Decisión incorrecta',
        message: 'Compara carácter por carácter el hash recibido con el hash oficial esperado.',
        hint: 'Si un solo carácter del hash no coincide, el archivo fue alterado o corrompido.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Identifica el uso correcto de funciones Hash
  // =========================================================================
  const [selectedHashUsage4, setSelectedHashUsage4] = useState(null);
  const usageScenarios4 = [
    {
      id: 'a',
      title: 'Usar SHA-256 directo sin sal para proteger contraseñas en la base de datos',
      desc: 'Es ideal porque SHA-256 es muy rápido y calcula millones de hashes por segundo en la GPU de un atacante con tablas rainbow.',
    },
    {
      id: 'b',
      title: 'Comprobar integridad de archivos y verificar firmas digitales; usar KDF lentos con sal para contraseñas',
      desc: 'Las funciones hash verifican integridad y huellas. Para contraseñas se requieren algoritmos lentos con costo y sal como Argon2 o bcrypt.',
    },
    {
      id: 'c',
      title: 'Usar SHA-256 como algoritmo de cifrado reversible para mensajes largos',
      desc: 'El receptor puede usar la clave de cifrado hash para recuperar el texto en claro original.',
    },
  ];

  const checkExercise4 = () => {
    if (selectedHashUsage4 === 'b') {
      const res = recordExerciseCompletion('hash', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Criterio técnico de seguridad sobresaliente!',
        message: 'Excelente comprensión: los hashes no son cifrados reversibles (la longitud se reduce a 256 bits y se pierde información), y los hashes rápidos como SHA-256 son vulnerables al crackeo masivo por GPU si se usan para contraseñas sin sal. Su rol estelar es la verificación de integridad y huellas digitales.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Uso incorrecto o inseguro',
        message: 'Recuerda que un hash no es un cifrado (no se puede revertir) y no debe usarse directamente para contraseñas sin sal y costo computacional.',
        hint: '¿Por qué la extrema velocidad de SHA-256 es una ventaja para integridad pero un peligro para contraseñas?',
      });
    }
  };

  // =========================================================================
  // Handlers para avanzar o reiniciar
  // =========================================================================
  const handleCheck = () => {
    if (currentStep === 1) checkExercise1();
    else if (currentStep === 2) checkExercise2();
    else if (currentStep === 3) checkExercise3();
    else if (currentStep === 4) checkExercise4();
  };

  const handleContinue = () => {
    setFeedback(null);
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsVictory(true);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setInputMessage1('Cryptium Security 2026');
    setComputedHash1(null);
    setDiffStats2(null);
    setComputedReceivedHash3(null);
    setIntegrityDecision3(null);
    setSelectedHashUsage4(null);
    setFeedback(null);
    setIsVictory(false);
  };

  const canCheck = useMemo(() => {
    if (currentStep === 1) return computedHash1 !== null;
    if (currentStep === 2) return diffStats2 !== null;
    if (currentStep === 3) return computedReceivedHash3 !== null && integrityDecision3 !== null;
    if (currentStep === 4) return selectedHashUsage4 !== null;
    return false;
  }, [currentStep, computedHash1, diffStats2, computedReceivedHash3, integrityDecision3, selectedHashUsage4]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="4. Funciones Hash Criptográficas"
        moduleNumber={4}
        nextModulePath="/aprendizaje/firmas"
        nextModuleName="Firmas Digitales"
        earnedXp={100}
        summaryPoints={[
          'Una función hash criptográfica produce un resumen de longitud fija (256 bits en SHA-256) a partir de cualquier entrada.',
          'Es estrictamente unidireccional: es computacionalmente inviable reconstruir el mensaje original a partir de la huella.',
          'El efecto avalancha garantiza que una variación mínima de 1 bit altera radicalmente cerca del 50% del hash.',
          'Son la base de la integridad en internet, descargas y firmas digitales (para contraseñas se requieren KDF lentos como Argon2).',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="hash"
      moduleTitle="Funciones Hash Criptográficas"
      currentStep={currentStep}
      totalSteps={4}
      userXp={progressState.xp}
      canCheck={canCheck}
      feedback={feedback}
      onCheck={handleCheck}
      onContinue={handleContinue}
      onRetry={handleRetry}
      completedSteps={completedSteps}
      isLoading={isLoadingCrypto}
      instruction={
        currentStep === 1
          ? 'Genera la huella digital criptográfica con SHA-256'
          : currentStep === 2
          ? 'Encuentra el cambio: experimenta el Efecto Avalancha'
          : currentStep === 3
          ? 'Verifica la integridad de una descarga'
          : 'Identifica el uso correcto de las funciones hash'
      }
      description={
        currentStep === 1
          ? 'Introduce un texto y calcula su resumen SHA-256 real para observar sus 256 bits unidireccionales.'
          : currentStep === 2
          ? 'Compara dos mensajes que difieren en solo un carácter y calcula la divergencia bit a bit.'
          : currentStep === 3
          ? 'Calcula el hash del archivo recibido y compáralo con la huella oficial para validar si fue manipulado.'
          : 'Determina en qué escenarios de seguridad es correcto emplear funciones hash y cuáles son sus limitaciones.'
      }
    >
      {/* ── RETO 1: Genera la huella ── */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>
              Mensaje de entrada:
            </label>
            <input
              type="text"
              className="duo-input-field"
              value={inputMessage1}
              onChange={(e) => {
                setInputMessage1(e.target.value);
                setComputedHash1(null);
                setFeedback(null);
              }}
              placeholder="Escribe cualquier texto..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-primary"
              onClick={handleComputeHash1}
              disabled={isLoadingCrypto || !inputMessage1}
            >
              <Hash size={18} />
              <span>Calcular SHA-256 (Web Crypto)</span>
            </button>
          </div>

          {computedHash1 && (
            <div className="duo-crypto-terminal">
              <div className="duo-terminal-header">
                <span>DIGEST SHA-256 (256 BITS / 32 BYTES)</span>
                <span style={{ color: 'var(--clr-accent)' }}>64 HEX DIGITS</span>
              </div>
              <div className="duo-terminal-body">
                <div style={{ color: 'var(--clr-accent)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                  {computedHash1.hex}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--txt-secondary)', borderTop: '1px solid var(--clr-border)', paddingTop: '8px' }}>
                  Longitud fija garantizada: {computedHash1.bitLength} bits. Esta huella no se puede revertir matemáticamente para obtener el texto original.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 2: Encuentra el cambio (Efecto Avalancha) ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>Mensaje A:</label>
              <input
                type="text"
                className="duo-input-field"
                value={textA2}
                onChange={(e) => {
                  setTextA2(e.target.value);
                  setDiffStats2(null);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>Mensaje B (diferencia de 1 carácter):</label>
              <input
                type="text"
                className="duo-input-field"
                value={textB2}
                onChange={(e) => {
                  setTextB2(e.target.value);
                  setDiffStats2(null);
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-primary"
              onClick={handleRunAvalanche2}
              disabled={isLoadingCrypto}
            >
              <Binary size={18} />
              <span>Analizar Efecto Avalancha</span>
            </button>
          </div>

          {diffStats2 && (
            <div className="duo-crypto-terminal">
              <div className="duo-terminal-header">
                <span>DIVERGENCIA BIT A BIT</span>
                <span style={{ color: 'var(--clr-success)' }}>{diffStats2.diffPercentage}% BITS ALTERADOS</span>
              </div>
              <div className="duo-terminal-body">
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--txt-secondary)', fontSize: '0.8rem' }}>Hash A: </span>
                  <code style={{ color: 'var(--clr-accent)' }}>{hashResultA2?.hex}</code>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'var(--txt-secondary)', fontSize: '0.8rem' }}>Hash B: </span>
                  <code style={{ color: 'var(--clr-warning)' }}>{hashResultB2?.hex}</code>
                </div>
                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--clr-error)' }}>{diffStats2.diffBits}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)' }}>Bits diferentes</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--clr-success)' }}>{diffStats2.sameBits}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)' }}>Bits idénticos</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--clr-accent)' }}>256</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)' }}>Total de bits</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 3: Verifica la integridad ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Hash SHA-256 oficial del distribuidor ({originalFileName3}):
            </span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--clr-success)', fontSize: '0.9rem', wordBreak: 'break-all', marginTop: '6px' }}>
              {expectedHash3}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>
              Contenido del paquete recibido por la red:
            </label>
            <input
              type="text"
              className="duo-input-field"
              value={receivedText3}
              onChange={(e) => {
                setReceivedText3(e.target.value);
                setComputedReceivedHash3(null);
                setFeedback(null);
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-secondary"
              onClick={handleComputeIntegrity3}
              disabled={isLoadingCrypto}
            >
              <Hash size={18} />
              <span>Calcular Hash del Paquete Recibido</span>
            </button>
          </div>

          {computedReceivedHash3 && (
            <div style={{ background: 'var(--clr-surface-3)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>Hash calculado del paquete recibido:</span>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--clr-accent)', fontSize: '0.9rem', wordBreak: 'break-all', marginTop: '4px' }}>
                {computedReceivedHash3}
              </div>

              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-primary)', marginBottom: '8px' }}>
                  ¿Cuál es el veredicto de integridad?
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: integrityDecision3 === 'tampered' ? '2px solid var(--clr-error)' : '1px solid var(--clr-border)',
                      background: integrityDecision3 === 'tampered' ? 'rgba(244, 63, 94, 0.15)' : 'var(--clr-surface)',
                      color: integrityDecision3 === 'tampered' ? 'var(--clr-error)' : 'var(--txt-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setIntegrityDecision3('tampered');
                      setFeedback(null);
                    }}
                  >
                    ⚠️ Alterado / Corrupto
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: integrityDecision3 === 'authentic' ? '2px solid var(--clr-success)' : '1px solid var(--clr-border)',
                      background: integrityDecision3 === 'authentic' ? 'rgba(16, 212, 110, 0.15)' : 'var(--clr-surface)',
                      color: integrityDecision3 === 'authentic' ? 'var(--clr-success)' : 'var(--txt-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setIntegrityDecision3('authentic');
                      setFeedback(null);
                    }}
                  >
                    ✅ Íntegro / Auténtico
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 4: Identifica el uso correcto ── */}
      {currentStep === 4 && (
        <div className="duo-options-grid">
          {usageScenarios4.map((scen) => (
            <div
              key={scen.id}
              className={`duo-option-card ${selectedHashUsage4 === scen.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedHashUsage4(scen.id);
                setFeedback(null);
              }}
            >
              <div className="duo-option-radio">
                {selectedHashUsage4 === scen.id && <div className="duo-option-radio-inner" />}
              </div>
              <div className="duo-option-body">
                <h4 className="duo-option-title">{scen.title}</h4>
                <p className="duo-option-desc">{scen.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </LessonContainer>
  );
}
