
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import Footer from './components/Footer';
import Home from './pages/Home';
import Mainpage from './pages/Mainpage';
import './App.css';

function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/wallet" element={<Home />} />
          <Route path="/dashboard" element={<Mainpage />} />
        </Routes>
      </div>
    </Router>
  );
}
