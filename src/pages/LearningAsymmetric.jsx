import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Lock,
  Unlock,
  Shield,
  User,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Copy,
  Info,
  Hash,
} from 'lucide-react';
import './Learning.css';

export default function LearningAsymmetric() {
  const navigate = useNavigate();

  // Step-by-step interactive simulation state (0: Init, 1: Keys Generated, 2: Key Shared, 3: Message Encrypted, 4: Sent, 5: Decrypted)
  const [simStep, setSimStep] = useState(0);
  const [aliceMessage, setAliceMessage] = useState('HOLA BOB');

  // Simulated keys
  const bobPublicKey = 'RSA_PUB_2048:MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...';
  const bobPrivateKey = 'RSA_PRIV_2048:MIIEowIBAAKCAQEAw7Zg5RzQ6... [PROTEGIDA]';
  const simulatedCipher = 'c283fb90d40e4f2187b8971f1a56e...[RSA-OAEP-ENCRYPTED]';

  // Challenge state: "¿Puede deducirse la clave privada a partir de la pública?"
  const [challengeAnswer, setChallengeAnswer] = useState(null); // 'yes' | 'no'

  // Independent Progress tracking
  const [milestones, setMilestones] = useState({
    generatedKeys: false,
    completedSimulation: false,
    viewedProcess: false,
    solvedChallenge: false,
  });

  const progressPercent =
    (milestones.generatedKeys ? 25 : 0) +
    (milestones.completedSimulation ? 25 : 0) +
    (milestones.viewedProcess ? 25 : 0) +
    (milestones.solvedChallenge ? 25 : 0);

  // Simulation steps progression
  const handleNextStep = () => {
    if (simStep === 0) {
      setSimStep(1);
      setMilestones((prev) => ({ ...prev, generatedKeys: true }));
    } else if (simStep < 5) {
      const next = simStep + 1;
      setSimStep(next);
      if (next === 5) {
        setMilestones((prev) => ({ ...prev, completedSimulation: true }));
      }
    }
  };

  const handleResetSim = () => {
    setSimStep(0);
  };

  return (
    <div className="learning-page animate-fade-in">
      {/* ── Breadcrumb / Back button ── */}
      <button className="btn btn-ghost lm-back-link" onClick={() => navigate('/aprendizaje')}>
        <ArrowLeft size={16} /> Volver al catálogo
      </button>

      {/* ── Header ── */}
      <div className="page-header">
        <h1>Criptografía Asimétrica</h1>
        <p>Comprende el poder del par de claves pública y privada y cómo resuelve el intercambio seguro.</p>
      </div>

      {/* ── Progress Card ── */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title-wrap">
            <Sparkles size={18} />
            <h3>Progreso del Módulo</h3>
          </div>
          <div className="progress-percentage">{progressPercent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="progress-milestones">
          <span className={`milestone-chip ${milestones.generatedKeys ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 1. Generar par de claves
          </span>
          <span className={`milestone-chip ${milestones.completedSimulation ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 2. Simulación Alice & Bob
          </span>
          <span className={`milestone-chip ${milestones.viewedProcess ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 3. Ver proceso
          </span>
          <span className={`milestone-chip ${milestones.solvedChallenge ? 'completed' : ''}`}>
            <CheckCircle2 size={13} /> 4. Desafío de seguridad
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 1 — ¿Qué es la criptografía asimétrica?
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">1</span>
          <h2>¿Qué es la criptografía asimétrica?</h2>
        </div>

        <div className="alert alert-info">
          <Key size={20} />
          <span>
            La criptografía asimétrica utiliza un par de claves relacionadas: una clave pública y una clave privada.
          </span>
        </div>

        {/* Dos Claves: Tarjetas visuales */}
        <div className="lm-two-col">
          <div className="card lm-key-card pub-key-card">
            <div className="lm-key-header">
              <span className="lm-key-icon-badge cyan">🔑</span>
              <div>
                <h3>Clave pública</h3>
                <span className="badge badge-accent">Puede compartirse</span>
              </div>
            </div>
            <p style={{ marginTop: '10px', color: 'var(--txt-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Se distribuye libremente a cualquier persona. Se utiliza para <strong>cifrar mensajes</strong> destinados al propietario del par.
            </p>
          </div>

          <div className="card lm-key-card priv-key-card">
            <div className="lm-key-header">
              <span className="lm-key-icon-badge purple">🔐</span>
              <div>
                <h3>Clave privada</h3>
                <span className="badge badge-purple">Debe mantenerse secreta</span>
              </div>
            </div>
            <p style={{ marginTop: '10px', color: 'var(--txt-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Solo el propietario la custodia bajo estricta seguridad. Se utiliza para <strong>descifrar</strong> los mensajes recibidos.
            </p>
          </div>
        </div>

        {/* Visual Diagram: Clave pública -> Cifrar -> Texto Cifrado -> Clave Privada -> Descifrar */}
        <div className="lm-diagram-box" style={{ marginTop: '20px' }}>
          <div className="lm-flow-horizontal">
            <div className="lm-flow-item">
              <span className="lm-flow-sub">Emisor</span>
              <div className="lm-flow-card">Mensaje</div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">🔑 Clave pública</span>
              <div className="lm-flow-card active-op">🔐 CIFRAR</div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">En tránsito</span>
              <div className="lm-flow-card cipher-card">Texto cifrado</div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">🔐 Clave privada</span>
              <div className="lm-flow-card active-op">🔓 DESCIFRAR</div>
            </div>
            <div className="lm-flow-connector">
              <ArrowRight size={18} />
            </div>
            <div className="lm-flow-item">
              <span className="lm-flow-sub">Receptor</span>
              <div className="lm-flow-card">Mensaje</div>
            </div>
          </div>
        </div>

        <div className="alert alert-warning" style={{ marginTop: '16px' }}>
          <Info size={18} />
          <span>
            <strong>Aclaración importante:</strong> Utilizar la <em>clave pública para cifrar</em> y la <em>clave privada para descifrar</em> es la forma básica de introducir la confidencialidad asimétrica. En módulos posteriores aprenderás que las <strong>firmas digitales</strong> utilizan este mismo par de manera inversa (la clave privada firma y la pública verifica).
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 2 — ¿Por qué necesitamos dos claves?
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">2</span>
          <h2>¿Por qué necesitamos dos claves?</h2>
        </div>

        <p className="lm-section-intro">
          El gran problema histórico de la criptografía era el <strong>intercambio de claves</strong>. Observa el contraste entre ambos modelos:
        </p>

        <div className="lm-two-col">
          <div className="card lm-comparison-card">
            <div className="lm-comp-badge text-warning">
              <AlertTriangle size={16} /> El problema en Simétrica
            </div>
            <div className="lm-flow-vertical-mini">
              <div className="node-mini">Persona A</div>
              <div className="arrow-mini">↓ necesita compartir</div>
              <div className="node-mini key-danger">🔑 Clave secreta</div>
              <div className="arrow-mini">↓ a través de internet</div>
              <div className="node-mini">Persona B</div>
            </div>
            <div className="lm-comp-desc">
              <strong>El dilema:</strong> ¿Cómo enviar la clave secreta por una red pública sin que un atacante la espíe y la copie?
            </div>
          </div>

          <div className="card lm-comparison-card">
            <div className="lm-comp-badge text-accent">
              <CheckCircle2 size={16} /> La solución en Asimétrica
            </div>
            <div className="lm-flow-vertical-mini">
              <div className="node-mini">Persona B publica</div>
              <div className="arrow-mini">↓ sin miedo a espías</div>
              <div className="node-mini key-safe">🔑 CLAVE PÚBLICA</div>
              <div className="arrow-mini">↓ Persona A la usa y B conserva</div>
              <div className="node-mini key-priv">🔐 CLAVE PRIVADA</div>
            </div>
            <div className="lm-comp-desc">
              <strong>La solución:</strong> La clave privada nunca viaja por la red. La clave pública puede estar en la web a la vista de todos.
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 3 — Ejemplo conocido: RSA
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">3</span>
          <h2>Ejemplo conocido: RSA</h2>
        </div>

        <div className="card lm-algo-example-card">
          <div className="lm-algo-badge-row">
            <span className="badge badge-accent">RSA</span>
            <span className="badge" style={{ background: 'var(--clr-surface-2)', color: 'var(--txt-muted)' }}>
              Rivest–Shamir–Adleman (1977)
            </span>
          </div>
          <h3 style={{ marginTop: '12px', fontSize: '1.2rem' }}>Criptosistema de Clave Pública RSA</h3>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '8px' }}>
            RSA es un sistema criptográfico de clave pública basado en propiedades matemáticas de números enteros y utilizado históricamente para cifrado y firmas digitales.
          </p>
          <div className="lm-algo-meta" style={{ marginTop: '12px' }}>
            <span>
              <strong>Fundamento matemático:</strong> La facilidad de multiplicar dos números primos gigantes frente a la extrema dificultad de factorizar su producto.
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 4 — Experimento visual: Simulación interactiva Alice & Bob
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">4</span>
          <h2>Experimento visual: Comunicación asimétrica</h2>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '16px' }}>
          <Sparkles size={18} />
          <span>
            <strong>SIMULACIÓN EDUCATIVA:</strong> Esta experiencia interactiva muestra conceptualmente cómo Alice y Bob se comunican de forma segura usando un par de claves sin exponer la clave privada.
          </span>
        </div>

        <div className="card lm-asym-sim-card">
          {/* Controls bar */}
          <div className="lm-sim-controls">
            <div className="lm-sim-step-indicator">
              Paso actual: <strong>{simStep} de 5</strong> —{' '}
              <span style={{ color: 'var(--clr-accent)' }}>
                {simStep === 0 && 'Estado inicial: Sin claves'}
                {simStep === 1 && 'Bob generó su par de claves'}
                {simStep === 2 && 'Bob compartió su clave pública con Alice'}
                {simStep === 3 && 'Alice cifró su mensaje con la clave pública de Bob'}
                {simStep === 4 && 'Mensaje cifrado transmitido por el canal inseguro'}
                {simStep === 5 && 'Bob descifró el mensaje con su clave privada'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {simStep < 5 ? (
                <button className="btn btn-primary" onClick={handleNextStep}>
                  {simStep === 0 && '1. Generar par de claves'}
                  {simStep === 1 && '2. Compartir clave pública'}
                  {simStep === 2 && '3. Cifrar mensaje de Alice'}
                  {simStep === 3 && '4. Transmitir por la red'}
                  {simStep === 4 && '5. Descifrar con clave privada'}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={handleResetSim}>
                  <RotateCcw size={14} /> Reiniciar simulación
                </button>
              )}
            </div>
          </div>

          {/* Interactive stage: Alice, Canal público, Bob */}
          <div className="lm-sim-stage">
            {/* Alice Actor */}
            <div className="lm-actor-card">
              <div className="lm-actor-header">
                <div className="lm-actor-avatar cyan">
                  <User size={22} />
                </div>
                <div>
                  <strong>Alice</strong>
                  <span className="lm-actor-role">Emisora</span>
                </div>
              </div>

              <div className="lm-actor-body">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Mensaje a enviar:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                  value={aliceMessage}
                  onChange={(e) => setAliceMessage(e.target.value)}
                  disabled={simStep >= 3}
                />

                {simStep >= 2 && (
                  <div className="lm-actor-key-received animate-fade-in">
                    <span className="lm-sub-badge">🔑 Clave pública recibida</span>
                    <code>{bobPublicKey.slice(0, 32)}...</code>
                  </div>
                )}

                {simStep >= 3 && (
                  <div className="lm-actor-crypto-status animate-fade-in">
                    <Lock size={14} className="text-accent" />
                    <span>Mensaje cifrado con la clave pública de Bob</span>
                  </div>
                )}
              </div>
            </div>

            {/* Canal de comunicación / Red */}
            <div className="lm-channel-card">
              <span className="lm-channel-tag">🌐 Canal público (Internet)</span>
              {simStep === 2 && (
                <div className="lm-packet animate-fade-in">
                  <span>🔑 Bob envía su Clave Pública</span>
                  <div className="packet-arrow">→ → →</div>
                </div>
              )}
              {simStep === 4 && (
                <div className="lm-packet packet-cipher animate-fade-in">
                  <span>🔒 Mensaje Cifrado en tránsito</span>
                  <code>{simulatedCipher.slice(0, 24)}...</code>
                  <div className="packet-arrow">→ → →</div>
                </div>
              )}
              {simStep !== 2 && simStep !== 4 && (
                <div className="lm-channel-idle">Canal a la espera...</div>
              )}
            </div>

            {/* Bob Actor */}
            <div className="lm-actor-card">
              <div className="lm-actor-header">
                <div className="lm-actor-avatar purple">
                  <User size={22} />
                </div>
                <div>
                  <strong>Bob</strong>
                  <span className="lm-actor-role">Receptor</span>
                </div>
              </div>

              <div className="lm-actor-body">
                {simStep >= 1 ? (
                  <div className="lm-bob-keys-box animate-fade-in">
                    <div className="lm-key-item">
                      <span className="lm-sub-badge cyan">🔑 Clave pública (Compartible)</span>
                      <code>{bobPublicKey.slice(0, 28)}...</code>
                    </div>
                    <div className="lm-key-item">
                      <span className="lm-sub-badge purple">🔐 Clave privada (Secreta)</span>
                      <code>{bobPrivateKey.slice(0, 28)}...</code>
                    </div>
                  </div>
                ) : (
                  <div className="lm-actor-placeholder">Bob aún no tiene par de claves.</div>
                )}

                {simStep === 5 && (
                  <div className="lm-bob-decrypted-box animate-fade-in">
                    <span className="lm-sub-badge green">✓ Mensaje recuperado:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--clr-success)' }}>
                      "{aliceMessage}"
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 5 — Ver el proceso paso a paso
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">5</span>
          <h2>Ver el proceso de comunicación</h2>
        </div>

        <div className="card lm-process-card" onClick={() => setMilestones((prev) => ({ ...prev, viewedProcess: true }))}>
          <div className="lm-flow-vertical-detailed">
            <div className="lm-step-node">
              <div className="lm-step-index">1</div>
              <div className="lm-step-body">
                <strong>Bob genera el par de claves</strong>
                <p>Crea simultáneamente su clave pública y su clave privada matemáticamente vinculadas.</p>
              </div>
            </div>
            <div className="lm-flow-arrow">↓</div>
            <div className="lm-step-node">
              <div className="lm-step-index">2</div>
              <div className="lm-step-body">
                <strong>Distribución pública</strong>
                <p>Bob publica su clave pública sin importar que cualquier tercero o espía la vea.</p>
              </div>
            </div>
            <div className="lm-flow-arrow">↓</div>
            <div className="lm-step-node highlight-node">
              <div className="lm-step-index">3</div>
              <div className="lm-step-body">
                <strong>Alice cifra con la clave pública de Bob</strong>
                <p>El mensaje queda "bloqueado" con un candado que únicamente la clave privada de Bob puede abrir.</p>
              </div>
            </div>
            <div className="lm-flow-arrow">↓</div>
            <div className="lm-step-node">
              <div className="lm-step-index">4</div>
              <div className="lm-step-body">
                <strong>Tránsito por la red</strong>
                <p>El texto cifrado viaja por el canal inseguro. Si un atacante lo intercepta, no puede descifrarlo.</p>
              </div>
            </div>
            <div className="lm-flow-arrow">↓</div>
            <div className="lm-step-node">
              <div className="lm-step-index">5</div>
              <div className="lm-step-body">
                <strong>Bob descifra con su clave privada</strong>
                <p>Bob utiliza su clave privada, la cual nunca salió de su custodia, y lee el mensaje original.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 6 — Desafío visual: ¿Puede deducirse la clave privada?
         ═══════════════════════════════════════════════════════════════ */}
      <div className="lm-section">
        <div className="lm-section-head">
          <span className="lm-section-num">6</span>
          <h2>Desafío: ¿Puede deducirse la clave privada?</h2>
        </div>

        <div className="card lm-challenge-box">
          <p style={{ color: 'var(--txt-primary)', fontSize: '1rem', fontWeight: 600 }}>
            Bob publicó su clave pública abiertamente. ¿Eso significa que cualquiera puede obtener su clave privada a partir de ella?
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              className={`btn ${challengeAnswer === 'yes' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => {
                setChallengeAnswer('yes');
                setMilestones((prev) => ({ ...prev, solvedChallenge: true }));
              }}
            >
              Sí, porque están matemáticamente relacionadas
            </button>
            <button
              className={`btn ${challengeAnswer === 'no' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => {
                setChallengeAnswer('no');
                setMilestones((prev) => ({ ...prev, solvedChallenge: true }));
              }}
            >
              No, la derivación es computacionalmente inviable
            </button>
          </div>

          {challengeAnswer && (
            <div className="animate-fade-in" style={{ marginTop: '16px' }}>
              {challengeAnswer === 'no' ? (
                <div className="alert alert-success">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>¡Correcto!</strong>
                    <p style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                      Aunque ambas claves están relacionadas mediante ecuaciones matemáticas, el problema unidireccional (como la factorización de primos de miles de bits) hace que sea <strong>computacionalmente imposible</strong> deducir la clave privada a partir de la pública con la tecnología actual.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Respuesta inexacta:</strong>
                    <p style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                      Aunque están relacionadas, las funciones criptográficas asimétricas son <em>funciones trampa de un solo sentido</em>. Conocer la clave pública no permite deducir la privada en un tiempo razonable.
                    </p>
                  </div>
                </div>
              )}

              <div className="lm-key-rules-grid" style={{ marginTop: '16px' }}>
                <div className="rule-card rule-public">
                  <span className="rule-icon">🔑 Clave pública</span>
                  <span className="rule-status text-accent">✓ Puede compartirse abiertamente</span>
                </div>
                <div className="rule-card rule-private">
                  <span className="rule-icon">🔐 Clave privada</span>
                  <span className="rule-status text-danger">✕ Nunca debe compartirse</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECCIÓN 7 — Conexión con el siguiente tema: Funciones Hash
         ═══════════════════════════════════════════════════════════════ */}
      <div className="card lm-conclusion">
        <div className="lm-conclusion-content">
          <Sparkles size={20} style={{ color: 'var(--clr-accent)' }} />
          <div>
            <p>
              <strong>Siguiente paso:</strong> Ya conoces las claves públicas y privadas. En el siguiente módulo veremos cómo las funciones hash permiten crear huellas digitales de los datos para garantizar su integridad.
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
              El módulo 4 "Funciones hash" ya se encuentra disponible para explorar.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/aprendizaje/hash')}
        >
          <Hash size={16} /> Continuar con funciones hash <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
