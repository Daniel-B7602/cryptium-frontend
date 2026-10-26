import { useNavigate } from 'react-router-dom';
import {
  Lock,
  FileKey,
  BarChart2,
  SearchCode,
  FlaskConical,
  ArrowRight,
  ChevronRight,
  Zap,
} from 'lucide-react';
import './Dashboard.css';

const featureCards = [
  {
    icon: Lock,
    title: 'Cifrado de Texto',
    description: 'Cifra y descifra mensajes de texto usando algoritmos criptográficos configurables.',
    to: '/cifrado',
    color: 'cyan',
    status: 'Disponible',
  },
  {
    icon: FileKey,
    title: 'Cifrado de Archivos',
    description: 'Protege cualquier tipo de archivo aplicando cifrado con clave personalizada.',
    to: '/archivos',
    color: 'cyan',
    status: 'Disponible',
  },
  {
    icon: BarChart2,
    title: 'Análisis Criptográfico',
    description: 'Evalúa la fortaleza de tus construcciones criptográficas con métricas visuales.',
    to: '/analisis',
    color: 'purple',
    status: 'Disponible',
  },
  {
    icon: SearchCode,
    title: 'Criptoanálisis Experimental',
    description: 'Laboratorio empírico centrado en AES: avalancha multimuestra, modos ECB/CBC y estadísticas.',
    to: '/criptoanalis',
    color: 'purple',
    status: 'Disponible',
  },
];

const flowSteps = [
  { label: 'Diseñar', icon: '◈' },
  { label: 'Configurar', icon: '⚙' },
  { label: 'Cifrar', icon: '🔒' },
  { label: 'Analizar', icon: '📊' },
  { label: 'Criptoanalizar', icon: '🔍' },
  { label: 'Modificar', icon: '✏' },
  { label: 'Probar de nuevo', icon: '🔄' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard animate-fade-in">
      {/* Hero */}
      <section className="dash-hero hex-bg">
        <div className="dash-hero-content">
          <div className="dash-hero-badge">
            <Zap size={12} />
            Sistema Experimental
          </div>
          <h1 className="dash-hero-title">
            CRYPTIUM
          </h1>
          <p className="dash-hero-desc">
            Sistema de diseño y análisis experimental de Sistemas Criptográficos.
            Construye, cifra, analiza y pon a prueba tus propias construcciones criptográficas.
          </p>
          <div className="dash-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/cifrado')}>
              Comenzar a cifrar <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/archivos')}>
              Cifrar archivos
            </button>
          </div>
        </div>
        <div className="dash-hero-visual">
          <div className="dash-crypto-anim">
            <div className="dash-ring dash-ring-1" />
            <div className="dash-ring dash-ring-2" />
            <div className="dash-ring dash-ring-3" />
            <div className="dash-lock-icon">🔐</div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="dash-section">
        <div className="section-title">Módulos del sistema</div>
        <div className="grid-2 dash-cards-grid">
          {featureCards.map(({ icon: Icon, title, description, to, color, status }) => (
            <button
              key={to}
              className={`dash-card card card-glow dash-card--${color}`}
              onClick={() => navigate(to)}
            >
              <div className={`dash-card-icon dash-card-icon--${color}`}>
                <Icon size={22} />
              </div>
              <div className="dash-card-body">
                <div className="dash-card-header">
                  <h3 className="dash-card-title">{title}</h3>
                  <span className={`badge ${color === 'cyan' ? 'badge-accent' : 'badge-purple'}`}>
                    {status}
                  </span>
                </div>
                <p className="dash-card-desc">{description}</p>
              </div>
              <ChevronRight size={18} className="dash-card-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Workflow Flow */}
      <section className="dash-section">
        <div className="section-title">Flujo de trabajo criptográfico</div>
        <div className="card dash-flow-card">
          <p className="dash-flow-subtitle">
            Cryptium sigue un ciclo iterativo para el diseño y análisis de sistemas criptográficos
          </p>
          <div className="dash-flow">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="dash-flow-item">
                <div className="dash-flow-step">
                  <div className="dash-flow-step-icon">{step.icon}</div>
                  <span className="dash-flow-step-label">{step.label}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="dash-flow-arrow">
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="dash-section">
        <div className="section-title">Estado del sistema</div>
        <div className="grid-3 dash-stats-grid">
          <div className="card dash-stat-card">
            <span className="dash-stat-label">Módulos activos</span>
            <span className="dash-stat-value">2 / 5</span>
            <div className="dash-stat-bar">
              <div className="dash-stat-fill" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="card dash-stat-card">
            <span className="dash-stat-label">Estado del backend</span>
            <div className="dash-stat-status">
              <span className="status-dot online" />
              <span className="dash-stat-value-sm">ASP.NET Core</span>
            </div>
          </div>
          <div className="card dash-stat-card">
            <span className="dash-stat-label">Versión</span>
            <span className="dash-stat-value">1.0.0-alpha</span>
          </div>
        </div>
      </section>
    </div>
  );
}
