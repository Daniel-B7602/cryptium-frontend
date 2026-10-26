import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import './LessonContainer.css';

/**
 * Reusable Duolingo-inspired lesson container shell.
 * Standardizes progress stepper, prompt header, and bottom feedback drawer.
 */
export default function LessonContainer({
  moduleId,
  moduleTitle,
  currentStep = 1,
  totalSteps = 4,
  instruction,
  description,
  userXp = 0,
  canCheck = false,
  feedback = null, // null | { status: 'success' | 'error', title: string, message: string, hint?: string }
  onCheck,
  onContinue,
  onRetry,
  onExit,
  isLoading = false,
  completedSteps = [],
  children,
}) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) onExit();
    else navigate('/aprendizaje');
  };

  return (
    <div className="duo-lesson-shell">
      {/* ── Top Bar ── */}
      <header className="duo-topbar">
        <button
          className="duo-exit-btn"
          onClick={handleExit}
          title="Salir a la ruta de aprendizaje"
          type="button"
        >
          <X size={20} />
        </button>

        {/* Stepper with 4 segments */}
        <div className="duo-stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = completedSteps.includes(stepNum) || stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
              <div
                key={stepNum}
                className={`duo-step-segment ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                title={`Reto ${stepNum} de ${totalSteps}`}
              />
            );
          })}
        </div>

        <div className="duo-xp-badge">
          <Sparkles size={16} />
          <span>{userXp} XP</span>
        </div>
      </header>

      {/* ── Main Exercise Card ── */}
      <main className="duo-main-card">
        <div className="duo-exercise-header">
          <div className="duo-exercise-meta">
            <span className="duo-module-tag">{moduleTitle}</span>
            <span className="duo-step-counter">
              Reto {currentStep} de {totalSteps}
            </span>
          </div>

          <h1 className="duo-instruction-title">{instruction}</h1>
          {description && <p className="duo-instruction-desc">{description}</p>}
        </div>

        {/* Protagonist Interactive Exercise Content */}
        <div className="duo-content-area">
          {children}
        </div>
      </main>

      {/* ── Bottom Action & Feedback Drawer ── */}
      <div
        className={`duo-action-bar ${
          feedback?.status === 'success'
            ? 'status-success'
            : feedback?.status === 'error'
            ? 'status-error'
            : ''
        }`}
      >
        <div className="duo-action-inner">
          {/* Feedback message when answer is checked */}
          {feedback ? (
            <div className="duo-feedback-content">
              <div className="duo-feedback-icon">
                {feedback.status === 'success' ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div className="duo-feedback-text">
                <h4>{feedback.title}</h4>
                <p>{feedback.message}</p>
                {feedback.hint && (
                  <span className="duo-feedback-hint">Pista: {feedback.hint}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="duo-feedback-placeholder">
              {/* Optional contextual hint can go here */}
            </div>
          )}

          {/* Action buttons */}
          <div className="duo-action-buttons">
            {feedback?.status === 'error' && onRetry && (
              <button
                type="button"
                className="duo-btn-retry"
                onClick={onRetry}
              >
                <RotateCcw size={18} />
                <span>Intentar de nuevo</span>
              </button>
            )}

            {feedback?.status === 'success' ? (
              <button
                type="button"
                className="duo-btn-continue"
                onClick={onContinue}
              >
                <span>Continuar</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="duo-btn-check"
                disabled={!canCheck || isLoading}
                onClick={onCheck}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Comprobar</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
