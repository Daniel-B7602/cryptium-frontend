import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Info,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Fingerprint,
  Layers,
  HelpCircle,
  FileText,
  UserCheck,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  generateSigningKeyPair,
  exportPublicKeySPKI,
  signMessageText,
  verifySignatureText,
  corruptSignatureByte,
  isWebCryptoSignSupported,
} from '../utils/signatureUtils';
import './Learning.css';
import './LearningDigitalSignatures.css';

export default function LearningDigitalSignatures() {
  const navigate = useNavigate();

  // Comprobación de compatibilidad con Web Crypto
  const webCryptoSupported = isWebCryptoSignSupported();

  // Sección activa para navegación rápida
  const [activeSection, setActiveSection] = useState('lab');

  // ─── Estado de Claves Criptográficas ───────────────────────────────
  const [keyPair, setKeyPair] = useState(null);
  const [exportedPubKey, setExportedPubKey] = useState(null);
  const [generatingKeys, setGeneratingKeys] = useState(false);
  const [showPem, setShowPem] = useState(false);
  const [copiedPem, setCopiedPem] = useState(false);

  // ─── Estado del Laboratorio de Firma ──────────────────────────────
  const [originalMessage, setOriginalMessage] = useState('Autorizo la transferencia de 1,500 USD a Bob.');
  const [signatureData, setSignatureData] = useState(null);
  const [signingLoading, setSigningLoading] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);

  // ─── Estado del Panel Receptor y Verificación ──────────────────────
  const [receivedMessage, setReceivedMessage] = useState('');
  const [receivedSigBytes, setReceivedSigBytes] = useState(null);
  const [isSigTampered, setIsSigTampered] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // null | { isValid: boolean, reason?: string }
  const [verifyingLoading, setVerifyingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ─── Estado del Desafío Educativo ─────────────────────────────────
  const [challengeStep, setChallengeStep] = useState(1); // 1: firmar, 2: alterar, 3: verificar fallo, 4: responder
  const [challengeAnswer, setChallengeAnswer] = useState(null); // 'A' | 'B' | 'C'

  // ─── Milestones de Progreso ────────────────────────────────────────
  const [milestones, setMilestones] = useState({
    exploredTheory: true,
    generatedKeys: false,
    signedMessage: false,
    verifiedSignature: false,
    testedTampering: false,
    completedChallenge: false,
  });

  const progressPercent = useMemo(() => {
    let count = 0;
    if (milestones.exploredTheory) count += 15;
    if (milestones.generatedKeys) count += 20;
    if (milestones.signedMessage) count += 20;
    if (milestones.verifiedSignature) count += 15;
    if (milestones.testedTampering) count += 15;
    if (milestones.completedChallenge) count += 15;
    return count;
  }, [milestones]);

  // ─── Generación Inicial de Claves RSA-PSS ─────────────────────────
  const handleGenerateKeys = async () => {
    if (!webCryptoSupported) {
      setErrorMsg('Tu navegador o contexto de seguridad no soporta Web Crypto con RSA-PSS.');
      return;
    }
    setGeneratingKeys(true);
    setErrorMsg(null);
    try {
      const keys = await generateSigningKeyPair();
      const pubExport = await exportPublicKeySPKI(keys.publicKey);
      setKeyPair(keys);
      setExportedPubKey(pubExport);
      setSignatureData(null);
      setVerificationResult(null);
      setIsSigTampered(false);
      setMilestones((prev) => ({ ...prev, generatedKeys: true }));
    } catch (err) {
      setErrorMsg(`Error al generar claves RSA-PSS: ${err.message}`);
    } finally {
      setGeneratingKeys(false);
    }
  };

  useEffect(() => {
    handleGenerateKeys();
  }, []);

  // ─── Acción: Firmar Mensaje ───────────────────────────────────────
  const handleSignMessage = async () => {
    if (!keyPair?.privateKey || !originalMessage.trim()) return;
    setSigningLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);
    try {
      const sig = await signMessageText(keyPair.privateKey, originalMessage);
      setSignatureData(sig);
      setReceivedMessage(originalMessage);
      setReceivedSigBytes(sig.signatureBytes);
      setIsSigTampered(false);
      setMilestones((prev) => ({ ...prev, signedMessage: true }));
    } catch (err) {
      setErrorMsg(`Error al firmar mensaje: ${err.message}`);
    } finally {
      setSigningLoading(false);
    }
  };

  // ─── Acción: Verificar Firma ──────────────────────────────────────
  const handleVerifySignature = async () => {
    if (!keyPair?.publicKey || !receivedSigBytes) return;
    setVerifyingLoading(true);
    try {
      const isValid = await verifySignatureText(keyPair.publicKey, receivedSigBytes, receivedMessage);
      let reason = 'La firma matemática coincide exactamente con la clave pública y el mensaje.';
      if (!isValid) {
        if (isSigTampered) {
          reason = 'La firma digital fue corrompida (al menos 1 byte fue alterado). No corresponde a la clave pública.';
        } else if (receivedMessage !== originalMessage) {
          reason = 'El mensaje recibido difiere del mensaje original firmado. El hash resultante no coincide.';
        } else {
          reason = 'La firma digital es inválida para este mensaje o clave.';
        }
      }

      setVerificationResult({ isValid, reason });
      setMilestones((prev) => ({
        ...prev,
        verifiedSignature: true,
        testedTampering: !isValid ? true : prev.testedTampering,
      }));
    } catch (err) {
      setVerificationResult({ isValid: false, reason: `Error durante la verificación: ${err.message}` });
    } finally {
      setVerifyingLoading(false);
    }
  };

  // ─── Manipulación Intencional para Demostración ────────────────────
  const handleTamperMessage = () => {
    const tampered = receivedMessage.endsWith('.') ? receivedMessage + '!' : receivedMessage + '.';
    setReceivedMessage(tampered);
    setVerificationResult(null);
  };

  const handleTamperSignature = () => {
    if (!receivedSigBytes) return;
    const corrupted = corruptSignatureByte(receivedSigBytes, 10);
    setReceivedSigBytes(corrupted);
    setIsSigTampered(true);
    setVerificationResult(null);
  };

  const handleRestoreOriginal = () => {
    if (signatureData) {
      setReceivedMessage(originalMessage);
      setReceivedSigBytes(signatureData.signatureBytes);
      setIsSigTampered(false);
      setVerificationResult(null);
    }
  };

  const copyToClipboard = (text, isPem) => {
    navigator.clipboard.writeText(text);
    if (isPem) {
      setCopiedPem(true);
      setTimeout(() => setCopiedPem(false), 2000);
    } else {
      setCopiedSig(true);
      setTimeout(() => setCopiedSig(false), 2000);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Breadcrumb / Volver al catálogo ── */}
      <button className="btn btn-ghost lm-back-link" onClick={() => navigate('/aprendizaje')}>
        <ArrowLeft size={16} /> Volver al catálogo de módulos
      </button>

      {/* ── Cabecera del Módulo ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
            Módulo 5
          </div>
          <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>· Criptografía Asimétrica Aplicada</span>
        </div>
        <h1 style={{ marginTop: '8px' }}>Firmas Digitales</h1>
        <p>
          Aprende cómo las firmas digitales garantizan la <strong>autenticidad</strong>, la <strong>integridad</strong> y
          el <strong>no repudio</strong> combinando claves asimétricas con funciones hash mediante el estándar{' '}
          <strong>RSA-PSS</strong> con <strong>SHA-256</strong>.
        </p>
      </div>

      {/* ── Tarjeta de Progreso ── */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title-wrap">
            <Sparkles size={18} style={{ color: '#10d46e' }} />
            <h3>Progreso del Módulo</h3>
          </div>
          <div className="progress-percentage">{progressPercent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #0098bb, #10d46e)' }} />
        </div>
        <div className="progress-milestones">
          <span className={`milestone-chip ${milestones.exploredTheory ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 1. Teoría y pilares
          </span>
          <span className={`milestone-chip ${milestones.generatedKeys ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 2. Claves RSA-PSS
          </span>
          <span className={`milestone-chip ${milestones.signedMessage ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 3. Firma generada
          </span>
          <span className={`milestone-chip ${milestones.verifiedSignature ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 4. Verificación matemática
          </span>
          <span className={`milestone-chip ${milestones.testedTampering ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 5. Detección de alteración
          </span>
          <span className={`milestone-chip ${milestones.completedChallenge ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 6. Reto completado
          </span>
        </div>
      </div>

      {/* ── Navegación rápida ── */}
      <div className="lds-nav-pills">
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--txt-muted)', marginRight: '6px' }}>
          SECCIONES:
        </span>
        <button
          className={`lds-nav-btn ${activeSection === 'sec-que-es' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-que-es')}
        >
          <FileCheck size={14} /> ¿Qué es una firma?
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'sec-claves' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-claves')}
        >
          <Key size={14} /> Claves e Identidad
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'sec-flujo' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-flujo')}
        >
          <Layers size={14} /> Flujo de Firma
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'sec-comparativa' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-comparativa')}
        >
          <Lock size={14} /> Firma vs Hash vs Cifrado
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'sec-algoritmos' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-algoritmos')}
        >
          <Zap size={14} /> Algoritmos (RSA-PSS, ECDSA)
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'lab' ? 'active' : ''}`}
          onClick={() => scrollToSection('lab')}
        >
          <ShieldCheck size={14} /> Laboratorio Interactivo
        </button>
        <button
          className={`lds-nav-btn ${activeSection === 'reto' ? 'active' : ''}`}
          onClick={() => scrollToSection('reto')}
        >
          <Sparkles size={14} /> Reto Educativo
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 1 — ¿Qué es una firma digital?
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-que-es">
        <div className="lm-section-head">
          <span className="lm-section-num">1</span>
          <h2>¿Qué es una firma digital criptográfica?</h2>
        </div>

        <div className="alert alert-info">
          <FileCheck size={20} />
          <span>
            Una firma digital es un mecanismo criptográfico que vincula de forma matemáticamente indisociable
            un documento o mensaje con la <strong>clave privada</strong> de un emisor concreto. Permite a cualquier receptor
            verificar su origen y corroborar que no ha sido alterado.
          </span>
        </div>

        {/* Las 3 propiedades fundamentales */}
        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon green">
              <UserCheck size={18} />
            </div>
            <h4>Autenticidad</h4>
            <p>
              Garantiza la autoría del emisor: únicamente la persona u organización que posee la <strong>clave privada</strong>{' '}
              pudo haber generado esa firma específica.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon cyan">
              <ShieldCheck size={18} />
            </div>
            <h4>Integridad Inviolable</h4>
            <p>
              Cualquier modificación en el mensaje original (incluso un solo espacio o coma) invalida de inmediato la firma,
              porque el hash verificado diferirá matemáticamente del hash firmado.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon purple">
              <Fingerprint size={18} />
            </div>
            <h4>No Repudio (Técnico y Legal)</h4>
            <p>
              El firmante no puede negar razonablemente haber generado el mensaje, siempre que su clave privada se haya
              mantenido bajo su custodia exclusiva y sin vulneraciones técnicas.
            </p>
          </div>
        </div>

        {/* Distinción fundamental: Firma manuscrita escaneada vs Firma criptográfica */}
        <div className="card" style={{ marginTop: '16px', padding: '16px 20px', borderLeft: '4px solid #00d4ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-accent)', fontWeight: 700 }}>
            <Info size={18} />
            <span>Firma Criptográfica vs Imagen de Firma Manuscrita</span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            Una imagen o trazado de una firma manuscrita pegada en un PDF no ofrece seguridad criptográfica real: cualquiera
            puede copiarla y pegarla en otro documento. En cambio, una <strong>firma digital criptográfica</strong> es única para
            cada mensaje específico; no puede recortarse ni transferirse a otro texto sin destruir su validez matemática.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 2 — Claves pública y privada e Identidad
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-claves">
        <div className="lm-section-head">
          <span className="lm-section-num">2</span>
          <h2>Claves Asimétricas y la Vinculación de Identidad</h2>
        </div>

        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          En el cifrado asimétrico tradicional (Módulo 3), la clave pública se usa para cifrar y la privada para descifrar.
          En las <strong>firmas digitales</strong>, los roles se invierten de forma complementaria:
        </p>

        <div className="lm-two-col" style={{ marginTop: '16px' }}>
          <div className="card lm-key-card" style={{ borderLeft: '4px solid #f43f5e' }}>
            <div className="lm-key-header">
              <span className="lm-key-icon-badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}>🔐</span>
              <div>
                <h3>Clave Privada de Firma</h3>
                <span className="badge badge-danger">Custodia Estricta</span>
              </div>
            </div>
            <p style={{ marginTop: '10px', color: 'var(--txt-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Se utiliza exclusivamente para <strong>generar la firma digital</strong>. Nunca se comparte ni se exporta
              por canales inseguros. Quien posee la clave privada tiene la facultad de firmar a nombre de su dueño.
            </p>
          </div>

          <div className="card lm-key-card" style={{ borderLeft: '4px solid #10d46e' }}>
            <div className="lm-key-header">
              <span className="lm-key-icon-badge" style={{ background: 'rgba(16, 212, 110, 0.2)', color: '#10d46e' }}>🔑</span>
              <div>
                <h3>Clave Pública de Verificación</h3>
                <span className="badge badge-accent">De Libre Difusión</span>
              </div>
            </div>
            <p style={{ marginTop: '10px', color: 'var(--txt-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Se distribuye a clientes, destinatarios o servidores para <strong>verificar la validez de la firma</strong>.
              Cualquiera puede verificar, pero nadie puede deducir la clave privada a partir de ella.
            </p>
          </div>
        </div>

        {/* El problema del enlace de identidad (PKI y Certificados) */}
        <div className="card" style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--clr-surface-2)' }}>
          <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--txt-primary)' }}>
            ⚠️ El eslabón crítico: ¿De quién es realmente esa clave pública?
          </h4>
          <p style={{ marginTop: '8px', fontSize: '0.86rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            Una clave pública por sí misma es únicamente un bloque de números. Si un atacante reemplaza la clave pública
            legítima por la suya propia, podría firmar mensajes falsificados y la verificación matemática sería exitosa.
            Por esta razón, en el mundo real la clave pública se emite dentro de un <strong>Certificado Digital X.509</strong>{' '}
            respaldado por una <strong>Autoridad de Certificación (CA)</strong> o una infraestructura de clave pública (PKI).
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 3 — Flujo de Firma y Verificación
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-flujo">
        <div className="lm-section-head">
          <span className="lm-section-num">3</span>
          <h2>Flujo Técnico de Firma y Verificación Paso a Paso</h2>
        </div>

        <div className="lds-flow-container">
          <div className="lds-flow-grid">
            {/* Lado Emisor (Alice) */}
            <div className="lds-actor-box">
              <div className="lds-actor-header">
                <span className="badge badge-accent">Emisor (Alice)</span>
                <h4>Generación de la Firma</h4>
              </div>

              <div className="lds-actor-steps">
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 1</span>
                  <span>Escribe o prepara el mensaje original en claro.</span>
                </div>
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 2</span>
                  <span>Calcula el hash criptográfico <strong>SHA-256(Mensaje)</strong> obteniendo 32 bytes de resumen.</span>
                </div>
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 3</span>
                  <span>
                    Aplica el algoritmo <strong>RSA-PSS</strong> utilizando su <strong>Clave Privada</strong> sobre el hash para producir la firma digital.
                  </span>
                </div>
              </div>
            </div>

            {/* Canal de Transmisión */}
            <div className="lds-flow-channel">
              <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Canal Público
              </span>
              <div className="lds-channel-item" style={{ color: 'var(--txt-primary)' }}>
                <FileText size={16} style={{ margin: '0 auto', color: 'var(--clr-accent)' }} />
                <span>Mensaje</span>
              </div>
              <div className="lds-channel-item" style={{ color: '#10d46e' }}>
                <FileCheck size={16} style={{ margin: '0 auto', color: '#10d46e' }} />
                <span>Firma Digital</span>
              </div>
              <div className="lds-channel-item" style={{ color: '#ec4899' }}>
                <Key size={16} style={{ margin: '0 auto', color: '#ec4899' }} />
                <span>Clave Pública</span>
              </div>
            </div>

            {/* Lado Receptor (Bob) */}
            <div className="lds-actor-box">
              <div className="lds-actor-header">
                <span className="badge badge-accent" style={{ background: 'rgba(16, 212, 110, 0.2)', color: '#10d46e', borderColor: '#10d46e' }}>
                  Receptor (Bob)
                </span>
                <h4>Verificación Matemática</h4>
              </div>

              <div className="lds-actor-steps">
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 4</span>
                  <span>Bob recibe el mensaje, la firma digital y la clave pública de Alice.</span>
                </div>
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 5</span>
                  <span>Bob calcula independientemente el hash SHA-256 del mensaje que acaba de recibir.</span>
                </div>
                <div className="lds-step-item">
                  <span className="lds-step-badge">Paso 6</span>
                  <span>
                    Ejecuta <code>verify(Clave Pública, Firma, Mensaje)</code>. Si el resultado es válido, tiene certeza matemática de origen e integridad.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 4 — Diferencias: Firma vs Hash vs Cifrado
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-comparativa">
        <div className="lm-section-head">
          <span className="lm-section-num">4</span>
          <h2>Comparativa Criptográfica Fundamental</h2>
        </div>

        <div className="lh-compare-table-wrapper">
          <table className="lh-compare-table">
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Firma Digital (RSA-PSS / ECDSA)</th>
                <th>Función Hash (SHA-256)</th>
                <th>Cifrado (AES / RSA-OAEP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Objetivo Primario</strong></td>
                <td><strong>Autenticidad</strong>, <strong>Integridad</strong> y <strong>No Repudio</strong>.</td>
                <td><strong>Integridad</strong> exclusiva (huella digital).</td>
                <td><strong>Confidencialidad</strong> (ocultar el mensaje).</td>
              </tr>
              <tr>
                <td><strong>¿Oculta el texto?</strong></td>
                <td><span className="badge badge-danger">No</span> (El mensaje viaja legible en claro).</td>
                <td><span className="badge badge-muted">No aplica</span> (Produce solo un resumen).</td>
                <td><span className="badge badge-accent">Sí</span> (Solo legible con la clave correcta).</td>
              </tr>
              <tr>
                <td><strong>Uso de Claves</strong></td>
                <td>Par asimétrico: firma con Privada, verifica con Pública.</td>
                <td>Sin claves (en su modalidad estándar).</td>
                <td>Clave secreta (AES) o Clave Pública (RSA).</td>
              </tr>
              <tr>
                <td><strong>¿Demuestra Autoría?</strong></td>
                <td><span className="badge badge-accent">Sí</span> (Solo el dueño de la clave privada pudo firmar).</td>
                <td><span className="badge badge-danger">No</span> (Cualquiera puede calcular el hash de un texto).</td>
                <td><span className="badge badge-muted">No directamente</span> (Requiere esquemas autenticados).</td>
              </tr>
              <tr>
                <td><strong>Reversibilidad</strong></td>
                <td>Irreversible: la firma no recupera el mensaje original.</td>
                <td>Irreversible: unidireccional por definición.</td>
                <td>Reversible: se descifra con la clave de descifrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 5 — Algoritmos Modernos y Contexto
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="sec-algoritmos">
        <div className="lm-section-head">
          <span className="lm-section-num">5</span>
          <h2>Algoritmos de Firma y Estándares de la Industria</h2>
        </div>

        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon cyan">
              <Zap size={18} />
            </div>
            <h4>RSA-PSS (Probabilistic Signature Scheme)</h4>
            <p>
              Estándar recomendado para RSA (PKCS#1 v2.2 / RFC 8017). Introduce una sal pseudoaleatoria (salt)
              que hace que dos firmas del mismo mensaje con la misma clave privada sean distintas cada vez,
              eliminando las vulnerabilidades del antiguo RSA determinista PKCS#1 v1.5.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon green">
              <Fingerprint size={18} />
            </div>
            <h4>ECDSA y Ed25519 (Curvas Elípticas)</h4>
            <p>
              Basados en el logaritmo discreto sobre curvas elípticas. Ofrecen claves y firmas mucho más pequeñas
              con el mismo nivel de seguridad (una clave ECDSA P-256 de 256 bits equivale a una clave RSA de 3072 bits),
              siendo el estándar en TLS 1.3, Bitcoin y dispositivos IoT.
            </p>
          </div>

          <div className="concept-card">
            <div className="concept-icon amber">
              <AlertTriangle size={18} />
            </div>
            <h4>Contexto y Gestión del Ciclo de Vida</h4>
            <p>
              Ningún algoritmo es seguro para siempre sin una adecuada gestión de claves: rotación periódica,
              almacenamiento en módulos de seguridad por hardware (HSM o TPM), listas de revocación (CRL/OCSP)
              y la preparación hacia algoritmos poscuánticos (ML-DSA / Dilithium).
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 6 — LABORATORIO FUNCIONAL DE FIRMA Y VERIFICACIÓN
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="lab">
        <div className="lm-section-head">
          <span className="lm-section-num">6</span>
          <h2>Laboratorio Real de Firma y Verificación RSA-PSS</h2>
        </div>
        <p style={{ color: 'var(--txt-secondary)', lineHeight: 1.5, margin: 0 }}>
          Este laboratorio interactivo utiliza la <strong>Web Crypto API nativa</strong> de tu navegador para generar un
          par de claves RSA-PSS de 2048 bits con SHA-256, firmar un mensaje y comprobar matemáticamente la verificación
          y detección de adulteraciones.
        </p>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="lds-lab-card">
          {/* Panel de Claves Criptográficas en Memoria */}
          <div className="lds-keys-panel">
            <div className="lds-key-info">
              <Key size={20} style={{ color: '#10d46e' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--txt-primary)' }}>
                  Par de Claves RSA-PSS (2048 bits · SHA-256)
                </div>
                <div className="lds-key-thumb">
                  Huella de Clave Pública: {exportedPubKey ? exportedPubKey.thumbprint : 'Generando...'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPem(!showPem)}
                disabled={!exportedPubKey}
              >
                {showPem ? <EyeOff size={14} /> : <Eye size={14} />} {showPem ? 'Ocultar PEM' : 'Ver Clave Pública SPKI'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleGenerateKeys}
                disabled={generatingKeys}
              >
                <RotateCcw size={14} /> {generatingKeys ? 'Generando...' : 'Regenerar par de claves'}
              </button>
            </div>
          </div>

          {/* Acordeón de Clave Pública en formato PEM */}
          {showPem && exportedPubKey && (
            <div className="lds-pem-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--txt-muted)' }}>Clave Pública Exportada (Formato X.509 SPKI Base64)</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => copyToClipboard(exportedPubKey.pem, true)}
                >
                  {copiedPem ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar PEM</>}
                </button>
              </div>
              {exportedPubKey.pem}
            </div>
          )}

          {/* Grid de dos paneles: Emisor (Firma) y Receptor (Verificación) */}
          <div className="lds-workspace-grid">
            {/* Panel 1: Emisor (Alice) */}
            <div className="lds-pane">
              <div className="lds-pane-head">
                <div className="lds-pane-title">
                  <UserCheck size={18} style={{ color: 'var(--clr-accent)' }} />
                  <span>1. Emisor: Redactar y Firmar</span>
                </div>
                <span className="badge badge-accent">Clave Privada</span>
              </div>

              <label style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Mensaje a firmar:</label>
              <textarea
                className="lds-textarea"
                value={originalMessage}
                onChange={(e) => setOriginalMessage(e.target.value)}
                placeholder="Escribe el mensaje legítimo..."
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSignMessage}
                  disabled={signingLoading || !keyPair?.privateKey || !originalMessage.trim()}
                >
                  <FileCheck size={16} /> {signingLoading ? 'Firmando...' : 'Firmar con Clave Privada'}
                </button>

                {signatureData && (
                  <span style={{ fontSize: '0.78rem', color: '#10d46e', fontWeight: 600 }}>
                    ✓ Firma generada (256 bytes)
                  </span>
                )}
              </div>

              {signatureData && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
                    <span>Firma Digital RSA-PSS (Hexadecimal):</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => copyToClipboard(signatureData.signatureHex, false)}
                    >
                      {copiedSig ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                    </button>
                  </div>
                  <div className="lds-sig-box">
                    {signatureData.signatureHex}
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2: Receptor (Bob) */}
            <div className="lds-pane">
              <div className="lds-pane-head">
                <div className="lds-pane-title">
                  <ShieldCheck size={18} style={{ color: '#10d46e' }} />
                  <span>2. Receptor: Mensaje y Verificación</span>
                </div>
                <span className="badge badge-accent" style={{ background: 'rgba(16, 212, 110, 0.2)', color: '#10d46e', borderColor: '#10d46e' }}>
                  Clave Pública
                </span>
              </div>

              <label style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>Mensaje recibido por el destinatario:</label>
              <textarea
                className="lds-textarea"
                value={receivedMessage}
                onChange={(e) => {
                  setReceivedMessage(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="Firma un mensaje primero para recibirlo aquí..."
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleVerifySignature}
                  disabled={verifyingLoading || !receivedSigBytes || !keyPair?.publicKey}
                >
                  <ShieldCheck size={16} /> {verifyingLoading ? 'Verificando...' : 'Verificar Firma con Clave Pública'}
                </button>

                {isSigTampered && (
                  <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                    Firma Corrompida
                  </span>
                )}
              </div>

              {receivedSigBytes && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                    Firma en verificación ({isSigTampered ? 'Alterada' : 'Original'}):
                  </div>
                  <div className={`lds-sig-box ${isSigTampered ? 'tampered' : ''}`}>
                    {Array.from(receivedSigBytes).map(b => b.toString(16).padStart(2, '0')).join('')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Pruebas de Manipulación Intencional */}
          {signatureData && (
            <div className="lds-tamper-bar">
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-primary)' }}>
                Experimentos de integridad:
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleTamperMessage}
              >
                <AlertTriangle size={14} style={{ color: '#f59e0b' }} /> Alterar 1 carácter del mensaje
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleTamperSignature}
              >
                <AlertTriangle size={14} style={{ color: '#f43f5e' }} /> Corromper 1 byte de la firma
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={handleRestoreOriginal}
              >
                <RotateCcw size={14} /> Restaurar mensaje y firma legítimos
              </button>
            </div>
          )}

          {/* Banner de Resultado de Verificación */}
          {verificationResult && (
            <div className={`lds-verify-banner ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
              <div className="lds-verify-status-wrap">
                {verificationResult.isValid ? (
                  <ShieldCheck size={36} style={{ color: '#10d46e' }} />
                ) : (
                  <ShieldAlert size={36} style={{ color: '#f43f5e' }} />
                )}
                <div className="lds-verify-text">
                  <h3 style={{ color: verificationResult.isValid ? '#10d46e' : '#f43f5e' }}>
                    {verificationResult.isValid ? '✓ Firma Digital Válida y Auténtica' : '✕ Verificación Fallida: Firma Inválida'}
                  </h3>
                  <p>{verificationResult.reason}</p>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', textAlign: 'right' }}>
                Algoritmo: <span className="mono">RSA-PSS (SHA-256)</span><br />
                Sal: <span className="mono">32 bytes</span>
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', fontStyle: 'italic', borderTop: '1px solid var(--clr-border)', paddingTop: '10px' }}>
            * Demostración efímera y educativa: las claves criptográficas se generan localmente en la memoria volátil de tu navegador.
            Al recargar la página, el par de claves se descarta de forma segura. No equivale a un sistema de firma electrónica cualificada con certificados X.509 de producción.
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 7 — DESAFÍO EDUCATIVO INTERACTIVO
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section" id="reto">
        <div className="lm-section-head">
          <span className="lm-section-num">7</span>
          <h2>Desafío: Detección Real de Alteración</h2>
        </div>

        <div className="lds-challenge-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} style={{ color: '#10d46e' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--txt-primary)' }}>
                  Misión Práctica: Provoca el fallo criptográfico y deduce su causa
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                  Ejecuta una firma real, modifica un carácter del mensaje y comprueba el rechazo matemático.
                </span>
              </div>
            </div>

            <span className={`badge ${verificationResult?.isValid === false ? 'badge-accent' : 'badge-warning'}`}>
              {verificationResult?.isValid === false ? '✓ Alteración detectada' : 'Paso requerido: provoca un fallo'}
            </span>
          </div>

          <div style={{ background: 'var(--clr-surface-2)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', lineHeight: 1.5 }}>
            <strong>Instrucciones:</strong>
            <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
              <li>En el laboratorio superior, haz clic en <strong>«Firmar con Clave Privada»</strong>.</li>
              <li>Pulsa el botón <strong>«Alterar 1 carácter del mensaje»</strong> en los controles de experimentación.</li>
              <li>Pulsa <strong>«Verificar Firma con Clave Pública»</strong> para observar cómo Web Crypto rechaza la firma.</li>
              <li>Selecciona abajo la explicación teórica exacta de por qué el algoritmo detectó la alteración.</li>
            </ol>
          </div>

          {/* Opciones del reto */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--txt-primary)' }}>
              ¿Por qué la verificación de la firma digital falló inmediatamente tras alterar el texto?
            </h4>

            <div className="lh-quiz-options">
              <button
                type="button"
                className={`lh-quiz-btn ${challengeAnswer === 'A' ? 'selected-correct' : ''}`}
                onClick={() => {
                  setChallengeAnswer('A');
                  setMilestones((prev) => ({ ...prev, completedChallenge: true }));
                }}
              >
                <span>
                  <strong>A)</strong> Porque el receptor calculó el hash del mensaje adulterado y, por el efecto avalancha, no coincidió con el hash que el emisor firmó con su clave privada.
                </span>
                {challengeAnswer === 'A' && <CheckCircle2 size={16} />}
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${challengeAnswer === 'B' ? 'selected-wrong' : ''}`}
                onClick={() => setChallengeAnswer('B')}
              >
                <span>
                  <strong>B)</strong> Porque la clave pública caducó de inmediato en cuanto se pulsó una tecla en el texto.
                </span>
              </button>

              <button
                type="button"
                className={`lh-quiz-btn ${challengeAnswer === 'C' ? 'selected-wrong' : ''}`}
                onClick={() => setChallengeAnswer('C')}
              >
                <span>
                  <strong>C)</strong> Porque la clave privada de Alice se conectó a internet para avisar al servidor de que el texto había cambiado.
                </span>
              </button>
            </div>

            {challengeAnswer === 'A' && (
              <div className="lh-challenge-feedback lh-feedback-success" style={{ marginTop: '12px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>¡Explicación exacta y rigurosa!</strong> El algoritmo de verificación no necesita comparar visualmente
                  los textos: calcula internamente <code>SHA-256(Mensaje adulterado)</code> y, al verificarlo contra la firma
                  matemática con la clave pública de Alice, la ecuación asimétrica de RSA-PSS no se cumple. Esto demuestra la
                  simbiosis perfecta entre <strong>hashes (integridad)</strong> y <strong>criptografía asimétrica (autoría)</strong>.
                </div>
              </div>
            )}

            {challengeAnswer === 'B' && (
              <div className="lh-challenge-feedback lh-feedback-warning" style={{ marginTop: '12px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Incorrecto:</strong> Las claves criptográficas son estructuras matemáticas puras; no tienen reloj
                  ni caducan automáticamente por el hecho de pulsar teclas.
                </div>
              </div>
            )}

            {challengeAnswer === 'C' && (
              <div className="lh-challenge-feedback lh-feedback-warning" style={{ marginTop: '12px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Incorrecto:</strong> La verificación criptográfica es completamente autónoma y local; no requiere
                  conexión de red ni avisos entre emisor y receptor. La prueba reside en la matemática misma del resumen y la firma.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 8 — Conclusión y Siguiente Módulo
         ═══════════════════════════════════════════════════════════════ */}
      <div className="card lm-conclusion">
        <div className="lm-conclusion-content">
          <Sparkles size={20} style={{ color: '#10d46e' }} />
          <div>
            <p>
              <strong>¡Felicitaciones!</strong> Has completado los 5 módulos esenciales de criptografía: Fundamentos, Simétrica, Asimétrica, Funciones Hash y Firmas Digitales.
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
              El módulo 6 "Criptoanálisis" ya se encuentra disponible para explorar.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/aprendizaje')}
          >
            <ArrowLeft size={16} /> Catálogo
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/aprendizaje/criptoanalisis')}
          >
            Continuar con Criptoanálisis <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
