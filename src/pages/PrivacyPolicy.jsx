
import React from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
         
        </div>

        <div className="privacy-content">
          <div className="intro-section">
            <p>
              Shards Protocol ("we," "our," or "us") is committed to respecting and protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard information when you use our services, 
              including the Shards Protocol web app, browser extension, and any connected tools or features 
              (collectively, the "Services").
            </p>
            <p>
              This Policy is governed by the laws of the Republic of Seychelles, where Shards Protocol is legally incorporated.
            </p>
          </div>

          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>
              Aura is designed with a privacy-first architecture. We collect minimal data and avoid unnecessary 
              personal identifiers. The types of information we may collect include:
            </p>

            <div className="subsection">
              <h3>a. Public Blockchain Data</h3>
              <ul>
                <li>Wallet addresses you connect</li>
                <li>On-chain transaction history</li>
                <li>Associated tokens and NFTs</li>
                <li>Protocol interactions (e.g., staking, governance, minting)</li>
              </ul>
              <p>This data is already publicly available on the blockchain and used to generate Aura Scores and badges.</p>
            </div>

            <div className="subsection">
              <h3>b. Extension Metadata</h3>
              <ul>
                <li>Usage analytics (optional and anonymized)</li>
                <li>Browser type and version</li>
                <li>Extension version</li>
                <li>Error logs (non-identifiable)</li>
              </ul>
              <p>We do not collect passwords, keystore files, seed phrases, or private keys.</p>
            </div>

            <div className="subsection">
              <h3>c. Social Profile Integration</h3>
              <p>If you opt to link your X (formerly Twitter) profile, we may collect:</p>
              <ul>
                <li>X handle</li>
                <li>Public profile picture</li>
                <li>Display name and bio (if used in visual overlays)</li>
              </ul>
              <p>No social media credentials or private messages are collected or stored.</p>
            </div>

            <div className="subsection">
              <h3>d. Data Retention</h3>
              <p>
                We retain user-related metadata only for as long as necessary to deliver and maintain our Services. 
                Public blockchain data is not stored on our servers but is re-fetched or recomputed as needed. 
                Analytics and error logs are retained for a maximum of 90 days, unless legally required otherwise.
              </p>
            </div>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To generate and display Aura reputation profiles (or Passport)</li>
              <li>To power user-facing features in the extension and app</li>
              <li>To personalize your experience</li>
              <li>To maintain and improve service performance</li>
              <li>To ensure security, detect abuse or misuse</li>
            </ul>
            <p>We do not sell your data or share it with advertisers.</p>
          </section>

          <section className="policy-section">
            <h2>3. Cookies and Local Storage</h2>
            <p>
              Aura may use local browser storage to remember your preferences and reduce friction during use 
              (e.g., connected wallet state, display settings). We do not use tracking cookies or store 
              behavioral browsing data.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. User Rights & Data Access</h2>
            <p>As a user, you have the right to:</p>
            <ul>
              <li>Access the personal data we collect about you</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of any data we've stored (where applicable)</li>
              <li>Withdraw consent to optional data collection (e.g., usage analytics)</li>
              <li>Lodge a complaint with a supervisory authority in Seychelles</li>
            </ul>
            
          </section>

          <section className="policy-section">
            <h2>5. Data Ownership and Control</h2>
            <p>
              You remain in full control of your Web3 identity. You may disconnect your wallet or uninstall 
              the extension at any time. Your Aura data is tied to your public on-chain activity and is 
              recalculated based on protocol interactions. If you disconnect, we stop collecting new session 
              data immediately.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Third-Party Services</h2>
            <p>
              Aura may integrate with Web3 protocols and social platforms (e.g., X) via their public APIs. 
              We do not share identifiable user data with any third-party service unless you explicitly 
              authorize a connection.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Security Practices</h2>
            <p>We follow best practices to protect your data:</p>
            <ul>
              <li>End-to-end encryption where applicable</li>
              <li>Secure APIs and audited smart contracts</li>
              <li>No custody of private keys or wallet access</li>
            </ul>
            <p>
              However, no system is entirely immune to vulnerabilities. We encourage users to follow 
              good security hygiene.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our Services are not directed to children under 13. We do not knowingly collect personal 
              data from children.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy as needed. Changes will be posted here with an updated effective date. 
              Continued use of the Services after a revision implies acceptance.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Contact Us</h2>
            <p>If you have any questions, requests, or concerns about this policy, contact:</p>
            <p>
              <p>To exercise these rights, contact us at: <a href="mailto:admin@shards.tech">admin@shards.tech</a></p>
              X/Twitter: <a href="https://x.com/ShardsOfficial" target="_blank" rel="noopener noreferrer">@shardsofficial</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
