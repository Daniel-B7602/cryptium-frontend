import { useEffect, useRef } from 'react';

/**
 * Visualizador de ondas de audio y señal de diferencia esteganográfica basado en HTML5 Canvas.
 * Renderiza de forma sincronizada y fluida la envolvente acústica de los audios y la dispersión delta.
 */
export default function AudioWaveformVisualizer({
  waveformOriginal = [],
  waveformStego = [],
  waveformDifference = [],
  height = 240,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const totalHeight = height;

    // Limpieza de fondo
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, totalHeight);

    // Dibujar rejilla de fondo sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridCols = 8;
    for (let c = 1; c < gridCols; c++) {
      const gx = (width / gridCols) * c;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, totalHeight);
      ctx.stroke();
    }

    // Dividimos la altura en 3 franjas de visualización
    // 1. Canal Original (0 a h1)
    // 2. Canal Stego (h1 a h2)
    // 3. Canal Diferencia Delta (h2 a totalHeight)
    const trackH = (totalHeight - 20) / 3;

    function drawWaveTrack(data, offsetY, color, label, isDelta = false) {
      const centerY = offsetY + trackH / 2;

      // Línea de referencia central (cero)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Etiqueta del canal
      ctx.fillStyle = color;
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillText(label, 10, offsetY + 14);

      if (!data || data.length === 0) return;

      const step = width / data.length;

      if (isDelta) {
        // En el canal delta, mostramos barras verticales resaltadas donde hubo modificación LSB
        ctx.fillStyle = color;
        for (let i = 0; i < data.length; i++) {
          const val = data[i];
          if (val > 0) {
            const x = i * step;
            const barH = trackH * 0.7;
            ctx.fillRect(x, centerY - barH / 2, Math.max(1.5, step * 0.9), barH);
          }
        }
      } else {
        // Onda acústica continua (espejada respecto al centro)
        ctx.strokeStyle = color;
        ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = i * step;
          const amp = Math.max(0.02, Math.abs(data[i])) * (trackH * 0.42);
          const y = centerY - amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = data.length - 1; i >= 0; i--) {
          const x = i * step;
          const amp = Math.max(0.02, Math.abs(data[i])) * (trackH * 0.42);
          const y = centerY + amp;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Dibujar los tres canales apilados
    drawWaveTrack(waveformOriginal, 5, 'rgb(0, 212, 255)', 'AUDIO ORIGINAL (S₁)');
    drawWaveTrack(waveformStego, trackH + 10, 'rgb(167, 139, 250)', 'AUDIO PORTADOR STEGO (S₂)');
    drawWaveTrack(waveformDifference, trackH * 2 + 15, 'rgb(245, 158, 11)', 'SEÑAL DE MODIFICACIÓN LSB (Δ = |S₁ - S₂|)', true);

  }, [waveformOriginal, waveformStego, waveformDifference, height]);

  return (
    <div className="as-waveform-container">
      <div className="as-waveform-header">
        <span className="as-waveform-title">Oscilograma Comparativo y Dispersión de Modificaciones</span>
        <div className="as-waveform-legend">
          <span className="as-legend-item">
            <span className="as-legend-dot" style={{ background: '#00d4ff' }} /> Original
          </span>
          <span className="as-legend-item">
            <span className="as-legend-dot" style={{ background: '#a78bfa' }} /> Stego
          </span>
          <span className="as-legend-item">
            <span className="as-legend-dot" style={{ background: '#f59e0b' }} /> Inyección LSB (Δ)
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: '8px',
          display: 'block',
          border: '1px solid var(--clr-border)',
        }}
      />
      <div className="as-waveform-footer">
        <span>Eje temporal: 0.0s</span>
        <span>Muestras discretas cuantificadas</span>
        <span>Fin del archivo</span>
      </div>
    </div>
  );
}

