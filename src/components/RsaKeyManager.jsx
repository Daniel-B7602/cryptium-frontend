import { useState, useRef } from 'react';
import { Key, Copy, Check, Download, Upload, Eye, EyeOff, RefreshCw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { generateRsaKeys } from '../services/api';
import './RsaKeyManager.css';

export default function RsaKeyManager({
  keys,
  onKeysChange,
  onSelectKey,
  currentOperation = 'encrypt',
  disabled = false,
}) {
  const [internalKeys, setInternalKeys] = useState(null); // { publicKey, privateKey, keySize }
  const [loading, setLoading] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null); // 'public' | 'private'
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const activeKeys = keys !== undefined ? keys : internalKeys;

  const handleGenerateKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateRsaKeys(2048);
      if (onKeysChange) {
        onKeysChange(data);
      } else {
        setInternalKeys(data);
      }

      if (onSelectKey) {
        // Seleccionar automáticamente la clave adecuada según la operación
        if (currentOperation === 'encrypt') {
          onSelectKey(data.publicKey, 'public');
        } else {
          onSelectKey(data.privateKey, 'private');
        }
      }
    } catch (err) {
      setError('Error al generar par de claves RSA: ' + (err.message || 'Error de conexión'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPem = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.includes('PUBLIC KEY')) {
          const updated = { ...(activeKeys || {}), publicKey: trimmed };
          if (onKeysChange) onKeysChange(updated);
          else setInternalKeys(updated);
          if (onSelectKey) onSelectKey(trimmed, 'public');
        } else if (trimmed.includes('PRIVATE KEY')) {
          const updated = { ...(activeKeys || {}), privateKey: trimmed };
          if (onKeysChange) onKeysChange(updated);
          else setInternalKeys(updated);
          if (onSelectKey) onSelectKey(trimmed, 'private');
        } else {
          setError('El archivo seleccionado no parece ser una clave PEM válida.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rsa-manager card">
      <div className="rsa-manager-header">
        <div className="rsa-manager-title">
          <Key size={18} className="rsa-icon-accent" />
          <span>Gestión de Claves Asimétricas RSA-2048</span>
        </div>
        <div className="rsa-manager-actions">
          <input
            type="file"
            ref={fileInputRef}
            className="rsa-file-input"
            accept=".pem,.key,.pub,.txt"
            onChange={handleImportPem}
          />
          <button
            type="button"
            className="btn btn-sm btn-ghost rsa-btn-import"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            title="Importar un archivo de clave en formato PEM (.pem, .key, .pub)"
          >
            <Upload size={14} /> Importar archivo PEM
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary rsa-btn-generate"
            onClick={handleGenerateKeys}
            disabled={disabled || loading}
            title="Generar automáticamente un par de claves RSA (2048 bits con relleno OAEP-SHA256)"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="spinner" /> Generando claves...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generar par de claves RSA
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rsa-alert-box rsa-alert-error">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {!activeKeys ? (
        <div className="rsa-empty-state">
          <ShieldCheck size={32} className="rsa-empty-icon" />
          <p>
            RSA utiliza un par de claves: la <strong>Clave Pública</strong> para cifrar y la <strong>Clave Privada</strong> para descifrar.
          </p>
          <span className="rsa-empty-sub">
            Pulsa el botón a continuación para generar un nuevo par de claves RSA-2048 listo para usar, o importa un archivo PEM existente.
          </span>
          <button
            type="button"
            className="btn btn-primary rsa-btn-empty-generate"
            onClick={handleGenerateKeys}
            disabled={disabled || loading}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="spinner" /> Generando par de claves...
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generar par de claves RSA
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rsa-keys-grid">
          {/* Tarjeta Clave Pública */}
          <div className={`rsa-key-box ${currentOperation === 'encrypt' ? 'rsa-key-box--highlight' : ''}`}>
            <div className="rsa-key-box-top">
              <span className="rsa-key-badge badge badge-sm badge-accent">
                Clave Pública (Para Cifrar - Compartir)
              </span>
              <div className="rsa-key-btn-group">
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleCopy(activeKeys.publicKey, 'public')}
                  title="Copiar Clave Pública al portapapeles"
                >
                  {copiedKey === 'public' ? <><Check size={13} /> Copiada</> : <><Copy size={13} /> Copiar</>}
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleDownload(activeKeys.publicKey, 'clave_publica_rsa.pem')}
                  title="Descargar como clave_publica_rsa.pem"
                >
                  <Download size={13} /> Descargar .pem
                </button>
              </div>
            </div>
            <pre className="rsa-key-preview">{activeKeys.publicKey.substring(0, 160)}...</pre>
            <div className="rsa-key-box-footer">
              <span className="rsa-key-desc">
                Compártela libremente con quienes desees que te envíen datos cifrados.
              </span>
              {onSelectKey && (
                <button
                  type="button"
                  className="btn btn-xs btn-primary rsa-use-btn"
                  onClick={() => onSelectKey(activeKeys.publicKey, 'public')}
                  title="Cargar esta clave pública en el campo de texto"
                >
                  Usar para cifrar
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta Clave Privada */}
          <div className={`rsa-key-box ${currentOperation === 'decrypt' ? 'rsa-key-box--highlight' : ''}`}>
            <div className="rsa-key-box-top">
              <span className="rsa-key-badge badge badge-sm badge-purple">
                Clave Privada (Para Descifrar - Secreto)
              </span>
              <div className="rsa-key-btn-group">
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => setShowPrivate(!showPrivate)}
                  title={showPrivate ? 'Ocultar clave privada' : 'Mostrar clave privada'}
                >
                  {showPrivate ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleCopy(activeKeys.privateKey, 'private')}
                  title="Copiar Clave Privada al portapapeles"
                >
                  {copiedKey === 'private' ? <><Check size={13} /> Copiada</> : <><Copy size={13} /> Copiar</>}
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleDownload(activeKeys.privateKey, 'clave_privada_rsa.pem')}
                  title="Descargar como clave_privada_rsa.pem"
                >
                  <Download size={13} /> Descargar .pem
                </button>
              </div>
            </div>
            <pre className="rsa-key-preview rsa-key-preview--private">
              {showPrivate
                ? `${activeKeys.privateKey.substring(0, 160)}...`
                : '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• [CLAVE PRIVADA PROTEGIDA]'}
            </pre>
            <div className="rsa-key-box-footer">
              <span className="rsa-key-desc rsa-key-desc--warn">
                ⚠️ NUNCA compartas tu clave privada ni la expongas en canales públicos.
              </span>
              {onSelectKey && (
                <button
                  type="button"
                  className="btn btn-xs btn-secondary rsa-use-btn"
                  onClick={() => onSelectKey(activeKeys.privateKey, 'private')}
                  title="Cargar esta clave privada en el campo de texto"
                >
                  Usar para descifrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
