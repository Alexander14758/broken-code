
import React, { useState, useEffect } from 'react';

export default function BackendSettings() {
  const [backendIP, setBackendIP] = useState('');
  const [backendPort, setBackendPort] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedIP = localStorage.getItem('backendIP') || '';
    const savedPort = localStorage.getItem('backendPort') || '';
    setBackendIP(savedIP);
    setBackendPort(savedPort);
  }, []);

  const handleSave = () => {
    localStorage.setItem('backendIP', backendIP);
    localStorage.setItem('backendPort', backendPort);
    alert('Backend settings saved successfully!');
    setIsVisible(false);
  };

  const handleClear = () => {
    setBackendIP('');
    setBackendPort('');
    localStorage.removeItem('backendIP');
    localStorage.removeItem('backendPort');
    alert('Backend settings cleared!');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        ⚙️ Backend Settings
      </button>

      {isVisible && (
        <div style={{
          marginTop: '15px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#8b5cf6', 
            marginBottom: '15px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Backend Configuration
          </h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Backend IP Address:
            </label>
            <input
              type="text"
              value={backendIP}
              onChange={(e) => setBackendIP(e.target.value)}
              placeholder="e.g., 192.168.1.100"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Backend Port:
            </label>
            <input
              type="text"
              value={backendPort}
              onChange={(e) => setBackendPort(e.target.value)}
              placeholder="e.g., 3000"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Save Settings
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Clear Settings
            </button>
          </div>

          <div style={{
            marginTop: '15px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: '1.4'
          }}>
            💡 Tip: Configure your backend IP and port to receive wallet connection data. 
            Data will be sent to: http://[IP]:[PORT]/webhook
          </div>
        </div>
      )}
    </div>
  );
}
