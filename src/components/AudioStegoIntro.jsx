import { Shield, Sparkles, Binary, AlertTriangle, ArrowRight, Lock, Eye, Disc3 } from 'lucide-react';

export default function AudioStegoIntro({ onSelectTab }) {
  return (
    <div className="as-intro-section animate-fade-in">
      {/* Banner Hero */}
      <div className="as-intro-hero card">
        <div className="as-intro-hero-content">
          <div className="as-intro-badge">
            <Sparkles size={13} />
            <span>Fundamentos Técnicos</span>
          </div>
          <h2 className="as-intro-title">Esteganografía de Audio en Cryptium</h2>
          <p className="as-intro-desc">
            A diferencia de la criptografía convencional, que hace que el mensaje sea incomprensible pero evidente,
            la <strong>esteganografía</strong> oculta la existencia misma de la comunicación incrustando datos
            secretos dentro de un medio portador aparentemente inocuo, como una grabación de audio digital.
          </p>
        </div>
      </div>

      {/* Grid de 4 Pilares Técnicos */}
      <div className="as-intro-grid">
        {/* Pilar 1 */}
        <div className="card as-intro-card">
          <div className="as-intro-card-icon as-icon--cyan">
            <Eye size={22} />
          </div>
          <h3 className="as-intro-card-title">1. Invisibilidad vs. Ininteligibilidad</h3>
          <p className="as-intro-card-text">
            Si un atacante intercepta un texto cifrado, sabe que hay un secreto. En cambio, un archivo WAV con esteganografía
            suena como música o voz habitual, evitando sospechas en canales vigilados o inspección de tráfico de red.
          </p>
        </div>

        {/* Pilar 2 */}
        <div className="card as-intro-card">
          <div className="as-intro-card-icon as-icon--purple">
            <Shield size={22} />
          </div>
          <h3 className="as-intro-card-title">2. Defensa en Profundidad (Cryptium)</h3>
          <p className="as-intro-card-text">
            Cryptium nunca oculta texto en claro. Antes de la inserción, el mensaje se protege con derivación de clave
            <strong> PBKDF2 (600.000 iteraciones)</strong> y cifrado autenticado <strong>AES-256-GCM</strong> con
            nonce y tag de integridad de 128 bits.
          </p>
        </div>

        {/* Pilar 3 */}
        <div className="card as-intro-card">
          <div className="as-intro-card-icon as-icon--amber">
            <Binary size={22} />
          </div>
          <h3 className="as-intro-card-title">3. Técnica LSB (1 bit por muestra)</h3>
          <p className="as-intro-card-text">
            Cada muestra de audio PCM de 16 bits almacena amplitudes entre -32.768 y +32.767. Al modular únicamente
            el bit menos significativo (LSB), la alteración máxima es de solo ±1 unidad, produciendo una relación
            señal-ruido (SNR) típicamente superior a 80 dB.
          </p>
        </div>

        {/* Pilar 4 */}
        <div className="card as-intro-card">
          <div className="as-intro-card-icon as-icon--red">
            <AlertTriangle size={22} />
          </div>
          <h3 className="as-intro-card-title">4. Fragilidad ante Compresión</h3>
          <p className="as-intro-card-text">
            Los algoritmos de compresión con pérdida (como MP3, AAC o WebM) eliminan las frecuencias e información
            inaudible mediante modelos psicoacústicos, destruyendo irremediablemente los bits LSB. El archivo portador
            debe conservarse en formato WAV PCM.
          </p>
        </div>
      </div>

      {/* Diagrama de Flujo del Protocolo Cryptium */}
      <div className="card as-flow-card">
        <span className="as-flow-title">Pipeline de Inyección y Extracción en Cryptium</span>
        <div className="as-flow-steps">
          <div className="as-flow-step">
            <div className="as-flow-step-num">1</div>
            <div className="as-flow-step-label">Texto UTF-8</div>
            <span className="as-flow-step-sub">Entrada en claro</span>
          </div>
          <ArrowRight size={16} className="as-flow-arrow" />
          <div className="as-flow-step">
            <div className="as-flow-step-num">2</div>
            <div className="as-flow-step-label">PBKDF2 + AES-GCM</div>
            <span className="as-flow-step-sub">Sal + Nonce + Tag</span>
          </div>
          <ArrowRight size={16} className="as-flow-arrow" />
          <div className="as-flow-step">
            <div className="as-flow-step-num">3</div>
            <div className="as-flow-step-label">Envelope CSTM</div>
            <span className="as-flow-step-sub">Cabecera 53B</span>
          </div>
          <ArrowRight size={16} className="as-flow-arrow" />
          <div className="as-flow-step">
            <div className="as-flow-step-num">4</div>
            <div className="as-flow-step-label">Inyección LSB</div>
            <span className="as-flow-step-sub">Modulación de bit 0</span>
          </div>
          <ArrowRight size={16} className="as-flow-arrow" />
          <div className="as-flow-step">
            <div className="as-flow-step-num">5</div>
            <div className="as-flow-step-label">WAV Portador</div>
            <span className="as-flow-step-sub">Salida descargable</span>
          </div>
        </div>

        <div className="as-intro-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSelectTab('hide')}
          >
            <Lock size={15} /> Probar ocultamiento de mensaje
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onSelectTab('analyze')}
          >
            <Disc3 size={15} /> Analizar un archivo WAV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onSelectTab('compare')}
          >
            <Binary size={15} /> Comparar audios con métricas DSP
          </button>
        </div>
      </div>
    </div>
  );
}

