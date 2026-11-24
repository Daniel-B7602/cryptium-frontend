import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  Award,
  BookOpen,
} from 'lucide-react';
import './LessonVictory.css';

/**
 * Duolingo-inspired completion screen.
 * Supports both individual exercise completion and full module completion.
 */
export default function LessonVictory({
  isModuleCompletion = false,
  moduleTitle,
  moduleNumber,
  exerciseTitle,
  exerciseNumber,
  nextModulePath,
  nextModuleName,
  hasNextExercise = false,
  earnedXp = 25,
  summaryPoints = [],
  onNextExercise,
  onReturnToTopic,
  onRestart,
}) {
  const navigate = useNavigate();

  return (
    <div className="duo-victory-shell">
      {/* ── Glowing Trophy Badge ── */}
      <div className="duo-victory-badge-wrap">
        <div className="duo-victory-icon-halo" />
        <div className="duo-victory-icon">
          <Trophy size={48} />
        </div>
      </div>

      <h1 className="duo-victory-title">
        {isModuleCompletion ? '¡Módulo Completado!' : '¡Ejercicio Superado!'}
      </h1>

      <span className="duo-victory-module-name">
        {isModuleCompletion
          ? moduleTitle
          : `${moduleTitle} · ${exerciseTitle || `Ejercicio ${exerciseNumber}`}`}
      </span>

      {/* ── Real Performance Metrics ── */}
      <div className="duo-victory-stats">
        <div className="duo-victory-stat-card">
          <span className="duo-victory-stat-val retos">
            <CheckCircle2 size={22} />
            {isModuleCompletion ? '16 / 16' : '4 / 4'}
          </span>
          <span className="duo-victory-stat-label">
            {isModuleCompletion ? 'Retos del Módulo' : 'Retos Prácticos'}
          </span>
        </div>

        <div className="duo-victory-stat-card">
          <span className="duo-victory-stat-val xp">
            <Sparkles size={22} />
            +{earnedXp}
          </span>
          <span className="duo-victory-stat-label">XP Ganados</span>
        </div>

        <div className="duo-victory-stat-card">
          <span className="duo-victory-stat-val rate">
            <Award size={22} />
            100%
          </span>
          <span className="duo-victory-stat-label">Precisión Cripto</span>
        </div>
      </div>

      {/* ── Pedagogical Summary ── */}
      {summaryPoints.length > 0 && (
        <div className="duo-victory-summary-card">
          <h3>
            <CheckCircle2 size={18} color="var(--clr-success)" />
            Lo que has dominado en esta sesión:
          </h3>
          <ul className="duo-victory-summary-list">
            {summaryPoints.map((point, idx) => (
              <li key={idx}>
                <CheckCircle2 size={16} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="duo-victory-actions">
        {/* Next exercise within the same topic */}
        {!isModuleCompletion && hasNextExercise && onNextExercise && (
          <button
            type="button"
            className="duo-btn-primary"
            onClick={onNextExercise}
          >
            <span>Siguiente Ejercicio</span>
            <ArrowRight size={18} />
          </button>
        )}

        {/* Next module path if module completed */}
        {isModuleCompletion && nextModulePath && (
          <button
            type="button"
            className="duo-btn-primary"
            onClick={() => navigate(nextModulePath)}
          >
            <span>Continuar con {nextModuleName || 'siguiente módulo'}</span>
            <ArrowRight size={18} />
          </button>
        )}

        {/* Return to topic map / theory */}
        {onReturnToTopic && (
          <button
            type="button"
            className="duo-btn-secondary"
            onClick={onReturnToTopic}
          >
            <BookOpen size={18} />
            <span>Volver al Tema</span>
          </button>
        )}

        {/* Restart / retry current exercise */}
        {onRestart && (
          <button
            type="button"
            className="duo-btn-secondary"
            onClick={onRestart}
          >
            <RotateCcw size={18} />
            <span>Repasar Retos</span>
          </button>
        )}

        {/* Return to main roadmap */}
        <button
          type="button"
          className="duo-btn-ghost"
          onClick={() => navigate('/aprendizaje')}
        >
          <Compass size={18} />
          <span>Ruta de Aprendizaje</span>
        </button>
      </div>
    </div>
  );
}
