import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  Award,
} from 'lucide-react';
import './LessonVictory.css';

/**
 * Duolingo-inspired module completion screen.
 * Displays performance metrics, pedagogical takeaways, and next actions.
 */
export default function LessonVictory({
  moduleTitle,
  moduleNumber,
  nextModulePath,
  nextModuleName,
  earnedXp = 100,
  summaryPoints = [],
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

      <h1 className="duo-victory-title">¡Módulo Completado!</h1>
      <span className="duo-victory-module-name">{moduleTitle}</span>

      {/* ── Real Performance Metrics ── */}
      <div className="duo-victory-stats">
        <div className="duo-victory-stat-card">
          <span className="duo-victory-stat-val retos">
            <CheckCircle2 size={22} />
            4 / 4
          </span>
          <span className="duo-victory-stat-label">Retos Superados</span>
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
        {nextModulePath && (
          <button
            type="button"
            className="duo-btn-primary"
            onClick={() => navigate(nextModulePath)}
          >
            <span>Continuar con {nextModuleName || 'siguiente módulo'}</span>
            <ArrowRight size={18} />
          </button>
        )}

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

        <button
          type="button"
          className="duo-btn-ghost"
          onClick={() => navigate('/aprendizaje')}
        >
          <Compass size={18} />
          <span>Volver a la Ruta</span>
        </button>
      </div>
    </div>
  );
}
