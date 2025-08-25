import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppKitProvider } from "../Appkitprovider";
import { useAppKitAccount } from "@reown/appkit/react";
import ApproveButton from "../components/Approvewallet";
import Bnbcode from "../components/Cryptolist";
import "./home.css";

// Placeholder for BackendSettings component
const BackendSettings = () => {
  const [backendIp, setBackendIp] = React.useState('');
  const [backendPort, setBackendPort] = React.useState('');

  const handleIpChange = (event) => {
    setBackendIp(event.target.value);
    // Logic to send updated IP to backend/store it
  };

  const handlePortChange = (event) => {
    setBackendPort(event.target.value);
    // Logic to send updated Port to backend/store it
  };

  return (
    <div className="backend-settings">
      <h3 className="section-title gradient-text">Backend Settings</h3>
      <div className="settings-input">
        <label htmlFor="backendIp">Backend IP:</label>
        <input
          type="text"
          id="backendIp"
          value={backendIp}
          onChange={handleIpChange}
          placeholder="Enter IP Address"
        />
      </div>
      <div className="settings-input">
        <label htmlFor="backendPort">Backend Port:</label>
        <input
          type="number"
          id="backendPort"
          value={backendPort}
          onChange={handlePortChange}
          placeholder="Enter Port"
        />
      </div>
    </div>
  );
};

function WalletHeader() {
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();

  return (
    <div className="wallet-header">
      <div className="header-background"></div>
      <div className="header-content">
        <button
          className="back-button glass"
          onClick={() => navigate('/')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Back to Home
        </button>

        <div className="logo-section">
          <img src="/images/ShardsLogo.jpg" alt="Shards Protocol" className="header-logo" />
          <h1 className="header-title gradient-text">Shards Protocol Dashboard</h1>
          <p className="header-subtitle">Connect your wallet to start earning rewards</p>
        </div>

        <div className="connect-section">
          {isConnected ? (
            <div className="wallet-status connected">
              <div className="status-indicator"></div>
              <div className="wallet-info">
                <span className="status-text">Connected</span>
                <span className="wallet-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>
          ) : (
            <div className="wallet-status disconnected">
              <div className="status-indicator"></div>
              <span className="status-text">Disconnected</span>
            </div>
          )}
          <appkit-button></appkit-button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppKitProvider>
      <div className="wallet-dashboard">
        <WalletHeader />

        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="dashboard-grid">
              <div className="scanner-section glass-card">
                <div className="section-header">
                  <h2 className="section-title gradient-text">Multi-Chain Scanner</h2>
                  <p className="section-subtitle">Analyze your on-chain activity and earn CAKE rewards</p>
                </div>
                <div className="scanner-content">
                  <Bnbcode />
                </div>
              </div>

              <div className="actions-section glass-card">
                <div className="section-header">
                  <h2 className="section-title gradient-text">Claim Your Rewards</h2>
                  <p className="section-subtitle">Claim your CAKE rewards from wallet scanning</p>
                </div>
                <div className="actions-content">
                  <BackendSettings />
                  <ApproveButton />
                </div>
              </div>
            </div>


          </div>
        </main>

        <div className="dashboard-particles">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="dashboard-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </AppKitProvider>
  );
}