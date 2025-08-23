
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <div className={`hamburger ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        {/* Close Button */}
        <button 
          className="sidebar-close"
          onClick={closeSidebar}
          aria-label="Close navigation"
        >
          ✕
        </button>

        {/* Navigation Links */}
        <ul className="sidebar-nav">
          <li>
            <button 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              🏠 Home
            </button>
          </li>
          <li>
            <button 
              className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}
              onClick={() => handleNavigation('/wallet')}
            >
              🪂 Airdrop
            </button>
          </li>
          <li>
            <button 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => handleNavigation('/about')}
            >
              ℹ️ About
            </button>
          </li>
        </ul>

        {/* Social Icons */}
        <div className="sidebar-footer">
          <a 
            href="https://discord.gg/shards" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </a>
        </div>
      </nav>
    </>
  );
}
