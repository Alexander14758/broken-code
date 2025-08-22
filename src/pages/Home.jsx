// Home.jsx
import { AppKitProvider } from "../AppKitProvider";
import ApproveButton from "../components/ApproveWallet"; 
import Bnbcode from "../components/Cryptolist";

import "./home.css";

export default function Home() {
  return (
    <AppKitProvider>
      {/* 🔘 Top-right AppKit connect button */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <appkit-button></appkit-button>
      </div>

      {/* 👇 Main content (not fixed) */}
      <div style={{ marginTop: "100px", textAlign: "center" }}>
        
        <Bnbcode />
        <ApproveButton />
      </div>
    </AppKitProvider>
  );
}
