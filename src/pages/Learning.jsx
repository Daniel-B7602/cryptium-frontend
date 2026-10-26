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
  Layers,
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
  HelpCircle,
} from 'lucide-react';
import './Learning.css';

// ─── Clave de Almacenamiento Local ──────────────────────────────────────────
const PROGRESS_STORAGE_KEY = 'cryptium_learning_progress_v1';

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { explored: ['fundamentos'], completed: [], xp: 0, completedMissions: {} };
    const parsed = JSON.parse(raw);
    return {
      explored: Array.isArray(parsed.explored) ? parsed.explored : ['fundamentos'],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedMissions: typeof parsed.completedMissions === 'object' && parsed.completedMissions !== null ? parsed.completedMissions : {},
    };
  } catch {
    return { explored: ['fundamentos'], completed: [], xp: 0, completedMissions: {} };
  }
}

function saveStoredProgress(data) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando progreso:', err);
  }
}

// ─── Definición de Etapas de la Ruta Criptográfica ──────────────────────────
const STAGES = [
  {
    id: 'fundamentos',
    num: 1,
    title: '1. Fundamentos de Criptografía',
    subtitle: 'Misión «Operación: Mensaje Secreto»',
    description: 'Aprende jugando con desafíos interactivos: interceptación, sustitución monoalfabética de César y análisis de fuerza bruta.',
    tag: 'Etapa 1 · Aventura Gamificada',
    concepts: ['Tríada CIA', 'Cifrado César', 'Fuerza Bruta'],
    icon: Sparkles,
    color: '#00d4ff',
    badgeClass: 'badge-accent',
    path: '/aprendizaje/fundamentos',
    implemented: true,
  },
  {
    id: 'simetrica',
    num: 2,
    title: '2. Criptografía Simétrica',
    subtitle: 'Misión «La Llave Compartida»',
    description: 'Experimenta con clave compartida, cifrado real AES, fallos por claves incorrectas y el dilema de intercambio seguro.',
    tag: 'Etapa 2 · Aventura Gamificada',
    concepts: ['Clave Compartida', 'Cifrado AES', 'Distribución de Claves'],
    icon: Lock,
    color: '#3b82f6',
    badgeClass: 'badge-blue',
    path: '/aprendizaje/simetrica',
    implemented: true,
  },
  {
    id: 'asimetrica',
    num: 3,
    title: '3. Criptografía Asimétrica',
    subtitle: 'Par de Claves Pública y Privada, RSA',
    description: 'Comprende la revolución del intercambio seguro sin compartir secretos a través del canal público mediante funciones trampa matemáticas.',
    tag: 'Etapa 3 · Clave Pública',
    concepts: ['Par de Claves', 'Funciones Trampa', 'RSA & Diffie-Hellman'],
    icon: Key,
    color: '#a855f7',
    badgeClass: 'badge-purple',
    path: '/aprendizaje/asimetrica',
    implemented: true,
  },
  {
    id: 'hash',
    num: 4,
    title: '4. Funciones Hash Criptográficas',
    subtitle: 'Resúmenes Unidireccionales & Integridad',
    description: 'Garantiza la integridad estricta con SHA-256. Analiza la resistencia a preimagen, resistencia a colisiones y efecto avalancha de 256 bits.',
    tag: 'Etapa 4 · Integridad',
    concepts: ['Unidireccionalidad', 'SHA-256', 'Resistencia a Colisiones'],
    icon: Shield,
    color: '#10d46e',
    badgeClass: 'badge-green',
    path: '/aprendizaje/hash',
    implemented: true,
  },
  {
    id: 'firmas',
    num: 5,
    title: '5. Firmas Digitales',
    subtitle: 'Autenticidad, Integridad y No Repudio',
    description: 'Combina el cifrado asimétrico y las funciones hash para certificar autoría legítima y garantizar validez matemática con RSA-PSS.',
    tag: 'Etapa 5 · Autenticidad',
    concepts: ['Firma con Privada', 'Verificación Pública', 'No Repudio'],
    icon: FileCheck,
    color: '#f59e0b',
    badgeClass: 'badge-amber',
    path: '/aprendizaje/firmas',
    implemented: true,
  },
  {
    id: 'criptoanalisis',
    num: 6,
    title: '6. Criptoanálisis y Ataques',
    subtitle: 'Análisis de Frecuencias y Vulnerabilidades',
    description: 'Aprende las técnicas para estudiar debilidades y romper criptogramas: conteo estadístico de letras, distancia de unicidad y entropía.',
    tag: 'Etapa 6 · Ruptura y Análisis',
    concepts: ['Frecuencia de Letras', 'Entropía Shannon', 'Ataques Analíticos'],
    icon: SearchCode,
    color: '#f43f5e',
    badgeClass: 'badge-rose',
    path: '/aprendizaje/criptoanalisis',
    implemented: true,
  },
  {
    id: 'pqc',
    num: 7,
    title: '7. Criptografía Post-Cuántica (PQC)',
    subtitle: 'Resistencia frente a Computación Cuántica',
    description: 'Nuevos estándares criptográficos basados en retículas euclídeas (ML-KEM / Crystals-Kyber) resistentes al algoritmo cuántico de Shor.',
    tag: 'Futura Expansión',
    concepts: ['Retículas Euclídeas', 'Algoritmo de Shor', 'Seguridad Cuántica'],
    icon: Layers,
    color: '#64748b',
    badgeClass: 'badge-muted',
    path: null,
    implemented: false,
  },
];

// ─── Hitos entre Etapas ─────────────────────────────────────────────────────
const MILESTONES = [
  {
    afterNum: 1,
    title: 'Hito 1: De lo Clásico a lo Moderno',
    desc: 'Dominaste las sustituciones elementales y avanzas hacia el cifrado por bloques y rondas múltiples.',
  },
  {
    afterNum: 3,
    title: 'Hito 2: La Revolución Asimétrica',
    desc: 'Comprendiste el cifrado de clave pública. Ahora exploras la integridad y los resúmenes unidireccionales.',
  },
  {
    afterNum: 5,
    title: 'Hito 3: Autenticidad y Criptoanálisis',
    desc: 'Dominaste la defensa con firmas digitales. Ahora es momento de estudiar las técnicas para quebrar sistemas.',
  },
];

// ─── Misiones Criptográficas Recomendadas ───────────────────────────────────
const MISSIONS = [
  {
    id: 'mission-caesar',
    stageId: 'fundamentos',
    title: 'Operación: Mensaje Secreto',
    desc: 'Desafíos interactivos de iniciación: descifra César, rompe por fuerza bruta y domina la Tríada CIA.',
    path: '/aprendizaje/fundamentos',
    tag: 'Misión 1 · Gamificada',
  },
  {
    id: 'mission-avalanche',
    stageId: 'simetrica',
    title: 'Misión: La Llave Compartida',
    desc: 'Descubre cómo una misma clave cifra y descifra con AES, comprueba fallos de clave y el dilema de intercambio.',
    path: '/aprendizaje/simetrica',
    tag: 'Misión 2 · Gamificada',
  },
  {
    id: 'mission-frequency',
    stageId: 'criptoanalisis',
    title: 'Análisis de Frecuencia',
    desc: 'Identifica la letra más frecuente de un criptograma y reconstruye el texto original.',
    path: '/aprendizaje/criptoanalisis',
    tag: 'Reto 3',
  },
];

export default function Learning() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('path'); // 'path' | 'catalog'
  const [progress, setProgress] = useState(loadStoredProgress);

  useEffect(() => {
    saveStoredProgress(progress);
  }, [progress]);

  // Manejo de entrada a módulo
  const handleOpenModule = (stage) => {
    if (!stage.implemented || !stage.path) return;

    // Registrar como explorado si aún no lo estaba
    setProgress((prev) => {
      if (!prev.explored.includes(stage.id)) {
        return {
          ...prev,
          explored: [...prev.explored, stage.id],
        };
      }
      return prev;
    });

    navigate(stage.path);
  };

  // Alternar estado de completado / dominado
  const handleToggleComplete = (stageId, e) => {
    e.stopPropagation();
    setProgress((prev) => {
      const isCompleted = prev.completed.includes(stageId);
      const newCompleted = isCompleted
        ? prev.completed.filter((id) => id !== stageId)
        : [...prev.completed, stageId];

      const newExplored = prev.explored.includes(stageId)
        ? prev.explored
        : [...prev.explored, stageId];

      return {
        explored: newExplored,
        completed: newCompleted,
      };
    });
  };

  // Reiniciar progreso local
  const handleResetProgress = () => {
    if (window.confirm('¿Deseas reiniciar tu progreso local de aprendizaje en este navegador?')) {
      const initial = { explored: ['fundamentos'], completed: [] };
      setProgress(initial);
      saveStoredProgress(initial);
    }
  };

  // Cálculos reales de progreso
  const activeStages = STAGES.filter((s) => s.implemented);
  const totalStages = activeStages.length; // 6
  const completedCount = progress.completed.length;
  const exploredCount = progress.explored.length;
  const completionPercentage = Math.round((completedCount / totalStages) * 100);

  // Rango criptográfico calculado a partir de datos reales
  let cryptRank = 'Cadete Criptográfico 🧭';
  if (completedCount === 6) {
    cryptRank = 'Maestro Criptoanalista 🛡️';
  } else if (completedCount >= 4) {
    cryptRank = 'Especialista en Claves ⚡';
  } else if (completedCount >= 2) {
    cryptRank = 'Criptógrafo Aficionado 🔑';
  } else if (exploredCount >= 3) {
    cryptRank = 'Iniciado Criptográfico 📜';
  }

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Barra Superior & Breadcrumbs ─────────────────────────────────── */}
      <div className="learning-topbar">
        <div className="learning-breadcrumbs">
          <BookOpen size={18} className="text-accent" />
          <span>Aprendizaje</span>
          <ChevronRight size={14} />
          <span className="active">Tu Ruta Criptográfica</span>
        </div>

        {/* Acceso Rápido Directo a Etapas */}
        <div className="learning-tab-group">
          {activeStages.map((st) => {
            const Icon = st.icon;
            const isDone = progress.completed.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                className="learning-tab-btn"
                onClick={() => handleOpenModule(st)}
                title={st.title}
              >
                <Icon size={14} style={{ color: isDone ? '#10d46e' : st.color }} />
                <span>{st.num}. {st.id.slice(0, 5)}</span>
                {isDone && <Check size={12} style={{ color: '#10d46e' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Encabezado Principal & HUD de Gamificación Moderada ──────────── */}
      <section className="crypto-route-hero">
        <div className="crypto-hero-content">
          <div className="crypto-hero-badge">
            <Compass size={14} /> Ruta Criptográfica Interactiva
          </div>
          <h1 className="crypto-hero-title">TU RUTA CRIPTOGRÁFICA</h1>
          <p className="crypto-hero-subtitle">
            Recorre las etapas de la seguridad de la información mediante un mapa guiado de aprendizaje.
            Experimenta con algoritmos reales, altera parámetros, mide la difusión y pon a prueba la fortaleza
            de las construcciones criptográficas modernas.
          </p>
        </div>

        {/* Panel HUD de Progreso Real */}
        <div className="crypto-hud-grid">
          {/* Tarjeta 1: Avance General */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Avance del Viaje</span>
              <div className="crypto-hud-icon"><Trophy size={16} /></div>
            </div>
            <div className="crypto-hud-val mono">{completionPercentage}%</div>
            <div className="crypto-hud-track">
              <div
                className="crypto-hud-fill"
                style={{ width: `${Math.max(5, completionPercentage)}%` }}
              />
            </div>
            <span className="crypto-hud-sub">{completedCount} de {totalStages} módulos dominados</span>
          </div>

          {/* Tarjeta 2: Módulos Explorados */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Módulos Iniciados</span>
              <div className="crypto-hud-icon"><Compass size={16} /></div>
            </div>
            <div className="crypto-hud-val mono">{exploredCount} / {totalStages}</div>
            <span className="crypto-hud-sub">
              {exploredCount === totalStages
                ? '¡Has iniciado todos los módulos!'
                : `${totalStages - exploredCount} etapas por explorar`}
            </span>
          </div>

          {/* Tarjeta 3: Módulos Dominados */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Módulos Dominados</span>
              <div className="crypto-hud-icon"><Award size={16} style={{ color: '#10d46e' }} /></div>
            </div>
            <div className="crypto-hud-val mono" style={{ color: '#10d46e' }}>
              {completedCount} / {totalStages}
            </div>
            <span className="crypto-hud-sub">Marca módulos como dominados al superarlos</span>
          </div>

          {/* Tarjeta 4: Rango Criptográfico */}
          <div className="crypto-hud-card">
            <div className="crypto-hud-head">
              <span className="crypto-hud-label">Rango Criptográfico</span>
              <div className="crypto-hud-icon"><Zap size={16} style={{ color: '#f59e0b' }} /></div>
            </div>
            <div className="crypto-hud-val" style={{ fontSize: '0.98rem', fontWeight: 800 }}>
              {cryptRank}
            </div>
            <span className="crypto-hud-sub">
              {progress.xp ? `⚡ ${progress.xp} XP ganados en misiones` : 'Calculado según tus retos y módulos'}
            </span>
          </div>
        </div>

        {/* Pie de HUD con aviso de persistencia local y reinicio */}
        <div className="crypto-hud-footer">
          <span>
            ℹ️ Progreso guardado automáticamente en tu navegador local. Libre acceso a todos los módulos.
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

      {/* ── Misiones Criptográficas Recomendadas ──────────────────────────── */}
      <section className="crypto-missions-section">
        <div className="crypto-section-header">
          <div className="crypto-section-title-wrap">
            <Target size={20} className="an-icon-cyan" />
            <h3 className="crypto-section-title">Misiones y Retos Recomendados</h3>
          </div>
          <span className="badge badge-accent">3 misiones activas vinculadas</span>
        </div>

        <div className="crypto-missions-grid">
          {MISSIONS.map((m) => {
            const isCompleted = progress.completed.includes(m.stageId);
            return (
              <div
                key={m.id}
                className={`crypto-mission-card ${isCompleted ? 'completed' : ''}`}
              >
                <div className="crypto-mission-top">
                  <span className={`badge ${isCompleted ? 'badge-green' : 'badge-accent'} crypto-mission-badge`}>
                    {m.tag}
                  </span>
                  {isCompleted ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10d46e', fontSize: '0.78rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Completada
                    </span>
                  ) : (
                    <span style={{ color: 'var(--txt-muted)', fontSize: '0.75rem' }}>Pendiente</span>
                  )}
                </div>

                <div className="crypto-mission-body">
                  <h4 className="crypto-mission-title">{m.title}</h4>
                  <p className="crypto-mission-desc">{m.desc}</p>
                </div>

                <button
                  type="button"
                  className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(m.path)}
                >
                  {isCompleted ? 'Repasar reto' : 'Ir al reto'} <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Conmutador de Vista (Ruta Visual vs Catálogo) ────────────────── */}
      <div className="crypto-view-switcher">
        <span className="crypto-view-label">
          Visualiza tu trayecto mediante la ruta serpentina de nodos o cambia a la vista de catálogo:
        </span>
        <div className="crypto-switch-btns">
          <button
            type="button"
            className={`crypto-switch-btn ${viewMode === 'path' ? 'active' : ''}`}
            onClick={() => setViewMode('path')}
          >
            <RouteIcon size={15} /> Ruta de Aprendizaje (Visual)
          </button>
          <button
            type="button"
            className={`crypto-switch-btn ${viewMode === 'catalog' ? 'active' : ''}`}
            onClick={() => setViewMode('catalog')}
          >
            <LayoutGrid size={15} /> Catálogo de Módulos
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           VISTA 1: RUTA VISUAL SERPENTINA (DUOLINGO-STYLE CRYPTO ROAD)
         ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'path' && (
        <div className="crypto-path-container">
          {/* Línea guía vertical central con gradiente de conexión */}
          <div className="crypto-path-track" />

          {STAGES.map((st, index) => {
            const isLeft = index % 2 === 0;
            const isCompleted = progress.completed.includes(st.id);
            const isExplored = progress.explored.includes(st.id);
            const Icon = st.icon;

            // Comprobar si hay un hito intermedio después de esta etapa
            const milestone = MILESTONES.find((m) => m.afterNum === st.num);

            return (
              <div key={st.id}>
                {/* Fila del Nodo en la Ruta */}
                <div className={`crypto-path-row ${isLeft ? 'crypto-path-row--left' : 'crypto-path-row--right'}`}>
                  {/* Tarjeta de la Etapa (columna izquierda o derecha según alternancia) */}
                  <div className="crypto-path-card-slot">
                    <div
                      className={`crypto-stage-card ${isCompleted ? 'completed' : ''} ${!st.implemented ? 'locked' : ''}`}
                      onClick={() => handleOpenModule(st)}
                      style={{ cursor: st.implemented ? 'pointer' : 'default' }}
                    >
                      <div className="crypto-stage-header">
                        <span className="crypto-stage-tag">{st.tag}</span>
                        {st.implemented ? (
                          <span
                            className={`badge ${
                              isCompleted
                                ? 'badge-green'
                                : isExplored
                                ? 'badge-accent'
                                : 'badge-purple'
                            }`}
                          >
                            {isCompleted ? '✓ Dominado' : isExplored ? 'En progreso' : 'Disponible'}
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                            Próximamente
                          </span>
                        )}
                      </div>

                      <div className="crypto-stage-title-group">
                        <h3 className="crypto-stage-title">
                          <Icon size={20} style={{ color: st.color }} />
                          {st.title}
                        </h3>
                        <span className="crypto-stage-sub" style={{ color: st.color }}>
                          {st.subtitle}
                        </span>
                      </div>

                      <p className="crypto-stage-desc">{st.description}</p>

                      {/* Conceptos clave */}
                      <div className="crypto-stage-concepts">
                        {st.concepts.map((concept, cIdx) => (
                          <span key={cIdx} className="crypto-concept-pill">
                            {concept}
                          </span>
                        ))}
                      </div>

                      {/* Acciones de la Etapa */}
                      <div className="crypto-stage-actions">
                        {st.implemented ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModule(st);
                              }}
                            >
                              {isCompleted ? 'Repasar módulo' : 'Explorar módulo'} <ArrowRight size={14} />
                            </button>

                            <button
                              type="button"
                              className={`crypto-toggle-complete-btn ${isCompleted ? 'active' : ''}`}
                              onClick={(e) => handleToggleComplete(st.id, e)}
                              title="Marca o desmarca si dominas este contenido"
                            >
                              <CheckCircle2 size={14} />
                              {isCompleted ? 'Dominado' : 'Marcar dominado'}
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', fontStyle: 'italic' }}>
                            En fase de investigación criptográfica (ML-KEM / Retículas).
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nodo Circular Interactivo Central */}
                  <div className="crypto-path-node-slot">
                    <button
                      type="button"
                      className={`crypto-node-btn ${isCompleted ? 'completed' : isExplored ? 'explored' : ''}`}
                      style={{ color: st.color }}
                      onClick={() => handleOpenModule(st)}
                      disabled={!st.implemented}
                      title={`Ir a ${st.title}`}
                    >
                      <span className="crypto-node-num-tag">#{st.num}</span>
                      <Icon size={26} />
                      {isCompleted && (
                        <div className="crypto-node-completed-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Espacio vacío para equilibrar la cuadrícula */}
                  <div className="crypto-path-empty-slot" />
                </div>

                {/* Hito Intermedio si corresponde */}
                {milestone && (
                  <div className="crypto-milestone-row">
                    <div className="crypto-milestone-card">
                      <div className="crypto-milestone-icon">
                        <Award size={18} />
                      </div>
                      <div className="crypto-milestone-info">
                        <span className="crypto-milestone-title">{milestone.title}</span>
                        <span className="crypto-milestone-desc">{milestone.desc}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           VISTA 2: CATÁLOGO EN CUADRÍCULA
         ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'catalog' && (
        <div className="modules-catalog-grid">
          {STAGES.map((st) => {
            const IconComp = st.icon;
            const isCompleted = progress.completed.includes(st.id);
            const isExplored = progress.explored.includes(st.id);

            return (
              <div
                key={st.id}
                className={`module-card ${st.implemented ? 'available' : 'locked'}`}
                onClick={() => handleOpenModule(st)}
              >
                <div className="module-header">
                  <div className="module-icon-wrap" style={{ color: st.color, background: 'var(--clr-surface-2)', border: `1px solid ${st.color}40` }}>
                    <IconComp size={22} />
                  </div>
                  <span
                    className={`badge ${
                      isCompleted
                        ? 'badge-green'
                        : isExplored
                        ? 'badge-accent'
                        : st.implemented
                        ? 'badge-purple'
                        : 'badge-muted'
                    }`}
                  >
                    {isCompleted ? '✓ Dominado' : isExplored ? 'En progreso' : st.implemented ? 'Disponible' : 'Próximamente'}
                  </span>
                </div>

                <div className="module-body">
                  <h3 className="module-title">{st.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: st.color, fontWeight: 600 }}>
                    {st.subtitle}
                  </span>
                  <p className="module-desc">{st.description}</p>
                </div>

                <div className="module-footer">
                  {st.implemented ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModule(st);
                      }}
                    >
                      {isCompleted ? 'Repasar módulo' : 'Iniciar módulo'} <ArrowRight size={14} />
                    </button>
                  ) : (
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      Módulo en preparación
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
