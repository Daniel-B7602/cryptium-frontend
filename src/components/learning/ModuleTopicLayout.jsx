import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw,
  Compass,
  HelpCircle,
  Lightbulb,
  Shield,
  Key,
  FileCheck,
  SearchCode,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { MODULE_TOPICS } from '../../data/learningCurriculum';
import { DynamicExerciseWidget } from './ExerciseWidgets';
import LessonContainer from './LessonContainer';
import LessonVictory from './LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
  MODULE_ORDER,
} from '../../utils/learningProgress';
import './ModuleTopicLayout.css';

/**
 * Unified Layout for Cryptium's 6 Learning Topics.
 * Strictly separates:
 *   - Apartado A: Aprender (Teoría pedagógica, analogías cotidianas, diagramas conceptuales)
 *   - Apartado B: Practicar (4 Ejercicios progresivos · 16 Retos interactivos sin respuestas anticipadas)
 */
export default function ModuleTopicLayout({ topicId }) {
  const navigate = useNavigate();

  // Load topic definition from curriculum
  const topic = MODULE_TOPICS[topicId];

  // Navigation tab: 'aprender' (Teoría) | 'practicar' (Laboratorio de Ejercicios)
  const [activeTab, setActiveTab] = useState('aprender');

  // Gamification progress state
  const [progress, setProgress] = useState(getGamifiedProgress);

  // Active exercise state: null (viewing exercise roadmap) | 1..4 (running active exercise)
  const [selectedExerciseNum, setSelectedExerciseNum] = useState(null);

  // Challenge stepper within selected exercise (0 to 3 -> Reto 1 to 4)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // User input answer in active widget
  const [userAnswer, setUserAnswer] = useState(null);

  // Feedback state: null | { status: 'success' | 'error', title, message, explanation }
  const [feedback, setFeedback] = useState(null);

  // Victory screens
  const [isExerciseVictory, setIsExerciseVictory] = useState(false);
  const [isModuleVictory, setIsModuleVictory] = useState(false);

  // Sync progress from localStorage
  const refreshProgress = () => {
    setProgress(getGamifiedProgress());
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  if (!topic) {
    return (
      <div className="module-not-found">
        <h2>Tema no encontrado</h2>
        <p>El identificador de tema "{topicId}" no existe en el plan de estudios.</p>
        <button
          type="button"
          className="duo-btn-primary"
          onClick={() => navigate('/aprendizaje')}
        >
          Volver a la Ruta de Aprendizaje
        </button>
      </div>
    );
  }

  // Completed exercises list for this module (e.g. [1, 2])
  const completedExercisesList = progress.completedExercises[topicId] || [];
  const completedCount = completedExercisesList.length;
  const isModuleFullyComplete = completedCount >= 4 || progress.completed.includes(topicId);

  // Active exercise object if selected
  const activeExercise = useMemo(() => {
    if (!selectedExerciseNum) return null;
    return (
      topic.exercises.find(
        (ex) => (ex.exerciseNum || ex.num) === selectedExerciseNum
      ) || null
    );
  }, [topic, selectedExerciseNum]);

  // Active challenge object if exercise is selected
  const activeChallenge = useMemo(() => {
    if (!activeExercise) return null;
    return activeExercise.challenges[currentChallengeIndex] || null;
  }, [activeExercise, currentChallengeIndex]);

  // Next module in sequence
  const currentModuleIdx = MODULE_ORDER.indexOf(topicId);
  const nextModuleId = currentModuleIdx >= 0 && currentModuleIdx < MODULE_ORDER.length - 1
    ? MODULE_ORDER[currentModuleIdx + 1]
    : null;
  const nextModuleObj = nextModuleId ? MODULE_TOPICS[nextModuleId] : null;

  // Theory sections & takeaways with robust fallbacks
  const theorySections = topic.theory?.sections || topic.theory?.concepts || [];
  const theoryTakeaways = topic.theory?.takeaways || topic.theory?.coreTakeaways || [];

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Start an exercise from the roadmap
  const handleStartExercise = (exNum) => {
    setSelectedExerciseNum(exNum);
    setCurrentChallengeIndex(0);
    setUserAnswer(null);
    setFeedback(null);
    setIsExerciseVictory(false);
    setIsModuleVictory(false);
  };

  // Check answer with challenge validator
  const handleCheckAnswer = () => {
    if (!activeChallenge) return;

    const validation = activeChallenge.validate(userAnswer);
    const isSuccess = Boolean(validation?.success ?? validation?.valid);

    if (isSuccess) {
      setFeedback({
        status: 'success',
        title: validation?.title || '¡Respuesta Correcta!',
        message: validation?.message,
        explanation: activeChallenge.explanation || validation?.explanation,
      });
    } else {
      setFeedback({
        status: 'error',
        title: validation?.title || 'Respuesta Inexacta',
        message: validation?.message,
        explanation: activeChallenge.explanation || validation?.explanation,
      });
    }
  };

  // Continue to next challenge or complete exercise
  const handleContinue = () => {
    if (!activeExercise) return;

    if (currentChallengeIndex < 3) {
      // Advance to next challenge
      setCurrentChallengeIndex((prev) => prev + 1);
      setUserAnswer(null);
      setFeedback(null);
    } else {
      // Completed all 4 challenges in this exercise
      const { updated, moduleCompletedNow } = recordExerciseCompletion(
        topicId,
        selectedExerciseNum,
        25
      );
      if (updated) setProgress(updated);

      if (moduleCompletedNow || (completedCount + (completedExercisesList.includes(selectedExerciseNum) ? 0 : 1) >= 4)) {
        setIsModuleVictory(true);
      } else {
        setIsExerciseVictory(true);
      }
    }
  };

  // Retry on error
  const handleRetry = () => {
    setFeedback(null);
  };

  // Advance to next exercise from Victory screen
  const handleNextExercise = () => {
    if (selectedExerciseNum < 4) {
      handleStartExercise(selectedExerciseNum + 1);
    } else {
      setSelectedExerciseNum(null);
      setActiveTab('practicar');
    }
  };

  // Return to topic exercise map
  const handleReturnToTopic = () => {
    setSelectedExerciseNum(null);
    setIsExerciseVictory(false);
    setIsModuleVictory(false);
    refreshProgress();
  };

  // ── Render Active Exercise / Victory View ────────────────────────────────
  if (selectedExerciseNum !== null) {
    if (isExerciseVictory || isModuleVictory) {
      return (
        <LessonVictory
          isModuleCompletion={isModuleVictory}
          moduleTitle={topic.title}
          exerciseTitle={activeExercise?.title}
          exerciseNumber={selectedExerciseNum}
          hasNextExercise={selectedExerciseNum < 4}
          earnedXp={isModuleVictory ? 100 : 25}
          nextModulePath={nextModuleObj ? `/aprendizaje/${nextModuleObj.id}` : null}
          nextModuleName={nextModuleObj ? nextModuleObj.title : null}
          summaryPoints={
            isModuleVictory
              ? theoryTakeaways.slice(0, 4)
              : [
                  `Completaste con éxito los 4 retos del ejercicio: "${activeExercise?.title}".`,
                  `Demostraste dominio práctico sobre los conceptos clave de este nivel.`,
                  `+25 XP acreditados a tu progreso general en Cryptium.`,
                ]
          }
          onNextExercise={handleNextExercise}
          onReturnToTopic={handleReturnToTopic}
          onRestart={() => handleStartExercise(selectedExerciseNum)}
        />
      );
    }

    if (activeChallenge) {
      // Can check if user provided valid non-empty answer
      const canCheck = (() => {
        if (userAnswer === null || userAnswer === undefined || userAnswer === '') return false;
        const wType = activeChallenge?.widgetType;
        if (wType === 'token_assembly') {
          return Array.isArray(userAnswer) && userAnswer.length > 0;
        }
        if (wType === 'protocol_sequence') {
          return Array.isArray(userAnswer) && userAnswer.length > 0;
        }
        if (wType === 'signature_tamper') {
          return Boolean(userAnswer && typeof userAnswer === 'object' && userAnswer.signed === true);
        }
        if (wType === 'hash_avalanche') {
          return Boolean(userAnswer && typeof userAnswer === 'object' && (userAnswer.hashA || userAnswer.diffBits !== undefined));
        }
        if (typeof userAnswer === 'string') {
          return userAnswer.trim().length > 0;
        }
        return true;
      })();

      return (
        <LessonContainer
          moduleId={topic.id}
          moduleTitle={`${topic.title} · ${activeExercise?.title}`}
          currentStep={currentChallengeIndex + 1}
          totalSteps={4}
          instruction={activeChallenge.instruction}
          description={activeChallenge.scenario || activeChallenge.description}
          hint={activeChallenge.hint}
          userXp={progress.xp}
          canCheck={canCheck}
          feedback={feedback}
          onCheck={handleCheckAnswer}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onExit={handleReturnToTopic}
          completedSteps={Array.from({ length: currentChallengeIndex }, (_, i) => i + 1)}
        >
          <DynamicExerciseWidget
            key={activeChallenge.id || `${selectedExerciseNum}-${currentChallengeIndex}`}
            challenge={activeChallenge}
            value={userAnswer}
            onChange={(val) => {
              setUserAnswer(val);
              if (feedback) setFeedback(null);
            }}
            disabled={feedback?.status === 'success'}
          />
        </LessonContainer>
      );
    }
  }

  // ── Render Main Topic Hub (Aprender vs Practicar) ─────────────────────────
  return (
    <div className="module-topic-hub">
      {/* ── Breadcrumb & Global Back ── */}
      <div className="topic-hub-nav">
        <button
          type="button"
          className="topic-nav-back"
          onClick={() => navigate('/aprendizaje')}
        >
          <ArrowLeft size={16} />
          <span>Volver a la Ruta</span>
        </button>
        <div className="topic-nav-xp">
          <Sparkles size={16} />
          <span>{progress.xp} XP acumulados</span>
        </div>
      </div>

      {/* ── Header Banner ── */}
      <header className="topic-header-banner">
        <div className="topic-header-meta">
          <span className={`topic-badge ${topic.badgeClass}`}>{topic.title}</span>
          <span className="topic-progress-badge">
            {completedCount} de 4 ejercicios completados ({completedCount * 4}/16 retos)
          </span>
        </div>
        <h1 className="topic-title">{topic.title}</h1>
        <p className="topic-tagline">{topic.subtitle || topic.tagline}</p>
      </header>

      {/* ── View Switcher: Aprender vs Practicar ── */}
      <div className="topic-view-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'aprender'}
          className={`topic-tab-btn ${activeTab === 'aprender' ? 'active' : ''}`}
          onClick={() => setActiveTab('aprender')}
        >
          <BookOpen size={18} />
          <span>A. Aprender (Teoría)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'practicar'}
          className={`topic-tab-btn ${activeTab === 'practicar' ? 'active' : ''}`}
          onClick={() => setActiveTab('practicar')}
        >
          <Zap size={18} />
          <span>B. Practicar (4 Ejercicios · 16 Retos)</span>
          <span className="tab-counter-badge">{completedCount}/4</span>
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="topic-tab-content">
        {/* ================================================================
            APARTADO A: APRENDER (TEORÍA PEDAGÓGICA Y ANALOGÍAS)
            ================================================================ */}
        {activeTab === 'aprender' && (
          <div className="topic-theory-section animate-fade-in">
            {/* 1. Resumen Conceptual */}
            <div className="theory-block summary-card">
              <h2 className="theory-block-title">
                <BookOpen size={20} className="text-accent" />
                Resumen Conceptual
              </h2>
              <p className="theory-summary-text">{topic.theory.summary}</p>
            </div>

            {/* 2. Pilares Conceptuales y Analogías Cotidianas */}
            <div className="theory-block concepts-block">
              <h2 className="theory-block-title">
                <Lightbulb size={20} className="text-amber" />
                Conceptos Clave con Analogías del Mundo Real
              </h2>
              <div className="theory-concepts-grid">
                {theorySections.map((sec, sIdx) => (
                  <div key={sIdx} className="concept-card">
                    <div className="concept-card-header">
                      <span className="concept-icon">{sIdx + 1}</span>
                      <h3 className="concept-title">{sec.title}</h3>
                    </div>

                    {/* Everyday Analogy */}
                    {sec.analogy && (
                      <div className="concept-analogy-box">
                        <div className="analogy-label">🗝️ Analogía de la vida cotidiana</div>
                        <p className="analogy-text">{sec.analogy}</p>
                      </div>
                    )}

                    {/* How it works technically */}
                    {(sec.content || sec.explanation) && (
                      <div className="concept-explanation-box">
                        <div className="explanation-label">⚙️ ¿Cómo opera en informática?</div>
                        <p className="explanation-text">{sec.content || sec.explanation}</p>
                      </div>
                    )}

                    {/* Diagram snippet */}
                    {sec.diagram && (
                      <div style={{
                        background: 'var(--clr-surface)',
                        border: '1px dashed rgba(0, 212, 255, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: 'var(--clr-accent)',
                        wordBreak: 'break-all',
                        lineHeight: 1.45,
                      }}>
                        {sec.diagram}
                      </div>
                    )}

                    {/* Practical example / takeaway */}
                    {sec.example && (
                      <div className="concept-takeaway-pill">
                        <strong>💡 Ejemplo práctico:</strong> {sec.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Puntos Esenciales para Recordar */}
            {theoryTakeaways.length > 0 && (
              <div className="theory-block takeaways-block">
                <h2 className="theory-block-title">
                  <CheckCircle2 size={20} className="text-green" />
                  Puntos Esenciales para el Reto
                </h2>
                <ul className="takeaways-list">
                  {theoryTakeaways.map((point, idx) => (
                    <li key={idx} className="takeaway-item">
                      <CheckCircle2 size={18} className="takeaway-check" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. CTA para pasar a la práctica */}
            <div className="theory-cta-banner">
              <div className="cta-banner-text">
                <h3>¿Listo para poner en práctica lo aprendido?</h3>
                <p>
                  Resuelve los 4 ejercicios progresivos con 16 retos interactivos diseñados para afianzar
                  tu comprensión paso a paso.
                </p>
              </div>
              <button
                type="button"
                className="duo-btn-primary"
                onClick={() => setActiveTab('practicar')}
              >
                <span>Ir a los Ejercicios Prácticos</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================
            APARTADO B: PRACTICAR (MAPA DE 4 EJERCICIOS Y 16 RETOS)
            ================================================================ */}
        {activeTab === 'practicar' && (
          <div className="topic-practice-section animate-fade-in">
            <div className="practice-header-info">
              <div className="practice-header-text">
                <h2>Ruta de Práctica: 4 Ejercicios Progresivos</h2>
                <p>
                  Cada ejercicio contiene <strong>4 retos interactivos</strong> prácticos.
                  Completa cada reto con tus propias acciones y deduce la solución.
                </p>
              </div>
              <div className="practice-header-stats">
                <span className="practice-stat-badge">
                  <CheckCircle2 size={16} />
                  {completedCount} / 4 Ejercicios
                </span>
                <span className="practice-stat-badge xp">
                  <Sparkles size={16} />
                  +{completedCount * 25} / 100 XP
                </span>
              </div>
            </div>

            {/* Grid of 4 Exercises */}
            <div className="exercises-cards-grid">
              {topic.exercises.map((exercise) => {
                const exNum = exercise.exerciseNum || exercise.num;
                const isCompleted = completedExercisesList.includes(exNum);
                const isUnlocked = exNum === 1 || completedExercisesList.includes(exNum - 1) || isCompleted;

                const levelBadgeClasses = {
                  'Básico': 'level-basic',
                  'Aplicado': 'level-applied',
                  'Avanzado': 'level-advanced',
                  'Integrador': 'level-integrator',
                };

                return (
                  <div
                    key={exercise.id || exNum}
                    className={`exercise-card ${isCompleted ? 'is-completed' : ''} ${!isUnlocked ? 'is-locked' : 'is-unlocked'}`}
                  >
                    <div className="exercise-card-header">
                      <div className="exercise-card-meta">
                        <span className={`exercise-level-pill ${levelBadgeClasses[exercise.level] || ''}`}>
                          {exercise.level}
                        </span>
                        <span className="exercise-num-pill">
                          Ejercicio {exNum} de 4
                        </span>
                      </div>

                      {isCompleted && (
                        <span className="exercise-status-badge completed">
                          <Check size={14} /> Completado
                        </span>
                      )}
                      {!isCompleted && isUnlocked && (
                        <span className="exercise-status-badge available">
                          <Zap size={14} /> Disponible
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="exercise-status-badge locked">
                          <Lock size={14} /> Bloqueado
                        </span>
                      )}
                    </div>

                    <h3 className="exercise-card-title">{exercise.title}</h3>
                    <p className="exercise-card-desc">{exercise.desc || exercise.description}</p>

                    <div className="exercise-card-footer">
                      <div className="exercise-challenges-count">
                        <HelpCircle size={15} />
                        <span>4 Retos Prácticos · +25 XP</span>
                      </div>

                      <button
                        type="button"
                        disabled={!isUnlocked}
                        className={`exercise-launch-btn ${isCompleted ? 'btn-revisit' : 'btn-start'}`}
                        onClick={() => handleStartExercise(exNum)}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw size={16} />
                            <span>Repasar</span>
                          </>
                        ) : isUnlocked ? (
                          <>
                            <Play size={16} />
                            <span>Comenzar</span>
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            <span>Bloqueado</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Module Completion Status Banner */}
            {isModuleFullyComplete && (
              <div className="module-completed-celebration">
                <div className="celebration-icon">🏆</div>
                <div className="celebration-text">
                  <h3>¡Has dominado todos los ejercicios de {topic.title}!</h3>
                  <p>
                    Superaste los 16 retos prácticos de este módulo. Puedes repasarlos cuando desees
                    o avanzar al siguiente tema de la ruta.
                  </p>
                </div>
                {nextModuleObj && (
                  <button
                    type="button"
                    className="duo-btn-primary"
                    onClick={() => navigate(`/aprendizaje/${nextModuleObj.id}`)}
                  >
                    <span>Siguiente Tema: {nextModuleObj.title}</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}