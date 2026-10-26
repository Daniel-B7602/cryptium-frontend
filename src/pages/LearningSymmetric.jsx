import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Key,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Eye,
  EyeOff,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import { encryptText, decryptText } from '../services/api';
import '../components/learning/ExerciseWidgets.css';

// ── Web Crypto AES-CBC Real Cryptography Fallback (Always functional) ─────────
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

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);

  const completedSteps = progressState.completedExercises.simetrica || [];

  // =========================================================================
  // EJERCICIO 1 — Elige la clave compartida
  // Configuración simétrica: Alice y Bob usan una única clave secreta idéntica
  // =========================================================================
  const [selectedArch1, setSelectedArch1] = useState(null);
  const architectures1 = [
    {
      id: 'a',
      title: 'Alice cifra con una clave pública y Bob descifra con su clave privada',
      desc: 'No comparten ninguna clave secreta previa en común; las claves son asimétricas.',
    },
    {
      id: 'b',
      title: 'Alice y Bob utilizan la misma clave secreta idéntica para cifrar y descifrar',
      desc: 'Ambos extremos comparten una clave secreta K que nadie más conoce. El descifrado invierte la operación con la misma clave.',
    },
    {
      id: 'c',
      title: 'Alice cifra sin clave y Bob adivina la contraseña mediante una función hash',
      desc: 'El cifrado simétrico no requiere claves si el texto es corto.',
    },
  ];

  const checkExercise1 = () => {
    if (selectedArch1 === 'b') {
      const res = recordExerciseCompletion('simetrica', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Concepto fundamental correcto!',
        message: 'En criptografía simétrica (como AES), emisor y receptor comparten exactamente la misma clave secreta K: C = E_K(M) y M = D_K(C). La clave debe mantenerse estrictamente confidencial para ambos.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Configuración simétrica incorrecta',
        message: 'La criptografía simétrica se define por el uso de una clave única y compartida entre las partes autorizadas.',
        hint: 'Simetría significa que ambos lados usan la misma pieza de información secreta.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Recupera el mensaje (Cifrado y Descifrado AES real)
  // El usuario ejecuta el cifrado y luego el descifrado
  // =========================================================================
  const [plainMessage2, setPlainMessage2] = useState('OPERACION CRYPTIUM');
  const [sharedKey2, setSharedKey2] = useState('clave-secreta-2026');
  const [generatedCipher2, setGeneratedCipher2] = useState('');
  const [recoveredMessage2, setRecoveredMessage2] = useState('');
  const [phase2, setPhase2] = useState('encrypt'); // 'encrypt' | 'decrypt'

  const handleEncryptReal2 = async () => {
    if (!plainMessage2.trim() || !sharedKey2.trim()) return;
    setIsLoadingCrypto(true);
    try {
      let cipher = '';
      try {
        const res = await encryptText(plainMessage2, sharedKey2);
        cipher = res.encryptedText || res.data;
      } catch {
        cipher = await fallbackAesEncrypt(plainMessage2, sharedKey2);
      }
      setGeneratedCipher2(cipher);
      setPhase2('decrypt');
      setFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const handleDecryptReal2 = async () => {
    if (!generatedCipher2 || !sharedKey2.trim()) return;
    setIsLoadingCrypto(true);
    try {
      let plain = '';
      try {
        const res = await decryptText(generatedCipher2, sharedKey2);
        plain = res.decryptedText || res.data;
      } catch {
        plain = await fallbackAesDecrypt(generatedCipher2, sharedKey2);
      }
      setRecoveredMessage2(plain);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise2 = () => {
    if (recoveredMessage2 === plainMessage2) {
      const res = recordExerciseCompletion('simetrica', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Ciclo de cifrado y descifrado verificado!',
        message: `Has ejecutado un ciclo real de AES. El texto en claro fue transformado en el criptograma Base64 y posteriormente descifrado de vuelta a "${recoveredMessage2}" sin perder ningún byte.`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Mensaje aún no recuperado',
        message: 'Debes completar el cifrado y descifrado para recuperar el texto original.',
        hint: 'Haz clic en "Cifrar con AES" y luego en "Descifrar mensaje".',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — ¿Qué salió mal? (Gestión de claves)
  // Escenario de fuga / clave errónea
  // =========================================================================
  const [selectedDiag3, setSelectedDiag3] = useState(null);
  const scenarios3 = [
    {
      id: 'a',
      title: 'Fallo de gestión de claves: la clave fue enviada en texto plano por correo',
      desc: 'El algoritmo AES funcionó correctamente, pero el canal de distribución de la clave no fue seguro, comprometiendo toda la confidencialidad.',
    },
    {
      id: 'b',
      title: 'Fallo de diseño del algoritmo: AES no soporta textos con más de 10 palabras',
      desc: 'El algoritmo de bloques colapsa si el mensaje no es numérico.',
    },
    {
      id: 'c',
      title: 'Fallo de longitud de clave: una clave simétrica debe tener al menos 4096 bits',
      desc: 'Las claves de 128 o 256 bits ya no se consideran matemáticamente seguras en la actualidad.',
    },
  ];

  const checkExercise3 = () => {
    if (selectedDiag3 === 'a') {
      const res = recordExerciseCompletion('simetrica', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Diagnóstico de seguridad preciso!',
        message: 'Excelente distinción: un algoritmo robusto como AES-256 es computacionalmente irrompible, pero el "dilema del huevo y la gallina" en criptografía simétrica es cómo intercambiar la clave secreta inicial sin que sea interceptada.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Diagnóstico incorrecto',
        message: 'AES de 128 y 256 bits es el estándar de oro moderno. El eslabón débil casi siempre es la distribución de la clave.',
        hint: 'Recuerda el Principio de Kerckhoffs: la seguridad depende únicamente del secreto de la clave.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Construye el proceso seguro (Ordenar pasos cronológicos)
  // =========================================================================
  const initialSteps4 = [
    { id: 's2', text: 'Cifrar el texto plano con AES generando el criptograma y un IV aleatorio' },
    { id: 's4', text: 'Descifrar el criptograma en el destino con la misma clave compartida' },
    { id: 's1', text: 'Generar y acordar de forma segura la clave compartida entre ambas partes' },
    { id: 's3', text: 'Transmitir el criptograma resultante a través del canal inseguro' },
  ];
  const [orderedSteps4, setOrderedSteps4] = useState(initialSteps4);

  const moveStep = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= orderedSteps4.length) return;
    const copy = [...orderedSteps4];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setOrderedSteps4(copy);
    setFeedback(null);
  };

  const checkExercise4 = () => {
    const ids = orderedSteps4.map((s) => s.id).join('-');
    if (ids === 's1-s2-s3-s4') {
      const res = recordExerciseCompletion('simetrica', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Secuencia criptográfica ordenada a la perfección!',
        message: '1. Acordar la clave K -> 2. Cifrar con AES + IV -> 3. Transmitir el criptograma por la red -> 4. Descifrar con la misma clave K. Nota importante: AES-CBC protege la confidencialidad, pero para garantizar autenticidad e integridad se recomienda un modo autenticado como AES-GCM.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Orden cronológico incorrecto',
        message: 'Revisa la secuencia lógica: ¿qué se necesita tener antes de cifrar, y cuándo se transmite el mensaje?',
        hint: 'Primero se acuerda la clave secreta antes de cualquier operación de cifrado.',
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
    setSelectedArch1(null);
    setPlainMessage2('OPERACION CRYPTIUM');
    setGeneratedCipher2('');
    setRecoveredMessage2('');
    setPhase2('encrypt');
    setSelectedDiag3(null);
    setOrderedSteps4(initialSteps4);
    setFeedback(null);
    setIsVictory(false);
  };

  const canCheck = useMemo(() => {
    if (currentStep === 1) return selectedArch1 !== null;
    if (currentStep === 2) return recoveredMessage2.length > 0;
    if (currentStep === 3) return selectedDiag3 !== null;
    if (currentStep === 4) return true;
    return false;
  }, [currentStep, selectedArch1, recoveredMessage2, selectedDiag3]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="2. Criptografía Simétrica"
        moduleNumber={2}
        nextModulePath="/aprendizaje/asimetrica"
        nextModuleName="Criptografía Asimétrica"
        earnedXp={100}
        summaryPoints={[
          'La criptografía simétrica utiliza una única clave secreta idéntica tanto para cifrar como para descifrar.',
          'Los algoritmos modernos como AES procesan datos en bloques con vectores de inicialización (IV) para evitar patrones.',
          'El gran desafío de la criptografía simétrica es el intercambio seguro y la gestión de la clave compartida.',
          'AES-CBC proporciona confidencialidad, mientras que modos como AES-GCM añaden autenticación e integridad integrada.',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="simetrica"
      moduleTitle="Criptografía Simétrica"
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
          ? 'Elige la arquitectura de clave compartida'
          : currentStep === 2
          ? 'Recupera el mensaje: ejecuta cifrado y descifrado real AES'
          : currentStep === 3
          ? '¿Qué salió mal? Identifica la fuga en la gestión de claves'
          : 'Construye el proceso seguro de cifrado simétrico'
      }
      description={
        currentStep === 1
          ? 'Alice y Bob necesitan intercambiar un informe clasificado. Selecciona la configuración que define a la criptografía simétrica.'
          : currentStep === 2
          ? 'Cifra un mensaje de prueba con AES y luego descífralo con la misma clave compartida para comprobar la reversibilidad.'
          : currentStep === 3
          ? 'Una empresa implementó AES-256 pero su información fue interceptada. Analiza la causa raíz del incidente.'
          : 'Organiza cronológicamente los 4 pasos necesarios para una comunicación simétrica segura de principio a fin.'
      }
    >
      {/* ── RETO 1: Elige la clave compartida ── */}
      {currentStep === 1 && (
        <div className="duo-options-grid">
          {architectures1.map((arch) => (
            <div
              key={arch.id}
              className={`duo-option-card ${selectedArch1 === arch.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedArch1(arch.id);
                setFeedback(null);
              }}
            >
              <div className="duo-option-radio">
                {selectedArch1 === arch.id && <div className="duo-option-radio-inner" />}
              </div>
              <div className="duo-option-body">
                <h4 className="duo-option-title">{arch.title}</h4>
                <p className="duo-option-desc">{arch.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RETO 2: Recupera el mensaje (AES Real) ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>Texto en claro:</label>
              <input
                type="text"
                className="duo-input-field"
                value={plainMessage2}
                onChange={(e) => {
                  setPlainMessage2(e.target.value);
                  setGeneratedCipher2('');
                  setRecoveredMessage2('');
                  setPhase2('encrypt');
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', fontWeight: 600 }}>Clave compartida (K):</label>
              <input
                type="text"
                className="duo-input-field"
                value={sharedKey2}
                onChange={(e) => {
                  setSharedKey2(e.target.value);
                  setGeneratedCipher2('');
                  setRecoveredMessage2('');
                  setPhase2('encrypt');
                }}
              />
            </div>
          </div>

          {/* Action trigger button */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {phase2 === 'encrypt' ? (
              <button
                type="button"
                className="duo-btn-primary"
                onClick={handleEncryptReal2}
                disabled={isLoadingCrypto}
              >
                <Lock size={18} />
                <span>1. Cifrar con AES</span>
              </button>
            ) : (
              <button
                type="button"
                className="duo-btn-primary"
                onClick={handleDecryptReal2}
                disabled={isLoadingCrypto}
              >
                <Unlock size={18} />
                <span>2. Descifrar con la misma clave</span>
              </button>
            )}
          </div>

          {/* Crypto Terminal Output */}
          <div className="duo-crypto-terminal">
            <div className="duo-terminal-header">
              <span>ESTADO CRIPTOGRÁFICO AES</span>
              <span>{generatedCipher2 ? 'CRIPTOGRAMA GENERADO' : 'EN ESPERA'}</span>
            </div>
            <div className="duo-terminal-body">
              {generatedCipher2 ? (
                <>
                  <div style={{ color: 'var(--clr-accent)', marginBottom: '8px' }}>
                    <strong>Criptograma Base64 (+ IV):</strong>
                  </div>
                  <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                    {generatedCipher2}
                  </div>
                  {recoveredMessage2 && (
                    <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '8px' }}>
                      <span style={{ color: 'var(--clr-success)', fontWeight: 700 }}>Texto recuperado exitosamente: </span>
                      <strong style={{ color: '#ffffff' }}>{recoveredMessage2}</strong>
                    </div>
                  )}
                </>
              ) : (
                <span style={{ color: 'var(--txt-muted)' }}>
                  Haz clic en "1. Cifrar con AES" para procesar el texto y derivar el criptograma con Web Crypto.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RETO 3: ¿Qué salió mal? ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt-primary)', background: 'var(--clr-surface-3)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--clr-error)' }}>
            <strong>Incidente de Seguridad:</strong> Un empleado utilizó cifrado AES-256 de grado militar para proteger un archivo confidencial. Luego envió el archivo cifrado y, en el mismo correo electrónico, escribió: <em>"Adjunto el documento, la contraseña para abrirlo es: Finanzas2026!"</em>. Un adversario interceptó el correo. ¿Dónde estuvo la vulnerabilidad?
          </p>

          <div className="duo-options-grid">
            {scenarios3.map((scen) => (
              <div
                key={scen.id}
                className={`duo-option-card ${selectedDiag3 === scen.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDiag3(scen.id);
                  setFeedback(null);
                }}
              >
                <div className="duo-option-radio">
                  {selectedDiag3 === scen.id && <div className="duo-option-radio-inner" />}
                </div>
                <div className="duo-option-body">
                  <h4 className="duo-option-title">{scen.title}</h4>
                  <p className="duo-option-desc">{scen.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RETO 4: Construye el proceso seguro ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
            Utiliza los botones ▲ y ▼ para ordenar la secuencia cronológica de una transmisión simétrica segura:
          </p>

          <div className="duo-sequencer-list">
            {orderedSteps4.map((step, idx) => (
              <div key={step.id} className="duo-sequencer-item">
                <div className="duo-step-idx">{idx + 1}</div>
                <div className="duo-sequencer-text">{step.text}</div>
                <div className="duo-reorder-btns">
                  <button
                    type="button"
                    className="duo-reorder-btn"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, -1)}
                    title="Subir paso"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="duo-reorder-btn"
                    disabled={idx === orderedSteps4.length - 1}
                    onClick={() => moveStep(idx, 1)}
                    title="Bajar paso"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </LessonContainer>
  );
}
