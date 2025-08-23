
import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-hero glass">
          <h1 className="about-title gradient-text">About Shards Protocol</h1>
          <p className="about-subtitle">
            The recognition layer that rewards your on-chain journey
          </p>
        </div>

        <div className="about-content">
          <div className="about-section glass">
            <h2 className="section-title gradient-text">Our Mission</h2>
            <p className="section-text">
              Shards Protocol transforms your on-chain activity into meaningful recognition and rewards. 
              We believe that every transaction, every interaction, and every milestone in Web3 should 
              contribute to building your digital reputation and unlocking new opportunities.
            </p>
          </div>

          <div className="about-section glass">
            <h2 className="section-title gradient-text">How It Works</h2>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <div className="feature-content">
                  <h3>AI Scoring Engine</h3>
                  <p>Our advanced AI analyzes your on-chain behavior to create a comprehensive credibility score.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🏆</div>
                <div className="feature-content">
                  <h3>Soulbound Badges</h3>
                  <p>Earn permanent badges that represent your achievements and expertise across different protocols.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💎</div>
                <div className="feature-content">
                  <h3>Reward System</h3>
                  <p>Convert your reputation into tangible rewards and unlock exclusive opportunities.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section glass">
            <h2 className="section-title gradient-text">Why Choose Shards?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h4>Decentralized</h4>
                <p>Built on blockchain technology for transparency and security</p>
              </div>
              <div className="benefit-card">
                <h4>Multi-Chain</h4>
                <p>Support for multiple blockchains and protocols</p>
              </div>
              <div className="benefit-card">
                <h4>Fair Rewards</h4>
                <p>Algorithmic distribution based on genuine activity</p>
              </div>
              <div className="benefit-card">
                <h4>Community Driven</h4>
                <p>Governed by the community, for the community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="about-particle"
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
  );
}
