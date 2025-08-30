
import React from 'react';
import './CustomAlert.css';

export default function CustomAlert({ isOpen, onClose, title, message, type = 'error' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '🚫';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '🚫';
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="custom-alert-overlay" onClick={handleBackdropClick}>
      <div className={`custom-alert-modal ${type}`}>
        <div className="alert-header">
          <div className="alert-icon">{getIcon()}</div>
          <h3 className="alert-title">{title}</h3>
        </div>
        
        <div className="alert-content">
          <p className="alert-message">{message}</p>
        </div>
        
        <div className="alert-footer">
          <button 
            className="alert-button"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
        
        <div className="alert-glow"></div>
      </div>
    </div>
  );
}
