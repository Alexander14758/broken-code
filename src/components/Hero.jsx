
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState('Cash');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ['Cash', 'Reward', 'Credibility'];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentWord === words[wordIndex]) {
          setIsDeleting(true);
        }
      } else {
        if (currentWord === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }

      if (isDeleting) {
        setCurrentWord(prev => prev.slice(0, -1));
      } else {
        setCurrentWord(words[wordIndex].slice(0, currentWord.length + 1));
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, wordIndex, words]);

  // Create particles
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${4 + Math.random() * 4}s`
      }}
    />
  ));

  return (
    <section className="hero">
      <div className="particles">{particles}</div>
      
      <div className="hero-content">
        <div className="logo-container fade-in">
          <img src="/src/images/ShardsLogo.jpg" alt="Shards Protocol" className="logo" />
        </div>
        
        <h1 className="hero-title fade-in-delay-1">
          Turn your on-chain activity into{' '}
          <span className="typing-word gradient-text">
            {currentWord}
            <span className="cursor">|</span>
          </span>
        </h1>
        
        <p className="hero-subtitle fade-in-delay-2">
          Shards Protocol is a recognition layer that rewards you for your on-chain milestones.
        </p>
        
        <button 
          className="cta-button glass glow fade-in-delay-3"
          onClick={() => navigate('/wallet')}
        >
          <span>Start Your Journey</span>
          <div className="button-glow"></div>
        </button>
        
        <p className="tagline fade-in-delay-3">
          <em>The recognition layer that rewards you.</em>
        </p>
      </div>
      
      <div className="hero-bg-glow"></div>
    </section>
  );
}
