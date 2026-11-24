import { useState, useRef } from 'react';
import { Copy, Check, Lock, Unlock, Play, Info, Key, Sparkles, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import RsaKeyManager from '../components/RsaKeyManager';
import { encryptText, decryptText, generateRsaKeys } from '../services/api';
import './TextCrypto.css';

const ALGORITHMS = [
  {
    id: 'AES',
    name: 'AES-256',
    type: 'Simétrico (Bloques)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Estándar mundial de cifrado simétrico por bloques (128 bits / 16 bytes). Utiliza la misma clave secreta compartida para cifrar y descifrar en modo CBC con relleno PKCS#7 y vector de inicialización (IV) de 16 bytes.',
    badgeClass: 'badge-accent',
    keyHelp: 'Usa una contraseña o frase secreta compartida. El emisor y el receptor deben acordar la misma clave.',
  },
  {
    id: 'ChaCha20',
    name: 'ChaCha20',
    type: 'Simétrico (Flujo)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Cifrador de flujo simétrico de alta velocidad según RFC 8439. Opera sobre palabras de 32 bits y genera un flujo continuo de bytes combinado mediante XOR con el mensaje. Utiliza una clave de 256 bits y un nonce de 96 bits único por operación.',
    badgeClass: 'badge-blue',
    keyHelp: 'Usa una clave secreta compartida de 256 bits (derivada de tu contraseña). Importante: ChaCha20 es un cifrador de flujo puro y no proporciona autenticación de integridad por sí solo (sin MAC Poly1305).',
    isUnauthenticated: true,
  },
  {
    id: 'RSA',
    name: 'RSA-2048',
    type: 'Asimétrico (Pares)',
    status: 'available',
    statusText: 'Disponible',
    description: 'Cifrado asimétrico basado en la factorización de números primos grandes. Utiliza un par de claves: la Clave Pública para cifrar y la Clave Privada para descifrar, con esquema de relleno seguro RSA-OAEP (SHA-256).',
    badgeClass: 'badge-purple',
    keyHelp: 'Para CIFRAR se utiliza la Clave Pública del destinatario. Para DESCIFRAR se utiliza tu Clave Privada. Las claves deben estar en formato PEM.',
    isAsymmetric: true,
  },
];

export default function TextCrypto() {
  const [operation, setOperation] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [selectedAlgo, setSelectedAlgo] = useState('AES');
  const [inputText, setInputText] = useState('');
  const [key, setKey] = useState('');
  const [rsaKeys, setRsaKeys] = useState(null); // { publicKey, privateKey, keySize }
  const [generatingRsa, setGeneratingRsa] = useState(false);
  const [result, setResult] = useState('');
  const [resultMeta, setResultMeta] = useState(null); // { algorithm, nonceOrIvHex, details }
  const [status, setStatus] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const currentAlgo = ALGORITHMS.find(a => a.id === selectedAlgo) || ALGORITHMS[0];

  const handleSwitchOperation = (newOp) => {
    setOperation(newOp);
    setStatus(null);
    // Si estamos en RSA y tenemos un par de claves generado:
    if (selectedAlgo === 'RSA' && rsaKeys) {
      // Si la clave en pantalla coincide con la del par o está vacía, cambiar automáticamente
      if (!key || key === rsaKeys.publicKey || key === rsaKeys.privateKey) {
        setKey(newOp === 'encrypt' ? rsaKeys.publicKey : rsaKeys.privateKey);
      }
    }
  };

  const handleAlgoChange = (algoId) => {
    setSelectedAlgo(algoId);
    setStatus(null);
    if (algoId === 'RSA' && rsaKeys) {
      setKey(operation === 'encrypt' ? rsaKeys.publicKey : rsaKeys.privateKey);
    } else {
      setKey('');
    }
  };

  const handleGenerateRsaPair = async () => {
    setGeneratingRsa(true);
    setStatus(null);
    try {
      const data = await generateRsaKeys(2048);
      setRsaKeys(data);
      const targetKey = operation === 'encrypt' ? data.publicKey : data.privateKey;
      setKey(targetKey);
      setStatus({
        type: 'success',
        message: `¡Par de claves RSA-2048 generado correctamente! Se cargó automáticamente la Clave ${operation === 'encrypt' ? 'Pública para cifrar' : 'Privada para descifrar'}.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'No se pudo generar el par de claves RSA: ' + (err.message || 'Error de conexión con el backend.'),
      });
    } finally {
      setGeneratingRsa(false);
    }
  };

  const validate = () => {
    if (!inputText.trim()) {
      return operation === 'encrypt'
        ? 'El campo de texto que deseas cifrar no puede estar vacío.'
        : 'El texto cifrado en Base64 que deseas descifrar no puede estar vacío.';
    }

    if (!key.trim()) {
      return currentAlgo.isAsymmetric
        ? `Debes proporcionar una ${operation === 'encrypt' ? 'Clave Pública' : 'Clave Privada'} RSA en formato PEM. Puedes pulsar «Generar par de claves RSA» para crear una automáticamente.`
        : 'Debes introducir una clave secreta.';
    }

    if (currentAlgo.isAsymmetric) {
      const cleanKey = key.trim();

      // 1. Detección de clave invertida (Pública en descifrado / Privada en cifrado)
      if (operation === 'encrypt') {
        if (cleanKey.includes('BEGIN PRIVATE KEY') || cleanKey.includes('BEGIN RSA PRIVATE KEY')) {
          return 'Has introducido una Clave Privada en el campo de cifrado. En criptografía asimétrica RSA, los mensajes se cifran con la Clave Pública del destinatario. La Clave Privada debe mantenerse en secreto y sólo se utiliza para descifrar.';
        }
        if (!cleanKey.includes('-----BEGIN PUBLIC KEY-----')) {
          return 'Formato de clave inválido: La Clave Pública RSA debe comenzar con "-----BEGIN PUBLIC KEY-----". Puedes pulsar el botón «Generar par de claves RSA» para crear una válida.';
        }
        if (!cleanKey.includes('-----END PUBLIC KEY-----')) {
          return 'Clave incompleta: Falta la línea de cierre "-----END PUBLIC KEY-----". Verifica que no hayas cortado caracteres al copiar la clave.';
        }
      } else {
        if (cleanKey.includes('BEGIN PUBLIC KEY') && !cleanKey.includes('PRIVATE KEY')) {
          return 'Has introducido una Clave Pública en el campo de descifrado. Para descifrar mensajes cifrados con RSA debes utilizar la Clave Privada correspondiente al par.';
        }
        const hasBeginPrivate = cleanKey.includes('-----BEGIN PRIVATE KEY-----') || cleanKey.includes('-----BEGIN RSA PRIVATE KEY-----');
        const hasEndPrivate = cleanKey.includes('-----END PRIVATE KEY-----') || cleanKey.includes('-----END RSA PRIVATE KEY-----');

        if (!hasBeginPrivate) {
          return 'Formato de clave inválido: La Clave Privada RSA debe comenzar con "-----BEGIN PRIVATE KEY-----" o "-----BEGIN RSA PRIVATE KEY-----".';
        }
        if (!hasEndPrivate) {
          return 'Clave incompleta: Falta la línea de cierre "-----END PRIVATE KEY-----". Verifica que no hayas cortado caracteres al copiar la clave.';
        }
      }

      // 2. Validación de bloque Base64
      const bodyLines = cleanKey
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('-----'));
      const base64Body = bodyLines.join('');

      if (base64Body.length < 50) {
        return 'La clave PEM está incompleta o vacía entre las cabeceras. Asegúrate de incluir el bloque completo de la clave.';
      }

      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (!base64Regex.test(base64Body)) {
        return 'La clave PEM contiene caracteres no válidos en su bloque Base64. Asegúrate de no incluir símbolos extraños ni espacios indebidos.';
      }
    }

    return null;
  };

  const handleExecute = async () => {
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult('');
    setResultMeta(null);

    try {
      let data;
      if (operation === 'encrypt') {
        data = await encryptText(inputText, key, selectedAlgo);
      } else {
        data = await decryptText(inputText, key, selectedAlgo);
      }

      const output = data.encryptedText ?? data.decryptedText ?? '';
      setResult(output);
      setResultMeta({
        algorithm: data.algorithm || currentAlgo.name,
        nonceOrIvHex: data.nonceOrIvHex,
        details: data.details,
      });

      setStatus({
        type: 'success',
        message: `Texto ${operation === 'encrypt' ? 'cifrado' : 'descifrado'} correctamente con ${currentAlgo.name}.`,
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      const isNetwork = err instanceof TypeError;
      let msg = isNetwork
        ? 'No se pudo conectar con el backend. Comprueba que el servidor esté en ejecución.'
        : (err.message || 'Error en la operación.');

      // Sanitizar posibles fugas de excepciones técnicas de bajo nivel
      if (msg.includes('ASN1') || msg.includes('corrupted') || msg.includes('asn1')) {
        msg = 'La clave proporcionada contiene datos corruptos o no compatibles con la estructura PEM/ASN.1 de RSA. Verifica haberla copiado sin alterar caracteres.';
      } else if (msg.includes('No supported key formats') || msg.includes('unsupported format')) {
        msg = 'El formato de la clave no es reconocido como una clave PEM RSA válida. Debe incluir cabeceras -----BEGIN... y -----END... estándar.';
      }

      setStatus({
        type: 'error',
        message: msg,
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
    setResultMeta(null);
    setStatus(null);
  };

  const generateRandomSymmetricKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    let str = '';
    for (let i = 0; i < array.length; i++) {
      str += chars[array[i] % chars.length];
    }
    setKey(str);
    setStatus({
      type: 'info',
      message: 'Se generó una clave aleatoria segura de 24 caracteres.',
    });
  };

  return (
    <div className="textcrypto animate-fade-in">
      {/* Selector de operación (Cifrar / Descifrar) */}
      <div className="tc-top-bar">
        <div className="segmented-control tc-op-selector">
          <button
            id="btn-tab-encrypt"
            className={`segmented-btn ${operation === 'encrypt' ? 'active' : ''}`}
            onClick={() => handleSwitchOperation('encrypt')}
          >
            <Lock size={15} /> Cifrar
          </button>
          <button
            id="btn-tab-decrypt"
            className={`segmented-btn ${operation === 'decrypt' ? 'active' : ''}`}
            onClick={() => handleSwitchOperation('decrypt')}
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
              onClick={() => handleAlgoChange(algo.id)}
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

          {currentAlgo.isUnauthenticated && (
            <div className="tc-algo-warn-banner">
              <AlertTriangle size={15} />
              <span>
                <strong>Aviso de Seguridad:</strong> ChaCha20 es un cifrador de flujo puro que ofrece alta confidencialidad y velocidad, pero <strong>no proporciona autenticación ni verificación de integridad por sí solo</strong> (a diferencia de ChaCha20-Poly1305, que incorpora un código MAC).
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gestor de Claves RSA si está seleccionado */}
      {currentAlgo.isAsymmetric && (
        <RsaKeyManager
          keys={rsaKeys}
          onKeysChange={setRsaKeys}
          onSelectKey={(selectedKeyPem) => setKey(selectedKeyPem)}
          currentOperation={operation}
          disabled={loading || generatingRsa}
        />
      )}

      {/* Grid principal: Entrada | Controles | Salida */}
      <div className="tc-layout">
        {/* Panel de entrada */}
        <div className="card tc-panel">
          <div className="tc-panel-title">
            {operation === 'encrypt' ? '📝 Texto en claro' : '🔒 Texto cifrado (Base64)'}
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
                  : 'Pega aquí el texto cifrado en Base64 que deseas descifrar...'
              }
              disabled={loading}
            />
            <div className="tc-counters">
              <span>{inputText.length} caracteres</span>
            </div>
          </div>

          {/* Campo de Clave según el algoritmo */}
          <div className="form-group tc-key-group">
            <div className="tc-key-header">
              <label className="form-label" htmlFor="input-key">
                {currentAlgo.isAsymmetric
                  ? (operation === 'encrypt' ? '📜 Clave Pública RSA (PEM)' : '🔐 Clave Privada RSA (PEM)')
                  : `🔑 Clave secreta (${currentAlgo.name})`}
              </label>

              <div className="tc-key-header-actions">
                {currentAlgo.isAsymmetric ? (
                  <>
                    {rsaKeys && (
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost tc-btn-load-key"
                        onClick={() => {
                          const targetKey = operation === 'encrypt' ? rsaKeys.publicKey : rsaKeys.privateKey;
                          setKey(targetKey);
                          setStatus({
                            type: 'info',
                            message: `Se cargó la Clave ${operation === 'encrypt' ? 'Pública' : 'Privada'} del par generado.`,
                          });
                        }}
                        title={`Cargar la clave ${operation === 'encrypt' ? 'pública' : 'privada'} generada en el campo`}
                      >
                        <Key size={12} /> Cargar clave {operation === 'encrypt' ? 'pública' : 'privada'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-xs btn-primary tc-btn-gen-rsa"
                      onClick={handleGenerateRsaPair}
                      disabled={generatingRsa || loading}
                      title="Generar automáticamente un nuevo par de claves pública y privada RSA-2048"
                    >
                      {generatingRsa ? (
                        <>
                          <RefreshCw size={12} className="spinner" /> Generando claves...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} /> Generar par de claves RSA
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  operation === 'encrypt' && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost tc-btn-gen-key"
                      onClick={generateRandomSymmetricKey}
                      title="Generar contraseña aleatoria segura"
                    >
                      <Sparkles size={12} /> Generar clave segura
                    </button>
                  )
                )}
              </div>
            </div>

            {currentAlgo.isAsymmetric ? (
              <textarea
                id="input-key"
                className="form-textarea tc-pem-textarea"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={
                  operation === 'encrypt'
                    ? '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----'
                    : '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----'
                }
                disabled={loading}
                rows={5}
              />
            ) : (
              <input
                id="input-key"
                type="text"
                className="form-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Introduce la contraseña o clave secreta..."
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              />
            )}

            <span className="tc-key-help">{currentAlgo.keyHelp}</span>
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
                {operation === 'encrypt' ? 'Cifrar texto' : 'Descifrar texto'}
              </>
            )}
          </button>
          <button
            className="btn btn-ghost tc-clear-btn"
            onClick={handleClear}
            disabled={loading}
          >
            Limpiar campos
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
              <div className="tc-output-meta-left">
                <span className="tc-result-chars">{result.length} caracteres</span>
                {resultMeta?.nonceOrIvHex && (
                  <span className="tc-nonce-pill" title="Vector o Nonce utilizado">
                    IV/Nonce: {resultMeta.nonceOrIvHex.substring(0, 16)}...
                  </span>
                )}
              </div>
              <button
                id="btn-copy"
                className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={handleCopy}
              >
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          )}

          {resultMeta?.details && (
            <div className="tc-details-box">
              <ShieldCheck size={14} className="tc-details-icon" />
              <span>{resultMeta.details}</span>
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
