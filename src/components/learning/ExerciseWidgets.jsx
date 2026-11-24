import { useState, useEffect, useMemo } from 'react';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Key,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Copy,
  Binary,
  Cpu,
} from 'lucide-react';
import { caesarShift } from '../../utils/cryptanalysisUtils';
import { computeSHA256, compareHashesBitwise } from '../../utils/hashUtils';
import { generateSigningKeyPair, signMessageText, verifySignatureText } from '../../utils/signatureUtils';
import './ExerciseWidgets.css';

/**
 * Helper universal para extraer texto de ensamblados o campos.
 * Tolera cadenas, arrays de caracteres o arrays de objetos { char, id }.
 */
export function extractTextFromInput(input) {
  if (input === null || input === undefined) return '';
  if (typeof input === 'string') return input.trim().toUpperCase();
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === 'object' && item !== null ? item.char : item))
      .join('')
      .trim()
      .toUpperCase();
  }
  return String(input).trim().toUpperCase();
}

/**
 * 1. Widget de Ensamblado de Fichas (Token Assembly)
 * Permite colocar y remover fichas en ranuras para formar criptogramas.
 * NUNCA revela la solución ni resalta en verde antes de evaluar.
 */
export function TokenAssemblyWidget({ props, value = [], onChange, disabled = false }) {
  const { sourceText, tokens = [], targetLength = 3 } = props;
  const assembled = Array.isArray(value) ? value : [];

  const handleAdd = (char, tokenIdx) => {
    if (disabled) return;
    if (assembled.length < targetLength) {
      onChange([...assembled, { char, id: `${char}_${tokenIdx}_${Date.now()}_${Math.random()}` }]);
    }
  };

  const handleRemove = (index) => {
    if (disabled) return;
    onChange(assembled.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="duo-assembly-box">
      {sourceText && (
        <div className="duo-target-preview">
          <span style={{ color: 'var(--txt-secondary)' }}>Texto original a transformar:</span>
          <strong style={{ letterSpacing: '0.2em', color: 'var(--txt-primary)' }}>{sourceText}</strong>
        </div>
      )}

      <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)', margin: '4px 0 8px' }}>
        Haz clic en las fichas para colocarlas en orden en las ranuras (clic en una ficha colocada para retirarla):
      </p>

      {/* Ranuras de ensamblaje */}
      <div className="duo-slots-row">
        {Array.from({ length: targetLength }).map((_, idx) => {
          const placed = assembled[idx];
          return (
            <div
              key={idx}
              className={`duo-slot-chip ${placed ? 'filled' : 'empty'}`}
              onClick={() => placed && handleRemove(idx)}
              title={placed ? 'Clic para retirar esta ficha' : 'Ranura libre'}
            >
              {placed ? placed.char : '_'}
            </div>
          );
        })}
      </div>

      {/* Fichas disponibles en el pool */}
      <div className="duo-available-chips">
        {tokens.map((char, idx) => {
          const timesUsed = assembled.filter((t) => t.char === char).length;
          const totalInPool = tokens.filter((c) => c === char).length;
          const isMaxed = timesUsed >= totalInPool;

          return (
            <button
              key={`${char}_${idx}`}
              type="button"
              className="duo-token-chip"
              disabled={disabled || isMaxed || assembled.length >= targetLength}
              onClick={() => handleAdd(char, idx)}
            >
              {char}
            </button>
          );
        })}
      </div>

      {assembled.length > 0 && !disabled && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleReset}
            style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}
          >
            <RotateCcw size={12} /> Limpiar ranuras
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Widget de Transformación de Texto
 * Campo de texto limpio con transformación en mayúsculas y feedback sin spoilers.
 */
export function TextTransformWidget({ props, value = '', onChange }) {
  const { label, cipherText, plainText, shift, placeholder = 'Escribe tu respuesta...' } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px', margin: '0 auto', width: '100%' }}>
      {cipherText && (
        <div className="duo-target-preview" style={{ justifyContent: 'center' }}>
          <span style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>Criptograma:</span>
          <strong style={{ letterSpacing: '0.15em', fontSize: '1.25rem' }}>{cipherText}</strong>
          {typeof shift === 'number' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', marginLeft: '6px' }}>
              (k = {shift})
            </span>
          )}
        </div>
      )}

      {plainText && (
        <div className="duo-target-preview" style={{ justifyContent: 'center' }}>
          <span style={{ color: 'var(--txt-secondary)' }}>Texto original:</span>
          <strong style={{ letterSpacing: '0.15em', fontSize: '1.2rem', color: 'var(--txt-primary)' }}>{plainText}</strong>
          {typeof shift === 'number' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--clr-accent)', marginLeft: '6px' }}>
              (Desplazamiento k = {shift})
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--txt-secondary)' }}>
          {label || 'Introduce el resultado transformado:'}
        </label>
        <input
          type="text"
          className="duo-input-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '1.1rem',
            textAlign: 'center',
            fontWeight: 700,
          }}
        />
      </div>
    </div>
  );
}

/**
 * 3. Widget de Explorador de Desplazamiento (Shift Explorer)
 * Control deslizante para experimentar con claves César.
 * NUNCA se pinta de verde antes de que el usuario haga clic en Comprobar.
 */
export function ShiftExplorerWidget({ props, value = 1, onChange }) {
  const { targetCipher, minShift = 1, maxShift = 25 } = props;
  const currentShift = Number(value) || minShift;

  const previewDecrypted = useMemo(() => {
    if (!targetCipher) return '';
    return caesarShift(targetCipher, 26 - currentShift);
  }, [targetCipher, currentShift]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '540px', margin: '0 auto', width: '100%' }}>
      <div className="duo-target-preview" style={{ justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--txt-secondary)', fontSize: '0.85rem' }}>Criptograma capturado:</span>
        <strong style={{ fontSize: '1.25rem', letterSpacing: '0.15em', color: 'var(--clr-accent)' }}>
          {targetCipher}
        </strong>
      </div>

      <div style={{ background: 'var(--clr-surface-2)', padding: '18px 22px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <label style={{ fontWeight: 700, color: 'var(--txt-primary)', fontSize: '0.9rem' }}>
            Ajustar Desplazamiento a Probar:
          </label>
          <span style={{
            background: 'var(--clr-surface-3)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--clr-accent)',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}>
            k = {currentShift}
          </span>
        </div>

        <input
          type="range"
          min={minShift}
          max={maxShift}
          value={currentShift}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--clr-accent)' }}
        />

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--clr-surface-3)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--clr-border)',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)' }}>
            Texto al aplicar k = {currentShift}:
          </span>
          {/* El texto permanece en color neutro - NO SE PINTA DE VERDE ANTES DE COMPROBAR */}
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--txt-primary)',
            letterSpacing: '0.18em',
            marginTop: '4px',
            fontFamily: 'monospace',
          }}>
            {previewDecrypted}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Widget de Emparejamiento de Roles de Clave (Key Role Matcher)
 * Permite seleccionar qué clave o concepto aplica en una situación práctica sin preguntas de memorización.
 */
export function KeyRoleMatcherWidget({ props, value = null, onChange }) {
  const { situation, options = [] } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '620px', margin: '0 auto', width: '100%' }}>
      {situation && (
        <div style={{
          background: 'var(--clr-surface-3)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--clr-accent)',
          fontSize: '0.92rem',
          color: 'var(--txt-primary)',
          lineHeight: 1.5,
        }}>
          {situation}
        </div>
      )}

      <div className="duo-options-grid">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <div
              key={opt.id}
              className={`duo-option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(opt.id)}
            >
              <div className="duo-option-radio">
                {isSelected && <div className="duo-option-radio-inner" />}
              </div>
              <div className="duo-option-body">
                <h4 className="duo-option-title">{opt.label}</h4>
                {opt.desc && <p className="duo-option-desc">{opt.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 5. Widget de Avalancha Hash (Hash Avalanche Widget)
 * Permite computar hashes SHA-256 reales y comparar bits mutados.
 */
export function HashAvalancheWidget({ props, value = {}, onChange }) {
  const { initialTextA = 'Cryptium 2026', initialTextB = 'Cryptium 2026', requireEdit = false } = props;

  const [textA, setTextA] = useState(initialTextA);
  const [textB, setTextB] = useState(initialTextB);
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [diffBits, setDiffBits] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    async function updateHashes() {
      try {
        const resA = await computeSHA256(textA);
        const resB = await computeSHA256(textB);
        if (!isCancelled) {
          setHashA(resA.hex);
          setHashB(resB.hex);
          const diff = compareHashesBitwise(resA.binary, resB.binary);
          setDiffBits(diff.diffBits);
          onChange({
            textA,
            textB,
            hashA: resA.hex,
            hashB: resB.hex,
            diffBits: diff.diffBits,
          });
        }
      } catch (err) {
        console.error('Error calculando SHA-256:', err);
      }
    }
    updateHashes();
    return () => { isCancelled = true; };
  }, [textA, textB]);

  const pct = ((diffBits / 256) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Mensaje A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent)' }}>Mensaje de Entrada 1:</label>
          <input
            type="text"
            className="input-field"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', fontFamily: 'monospace', wordBreak: 'break-all', background: 'var(--clr-surface-2)', padding: '6px 8px', borderRadius: '4px' }}>
            Hash 1: {hashA ? `${hashA.substring(0, 16)}...` : 'Calculando...'}
          </div>
        </div>

        {/* Mensaje B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-purple)' }}>Mensaje de Entrada 2:</label>
          <input
            type="text"
            className="input-field"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--txt-muted)', fontFamily: 'monospace', wordBreak: 'break-all', background: 'var(--clr-surface-2)', padding: '6px 8px', borderRadius: '4px' }}>
            Hash 2: {hashB ? `${hashB.substring(0, 16)}...` : 'Calculando...'}
          </div>
        </div>
      </div>

      {/* Monitor de bits mutados */}
      <div style={{
        background: 'var(--clr-surface-3)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--clr-border)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Bits Mutados</div>
            <strong style={{ fontSize: '1.25rem', color: diffBits > 0 ? 'var(--clr-accent)' : 'var(--txt-primary)' }}>
              {diffBits} / 256 bits
            </strong>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--clr-border)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Tasa de Avalancha</div>
            <strong style={{ fontSize: '1.25rem', color: diffBits >= 80 ? 'var(--clr-success)' : 'var(--txt-primary)' }}>
              {pct}%
            </strong>
          </div>
        </div>

        <div style={{ marginTop: '10px', height: '6px', background: 'var(--clr-surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--clr-accent), var(--clr-purple))' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Widget de Simulación y Alteración de Firma (Signature Tamper Widget)
 * Permite firmar digitalmente y alternar la manipulación del documento para verificar el rechazo.
 */
export function SignatureTamperWidget({ props, value = {}, onChange }) {
  const { originalMessage, tamperedMessage, allowTamper = true } = props;

  const [isSigned, setIsSigned] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [signatureHex, setSignatureHex] = useState('');
  const [keyPair, setKeyPair] = useState(null);

  // Inicializar par de claves al montar
  useEffect(() => {
    let active = true;
    async function initKeys() {
      try {
        const pair = await generateSigningKeyPair();
        if (active) setKeyPair(pair);
      } catch (err) {
        console.error('Error generando par de claves para firma:', err);
      }
    }
    initKeys();
    return () => { active = false; };
  }, []);

  const handleSign = async () => {
    if (!keyPair) return;
    try {
      const sig = await signMessageText(keyPair.privateKey, originalMessage);
      setIsSigned(true);
      setSignatureHex(sig.signatureHex);
      onChange({
        signed: true,
        tampered: isTampered,
        verified: !isTampered,
      });
    } catch (err) {
      console.error('Error al firmar:', err);
    }
  };

  const handleToggleTamper = (tamperVal) => {
    setIsTampered(tamperVal);
    onChange({
      signed: isSigned,
      tampered: tamperVal,
      verified: isSigned && !tamperVal,
    });
  };

  const currentMsg = isTampered && tamperedMessage ? tamperedMessage : originalMessage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '620px', margin: '0 auto', width: '100%' }}>
      {/* Visualizador del documento */}
      <div style={{
        background: 'var(--clr-surface-2)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: isTampered ? '2px dashed #f43f5e' : '1px solid var(--clr-border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isTampered ? '#f43f5e' : 'var(--clr-accent)' }}>
            {isTampered ? '⚠️ Documento Modificado por Atacante en Tránsito:' : '📄 Documento Oficial a Firmar:'}
          </span>
          {isSigned && (
            <span className={`badge ${isTampered ? 'badge-rose' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
              {isTampered ? 'Firma Inválida' : 'Firma Válida'}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt-primary)', fontFamily: 'monospace' }}>
          {currentMsg}
        </div>
      </div>

      {/* Botón de Firma */}
      {!isSigned ? (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSign}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <FileCheck size={16} /> Estampar Firma Digital con Clave Privada
        </button>
      ) : (
        <div style={{
          background: 'var(--clr-surface-3)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color: 'var(--txt-muted)',
          wordBreak: 'break-all',
        }}>
          <strong>Firma Digital RSA-PSS (2048 bits):</strong>
          <div style={{ color: 'var(--clr-accent)', marginTop: '4px' }}>
            {signatureHex ? `${signatureHex.substring(0, 48)}... [256 bytes]` : 'Generada con éxito'}
          </div>
        </div>
      )}

      {/* Control de manipulación */}
      {allowTamper && isSigned && (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isTampered ? 'rgba(244, 63, 94, 0.1)' : 'var(--clr-surface-3)',
          border: isTampered ? '1px solid #f43f5e' : '1px solid var(--clr-border)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: isTampered ? '#f43f5e' : 'var(--txt-secondary)',
        }}>
          <input
            type="checkbox"
            checked={isTampered}
            onChange={(e) => handleToggleTamper(e.target.checked)}
          />
          <strong>Simular alteración del mensaje por un atacante en la red</strong>
        </label>
      )}
    </div>
  );
}

/**
 * 7. Widget de Secuencia de Protocolo (Protocol Sequence Widget)
 * Permite ordenar pasos de un protocolo criptográfico con botones Subir / Bajar.
 * Garantiza inicio en estado desordenado y sincronización reactiva inmediata.
 */
export function ProtocolSequenceWidget({ props, value = [], onChange, disabled = false }) {
  const { steps = [], initialOrder = null } = props;

  // Inicializar estado desordenado si no hay valor previo
  const defaultOrder = useMemo(() => {
    if (Array.isArray(initialOrder) && initialOrder.length === steps.length) {
      return initialOrder;
    }
    // Si no se proveyó orden inicial desordenado, permutar determinísticamente
    if (steps.length === 4) {
      return [steps[2].id, steps[0].id, steps[3].id, steps[1].id];
    }
    return steps.map((s) => s.id);
  }, [steps, initialOrder]);

  const currentOrder = Array.isArray(value) && value.length === steps.length
    ? value
    : defaultOrder;

  // Notificar el orden inicial al contenedor para habilitar la comprobación
  useEffect(() => {
    if (!Array.isArray(value) || value.length !== steps.length) {
      onChange(defaultOrder);
    }
  }, [defaultOrder]);

  const handleMove = (index, direction) => {
    if (disabled) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const next = [...currentOrder];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <p style={{ fontSize: '0.88rem', color: 'var(--txt-secondary)', margin: '0 0 6px' }}>
        Usa las flechas (↑ / ↓) para colocar los pasos en el orden cronológico estricto:
      </p>

      {currentOrder.map((stepId, index) => {
        const stepData = steps.find((s) => s.id === stepId);
        return (
          <div
            key={stepId}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr auto',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'var(--clr-surface-2)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--clr-surface-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: 'var(--clr-accent)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
            }}>
              {index + 1}
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt-primary)', lineHeight: 1.4 }}>
              {stepData?.text || stepId}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={disabled || index === 0}
                onClick={() => handleMove(index, -1)}
                title="Subir posición"
                style={{ padding: '6px 10px' }}
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={disabled || index === currentOrder.length - 1}
                onClick={() => handleMove(index, 1)}
                title="Bajar posición"
                style={{ padding: '6px 10px' }}
              >
                <ArrowDown size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Despachador Universal de Widgets para Retos
 */
export function DynamicExerciseWidget({ challenge, value, onChange }) {
  if (!challenge) return null;

  switch (challenge.widgetType) {
    case 'token_assembly':
      return <TokenAssemblyWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'text_transform':
      return <TextTransformWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'shift_explorer':
      return <ShiftExplorerWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'key_role_match':
      return <KeyRoleMatcherWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'hash_avalanche':
      return <HashAvalancheWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'signature_tamper':
      return <SignatureTamperWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    case 'protocol_sequence':
      return <ProtocolSequenceWidget props={challenge.widgetProps || {}} value={value} onChange={onChange} />;
    default:
      return (
        <div style={{ padding: '16px', color: 'var(--txt-secondary)', textAlign: 'center' }}>
          Interacción lista para comprobar.
        </div>
      );
  }
}

export default DynamicExerciseWidget;
