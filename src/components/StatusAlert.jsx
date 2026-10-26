import './StatusAlert.css';

/**
 * Banner de estado reutilizable.
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} message
 * @param {function} [onDismiss]
 */
export default function StatusAlert({ type = 'info', message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} status-alert`} role="alert">
      <span className="status-alert-icon">{icons[type]}</span>
      <span className="status-alert-msg">{message}</span>
      {onDismiss && (
        <button className="status-alert-close" onClick={onDismiss} aria-label="Cerrar">
          ✕
        </button>
      )}
    </div>
  );
}

const icons = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};
