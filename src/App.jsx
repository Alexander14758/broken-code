import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AntiInspect from './components/AntiInspect';
import Home from './pages/Home';
import Mainpage from './pages/Mainpage';
import About from './pages/About';
import Scanner from './pages/Scanner';
import PrivacyPolicy from './pages/PrivacyPolicy';
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
        <AntiInspect />
        <Sidebar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/airdrop" element={<Home />} />
          <Route path="/dashboard" element={<Mainpage />} />
          <Route path="/about" element={<About />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}