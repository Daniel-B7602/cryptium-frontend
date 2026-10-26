import { useState, useRef } from 'react';
import { Copy, Check, Lock, Unlock, Play, Info } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import { encryptText, decryptText } from '../services/api';
import './TextCrypto.css';

const ALGORITHMS = [
  {
    id: 'AES',
    name: 'AES',
    type: 'Simétrico',
    status: 'available',
    statusText: 'Disponible',
    description: 'Cifrado simétrico: utiliza una clave para transformar los datos y la misma clave se utiliza para descifrarlos.',
    badgeClass: 'badge-accent',
  },
  {
    id: 'ChaCha20',
    name: 'ChaCha20',
    type: 'Simétrico (Flujo)',
    status: 'coming_soon',
    statusText: 'Próximamente',
    description: 'Cifrado simétrico basado en operaciones sobre palabras y bits. Está diseñado para generar un flujo de datos que se combina con el mensaje.',
    badgeClass: 'badge-muted',
  },
  {
    id: 'RSA',
    name: 'RSA',
    type: 'Asimétrico',
    status: 'coming_soon',
    statusText: 'Próximamente',
    description: 'Cifrado asimétrico: utiliza un par de claves, una pública para cifrar y una privada para descifrar.',
    badgeClass: 'badge-muted',
  },
];

export default function TextCrypto() {
  const [operation, setOperation] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [selectedAlgo, setSelectedAlgo] = useState('AES');
  const [inputText, setInputText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const currentAlgo = ALGORITHMS.find(a => a.id === selectedAlgo) || ALGORITHMS[0];

  const validate = () => {
    if (!inputText.trim()) return 'El campo de texto no puede estar vacío.';
    if (!key.trim())       return 'Debes introducir una clave.';
    return null;
  };

  const handleExecute = async () => {
    // Verificar si el algoritmo está soportado
    if (currentAlgo.status === 'coming_soon') {
      setStatus({
        type: 'warning',
        message: `El algoritmo ${currentAlgo.name} aún no está disponible en el backend. Selecciona un algoritmo disponible como AES.`,
      });
      return;
    }

    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult('');

    try {
      let data;
      if (selectedAlgo === 'AES') {
        data = operation === 'encrypt'
          ? await encryptText(inputText, key)
          : await decryptText(inputText, key);
      }

      const output = data.encryptedText ?? data.decryptedText ?? '';
      setResult(output);
      setStatus({
        type: 'success',
        message: `Texto ${operation === 'encrypt' ? 'cifrado' : 'descifrado'} correctamente con ${currentAlgo.name}.`,
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      const isNetwork = err instanceof TypeError;
      setStatus({
        type: 'error',
        message: isNetwork
          ? 'No se pudo conectar con el backend. Comprueba que el servidor está en ejecución.'
          : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({ type: 'error', message: 'No se pudo copiar al portapapeles.' });
    }
  };

  const handleClear = () => {
    setInputText('');
    setKey('');
    setResult('');
    setStatus(null);
  };

  return (
    <div className="textcrypto animate-fade-in">
      {/* Selector de operación (Cifrar / Descifrar) */}
      <div className="tc-top-bar">
        <div className="segmented-control tc-op-selector">
          <button
            id="btn-tab-encrypt"
            className={`segmented-btn ${operation === 'encrypt' ? 'active' : ''}`}
            onClick={() => { setOperation('encrypt'); setStatus(null); }}
          >
            <Lock size={15} /> Cifrar
          </button>
          <button
            id="btn-tab-decrypt"
            className={`segmented-btn ${operation === 'decrypt' ? 'active' : ''}`}
            onClick={() => { setOperation('decrypt'); setStatus(null); }}
          >
            <Unlock size={15} /> Descifrar
          </button>
        </div>
      </div>

      {/* Selector de Algoritmo de Cifrado */}
      <div className="card tc-algo-card">
        <div className="tc-algo-header">
          <label className="form-label" htmlFor="algo-select">
            🛡️ Algoritmo de cifrado
          </label>
          <span className={`badge ${currentAlgo.badgeClass}`}>
            {currentAlgo.statusText}
          </span>
        </div>

        <div className="tc-algo-grid">
          {ALGORITHMS.map(algo => (
            <button
              key={algo.id}
              type="button"
              className={`tc-algo-btn ${selectedAlgo === algo.id ? 'tc-algo-btn--active' : ''}`}
              onClick={() => { setSelectedAlgo(algo.id); setStatus(null); }}
            >
              <div className="tc-algo-btn-top">
                <span className="tc-algo-name">{algo.name}</span>
                <span className={`badge badge-sm ${algo.badgeClass}`}>{algo.type}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tarjeta Informativa: ¿Qué hace este algoritmo? */}
        <div className="tc-algo-info-box">
          <div className="tc-algo-info-title">
            <Info size={16} />
            <span>¿Qué hace este algoritmo?</span>
          </div>
          <p className="tc-algo-info-desc">
            {currentAlgo.description}
          </p>

        </div>
      </div>

      {/* Grid principal: Entrada | Controles | Salida */}
      <div className="tc-layout">
        {/* Panel de entrada */}
        <div className="card tc-panel">
          <div className="tc-panel-title">
            {operation === 'encrypt' ? '📝 Texto en claro' : '🔒 Texto cifrado'}
          </div>

          <div className="form-group">
            <textarea
              id="input-text"
              className="form-textarea tc-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                operation === 'encrypt'
                  ? 'Escribe o pega el texto que deseas cifrar...'
                  : 'Pega aquí el texto cifrado que deseas descifrar...'
              }
              disabled={loading}
            />
            <div className="tc-counters">
              <span>{inputText.length} caracteres</span>
            </div>
          </div>

          <div className="form-group tc-key-group">
            <label className="form-label" htmlFor="input-key">
              🔑 Clave de cifrado ({selectedAlgo})
            </label>
            <input
              id="input-key"
              type="text"
              className="form-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Introduce la clave secreta..."
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            />
          </div>
        </div>

        {/* Columna de acciones */}
        <div className="tc-actions-col">
          <button
            id="btn-execute"
            className="btn btn-primary btn-lg tc-execute-btn"
            onClick={handleExecute}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Procesando...
              </>
            ) : (
              <>
                <Play size={18} />
                {operation === 'encrypt' ? 'Cifrar' : 'Descifrar'}
              </>
            )}
          </button>
          <button
            className="btn btn-ghost tc-clear-btn"
            onClick={handleClear}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>

        {/* Panel de salida */}
        <div className="card tc-panel tc-panel-output" ref={resultRef}>
          <div className="tc-panel-title">
            {operation === 'encrypt' ? '🔒 Resultado cifrado' : '📝 Resultado descifrado'}
          </div>

          <div className="tc-output-area">
            {result ? (
              <pre className="tc-result-text">{result}</pre>
            ) : (
              <div className="tc-empty-state">
                <span className="tc-empty-icon">
                  {operation === 'encrypt' ? <Lock size={32} /> : <Unlock size={32} />}
                </span>
                <span>El resultado aparecerá aquí</span>
              </div>
            )}
          </div>

          {result && (
            <div className="tc-output-footer">
              <span className="tc-result-chars">{result.length} caracteres</span>
              <button
                id="btn-copy"
                className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={handleCopy}
              >
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de estado */}
      {status && (
        <StatusAlert
          type={status.type}
          message={status.message}
          onDismiss={() => setStatus(null)}
        />
      )}
    </div>
  );
}
