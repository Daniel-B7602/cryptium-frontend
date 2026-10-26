import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lock,
  FileKey,
  FlaskConical,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Sliders,
  AudioWaveform,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/',                    label: 'Inicio',                  icon: LayoutDashboard, exact: true },
  { to: '/cifrado',             label: 'Cifrado',                 icon: Lock },
  { to: '/archivos',            label: 'Archivos',                icon: FileKey },
  { to: '/esteganografia-audio', label: 'Esteganografía de audio', icon: AudioWaveform },
  { to: '/analisis',            label: 'Criptoanálisis',           icon: FlaskConical,    badge: 'Lab' },
  { to: '/experimentos',        label: 'Experimentos',             icon: Sliders,        badge: 'Beta' },
  { to: '/aprendizaje',         label: 'Aprendizaje',              icon: BookOpen,        badge: 'Nuevo' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={22} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">CRYPTIUM</span>
          <span className="sidebar-version">v1.0 · Experimental</span>
        </div>
      </div>

      {/* Decorative separator */}
      <div className="sidebar-sep" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navegación</span>
        {navItems.map(({ to, label, icon: Icon, exact, badge }) => {
          const isLabActive = to === '/analisis' && (location.pathname === '/analisis' || location.pathname === '/criptoanalis');
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `sidebar-item ${isActive || isLabActive ? 'sidebar-item--active' : ''}`
              }
            >
              <span className="sidebar-item-icon">
                <Icon size={18} />
              </span>
              <span className="sidebar-item-label">{label}</span>
              {badge && <span className="sidebar-badge">{badge}</span>}
              <ChevronRight size={14} className="sidebar-item-chevron" />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-dot-wrapper">
          <span className="status-dot online" />
          <span className="sidebar-footer-text">Sistema activo</span>
        </div>
      </div>
    </aside>
  );
}
