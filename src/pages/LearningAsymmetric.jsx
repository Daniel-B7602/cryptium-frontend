import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Lock,
  Unlock,
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import '../components/learning/ExerciseWidgets.css';

export default function LearningAsymmetric() {
  const navigate = useNavigate();

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);

  const completedSteps = progressState.completedExercises.asimetrica || [];

  // =========================================================================
  // EJERCICIO 1 — Envía un mensaje confidencial
  // Alice quiere enviar un mensaje privado a Bob.
  // ¿Qué clave usa Alice para cifrar? (Pública de Bob)
  // ¿Qué clave usa Bob para descifrar? (Privada de Bob)
  // =========================================================================
  const [encryptKeySelection1, setEncryptKeySelection1] = useState(null); // 'alice_priv', 'alice_pub', 'bob_pub', 'bob_priv'
  const [decryptKeySelection1, setDecryptKeySelection1] = useState(null);

  const keyOptions1 = [
    { id: 'alice_pub', label: 'Clave Pública de Alice', owner: 'Alice', type: 'pub' },
    { id: 'alice_priv', label: 'Clave Privada de Alice', owner: 'Alice', type: 'priv' },
    { id: 'bob_pub', label: 'Clave Pública de Bob', owner: 'Bob', type: 'pub' },
    { id: 'bob_priv', label: 'Clave Privada de Bob', owner: 'Bob', type: 'priv' },
  ];

  const checkExercise1 = () => {
    if (encryptKeySelection1 === 'bob_pub' && decryptKeySelection1 === 'bob_priv') {
      const res = recordExerciseCompletion('asimetrica', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Pares de claves perfectamente asignados!',
        message: 'Para enviar información confidencial, Alice cifra con la Clave Pública del destinatario (Bob). Al estar encriptado para esa clave pública específica, la matemática de funciones trampa (como RSA o curvas elípticas) garantiza que ÚNICAMENTE Bob, con su Clave Privada secreta, puede descifrar el mensaje.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Combinación de claves incorrecta',
        message: 'Recuerda: cualquiera puede cifrar para Bob usando la clave que Bob comparte abiertamente, pero solo Bob debe poder leerlo.',
        hint: 'Para cifrar: Clave Pública de Bob. Para descifrar: Clave Privada de Bob.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Reconstruye el intercambio asimétrico (Reordenar etapas)
  // =========================================================================
  const initialSteps2 = [
    { id: 'st3', text: 'Alice toma la clave pública de Bob y cifra el mensaje confidencial' },
    { id: 'st1', text: 'Bob genera su par de claves matemáticas vinculadas: Pública y Privada' },
    { id: 'st4', text: 'Bob recibe el criptograma y lo descifra con su Clave Privada secreta' },
    { id: 'st2', text: 'Bob publica y distribuye abiertamente su Clave Pública (a Alice y al mundo)' },
  ];
  const [orderedSteps2, setOrderedSteps2] = useState(initialSteps2);

  const moveStep2 = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= orderedSteps2.length) return;
    const copy = [...orderedSteps2];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setOrderedSteps2(copy);
    setFeedback(null);
  };

  const checkExercise2 = () => {
    const ids = orderedSteps2.map((s) => s.id).join('-');
    if (ids === 'st1-st2-st3-st4') {
      const res = recordExerciseCompletion('asimetrica', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Ciclo asimétrico reconstruido correctamente!',
        message: '1. Generar par de claves -> 2. Difundir clave pública -> 3. Cifrar con clave pública del receptor -> 4. Descifrar con clave privada exclusiva. Observa cómo jamás se compartió ningún secreto previo entre Alice y Bob.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Secuencia desordenada',
        message: 'Revisa el flujo: primero deben existir las claves antes de poder compartirlas o cifrar.',
        hint: 'El primer paso es la generación del par de claves por parte de Bob.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — Encuentra la clave correcta (Escenarios cruzados)
  // =========================================================================
  const [selectedScenario3, setSelectedScenario3] = useState(null);
  const questions3 = [
    {
      id: 'a',
      title: 'Una clave pública puede sustituir a la privada si tiene 4096 bits',
      desc: 'Con suficiente longitud de clave, la clave pública adquiere la capacidad de descifrar.',
    },
    {
      id: 'b',
      title: 'La clave pública nunca sustituye a la privada: una cifra y la otra descifra',
      desc: 'La clave pública es conocida por todos; si pudiera descifrar, cualquiera en internet podría leer las comunicaciones privadas.',
    },
    {
      id: 'c',
      title: 'La clave privada se hace pública cuando se vence el certificado SSL',
      desc: 'Las claves privadas caducan y pasan automáticamente a dominio público.',
    },
  ];

  const checkExercise3 = () => {
    if (selectedScenario3 === 'b') {
      const res = recordExerciseCompletion('asimetrica', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Diferenciación conceptual impecable!',
        message: 'Exactamente. La asimetría matemática radica en que una operación (cifrar con pública) es computacionalmente fácil para todos, pero la inversa (descifrar) requiere el "secreto trampa" que solo reside en la clave privada. Nunca son intercambiables.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Concepto incorrecto',
        message: 'La clave pública y privada cumplen roles estrictamente opuestos e irreemplazables.',
        hint: 'Si la clave pública pudiera descifrar, ¿qué pasaría con la confidencialidad?',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Detecta una comunicación insegura (Ataque Man-in-the-Middle)
  // =========================================================================
  const [selectedMitM4, setSelectedMitM4] = useState(null);
  const mitmOptions4 = [
    {
      id: 'a',
      title: 'Ataque Man-in-the-Middle: suplantación de la clave pública sin verificar',
      desc: 'Un atacante en la red interceptó la clave pública de Bob y entregó la suya propia a Alice. Alice cifró con la clave del atacante. Solución: verificar la huella digital (fingerprint) o usar certificados digitales emitidos por una CA confiable.',
    },
    {
      id: 'b',
      title: 'Fallo de hardware: el procesador de Bob no soporta números primos grandes',
      desc: 'El algoritmo asimétrico calculó mal los factores primos y filtró el texto en claro por la memoria RAM.',
    },
    {
      id: 'c',
      title: 'Fallo de velocidad: la red fue demasiado rápida para el cifrado asimétrico',
      desc: 'Los paquetes cifrados llegaron desordenados al receptor.',
    },
  ];

  const checkExercise4 = () => {
    if (selectedMitM4 === 'a') {
      const res = recordExerciseCompletion('asimetrica', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Vulnerabilidad y contramedida identificadas!',
        message: 'Has detectado el ataque Man-in-the-Middle (MitM). La criptografía asimétrica resuelve la confidencialidad, pero NO la autenticidad de la clave pública por sí sola. Para garantizar que la clave pública pertenece realmente a Bob se utilizan Certificados Digitales (X.509) o validación de huella digital de la clave.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Diagnóstico incorrecto',
        message: 'El problema no es de hardware ni velocidad, sino de confianza en la procedencia de la clave pública.',
        hint: '¿Cómo sabe Alice que la clave pública recibida realmente le pertenece a Bob y no a un intermediario?',
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
    setEncryptKeySelection1(null);
    setDecryptKeySelection1(null);
    setOrderedSteps2(initialSteps2);
    setSelectedScenario3(null);
    setSelectedMitM4(null);
    setFeedback(null);
    setIsVictory(false);
  };

  const canCheck = useMemo(() => {
    if (currentStep === 1) return encryptKeySelection1 && decryptKeySelection1;
    if (currentStep === 2) return true;
    if (currentStep === 3) return selectedScenario3 !== null;
    if (currentStep === 4) return selectedMitM4 !== null;
    return false;
  }, [currentStep, encryptKeySelection1, decryptKeySelection1, selectedScenario3, selectedMitM4]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="3. Criptografía Asimétrica"
        moduleNumber={3}
        nextModulePath="/aprendizaje/hash"
        nextModuleName="Funciones Hash Criptográficas"
        earnedXp={100}
        summaryPoints={[
          'La criptografía asimétrica se basa en un par de claves matemáticamente vinculadas: una Pública (abierta) y una Privada (estrictamente secreta).',
          'Para confidencialidad, el emisor cifra con la Clave Pública del destinatario y este descifra con su Clave Privada.',
          'Resuelve el problema de distribución de secretos sin requerir un canal previo seguro.',
          'La autenticidad de la clave pública debe verificarse mediante huellas digitales o Autoridades de Certificación (PKI) para evitar ataques Man-in-the-Middle.',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="asimetrica"
      moduleTitle="Criptografía Asimétrica"
      currentStep={currentStep}
      totalSteps={4}
      userXp={progressState.xp}
      canCheck={canCheck}
      feedback={feedback}
      onCheck={handleCheck}
      onContinue={handleContinue}
      onRetry={handleRetry}
      completedSteps={completedSteps}
      instruction={
        currentStep === 1
          ? 'Envía un mensaje confidencial: asigna las claves correctas'
          : currentStep === 2
          ? 'Reconstruye el intercambio de comunicación asimétrica'
          : currentStep === 3
          ? 'Encuentra la clave correcta: roles del par de claves'
          : 'Detecta una comunicación insegura: Ataque Man-in-the-Middle'
      }
      description={
        currentStep === 1
          ? 'Alice desea enviar información secreta a Bob. Selecciona la clave que usará Alice para cifrar y la que usará Bob para descifrar.'
          : currentStep === 2
          ? 'Ordena las 4 fases del ciclo de comunicación asimétrica desde la generación de claves hasta la recepción.'
          : currentStep === 3
          ? 'Evalúa la relación matemática y de seguridad entre la clave pública y la clave privada.'
          : 'Un intermediario interceptó una conversación asimétrica. Identifica la vulnerabilidad técnica y su protección.'
      }
    >
      {/* ── RETO 1: Envía un mensaje confidencial ── */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Alice Box */}
            <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={20} color="var(--clr-accent)" />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--txt-primary)' }}>Alice (Emisora)</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', marginBottom: '16px' }}>
                ¿Con qué clave debe Alice <strong>cifrar</strong> el mensaje confidencial para Bob?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {keyOptions1.map((k) => (
                  <button
                    key={`enc-${k.id}`}
                    type="button"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: encryptKeySelection1 === k.id ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                      background: encryptKeySelection1 === k.id ? 'rgba(0, 212, 255, 0.15)' : 'var(--clr-surface-3)',
                      color: encryptKeySelection1 === k.id ? 'var(--clr-accent)' : 'var(--txt-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'all var(--t-fast)',
                    }}
                    onClick={() => {
                      setEncryptKeySelection1(k.id);
                      setFeedback(null);
                    }}
                  >
                    🔑 {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bob Box */}
            <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={20} color="var(--clr-success)" />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--txt-primary)' }}>Bob (Receptor)</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', marginBottom: '16px' }}>
                ¿Con qué clave debe Bob <strong>descifrar</strong> el criptograma recibido?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {keyOptions1.map((k) => (
                  <button
                    key={`dec-${k.id}`}
                    type="button"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: decryptKeySelection1 === k.id ? '2px solid var(--clr-success)' : '1px solid var(--clr-border)',
                      background: decryptKeySelection1 === k.id ? 'rgba(16, 212, 110, 0.15)' : 'var(--clr-surface-3)',
                      color: decryptKeySelection1 === k.id ? 'var(--clr-success)' : 'var(--txt-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'all var(--t-fast)',
                    }}
                    onClick={() => {
                      setDecryptKeySelection1(k.id);
                      setFeedback(null);
                    }}
                  >
                    🔐 {k.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RETO 2: Reconstruye el intercambio ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
            Ordena las etapas usando los botones ▲ y ▼ para reflejar cómo viaja un mensaje asimétrico:
          </p>
          <div className="duo-sequencer-list">
            {orderedSteps2.map((step, idx) => (
              <div key={step.id} className="duo-sequencer-item">
                <div className="duo-step-idx">{idx + 1}</div>
                <div className="duo-sequencer-text">{step.text}</div>
                <div className="duo-reorder-btns">
                  <button
                    type="button"
                    className="duo-reorder-btn"
                    disabled={idx === 0}
                    onClick={() => moveStep2(idx, -1)}
                    title="Subir paso"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="duo-reorder-btn"
                    disabled={idx === orderedSteps2.length - 1}
                    onClick={() => moveStep2(idx, 1)}
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

      {/* ── RETO 3: Encuentra la clave correcta ── */}
      {currentStep === 3 && (
        <div className="duo-options-grid">
          {questions3.map((q) => (
            <div
              key={q.id}
              className={`duo-option-card ${selectedScenario3 === q.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedScenario3(q.id);
                setFeedback(null);
              }}
            >
              <div className="duo-option-radio">
                {selectedScenario3 === q.id && <div className="duo-option-radio-inner" />}
              </div>
              <div className="duo-option-body">
                <h4 className="duo-option-title">{q.title}</h4>
                <p className="duo-option-desc">{q.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RETO 4: Detecta una comunicación insegura ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt-primary)', background: 'var(--clr-surface-3)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--clr-warning)' }}>
            <strong>Escenario de Interceptación:</strong> Alice solicitó por chat la clave pública de Bob. Un intermediario en la red Wi-Fi capturó la petición, generó su propio par de claves e inyectó su propia clave pública haciéndose pasar por Bob. Alice cifró sus contraseñas con esa clave. ¿Cuál es el ataque y cómo se soluciona?
          </p>

          <div className="duo-options-grid">
            {mitmOptions4.map((opt) => (
              <div
                key={opt.id}
                className={`duo-option-card ${selectedMitM4 === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMitM4(opt.id);
                  setFeedback(null);
                }}
              >
                <div className="duo-option-radio">
                  {selectedMitM4 === opt.id && <div className="duo-option-radio-inner" />}
                </div>
                <div className="duo-option-body">
                  <h4 className="duo-option-title">{opt.title}</h4>
                  <p className="duo-option-desc">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </LessonContainer>
  );
}
