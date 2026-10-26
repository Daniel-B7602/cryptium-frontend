import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchCode,
  Shield,
  Key,
  Lock,
  Unlock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart2,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import {
  caesarShift,
  bruteForceCaesar,
  calculateFrequencies,
} from '../utils/cryptanalysisUtils';
import '../components/learning/ExerciseWidgets.css';

export default function LearningCryptanalysis() {
  const navigate = useNavigate();

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);

  const completedSteps = progressState.completedExercises.criptoanalisis || [];

  // =========================================================================
  // EJERCICIO 1 — Descubre el patrón
  // Criptograma con patrones monoalfabéticos visibles
  // =========================================================================
  const sampleCipher1 = 'KR FXDQGR HO VRO VDOLR, HOORV YLHURQ OD FLXGDG.';
  const [selectedPattern1, setSelectedPattern1] = useState(null);
  const patternOptions1 = [
    {
      id: 'a',
      title: 'Las palabras cortas repetidas como "HO" (EL) y la letra aislada "Y" (V) revelan la estructura de un cifrado monoalfabético',
      desc: 'En un cifrado clásico por sustitución, cada letra en claro se reemplaza siempre por el mismo símbolo, por lo que la gramática y palabras de 1 o 2 letras conservan su longitud y patrón.',
    },
    {
      id: 'b',
      title: 'El mensaje está cifrado con RSA porque utiliza caracteres en mayúsculas',
      desc: 'Cualquier texto en mayúsculas indica la presencia de números primos asimétricos.',
    },
    {
      id: 'c',
      title: 'No hay ningún patrón; el texto es idéntico a una secuencia de ruido aleatorio criptográfico',
      desc: 'El Cifrado César genera la máxima entropía teórica de Shannon.',
    },
  ];

  const checkExercise1 = () => {
    if (selectedPattern1 === 'a') {
      const res = recordExerciseCompletion('criptoanalisis', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Patrón criptoanalítico detectado!',
        message: 'Excelente observación: al ser una sustitución simple monoalfabética, los espacios, longitudes de palabras y palabras comunes (como artículos "EL" -> "HO") preservan su estructura original. Este es el primer indicio para un criptoanalista.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Interpretación incorrecta',
        message: 'Revisa las palabras breves del mensaje. En César, cada letra siempre se transforma en la misma.',
        hint: 'Fíjate en cómo "HO" aparece dos veces y las palabras tienen las mismas longitudes del español.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Analiza las frecuencias
  // Texto cifrado suficientemente largo para análisis estadístico
  // =========================================================================
  const cipherTextFreq2 = 'OD FULSWRJUDILD HV OD GLVFLSOLQD TXH VH RFXSD GH ODV WHFQLFDV GH FLIUDGR R FRGLILFDGR GHVWLQDGDV D DOWHUDU ODV UHSUHVHQWDFLRQHV OLQJXLVWLFDV GH FLHUWRV PHQVDMHV FRQ HO ILQ GH KDFHUORV LQLQWHOLJLEOHV D UHFHSWRUHV QR DXWRULCDGRV.';
  // El texto original es con shift = 3.
  // La letra más frecuente en el criptograma es 'D' o 'H'. En el criptograma:
  // E (+3) = H. Por tanto, la letra más común del español ('E') se desplazó a 'H'.
  const freqData2 = useMemo(() => {
    const res = calculateFrequencies(cipherTextFreq2, 'es');
    // Tomar las top 8 letras observadas
    return res.data
      .filter((d) => d.count > 0)
      .sort((a, b) => b.observed - a.observed)
      .slice(0, 8);
  }, []);

  const [hypothesizedShift2, setHypothesizedShift2] = useState(1);
  const topObservedLetter = freqData2[0]?.letter || 'H';

  const checkExercise2 = () => {
    // Si la letra más frecuente observada es 'H' y en español la más frecuente es 'E',
    // E (4) + 3 = H (7) -> shift = 3
    if (hypothesizedShift2 === 3) {
      const res = recordExerciseCompletion('criptoanalisis', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Hipótesis de frecuencia acertada!',
        message: `La letra con mayor frecuencia en el criptograma es "${topObservedLetter}". Sabiendo que en español la letra más frecuente es la "E", la distancia entre "E" y "${topObservedLetter}" es de 3 posiciones (k = 3). ¡Has realizado un criptoanálisis por frecuencias exitoso!`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Desplazamiento no concordante',
        message: `Con k = ${hypothesizedShift2}, no se alinea el pico de frecuencia de "${topObservedLetter}" con la letra "E" (la más frecuente del español con ~13.7%).`,
        hint: 'Cuenta cuántas posiciones hay en el alfabeto desde la letra E (5ª) hasta la letra H (8ª).',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — Rompe el cifrado (Fuerza Bruta)
  // =========================================================================
  const bruteCipher3 = 'WKH VHFUHW FRGH LV FUBSWLXP';
  // Texto original: "THE SECRET CODE IS CRYPTIUM" (Shift = 3)
  const bruteCandidates3 = useMemo(() => {
    return bruteForceCaesar(bruteCipher3, 'en');
  }, []);

  const [selectedBruteShift3, setSelectedBruteShift3] = useState(null);

  const checkExercise3 = () => {
    if (selectedBruteShift3 === 3) {
      const res = recordExerciseCompletion('criptoanalisis', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Criptograma roto por fuerza bruta!',
        message: 'Con k = 3, el texto recuperado es: "THE SECRET CODE IS CRYPTIUM". Dado que César solo posee 25 desplazamientos posibles, una búsqueda exhaustiva prueba todas las variantes en menos de 1 milisegundo, haciendo que este cifrado carezca de seguridad en la era computacional.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Opción no legible',
        message: 'La rotación seleccionada produce texto ininteligible.',
        hint: 'Busca la fila donde las palabras en inglés ("THE SECRET CODE...") sean completamente claras.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Evalúa la debilidad (César vs Cifrados Modernos AES)
  // =========================================================================
  const [selectedEval4, setSelectedEval4] = useState(null);
  const evalOptions4 = [
    {
      id: 'a',
      title: 'César es vulnerable por su espacio de claves (25) y preservación de frecuencias; AES resiste gracias a confusión, difusión y claves de 2^256',
      desc: 'En César, cada letra siempre tiene el mismo sustituto (frecuencias intactas). En AES, cada bit de salida depende de todos los bits de entrada y clave, generando una salida estadísticamente indistinguible de ruido blanco con 1.15 × 10^77 claves posibles.',
    },
    {
      id: 'b',
      title: 'AES es vulnerable al análisis de frecuencias si el texto está en español',
      desc: 'El análisis de frecuencias puede romper AES-256 en pocos minutos con una tabla de letras del español.',
    },
    {
      id: 'c',
      title: 'Ambos algoritmos tienen la misma resistencia si se usa una contraseña de 8 letras',
      desc: 'No hay diferencia de seguridad entre cifrado monoalfabético y cifrado por bloques.',
    },
  ];

  const checkExercise4 = () => {
    if (selectedEval4 === 'a') {
      const res = recordExerciseCompletion('criptoanalisis', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Evaluación criptográfica definitiva!',
        message: '¡Excelente conclusión del curso! El criptoanálisis clásico demostró que ocultar letras no basta: se requiere Confusión (cajas S no lineales) y Difusión (permutaciones de bloques) como las de Shannon y AES, junto a un espacio de claves exponencialmente inexpugnable.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Evaluación incorrecta',
        message: 'AES no preserva frecuencias de letras en absoluto y no puede romperse por análisis estadístico elemental.',
        hint: 'Recuerda las propiedades de confusión y difusión que hacen a AES el estándar mundial.',
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
    setSelectedPattern1(null);
    setHypothesizedShift2(1);
    setSelectedBruteShift3(null);
    setSelectedEval4(null);
    setFeedback(null);
    setIsVictory(false);
  };

  const canCheck = useMemo(() => {
    if (currentStep === 1) return selectedPattern1 !== null;
    if (currentStep === 2) return true;
    if (currentStep === 3) return selectedBruteShift3 !== null;
    if (currentStep === 4) return selectedEval4 !== null;
    return false;
  }, [currentStep, selectedPattern1, selectedBruteShift3, selectedEval4]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="6. Criptoanálisis y Ataques"
        moduleNumber={6}
        nextModulePath="/aprendizaje"
        nextModuleName="Ruta de Aprendizaje Cryptium"
        earnedXp={100}
        summaryPoints={[
          'El análisis de patrones permite identificar la estructura sintáctica de cifrados monoalfabéticos.',
          'El análisis de frecuencias compara los picos estadísticos del criptograma con las letras más comunes del idioma.',
          'El ataque por fuerza bruta prueba exhaustivamente el espacio de claves: letal para César (25 claves), inútil para AES-256 (2^256 claves).',
          'Los cifrados modernos garantizan confusión y difusión, destruyendo cualquier correlación estadística aprovechable.',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="criptoanalisis"
      moduleTitle="Criptoanálisis y Ataques"
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
          ? 'Descubre el patrón en el criptograma interceptado'
          : currentStep === 2
          ? 'Analiza las frecuencias y formula una hipótesis de descifrado'
          : currentStep === 3
          ? 'Rompe el cifrado: ataque exhaustivo por fuerza bruta'
          : 'Evalúa la debilidad: Criptoanálisis clásico vs Cifrados modernos'
      }
      description={
        currentStep === 1
          ? 'Inspecciona el texto cifrado e identifica los patrones estructurales típicos de un cifrado monoalfabético.'
          : currentStep === 2
          ? 'Examina el histograma de frecuencias observadas vs teóricas del español para deducir el desplazamiento k.'
          : currentStep === 3
          ? 'Explora las rotaciones generadas por la herramienta de fuerza bruta y selecciona la que revela el texto legible.'
          : 'Compara por qué las técnicas estadísticas rompen a César pero son completamente inútiles frente a AES-256.'
      }
    >
      {/* ── RETO 1: Descubre el patrón ── */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--clr-accent)', textTransform: 'uppercase', fontWeight: 700 }}>
              Criptograma capturado por el analista:
            </span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.15rem', color: '#ffffff', letterSpacing: '0.08em', marginTop: '8px' }}>
              "{sampleCipher1}"
            </div>
          </div>

          <div className="duo-options-grid">
            {patternOptions1.map((opt) => (
              <div
                key={opt.id}
                className={`duo-option-card ${selectedPattern1 === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPattern1(opt.id);
                  setFeedback(null);
                }}
              >
                <div className="duo-option-radio">
                  {selectedPattern1 === opt.id && <div className="duo-option-radio-inner" />}
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

      {/* ── RETO 2: Analiza las frecuencias ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', fontWeight: 700 }}>
              DISTRIBUCIÓN DE FRECUENCIAS DE LETRAS (%) EN EL CRIPTOGRAMA
            </span>
            <div style={{ height: '220px', width: '100%', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData2} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="letter" stroke="#8a9bb5" />
                  <YAxis stroke="#8a9bb5" unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1421', borderColor: '#1e2d45', borderRadius: '8px', color: '#e8edf5' }}
                    formatter={(val) => [`${val}%`, 'Frecuencia']}
                  />
                  <Bar dataKey="observed" name="Observada en Criptograma" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reference" name="Referencia Español" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'var(--clr-surface-3)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                Hipótesis de Desplazamiento (k):
              </label>
              <span style={{ background: 'var(--clr-surface)', padding: '4px 12px', borderRadius: '4px', color: 'var(--clr-accent)', fontWeight: 800 }}>
                k = {hypothesizedShift2}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={hypothesizedShift2}
              onChange={(e) => {
                setHypothesizedShift2(Number(e.target.value));
                setFeedback(null);
              }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--clr-accent)' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', marginTop: '8px', display: 'block' }}>
              💡 Pista: La letra más frecuente en el criptograma es <strong>"{topObservedLetter}"</strong>. Si corresponde a la letra "E" en español, ¿cuánto vale k?
            </span>
          </div>
        </div>
      )}

      {/* ── RETO 3: Rompe el cifrado (Fuerza Bruta) ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--clr-warning)', fontWeight: 700 }}>CRIPTOGRAMA OBJETIVO:</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', fontSize: '1rem', marginTop: '4px' }}>
              "{bruteCipher3}"
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)' }}>
            Selecciona la fila del ataque por fuerza bruta donde las palabras resulten legibles en inglés:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
            {bruteCandidates3.slice(0, 10).map((cand) => (
              <div
                key={cand.shift}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedBruteShift3 === cand.shift ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  background: selectedBruteShift3 === cand.shift ? 'rgba(0, 212, 255, 0.12)' : 'var(--clr-surface-2)',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast)',
                }}
                onClick={() => {
                  setSelectedBruteShift3(cand.shift);
                  setFeedback(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', width: '40px' }}>k = {cand.shift}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', color: selectedBruteShift3 === cand.shift ? 'var(--clr-accent)' : 'var(--txt-primary)' }}>
                    {cand.plaintext}
                  </span>
                </div>
                {cand.isBest && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16, 212, 110, 0.2)', color: 'var(--clr-success)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Alta Plausibilidad
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RETO 4: Evalúa la debilidad ── */}
      {currentStep === 4 && (
        <div className="duo-options-grid">
          {evalOptions4.map((opt) => (
            <div
              key={opt.id}
              className={`duo-option-card ${selectedEval4 === opt.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedEval4(opt.id);
                setFeedback(null);
              }}
            >
              <div className="duo-option-radio">
                {selectedEval4 === opt.id && <div className="duo-option-radio-inner" />}
              </div>
              <div className="duo-option-body">
                <h4 className="duo-option-title">{opt.title}</h4>
                <p className="duo-option-desc">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </LessonContainer>
  );
}
