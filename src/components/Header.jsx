import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import './Header.css';

const routeTitles = {
  '/':             { title: 'Dashboard',       sub: 'Vista general del sistema' },
  '/cifrado':      { title: 'Cifrado de Texto', sub: 'Cifrar y descifrar mensajes' },
  '/archivos':     { title: 'Cifrado de Archivos', sub: 'Proteger archivos con criptografía' },
  '/analisis':     { title: 'Criptoanálisis', sub: 'Explora patrones, mide propiedades y analiza la seguridad de los cifrados' },
  '/criptoanalis': { title: 'Criptoanálisis', sub: 'Explora patrones, mide propiedades y analiza la seguridad de los cifrados' },
  '/experimentos': { title: 'Experimentos',    sub: 'Constructor de cifrados propios' },
  '/aprendizaje':             { title: 'Aprendizaje', sub: 'Módulos educativos interactivos' },
  '/aprendizaje/fundamentos': { title: 'Fundamentos Criptográficos', sub: 'Módulo 1: Criptografía clásica' },
  '/aprendizaje/simetrica':   { title: 'Criptografía Simétrica', sub: 'Módulo 2: Clave compartida' },
  '/aprendizaje/asimetrica':  { title: 'Criptografía Asimétrica', sub: 'Módulo 3: Par de claves' },
  '/aprendizaje/hash':        { title: 'Funciones Hash Criptográficas', sub: 'Módulo 4: Resúmenes y efecto avalancha' },
  '/aprendizaje/firmas':      { title: 'Firmas Digitales', sub: 'Módulo 5: Autenticidad, integridad y no repudio' },
  '/aprendizaje/criptoanalisis': { title: 'Criptoanálisis', sub: 'Módulo 6: Modelos de ataque, frecuencias y difusión' },
};

export default function Header() {
  const { pathname } = useLocation();
  const info = routeTitles[pathname] ?? { title: 'Cryptium', sub: '' };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">{info.title}</h2>
        {info.sub && <span className="header-sub">{info.sub}</span>}
      </div>
      <div className="header-right">
        <div className="header-api-badge">
          <span className="status-dot online" />
          <span className="header-api-url">{BASE_URL}</span>
        </div>
      </div>
    </header>
  );
}
