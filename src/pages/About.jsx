
import React from 'react';
import './About.css';

// Import team images
import MichaelCarterImg from '../images/Michael_Carter.jpg';
import DavidMitchellImg from '../images/David_Mitchell.jpg';
import ArjunSharmaImg from '../images/Arjun_Sharma.jpg';
import JamesAndersonImg from '../images/James_Anderson.jpg';

export default function About() {
  const scrollToTeam = () => {
    const teamSection = document.getElementById('team-section');
    if (teamSection) {
      teamSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const teamMembers = [
    {
      name: "Michael Carter",
      role: "CEO, Co-Founder",
      image: MichaelCarterImg
    },
    {
      name: "David Mitchell", 
      role: "CPO, Co-Founder",
      image: DavidMitchellImg
    },
    {
      name: "Arjun Sharma",
      role: "CTO, Co-Founder", 
      image: ArjunSharmaImg
    },
    {
      name: "James Anderson",
      role: "Co-Founder",
      image: JamesAndersonImg
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-background">
          <div className="particles">
            {Array.from({ length: 30 }, (_, i) => (
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
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title gradient-text fade-in">About Shards Protocol</h1>
          <p className="hero-description fade-in-delay-1">
            Shards Protocol is built by Shards with the goal of creating a unifying rewards distribution and user recognition protocol in Web3.
          </p>
          
          <button 
            className="learn-team-btn glass glow fade-in-delay-2"
            onClick={scrollToTeam}
          >
            <span>LEARN ABOUT THE TEAM</span>
            <div className="button-glow"></div>
          </button>
        </div>
      </section>

      {/* Team Section */}
      <section id="team-section" className="team-section">
        <div className="team-container">
          <div className="team-header">
            <h2 className="section-title gradient-text">Introducing the Team</h2>
            <p className="team-subtitle">Meet the exceptional people that make the magic happen.</p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className={`team-card glass fade-in-delay-${index + 1}`}
              >
                <div className="team-image-container">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="team-image"
                  />
                  <div className="image-overlay"></div>
                </div>
                
                <div className="team-info">
                  <h3 className="team-name gradient-text">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
                
                <div className="card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
