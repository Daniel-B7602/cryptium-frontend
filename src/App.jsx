import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TextCrypto from './pages/TextCrypto';
import FileCrypto from './pages/FileCrypto';
import Analysis from './pages/Analysis';
import Cryptanalysis from './pages/Cryptanalysis';
import Experiments from './pages/Experiments';
import Learning from './pages/Learning';
import LearningFundamentos from './pages/LearningFundamentos';
import LearningSymmetric from './pages/LearningSymmetric';
import LearningAsymmetric from './pages/LearningAsymmetric';
import LearningHash from './pages/LearningHash';
import LearningDigitalSignatures from './pages/LearningDigitalSignatures';
import LearningCryptanalysis from './pages/LearningCryptanalysis';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-wrapper">
            <Routes>
              <Route path="/"                      element={<Dashboard />} />
              <Route path="/cifrado"               element={<TextCrypto />} />
              <Route path="/archivos"              element={<FileCrypto />} />
              <Route path="/analisis"              element={<Analysis />} />
              <Route path="/criptoanalis"          element={<Cryptanalysis />} />
              <Route path="/experimentos"          element={<Experiments />} />
              <Route path="/aprendizaje"           element={<Learning />} />
              <Route path="/aprendizaje/fundamentos" element={<LearningFundamentos />} />
              <Route path="/aprendizaje/simetrica"   element={<LearningSymmetric />} />
              <Route path="/aprendizaje/asimetrica"  element={<LearningAsymmetric />} />
              <Route path="/aprendizaje/hash"        element={<LearningHash />} />
              <Route path="/aprendizaje/firmas"      element={<LearningDigitalSignatures />} />
              <Route path="/aprendizaje/criptoanalisis" element={<LearningCryptanalysis />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
