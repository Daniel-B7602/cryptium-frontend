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
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  UserCheck,
} from 'lucide-react';
import LessonContainer from '../components/learning/LessonContainer';
import LessonVictory from '../components/learning/LessonVictory';
import {
  getGamifiedProgress,
  recordExerciseCompletion,
} from '../utils/learningProgress';
import {
  generateSigningKeyPair,
  signMessageText,
  verifySignatureText,
  corruptSignatureByte,
  exportPublicKeySPKI,
} from '../utils/signatureUtils';
import '../components/learning/ExerciseWidgets.css';

export default function LearningDigitalSignatures() {
  const navigate = useNavigate();

  const [progressState, setProgressState] = useState(getGamifiedProgress);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);

  const completedSteps = progressState.completedExercises.firmas || [];

  // Keys shared across exercises in this session
  const [keyPair, setKeyPair] = useState(null);
  const [exportedKey, setExportedKey] = useState(null);

  // Initialize RSA-PSS keys on mount
  useEffect(() => {
    async function initKeys() {
      try {
        const kp = await generateSigningKeyPair();
        const exp = await exportPublicKeySPKI(kp.publicKey);
        setKeyPair(kp);
        setExportedKey(exp);
      } catch (err) {
        console.error('Error generando claves RSA-PSS:', err);
      }
    }
    initKeys();
  }, []);

  // =========================================================================
  // EJERCICIO 1 — Firma el mensaje (RSA-PSS SHA-256 real)
  // =========================================================================
  const [documentMessage1, setDocumentMessage1] = useState('Autorizo la transferencia de 1,500 USD a Bob.');
  const [signatureData1, setSignatureData1] = useState(null);

  const handleSignDocument1 = async () => {
    if (!keyPair) return;
    setIsLoadingCrypto(true);
    try {
      const sig = await signMessageText(keyPair.privateKey, documentMessage1);
      setSignatureData1(sig);
      setFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise1 = () => {
    if (signatureData1) {
      const res = recordExerciseCompletion('firmas', 1, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Documento firmado criptográficamente!',
        message: `Has generado una firma digital RSA-PSS de 2048 bits usando tu Clave Privada. Se calculó el hash SHA-256 del mensaje (${signatureData1.messageHashHex.slice(0, 16)}...) y se aplicó la operación matemática con tu clave privada secreta, ligando tu identidad al contenido exacto.`,
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Documento aún no firmado',
        message: 'Haz clic en "Firmar Documento con Clave Privada" para ejecutar la operación nativa.',
        hint: 'La firma se genera mediante la API Web Crypto RSA-PSS.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 2 — Verifica al remitente (Verificación con Clave Pública)
  // =========================================================================
  const [verificationResult2, setVerificationResult2] = useState(null); // true | false

  const handleVerify2 = async () => {
    if (!keyPair || !signatureData1) return;
    setIsLoadingCrypto(true);
    try {
      const isValid = await verifySignatureText(
        keyPair.publicKey,
        signatureData1.signatureBytes,
        documentMessage1
      );
      setVerificationResult2(isValid);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise2 = () => {
    if (verificationResult2 === true) {
      const res = recordExerciseCompletion('firmas', 2, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Firma digital verificada y válida!',
        message: 'Cualquier persona en el mundo puede usar tu Clave Pública para verificar la firma, comprobando dos cosas simultáneamente: 1) Que el mensaje proviene indiscutiblemente del dueño de la clave privada (Autenticidad y No Repudio), y 2) Que el texto no sufrió ningún cambio (Integridad).',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Verificación pendiente',
        message: 'Ejecuta la comprobación haciendo clic en "Verificar con Clave Pública".',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 3 — Descubre la alteración (Tamper detection)
  // Mensaje alterado a "$15,000"
  // =========================================================================
  const [tamperedMessage3, setTamperedMessage3] = useState('Autorizo la transferencia de 15,000 USD a Bob.');
  const [tamperVerification3, setTamperVerification3] = useState(null);

  const handleVerifyTampered3 = async () => {
    if (!keyPair || !signatureData1) return;
    setIsLoadingCrypto(true);
    try {
      const isValid = await verifySignatureText(
        keyPair.publicKey,
        signatureData1.signatureBytes,
        tamperedMessage3
      );
      setTamperVerification3(isValid);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCrypto(false);
    }
  };

  const checkExercise3 = () => {
    if (tamperVerification3 === false) {
      const res = recordExerciseCompletion('firmas', 3, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Fraude y alteración detectados infaliblemente!',
        message: 'Al cambiar "1,500" por "15,000", el hash del mensaje recibido ya no concuerda con el hash certificado en la firma digital. Web Crypto rechazó matemáticamente la firma (isValid = false). Es imposible modificar el texto sin invalidar la firma.',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Verificación no ejecutada',
        message: 'Haz clic en "Verificar Documento Alterado" para observar la respuesta del algoritmo.',
        hint: 'El algoritmo compara el hash del texto alterado con la firma matemática.',
      });
    }
  };

  // =========================================================================
  // EJERCICIO 4 — Distingue firma y cifrado
  // =========================================================================
  const [selectedDistinction4, setSelectedDistinction4] = useState(null);
  const scenarios4 = [
    {
      id: 'a',
      title: 'Firmar digitalmente con la clave privada: no oculta el contenido pero garantiza autoría e integridad',
      desc: 'El contrato permanece legible y público para todos los ciudadanos, pero la firma digital demuestra que fue emitido oficialmente y que no ha sido modificado.',
    },
    {
      id: 'b',
      title: 'Cifrar con la clave pública de los ciudadanos para ocultar el decreto',
      desc: 'El texto debe mantenerse secreto para que solo los ciudadanos autorizados puedan leerlo.',
    },
    {
      id: 'c',
      title: 'Firmar y cifrar son la misma operación matemática con nombres comerciales distintos',
      desc: 'No existe ninguna diferencia técnica entre encriptar un archivo y firmarlo digitalmente.',
    },
  ];

  const checkExercise4 = () => {
    if (selectedDistinction4 === 'a') {
      const res = recordExerciseCompletion('firmas', 4, 25);
      if (res.updated) setProgressState(res.updated);
      setFeedback({
        status: 'success',
        title: '¡Diferenciación criptográfica magistral!',
        message: 'Perfecto. Cifrar protege la CONFIDENCIALIDAD (oculta el mensaje para que solo el destinatario lo lea). Firmar digitalmente garantiza AUTENTICIDAD, INTEGRIDAD Y NO REPUDIO (el contenido puede ser público para todo el mundo, pero nadie puede falsificar quién lo emitió ni modificar una coma).',
      });
    } else {
      setFeedback({
        status: 'error',
        title: 'Distinción incorrecta',
        message: 'Recuerda que una ley o contrato oficial debe ser público (no cifrado), pero su autoría debe estar certificada.',
        hint: '¿Qué mecanismo permite que todos lean el documento mientras se demuestra quién lo firmó?',
      });
    }
  };

  // =========================================================================
  // Handlers para avanzar o reiniciar
  // =========================================================================
  const handleCheck = () => {
    if (currentStep === 1) checkExercise1();
    else if (currentStep === 2) checkExercise2();
    else if (currentStep === 3) checkExercise3();
    else if (currentStep === 4) checkExercise4();
  };

  const handleContinue = () => {
    setFeedback(null);
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsVictory(true);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSignatureData1(null);
    setVerificationResult2(null);
    setTamperVerification3(null);
    setSelectedDistinction4(null);
    setFeedback(null);
    setIsVictory(false);
  };

  const canCheck = useMemo(() => {
    if (currentStep === 1) return signatureData1 !== null;
    if (currentStep === 2) return verificationResult2 !== null;
    if (currentStep === 3) return tamperVerification3 !== null;
    if (currentStep === 4) return selectedDistinction4 !== null;
    return false;
  }, [currentStep, signatureData1, verificationResult2, tamperVerification3, selectedDistinction4]);

  if (isVictory) {
    return (
      <LessonVictory
        moduleTitle="5. Firmas Digitales"
        moduleNumber={5}
        nextModulePath="/aprendizaje/criptoanalisis"
        nextModuleName="Criptoanálisis y Ataques"
        earnedXp={100}
        summaryPoints={[
          'La firma digital se crea aplicando la Clave Privada sobre el hash del documento.',
          'Cualquier usuario puede comprobar la autenticidad e integridad utilizando la Clave Pública correspondiente.',
          'Cualquier alteración por mínima que sea (incluso un solo dígito) invalida inmediatamente la verificación matemática.',
          'Cifrar garantiza confidencialidad; firmar garantiza autenticidad, integridad y no repudio.',
        ]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <LessonContainer
      moduleId="firmas"
      moduleTitle="Firmas Digitales"
      currentStep={currentStep}
      totalSteps={4}
      userXp={progressState.xp}
      canCheck={canCheck}
      feedback={feedback}
      onCheck={handleCheck}
      onContinue={handleContinue}
      onRetry={handleRetry}
      completedSteps={completedSteps}
      isLoading={isLoadingCrypto}
      instruction={
        currentStep === 1
          ? 'Firma digitalmente la autorización con tu clave privada'
          : currentStep === 2
          ? 'Verifica la validez de la firma con la clave pública'
          : currentStep === 3
          ? 'Descubre la alteración: detecta fraude en un documento modificado'
          : 'Distingue firma digital de cifrado confidencial'
      }
      description={
        currentStep === 1
          ? 'Genera una firma RSA-PSS real sobre el mensaje para vincular matemáticamente tu autoría.'
          : currentStep === 2
          ? 'Actúa como el destinatario: comprueba que la firma recibida coincide exactamente con la clave pública.'
          : currentStep === 3
          ? 'Un adversario intentó cambiar el monto transferido de $1,500 a $15,000. Ejecuta la verificación para detectarlo.'
          : 'Analiza un escenario práctico donde se requiere certificar un documento oficial sin ocultar su contenido.'
      }
    >
      {/* ── RETO 1: Firma el mensaje ── */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Documento a firmar:
            </span>
            <input
              type="text"
              className="duo-input-field"
              value={documentMessage1}
              onChange={(e) => {
                setDocumentMessage1(e.target.value);
                setSignatureData1(null);
                setFeedback(null);
              }}
              style={{ marginTop: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-primary"
              onClick={handleSignDocument1}
              disabled={isLoadingCrypto || !keyPair}
            >
              <FileCheck size={18} />
              <span>Firmar Documento con Clave Privada</span>
            </button>
          </div>

          {signatureData1 && (
            <div className="duo-crypto-terminal">
              <div className="duo-terminal-header">
                <span>FIRMA DIGITAL RSA-PSS (2048 BITS)</span>
                <span style={{ color: 'var(--clr-success)' }}>GENERADA</span>
              </div>
              <div className="duo-terminal-body">
                <div style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', marginBottom: '4px' }}>
                  Hash SHA-256 del documento firmado:
                </div>
                <div style={{ color: 'var(--clr-accent)', marginBottom: '10px' }}>
                  {signatureData1.messageHashHex}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', marginBottom: '4px' }}>
                  Firma criptográfica Base64 (256 bytes):
                </div>
                <div style={{ color: '#ffffff', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                  {signatureData1.signatureBase64.slice(0, 80)}...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 2: Verifica al remitente ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', fontWeight: 700 }}>RECEPTOR DEL MENSAJE</span>
              <span style={{ fontSize: '0.75rem', background: 'var(--clr-surface-3)', padding: '2px 8px', borderRadius: '4px', color: 'var(--clr-accent)' }}>
                CLAVE PÚBLICA DISPONIBLE
              </span>
            </div>
            <p style={{ color: 'var(--txt-primary)', fontSize: '0.95rem' }}>
              Mensaje recibido: <em>"{documentMessage1}"</em>
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-primary"
              onClick={handleVerify2}
              disabled={isLoadingCrypto}
            >
              <UserCheck size={18} />
              <span>Verificar con Clave Pública</span>
            </button>
          </div>

          {verificationResult2 !== null && (
            <div style={{
              background: verificationResult2 ? 'rgba(16, 212, 110, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${verificationResult2 ? 'var(--clr-success)' : 'var(--clr-error)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: verificationResult2 ? 'var(--clr-success)' : 'var(--clr-error)', fontWeight: 700, fontSize: '1.1rem' }}>
                {verificationResult2 ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                <span>{verificationResult2 ? 'Firma Digital Válida y Auténtica' : 'Firma Digital No Válida'}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', marginTop: '6px' }}>
                La comprobación matemática contra la clave pública certifica que el firmante autorizó el documento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 3: Descubre la alteración ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--clr-error)', fontWeight: 700, textTransform: 'uppercase' }}>
              ⚠️ Mensaje interceptado y adulterado por un atacante:
            </span>
            <input
              type="text"
              className="duo-input-field"
              value={tamperedMessage3}
              onChange={(e) => {
                setTamperedMessage3(e.target.value);
                setTamperVerification3(null);
                setFeedback(null);
              }}
              style={{ marginTop: '8px', borderColor: 'var(--clr-error)' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--txt-secondary)', marginTop: '4px', display: 'block' }}>
              El atacante intentó reutilizar la firma original del mensaje de $1,500 para autorizar $15,000.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="duo-btn-secondary"
              onClick={handleVerifyTampered3}
              disabled={isLoadingCrypto}
            >
              <ShieldAlert size={18} />
              <span>Verificar Documento Alterado</span>
            </button>
          </div>

          {tamperVerification3 !== null && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid var(--clr-error)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--clr-error)', fontWeight: 700, fontSize: '1.1rem' }}>
                <ShieldAlert size={24} />
                <span>¡VERIFICACIÓN RECHAZADA (Firma Inválida)!</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', marginTop: '6px' }}>
                El algoritmo detectó que el contenido no coincide con la firma original. La operación ha sido bloqueada.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── RETO 4: Distingue firma y cifrado ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt-primary)', background: 'var(--clr-surface-3)', padding: '14px 18px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--clr-accent)' }}>
            <strong>Caso de Uso:</strong> El gobierno necesita publicar en su portal web un decreto ley oficial. El texto debe ser de libre lectura pública para cualquier ciudadano, pero debe garantizarse de forma irrefutable que fue emitido por la presidencia y que ningún hacker alteró sus artículos. ¿Cuál es la solución criptográfica correcta?
          </p>

          <div className="duo-options-grid">
            {scenarios4.map((scen) => (
              <div
                key={scen.id}
                className={`duo-option-card ${selectedDistinction4 === scen.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDistinction4(scen.id);
                  setFeedback(null);
                }}
              >
                <div className="duo-option-radio">
                  {selectedDistinction4 === scen.id && <div className="duo-option-radio-inner" />}
                </div>
                <div className="duo-option-body">
                  <h4 className="duo-option-title">{scen.title}</h4>
                  <p className="duo-option-desc">{scen.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </LessonContainer>
  );
}
