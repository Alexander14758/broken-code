
import React from 'react';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Hero />
      <FeatureCards />
      <Footer />
    </div>
  );
}
