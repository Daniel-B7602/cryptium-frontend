import { AudioWaveform, Construction, Sparkles, Shield, Disc3 } from 'lucide-react';
import './AudioSteganography.css';

export default function AudioSteganography() {
  return (
    <div className="audio-stego-page">
      <div className="audio-stego-container">
        {/* Glow de fondo decorativo */}
        <div className="audio-stego-glow" aria-hidden="true" />

        <div className="audio-stego-card">
          {/* Mensaje destacado de módulo en construcción */}
          <div className="audio-stego-status-badge">
            <Construction size={14} className="audio-stego-badge-icon" />
            <span>Módulo en construcción</span>
          </div>

          {/* Icono representativo de audio */}
          <div className="audio-stego-icon-wrapper">
            <div className="audio-stego-wave-pulse" aria-hidden="true" />
            <div className="audio-stego-icon-box">
              <AudioWaveform size={42} className="audio-stego-icon" />
            </div>
          </div>

          {/* Título */}
          <h1 className="audio-stego-title">Esteganografía de audio</h1>

          {/* Texto explicativo solicitado */}
          <p className="audio-stego-description">
            Estamos trabajando en una nueva herramienta para ocultar y recuperar mensajes
            cifrados dentro de archivos de audio. Próximamente estará disponible en Cryptium.
          </p>

          {/* Ondas sonoras decorativas sutiles */}
          <div className="audio-stego-soundbars" aria-hidden="true">
            <span style={{ animationDelay: '0.1s' }} />
            <span style={{ animationDelay: '0.35s' }} />
            <span style={{ animationDelay: '0.2s' }} />
            <span style={{ animationDelay: '0.5s' }} />
            <span style={{ animationDelay: '0.15s' }} />
            <span style={{ animationDelay: '0.4s' }} />
            <span style={{ animationDelay: '0.25s' }} />
          </div>

          {/* Etiquetas conceptuales informativas (sin controles ni acciones interactivas) */}
          <div className="audio-stego-preview-pills">
            <div className="audio-stego-pill">
              <Sparkles size={13} />
              <span>Inyección LSB y espectral</span>
            </div>
            <div className="audio-stego-pill">
              <Shield size={13} />
              <span>Cifrado previo de payload</span>
            </div>
            <div className="audio-stego-pill">
              <Disc3 size={13} />
              <span>Formatos WAV / FLAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
