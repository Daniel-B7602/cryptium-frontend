import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Lock,
  Key,
  Shield,
  FileCheck,
  SearchCode,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  Trophy,
  Target,
  Award,
  RotateCcw,
  Zap,
  Check,
  LayoutGrid,
  Route as RouteIcon,
  Play,
} from 'lucide-react';
import {
  getGamifiedProgress,
  PROGRESS_STORAGE_KEY,
} from '../utils/learningProgress';
import './Learning.css';

// ─── Definición de los 6 Módulos Educativos de Cryptium ──────────────────────
const MODULES = [
  {
    id: 'fundamentos',
    num: 1,
    title: '1. Fundamentos de Criptografía',
    subtitle: 'Cifrado Clásico, César y Espacio de Claves',
    description: 'Comprende qué significa cifrar, cómo funciona una sustitución clásica monoalfabética y por qué la seguridad requiere más que ocultar texto.',
    tag: 'Módulo 1 · Fundamentos',
    concepts: ['Cifrado César', 'Transformación Inversa', 'Espacio de Claves', 'Vulnerabilidad Clásica'],
    icon: Sparkles,
    color: '#00d4ff',
    badgeClass: 'badge-accent',
    path: '/aprendizaje/fundamentos',
  },
  {
    id: 'simetrica',
    num: 2,
    title: '2. Criptografía Simétrica',
    subtitle: 'Clave Compartida, Cifrado por Bloques AES',
    description: 'Aprende el uso de una clave secreta compartida idéntica, la relación estricta entre cifrado y descifrado AES, y el reto de distribución de claves.',
    tag: 'Módulo 2 · Simetría',
    concepts: ['Clave Compartida (K)', 'Cifrado AES Real', 'Gestión de Claves (KMS)', 'Confidencialidad vs Autenticidad'],
    icon: Lock,
    color: '#3b82f6',
    badgeClass: 'badge-blue',
    path: '/aprendizaje/simetrica',
  },
  {
    id: 'asimetrica',
    num: 3,
    title: '3. Criptografía Asimétrica',
    subtitle: 'Par de Claves Pública y Privada, RSA',
    description: 'Domina la revolución de la clave pública: cómo enviar mensajes confidenciales a través de un canal abierto sin compartir secretos previos.',
    tag: 'Módulo 3 · Asimetría',
    concepts: ['Clave Pública vs Privada', 'Funciones Trampa', 'Flujo Asimétrico', 'Ataque Man-in-the-Middle'],
    icon: Key,
    color: '#a855f7',
    badgeClass: 'badge-purple',
    path: '/aprendizaje/asimetrica',
  },
  {
    id: 'hash',
    num: 4,
    title: '4. Funciones Hash Criptográficas',
    subtitle: 'Resúmenes Unidireccionales & Integridad SHA-256',
    description: 'Genera huellas digitales criptográficas, experimenta el efecto avalancha bit a bit y comprende por qué un hash no es un cifrado reversible.',
    tag: 'Módulo 4 · Integridad',
    concepts: ['Unidireccionalidad', 'SHA-256 (256 bits)', 'Efecto Avalancha', 'Verificación de Integridad'],
    icon: Shield,
    color: '#10d46e',
    badgeClass: 'badge-green',
    path: '/aprendizaje/hash',
  },
  {
    id: 'firmas',
    num: 5,
    title: '5. Firmas Digitales',
    subtitle: 'Autenticidad, Integridad y No Repudio con RSA-PSS',
    description: 'Firma mensajes con clave privada y valida autorías con clave pública. Descubre cómo la matemática detecta inmediatamente cualquier alteración fraudulenta.',
    tag: 'Módulo 5 · Autenticidad',
    concepts: ['Firma con Clave Privada', 'Verificación con Clave Pública', 'Detección de Manipulación', 'Firma vs Cifrado'],
    icon: FileCheck,
    color: '#f59e0b',
    badgeClass: 'badge-amber',
    path: '/aprendizaje/firmas',
  },
  {
    id: 'criptoanalisis',
    num: 6,
    title: '6. Criptoanálisis y Ataques',
    subtitle: 'Análisis de Frecuencias, Patrones y Fuerza Bruta',
    description: 'Rompe cifrados clásicos utilizando análisis estadístico de frecuencias y ataques exhaustivos. Comprende por qué los algoritmos modernos resisten estas técnicas.',
    tag: 'Módulo 6 · Criptoanálisis',
    concepts: ['Patrones Monoalfabéticos', 'Histograma de Frecuencias', 'Fuerza Bruta César', 'Confusión y Difusión AES'],
    icon: SearchCode,
    color: '#f43f5e',
    badgeClass: 'badge-rose',
    path: '/aprendizaje/criptoanalisis',
  },
];

export default function Learning() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(getGamifiedProgress);
  const [viewMode, setViewMode] = useState('path'); // 'path' | 'catalog'

  useEffect(() => {
    setProgress(getGamifiedProgress());
  }, []);

  // Métricas reales
  const totalModules = MODULES.length; // 6
  const totalExercisesPossible = 24; // 6 * 4

  const completedModulesCount = MODULES.filter((m) => {
    const list = progress.completedExercises[m.id] || [];
    return progress.completed.includes(m.id) || list.length >= 4;
  }).length;

  const totalExercisesCompleted = MODULES.reduce((acc, m) => {
    const list = progress.completedExercises[m.id] || [];
    return acc + Math.min(4, list.length);
  }, 0);

  const globalCompletionRate = Math.round((totalExercisesCompleted / totalExercisesPossible) * 100);

  // Módulo recomendado (primer módulo no completado)
  const nextRecommendedModule = MODULES.find((m) => {
    const list = progress.completedExercises[m.id] || [];
    return !progress.completed.includes(m.id) && list.length < 4;
  }) || MODULES[0];

  // Rango criptográfico
  const rankLabel =
    totalExercisesCompleted >= 24
      ? 'Maestro Criptógrafo'
      : totalExercisesCompleted >= 16
      ? 'Analista Avanzado'
      : totalExercisesCompleted >= 8
      ? 'Criptoanalista Jr.'
      : totalExercisesCompleted >= 1
      ? 'Iniciado Criptográfico'
      : 'Novato';

  const handleResetProgress = () => {
    if (window.confirm('¿Deseas reiniciar todo tu progreso de los 6 módulos educativos en este navegador?')) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      setProgress(getGamifiedProgress());
    }
  };

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Barra Superior & Breadcrumbs ── */}
      <div className="learning-topbar">
        <div className="learning-breadcrumbs">
          <BookOpen size={18} className="text-accent" />
          <span>Cryptium</span>
          <ChevronRight size={14} />
          <span className="active">Ruta Educativa Interactiva</span>
        </div>

        {/* Mini tabs rápidas de los 6 módulos */}
        <div className="learning-tab-group">
          {MODULES.map((m) => {
            const list = progress.completedExercises[m.id] || [];
            const isDone = progress.completed.includes(m.id) || list.length >= 4;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                className={`learning-tab-btn ${isDone ? 'done' : ''}`}
                onClick={() => navigate(m.path)}
                title={m.title}
              >
                <Icon size={14} style={{ color: isDone ? '#10d46e' : m.color }} />
                <span>M{m.num}</span>
                {isDone && <Check size={12} style={{ color: '#10d46e' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Encabezado Principal & HUD de Progreso ── */}
      <section className="crypto-route-hero">
        <div className="crypto-hero-content">
          <div className="crypto-hero-badge">
            <Compass size={14} /> Experiencia Guiada de Criptografía
          </div>
          <h1 className="crypto-hero-title">RUTA DE APRENDIZAJE CRIPTOGRÁFICO</h1>
          <p className="crypto-hero-subtitle">
            Aprende resolviendo retos cortos e interactivos inspirados en la metodología Duolingo.
            Cifra mensajes reales, analiza colisiones hash, firma digitalmente con RSA y ejecuta criptoanálisis
            con retroalimentación inmediata en cada reto.
          </p>
        </div>

        {/* Panel HUD de Progreso Real */}
        <div className="crypto-hud-grid">
          {/* Tarjeta 1: Retos Superados */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Retos Completados</span>
              <div className="crypto-hud-icon"><Trophy size={16} /></div>
            </div>
            <div className="crypto-hud-val mono">{totalExercisesCompleted} / {totalExercisesPossible}</div>
            <div className="crypto-hud-track">
              <div
                className="crypto-hud-fill"
                style={{ width: `${Math.max(4, globalCompletionRate)}%` }}
              />
            </div>
            <span className="crypto-hud-sub">{globalCompletionRate}% del plan dominado</span>
          </div>

          {/* Tarjeta 2: Módulos Completados */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Módulos Superados</span>
              <div className="crypto-hud-icon"><Award size={16} style={{ color: '#10d46e' }} /></div>
            </div>
            <div className="crypto-hud-val mono" style={{ color: '#10d46e' }}>
              {completedModulesCount} / {totalModules}
            </div>
            <span className="crypto-hud-sub">4 retos esenciales por módulo</span>
          </div>

          {/* Tarjeta 3: Puntos de Experiencia */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Experiencia Total</span>
              <div className="crypto-hud-icon"><Sparkles size={16} style={{ color: '#fbbf24' }} /></div>
            </div>
            <div className="crypto-hud-val mono" style={{ color: '#fbbf24' }}>
              {progress.xp || 0} XP
            </div>
            <span className="crypto-hud-sub">+25 XP por reto verificado</span>
          </div>

          {/* Tarjeta 4: Rango */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Nivel de Seguridad</span>
              <div className="crypto-hud-icon"><Zap size={16} style={{ color: 'var(--clr-accent)' }} /></div>
            </div>
            <div className="crypto-hud-val" style={{ fontSize: '1rem', color: 'var(--clr-accent)', fontWeight: 800 }}>
              {rankLabel}
            </div>
            <span className="crypto-hud-sub">Basado en tus aciertos reales</span>
          </div>
        </div>

        {/* Pie de HUD con reset y nota de almacenamiento local */}
        <div className="crypto-hud-footer">
          <span>
            💾 Progreso guardado automáticamente en tu navegador. Puedes acceder a los 6 módulos libremente.
          </span>
          <button
            type="button"
            className="crypto-reset-btn"
            onClick={handleResetProgress}
            title="Reiniciar progreso guardado en este navegador"
          >
            <RotateCcw size={12} /> Reiniciar progreso local
          </button>
        </div>
      </section>

      {/* ── Selector de Vista (Ruta de Nodos vs Catálogo) ── */}
      <div className="crypto-view-switcher">
        <span className="crypto-view-label">
          Explora mediante la ruta guiada con hitos o la cuadrícula de catálogo:
        </span>
        <div className="crypto-switch-btns">
          <button
            type="button"
            className={`crypto-switch-btn ${viewMode === 'path' ? 'active' : ''}`}
            onClick={() => setViewMode('path')}
          >
            <RouteIcon size={15} /> Ruta de Retos (Visual)
          </button>
          <button
            type="button"
            className={`crypto-switch-btn ${viewMode === 'catalog' ? 'active' : ''}`}
            onClick={() => setViewMode('catalog')}
          >
            <LayoutGrid size={15} /> Cuadrícula de Módulos
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           VISTA 1: RUTA VISUAL DE APRENDIZAJE GUIADO
         ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'path' && (
        <div className="crypto-path-container">
          <div className="crypto-path-track" />

          {MODULES.map((m, index) => {
            const isLeft = index % 2 === 0;
            const completedList = progress.completedExercises[m.id] || [];
            const exerciseCount = completedList.length;
            const isDone = progress.completed.includes(m.id) || exerciseCount >= 4;
            const isRecommended = nextRecommendedModule.id === m.id;
            const Icon = m.icon;

            return (
              <div key={m.id} className="crypto-path-node-wrapper">
                <div className={`crypto-path-row ${isLeft ? 'crypto-path-row--left' : 'crypto-path-row--right'}`}>
                  {/* Tarjeta Informativa del Módulo */}
                  <div className="crypto-path-card-slot">
                    <div
                      className={`crypto-stage-card ${isDone ? 'completed' : ''} ${isRecommended ? 'recommended' : ''}`}
                      onClick={() => navigate(m.path)}
                    >
                      <div className="crypto-stage-header">
                        <span className="crypto-stage-tag">{m.tag}</span>
                        {isRecommended && !isDone && (
                          <span className="badge badge-accent" style={{ animation: 'duoPulseSegment 1.5s infinite alternate' }}>
                            ★ Siguiente Recomendado
                          </span>
                        )}
                        <span
                          className={`badge ${
                            isDone
                              ? 'badge-green'
                              : exerciseCount > 0
                              ? 'badge-accent'
                              : 'badge-purple'
                          }`}
                        >
                          {isDone ? '✓ 4/4 Retos Superados' : exerciseCount > 0 ? `${exerciseCount}/4 En progreso` : '0/4 Disponible'}
                        </span>
                      </div>

                      <div className="crypto-stage-title-group">
                        <h3 className="crypto-stage-title">
                          <Icon size={22} style={{ color: m.color }} />
                          {m.title}
                        </h3>
                        <span className="crypto-stage-sub" style={{ color: m.color }}>
                          {m.subtitle}
                        </span>
                      </div>

                      <p className="crypto-stage-desc">{m.description}</p>

                      {/* Mini barra de progreso de los 4 retos */}
                      <div style={{ margin: '12px 0 16px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--txt-secondary)', marginBottom: '4px' }}>
                          <span>Progreso del módulo:</span>
                          <strong style={{ color: isDone ? 'var(--clr-success)' : 'var(--clr-accent)' }}>
                            {exerciseCount} de 4 retos
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              style={{
                                flex: 1,
                                borderRadius: '999px',
                                background: completedList.includes(step)
                                  ? 'var(--clr-success)'
                                  : 'var(--clr-surface-3)',
                                transition: 'all 0.3s ease',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Conceptos clave */}
                      <div className="crypto-stage-concepts">
                        {m.concepts.map((concept, cIdx) => (
                          <span key={cIdx} className="crypto-concept-pill">
                            {concept}
                          </span>
                        ))}
                      </div>

                      {/* Botón de acción */}
                      <div className="crypto-stage-actions">
                        <button
                          type="button"
                          className={`btn ${isDone ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(m.path);
                          }}
                        >
                          <Play size={14} />
                          <span>{isDone ? 'Repasar módulo' : exerciseCount > 0 ? 'Continuar reto' : 'Iniciar módulo'}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nodo Circular Interactivo Central */}
                  <div className="crypto-path-node-slot">
                    <button
                      type="button"
                      className={`crypto-node-btn ${isDone ? 'completed' : exerciseCount > 0 ? 'explored' : ''} ${isRecommended ? 'active-pulse' : ''}`}
                      style={{ color: m.color }}
                      onClick={() => navigate(m.path)}
                      title={`Entrar a ${m.title}`}
                    >
                      <span className="crypto-node-num-tag">#{m.num}</span>
                      <Icon size={26} />
                      {isDone && (
                        <div className="crypto-node-completed-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Espacio equilibrador */}
                  <div className="crypto-path-empty-slot" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           VISTA 2: CUADRÍCULA DE CATÁLOGO
         ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'catalog' && (
        <div className="crypto-stages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {MODULES.map((m) => {
            const completedList = progress.completedExercises[m.id] || [];
            const exerciseCount = completedList.length;
            const isDone = progress.completed.includes(m.id) || exerciseCount >= 4;
            const Icon = m.icon;

            return (
              <div
                key={m.id}
                className={`crypto-stage-card ${isDone ? 'completed' : ''}`}
                onClick={() => navigate(m.path)}
                style={{ cursor: 'pointer' }}
              >
                <div className="crypto-stage-header">
                  <span className="crypto-stage-tag">{m.tag}</span>
                  <span className={`badge ${isDone ? 'badge-green' : exerciseCount > 0 ? 'badge-accent' : 'badge-purple'}`}>
                    {isDone ? '✓ 4/4 Retos' : `${exerciseCount}/4 Retos`}
                  </span>
                </div>

                <div className="crypto-stage-title-group">
                  <h3 className="crypto-stage-title">
                    <Icon size={20} style={{ color: m.color }} />
                    {m.title}
                  </h3>
                  <span className="crypto-stage-sub" style={{ color: m.color }}>
                    {m.subtitle}
                  </span>
                </div>

                <p className="crypto-stage-desc">{m.description}</p>

                <div className="crypto-stage-concepts">
                  {m.concepts.map((concept, cIdx) => (
                    <span key={cIdx} className="crypto-concept-pill">
                      {concept}
                    </span>
                  ))}
                </div>

                <div className="crypto-stage-actions" style={{ marginTop: 'auto' }}>
                  <button
                    type="button"
                    className={`btn ${isDone ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(m.path);
                    }}
                  >
                    <span>{isDone ? 'Repasar módulo' : exerciseCount > 0 ? 'Continuar' : 'Comenzar'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
