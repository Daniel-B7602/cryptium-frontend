import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Unlock,
  Key,
  Shield,
  SearchCode,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  HelpCircle,
  Eye,
} from 'lucide-react';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import { caesarShift } from '../utils/cryptanalysisUtils';
import '../components/learning/ExerciseWidgets.css';

export default function LearningFundamentos() {
  const navigate = useNavigate();

  // Progress state
  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);

  // Completed steps tracker
  const completedSteps = progressState.completedExercises.fundamentos || [];

  // =========================================================================
  // EJERCICIO 1 — Protege el mensaje (Cifrado César con shift = 3)
  // Mensaje en claro: "HOLA" -> Cifrado objetivo: "KROD"
  // =========================================================================
  const message1 = 'HOLA';
  const shift1 = 3;
  const targetCipher1 = useMemo(() => caesarShift(message1, shift1), [message1, shift1]);
  // Available tokens to assemble into slots
  const [assembledTokens1, setAssembledTokens1] = useState([]);
  const availableTokens1 = useMemo(() => {
    return [
      { id: 't1', char: 'K' },
      { id: 't2', char: 'R' },
      { id: 't3', char: 'O' },
      { id: 't4', char: 'D' },
      { id: 't5', char: 'X' },
      { id: 't6', char: 'P' },
    ];
  }, []);

  const handleAddToken1 = (token) => {
    if (assembledTokens1.length < message1.length) {
      setAssembledTokens1((prev) => [...prev, token]);
      setFeedback(null);
    }
  };

  const handleRemoveToken1 = (index) => {
    setAssembledTokens1((prev) => prev.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const checkExercise1 = () => {
    const assembledText = assembledTokens1.map((t) => t.char).join('');
    if (assembledText === targetCipher1) {
      const res = recordExerciseCompletion('fundamentos', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Excelente cifrado!',
        message: `Has aplicado la transformación César con desplazamiento k = 3. Cada letra avanzó 3 posiciones: H->K, O->R, L->O, A->D, obteniendo "${targetCipher1}".`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Transformación incorrecta',
        message: `El criptograma ensamblado "${assembledText}" no coincide con el cifrado César (k = 3) de "${message1}".`,
        hint: 'H (+3) = K, O (+3) = R, L (+3) = O, A (+3) = D.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Descifra la comunicación (César inverso)
  // Criptograma: "VHJXULGDG" con shift = 3 -> Original: "SEGURIDAD"
  // =========================================================================
  const cipher2 = 'VHJXULGDG';
  const shift2 = 3;
  const targetPlain2 = useMemo(() => caesarShift(cipher2, 26 - shift2), [cipher2, shift2]);
  const [userInput2, setUserInput2] = useState('');

  const checkExercise2 = () => {
    const cleanInput = userInput2.trim().toUpperCase();
    if (cleanInput === targetPlain2) {
      const res = recordExerciseCompletion('fundamentos', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Mensaje original recuperado!',
        message: `El proceso de descifrado es la transformación inversa exacta: restar el desplazamiento k = 3 a cada letra. V(-3)=S, H(-3)=E, J(-3)=G... revelando "${targetPlain2}".`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Descifrado incorrecto',
        message: `El texto "${cleanInput}" no corresponde al mensaje original.`,
        hint: 'Resta 3 posiciones a cada letra del criptograma "VHJXULGDG".',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — Encuentra el desplazamiento
  // Criptograma: "FODYH" que corresponde a la palabra "CLAVE"
  // El usuario ajusta un control de desplazamiento (0 a 10) hasta que coincida
  // =========================================================================
  const targetCipher3 = 'FODYH';
  const plainWord3 = 'CLAVE';
  const [selectedShift3, setSelectedShift3] = useState(1);
  const currentDecrypted3 = useMemo(() => caesarShift(targetCipher3, 26 - selectedShift3), [targetCipher3, selectedShift3]);

  const checkExercise3 = () => {
    if (selectedShift3 === 3) {
      const res = recordExerciseCompletion('fundamentos', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Desplazamiento identificado con precisión!',
        message: `Exacto: el desplazamiento utilizado fue k = 3. Al aplicar shift = 3, "CLAVE" se transforma exactamente en "FODYH" (C->F, L->O, A->D, V->Y, E->H).`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Desplazamiento incorrecto',
        message: `Con desplazamiento k = ${selectedShift3}, el texto resultante es "${currentDecrypted3}", el cual no coincide con la palabra esperada "CLAVE".`,
        hint: 'Compara la distancia en el alfabeto entre la primera letra C y la primera letra cifrada F (C=3, D=4, E=5, F=6).',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Detecta el error de seguridad (César en el mundo real)
  // Identificar por qué César es totalmente vulnerable en datos reales
  // =========================================================================
  const [selectedOption4, setSelectedOption4] = useState(null);
  const options4 = [
    {
      id: 'a',
      title: 'Solo funciona si los mensajes están escritos en latín clásico',
      desc: 'El algoritmo fue diseñado en la antigua Roma y pierde eficacia matemática en idiomas modernos.',
    },
    {
      id: 'b',
      title: 'Espacio de claves diminuto (25 claves) y preservación de frecuencias',
      desc: 'Un atacante puede probar todas las claves en microsegundos o analizar la frecuencia de letras para romperlo de inmediato.',
    },
    {
      id: 'c',
      title: 'La clave se vuelve más débil cada vez que se envía por internet',
      desc: 'Los routers de red alteran automáticamente el desplazamiento de los caracteres en tránsito.',
    },
  ];

  const checkExercise4 = () => {
    if (selectedOption4 === 'b') {
      const res = recordExerciseCompletion('fundamentos', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Análisis de seguridad impecable!',
        message: 'Un cifrado monoalfabético como César es totalmente inadecuado para proteger información real: solo existen 25 claves posibles (fuerza bruta trivial) y cada letra siempre se mapea al mismo carácter, conservando intacta la estructura estadística del idioma.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Esa no es la debilidad técnica real',
        message: 'La vulnerabilidad fundamental de César radica en su pequeñísimo espacio de búsqueda y en que no enmascara las propiedades estadísticas del lenguaje.',
        hint: '¿Cuántos desplazamientos posibles existen en el alfabeto y qué ocurre con letras muy frecuentes como la "E"?',
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
    setAssembledTokens1([]);
    setUserInput2('');
    setSelectedShift3(1);
    setSelectedOption4(null);
    setFeedback(null);
    setIsVictory(false);
  };

  // Determinar si el botón Comprobar debe estar habilitado
  const canCheck = useMemo(() => {
    if (currentStep === 1) return assembledTokens1.length === message1.length;
    if (currentStep === 2) return userInput2.trim().length > 0;
    if (currentStep === 3) return true;
    if (currentStep === 4) return selectedOption4 !== null;
    return false;
  }, [currentStep, assembledTokens1, userInput2, selectedOption4]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="1. Fundamentos de Criptografía"
        moduleNumber={1}
        nextModulePath="/aprendizaje/simetrica"
        nextModuleName="Criptografía Simétrica"
        earnedXp={100}
        summaryPoints={[
          'El cifrado transforma un texto en claro legible en un criptograma mediante una clave secreta.',
          'El descifrado es la transformación matemática inversa exacta que requiere la clave correspondiente.',
          'Los cifrados clásicos como César son vulnerables por su mínimo espacio de claves (25 desplazamientos) y preservación de frecuencias.',
          'La seguridad moderna requiere algoritmos matemáticamente robustos (confusión y difusión) en lugar de ocultación ingenua.',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="fundamentos"
      moduleTitle="Fundamentos de Criptografía"
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
          ? 'Protege el mensaje: construye el criptograma César'
          : currentStep === 2
          ? 'Descifra la comunicación interceptada'
          : currentStep === 3
          ? 'Encuentra el desplazamiento secreto del criptograma'
          : 'Detecta el error crítico de seguridad'
      }
      description={
        currentStep === 1
          ? `Aplica un Cifrado César con desplazamiento k = ${shift1}. Desplaza cada letra del mensaje "${message1}" para formar el criptograma.`
          : currentStep === 2
          ? `Se ha interceptado el criptograma "${cipher2}". Se sabe que fue cifrado con desplazamiento k = ${shift2}. Recupera el mensaje original.`
          : currentStep === 3
          ? `Sabes que el criptograma "${targetCipher3}" oculta la palabra "${plainWord3}". Modifica el desplazamiento hasta revelar el texto legible.`
          : 'Analiza la siguiente situación y determina por qué un cifrado clásico no es apto para proteger información real.'
      }
    >
      {/* ── RETO 1: Protege el mensaje ── */}
      {currentStep === 1 && (
        <div className="duo-assembly-box">
          <div className="duo-target-preview">
            <span style={{ color: 'var(--txt-secondary)' }}>Texto original:</span>
            <strong style={{ letterSpacing: '0.2em', color: 'var(--txt-primary)' }}>{message1}</strong>
            <span style={{ color: 'var(--clr-accent)', marginLeft: '12px' }}>(Desplazamiento k = 3)</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--txt-secondary)' }}>
            Haz clic en las fichas para colocar los caracteres cifrados en orden:
          </p>

          <div className="duo-slots-row">
            {Array.from({ length: message1.length }).map((_, idx) => {
              const placed = assembledTokens1[idx];
              return (
                <div
                  key={idx}
                  className="duo-slot-chip"
                  onClick={() => placed && handleRemoveToken1(idx)}
                  title={placed ? 'Clic para remover ficha' : 'Ranura vacía'}
                >
                  {placed ? placed.char : '_'}
                </div>
              );
            })}
          </div>

          <div className="duo-available-chips">
            {availableTokens1.map((token) => {
              const isUsed = assembledTokens1.some((t) => t.id === token.id);
              return (
                <button
                  key={token.id}
                  type="button"
                  className="duo-token-chip"
                  disabled={isUsed || assembledTokens1.length >= message1.length}
                  onClick={() => handleAddToken1(token)}
                >
                  {token.char}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RETO 2: Descifra la comunicación ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          <div className="duo-target-preview" style={{ justifyContent: 'center' }}>
            <span style={{ color: 'var(--clr-error)' }}>Criptograma:</span>
            <strong style={{ letterSpacing: '0.15em', fontSize: '1.25rem' }}>{cipher2}</strong>
            <span style={{ color: 'var(--clr-accent)', marginLeft: '8px' }}>k = {shift2}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt-secondary)' }}>
              Introduce el mensaje original descifrado:
            </label>
            <input
              type="text"
              className="duo-input-field"
              placeholder="Ej: SEGURIDAD"
              value={userInput2}
              onChange={(e) => {
                setUserInput2(e.target.value.toUpperCase());
                setFeedback(null);
              }}
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.1rem', textAlign: 'center' }}
            />
          </div>

          <div style={{ background: 'var(--clr-surface-3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--txt-secondary)' }}>
            💡 <strong style={{ color: 'var(--txt-primary)' }}>Regla de Descifrado:</strong> Cada letra debe retroceder {shift2} posiciones en el alfabeto (V-3 = S, H-3 = E...).
          </div>
        </div>
      )}

      {/* ── RETO 3: Encuentra el desplazamiento ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="duo-target-preview" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>Criptograma capturado:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--clr-accent)', letterSpacing: '0.15em' }}>{targetCipher3}</strong>
            </div>
            <div className="duo-target-preview" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)' }}>Pista de contenido:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--clr-success)', letterSpacing: '0.15em' }}>{plainWord3}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--clr-surface-2)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 700, color: 'var(--txt-primary)' }}>
                Probar Desplazamiento (k):
              </label>
              <span style={{ background: 'var(--clr-surface-3)', padding: '4px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--clr-accent)', fontWeight: 800, fontSize: '1.1rem' }}>
                k = {selectedShift3}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={selectedShift3}
              onChange={(e) => {
                setSelectedShift3(Number(e.target.value));
                setFeedback(null);
              }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--clr-accent)' }}
            />

            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--clr-surface-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)' }}>Texto al aplicar retroceso k={selectedShift3}: </span>
              <strong style={{ fontSize: '1.2rem', color: currentDecrypted3 === plainWord3 ? 'var(--clr-success)' : 'var(--txt-primary)', letterSpacing: '0.15em', marginLeft: '8px' }}>
                {currentDecrypted3}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ── RETO 4: Detecta el error de seguridad ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt-primary)', background: 'var(--clr-surface-3)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--clr-warning)' }}>
            <strong>Escenario práctico:</strong> Un banco almacena las contraseñas de sus usuarios utilizando Cifrado César con desplazamiento k = 17 en su base de datos principal, argumentando que "el texto no puede leerse a simple vista". ¿Cuál es el error técnico crítico?
          </p>

          <div className="duo-options-grid">
            {options4.map((opt) => (
              <div
                key={opt.id}
                className={`duo-option-card ${selectedOption4 === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedOption4(opt.id);
                  setFeedback(null);
                }}
              >
                <div className="duo-option-radio">
                  {selectedOption4 === opt.id && <div className="duo-option-radio-inner" />}
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
