
import React from 'react';
import './FeatureCards.css';

export default function FeatureCards() {
  const features = [
    {
      title: "AI SCORING ENGINE",
      description: "A multidimensional scoring engine that turns raw on-chain data into wallet intelligence, measuring credibility, expertise, and loyalty.",
      icon: "🤖"
    },
    {
      title: "BADGES",
      description: "Earn points by proving credibility, skill, and loyalty across Web3. Farm and flex your Aura, unlock rewards, and level up your status.",
      icon: "🏆"
    },
    {
      title: "SHARDS POINTS",
      description: "Transform your on-chain activity into Soulbound Badges using Shards. The more Badges you have, the more rewards you receive.",
      icon: "💎"
    }
  ];

  return (
    <section className="features" id="features">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card glass fade-in-delay-${index + 1}`}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title gradient-text">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
