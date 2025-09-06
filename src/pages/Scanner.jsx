
import React from 'react';
import { AppKitProvider } from "../Appkitprovider";
import ScannerComponent from "../components/Scanner";
import "./home.css";

export default function Scanner() {
  return (
    <AppKitProvider>
      <div className="wallet-dashboard">
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="dashboard-grid">
              <div className="scanner-section glass-card">
                <div className="section-header">
                  <h2 className="section-title gradient-text">Token Scanner</h2>
                  <p className="section-subtitle">Analyze token balances and values across your wallet</p>
                </div>
                <div className="scanner-content">
                  <ScannerComponent />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppKitProvider>
  );
}
