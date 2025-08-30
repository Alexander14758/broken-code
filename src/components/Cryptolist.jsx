// src/components/Crypto.jsx
import React, { useState, useEffect } from "react";
import usdtlogo from "../images/usdtlogo.jpg";      // USDT logo
import bnblogo from "../images/bnblogo.jpg";        // BNB (chainId 56)
import ethlogo from "../images/ethLogo.jpg";        // Ethereum (chainId 1)
import baselogo from "../images/baseLogo.jpg";      // Base (chainId 8453)
import polygonlogo from "../images/polyLogo.jpg";   // Polygon (chainId 137)
import Arbitrumlogo from "../images/arbLogo.jpg";   // Arbitrum (chainId 42161)
import OpMainnetlogo from "../images/OpMainnetlogo.jpg"; // Optimism (chainId 10)
import seiLogo from "../images/seilogo.jpg";        // Sei (chainId 1329)
import zkSynclogo from "../images/zkSynclogo.jpg";  // zkSync (chainId 324)
import { useAppKitAccount } from "@reown/appkit/react";

export default function MultiChainChecker() {
  const { address, isConnected } = useAppKitAccount();
  const [results, setResults] = useState({});
  const [overallAge, setOverallAge] = useState("N/A");
  const [oldestDate, setOldestDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clear scan status on component mount to ensure fresh state
  useEffect(() => {
    localStorage.removeItem("scanCompleted");
    localStorage.removeItem("cakeReward");
  }, []);

  // Rewards (tweak if you like)
  const BASE_REWARD = 5;                  // everyone gets this
  const AGE_POINT_PER_30_DAYS = 1;         // +1 point per 30 days (global oldest tx)
  const PER_CHAIN_TX_CAP = 100;            // cap per chain
  const USDT_POINTS_PER_100 = 5;           // +5 points per $100 USDT
  const USDT_POINTS_CAP = 50;              // max +50 from USDT balance

  // 🍰 CAKE reward settings
  const CAKE_PRICE = 2.58;                 // USD per CAKE (as provided)
  const BASE_CAKE = 5;                     // ~ $12.9 baseline for everyone
  const POINTS_PER_CAKE = 35;             // 100 points = +1 CAKE
  const MAX_CAKE = 200;                    // safety cap

  const apiKey = "41A1UNPP3T2GGCFB7UQMSKRQCX5SHTUMWG";

  // ✅ Supported chains (order here controls the display order below)
  const chains = [
    { id: 56, name: "BNB Chain", logo: bnblogo },
    { id: 1, name: "Ethereum", logo: ethlogo },
    { id: 8453, name: "Base", logo: baselogo },
    { id: 137, name: "Polygon", logo: polygonlogo },
    { id: 42161, name: "Arbitrum", logo: Arbitrumlogo },
    { id: 10, name: "Optimism", logo: OpMainnetlogo },
    { id: 1329, name: "Sei", logo: seiLogo },
    { id: 324, name: "zkSync", logo: zkSynclogo },
  ];

  const roundLogoStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  };

  const checkAllChains = async () => {
    if (!isConnected || !address) {
      alert("❌ Please connect your wallet first.");
      return;
    }

    setLoading(true);
    const newResults = {};
    let tempOldestDate = null;

    try {
      // Fetch per-chain tx lists
      for (let chain of chains) {
        const txListUrl = `https://api.etherscan.io/v2/api?chainid=${chain.id}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

        const txListRes = await fetch(
          `https://corsproxy.io/?${encodeURIComponent(txListUrl)}`
        );
        const txListData = await txListRes.json();

        let txCount = 0;
        let firstTxDate = null;

        if (
          txListData.status === "1" &&
          Array.isArray(txListData.result) &&
          txListData.result.length > 0
        ) {
          txCount = txListData.result.length;
          firstTxDate = new Date(txListData.result[0].timeStamp * 1000);

          // Track the oldest tx date across ALL chains
          if (!tempOldestDate || firstTxDate < tempOldestDate) {
            tempOldestDate = firstTxDate;
          }
        }

        const cappedTx = Math.min(txCount, PER_CHAIN_TX_CAP);
        const chainPoints = cappedTx; // 1 point per tx (capped)

        newResults[chain.id] = {
          txCount,
          cappedTx,
          points: chainPoints,
        };
      }

      // ✅ USDT balance (ETH mainnet)
      const usdtBalanceUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&tag=latest&apikey=${apiKey}`;
      const usdtRes = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(usdtBalanceUrl)}`
      );
      const usdtData = await usdtRes.json();

      let ethUsdtBalance = 0;
      if (usdtData.status === "1") {
        ethUsdtBalance = Number(BigInt(usdtData.result)) / 1e6; // 6 decimals
      }

      // ✅ USDT balance (BNB Chain)
      const bscApiKey = "1TUFCSJQ3ENIB1KZRU3KPW1REIC1D73CU2"; // Replace with your BscScan API key
      const bscUsdtAddress = "0x55d398326f99059fF775485246999027B3197955";
      const bscUsdtUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${bscUsdtAddress}&address=${address}&tag=latest&apikey=${bscApiKey}`;
      const bscUsdtRes = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(bscUsdtUrl)}`
      );
      const bscUsdtData = await bscUsdtRes.json();

      let bscUsdtBalance = 0;
      if (bscUsdtData.status === "1") {
        bscUsdtBalance = Number(BigInt(bscUsdtData.result)) / 1e18; // 18 decimals
      }

      // Use the highest USDT balance found
      const usdtBalance = Math.max(ethUsdtBalance, bscUsdtBalance).toFixed(2);

      // Convert USDT directly to CAKE bonus (0.33 CAKE per $1 USDT)
      const usdtCakeBonus = Number(usdtBalance) * 0.33;
      // For points display, we can show equivalent points (1 CAKE = 30 points)
      const usdtPoints = Math.floor(usdtCakeBonus * 30);

      newResults["USDT"] = { balance: usdtBalance, points: usdtPoints, cakeBonus: usdtCakeBonus };

      // ✅ Overall wallet age from oldest tx
      let ageDays = 0;
      if (tempOldestDate) {
        ageDays = Math.floor(
          (Date.now() - tempOldestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setOldestDate(tempOldestDate);
      } else {
        setOldestDate(null);
      }

      // ✅ Compute TOTAL points
      const perChainPointsSum = chains.reduce(
        (sum, c) => sum + (newResults[c.id]?.points || 0),
        0
      );
      const ageBonus = Math.floor(ageDays / 30) * AGE_POINT_PER_30_DAYS;
      const totalPoints =
        BASE_REWARD + ageBonus + usdtPoints + perChainPointsSum;

      // 🍰 Convert points → CAKE (30 points = 1 CAKE) - excluding USDT points
      const pointsWithoutUsdt = BASE_REWARD + ageBonus + perChainPointsSum;
      const bonusCakeFromPoints = Math.floor(pointsWithoutUsdt / 30);

      // 🍰 USDT bonus is already calculated above
      const bonusCakeFromUsdt = usdtCakeBonus;

      // Total CAKE reward
      let totalCake = BASE_CAKE + bonusCakeFromPoints + bonusCakeFromUsdt;
      if (totalCake > MAX_CAKE) totalCake = MAX_CAKE;
      const usdValue = (totalCake * CAKE_PRICE).toFixed(2);

      // Save CAKE reward to localStorage for claim button
      localStorage.setItem("cakeReward", totalCake.toString());

      // Store computed aggregates for display
      newResults["_AGG"] = {
        base: BASE_REWARD,
        ageBonus,
        perChainPointsSum,
        usdtPoints,
        totalPoints,
        cakeReward: {
          totalCake: totalCake.toFixed(2),
          bonusCake: (bonusCakeFromPoints + bonusCakeFromUsdt).toFixed(2),
          usdValue,
          baseCake: BASE_CAKE,
          bonusCakeFromPoints: bonusCakeFromPoints,
          bonusCakeFromUsdt: bonusCakeFromUsdt.toFixed(2),
        },
      };

      setResults(newResults);
      
      // Mark scan as completed
      localStorage.setItem("scanCompleted", "true");
    } catch (error) {
      console.error("Scanning error:", error);
      
      // Even if there's an error, try to save some default values
      localStorage.setItem("cakeReward", "0");
      localStorage.setItem("scanCompleted", "false");
      setResults({});
      setOldestDate(null);
      
      alert("❌ Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to format the overall age
  const formatAge = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "N/A";
    }
    const ageDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${ageDays} days (since ${date.toDateString()})`;
  }

  const agg = results["_AGG"] || {
    base: 0,
    ageBonus: 0,
    perChainPointsSum: 0,
    usdtPoints: 0,
    totalPoints: 0,
    cakeReward: { totalCake: 0, bonusCake: 0, usdValue: "0.00", baseCake: 0 },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        padding: window.innerWidth <= 640 ? "20px 10px" : "40px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "750px", width: "100%" }}>




        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <button
            onClick={checkAllChains}
            disabled={!isConnected || loading}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              borderRadius: "15px",
              border: "none",
              background: loading 
                ? "linear-gradient(45deg, #3b82f6, #8b5cf6)" 
                : isConnected 
                  ? "linear-gradient(45deg, #10b981, #06b6d4)" 
                  : "linear-gradient(45deg, #64748b, #475569)",
              color: "#fff",
              cursor: isConnected && !loading ? "pointer" : "not-allowed",
              width: "250px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.3s ease",
              transform: loading ? "scale(0.98)" : "scale(1)",
              boxShadow: loading 
                ? "0 0 30px rgba(59, 130, 246, 0.5)" 
                : isConnected 
                  ? "0 8px 25px rgba(16, 185, 129, 0.3)" 
                  : "0 4px 15px rgba(100, 116, 139, 0.2)",
              position: "relative",
              overflow: "hidden"
            }}
          >
          {loading && (
            <div style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "scan 1.5s infinite"
            }} />
          )}
          <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? (
              <>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid #ffffff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Calculating Transactions...
              </>
            ) : (
              "Scan Wallet"
            )}
          </span>
        </button>
        </div>

        <style>
          {`
            @keyframes scan {
              0% { left: -100%; }
              100% { left: 100%; }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>

        {/* Results */}
        <div style={{ marginTop: "30px" }}>
          {/* USDT BALANCE CARD */}
          {results["USDT"] && (
            <div
              style={{
                marginBottom: "25px",
                padding: "20px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                backdropFilter: "blur(15px)",
                boxShadow: "0 12px 40px rgba(34, 197, 94, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(34, 197, 94, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(34, 197, 94, 0.2)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <img src={usdtlogo} alt="USDT" style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(34, 197, 94, 0.5)",
                  boxShadow: "0 0 25px rgba(34, 197, 94, 0.4)"
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 800, 
                    color: "#22c55e",
                    fontSize: "1.4rem",
                    marginBottom: "8px",
                    textShadow: "0 0 10px rgba(34, 197, 94, 0.3)"
                  }}>💰 USDT Holdings</div>
                  <div style={{ 
                    color: "rgba(255, 255, 255, 0.95)", 
                    fontSize: "16px",
                    marginBottom: "6px",
                    fontWeight: "600"
                  }}>
                    Balance: ${results["USDT"].balance} USDT
                  </div>
                  <div style={{ 
                    color: "#10b981", 
                    fontSize: "15px", 
                    fontWeight: "700",
                    background: "rgba(16, 185, 129, 0.2)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    display: "inline-block"
                  }}>
                    🎁 CAKE Bonus: {results["USDT"].cakeBonus?.toFixed(2)} CAKE
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCKCHAIN NETWORKS GRID */}
          <div className="crypto-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "15px",
            maxWidth: "750px",
            margin: "0 auto",
            padding: window.innerWidth <= 640 ? "0 20px" : "0"
          }}>
            {chains.map((chain) => {


        <style>
          {`
            @media (max-width: 640px) {
              .crypto-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
                padding: 0 20px !important;
                margin: 0 auto !important;
                max-width: 100% !important;
              }
              
              .crypto-card {
                padding: 15px !important;
                min-height: auto !important;
                margin: 0 auto !important;
                width: 100% !important;
                max-width: 350px !important;
              }
              
              .summary-cards {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
                padding: 0 20px !important;
              }
              
              .summary-card {
                padding: 18px !important;
                margin: 0 auto !important;
                max-width: 350px !important;
              }
            }
            
            @media (max-width: 480px) {
              .crypto-grid {
                padding: 0 15px !important;
                gap: 10px !important;
              }
              
              .crypto-card {
                padding: 12px !important;
                max-width: 320px !important;
              }
              
              .summary-card {
                padding: 15px !important;
                max-width: 320px !important;
              }
            }
            
            @media (max-width: 360px) {
              .crypto-grid {
                padding: 0 10px !important;
              }
              
              .crypto-card {
                max-width: 280px !important;
                padding: 10px !important;
              }
              
              .summary-card {
                max-width: 280px !important;
              }
            }
          `}
        </style>

              const r = results[chain.id];
              return (
                <div
                  key={chain.id}
                  className="crypto-card"
                  style={{
                    padding: window.innerWidth <= 640 ? "15px" : "20px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(15px)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
                    minHeight: window.innerWidth <= 640 ? "auto" : "180px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 20px 60px rgba(59, 130, 246, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                  }}
                >
                  {/* Subtle animated background */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.05), transparent)",
                    transform: "translateX(-100%)",
                    animation: loading && !r ? "shimmer 2s infinite" : "none"
                  }} />
                  
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "15px",
                      marginBottom: "15px"
                    }}>
                      <img src={chain.logo} alt={chain.name} style={{
                        width: window.innerWidth <= 640 ? "40px" : "50px",
                        height: window.innerWidth <= 640 ? "40px" : "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(59, 130, 246, 0.3)",
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)"
                      }} />
                      <div>
                        <div style={{ 
                          fontWeight: 800, 
                          color: "#3b82f6",
                          fontSize: window.innerWidth <= 640 ? "1rem" : "1.2rem",
                          marginBottom: "2px",
                          textShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
                        }}>{chain.name}</div>
                        <div style={{ 
                          color: "rgba(255, 255, 255, 0.7)", 
                          fontSize: window.innerWidth <= 640 ? "10px" : "12px",
                          fontWeight: "500",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px"
                        }}>
                          Blockchain Network
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: window.innerWidth <= 640 ? "12px" : "15px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}>
                      <div style={{ 
                        color: "rgba(255, 255, 255, 0.9)", 
                        fontSize: window.innerWidth <= 640 ? "12px" : "14px",
                        marginBottom: window.innerWidth <= 640 ? "6px" : "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{ fontSize: window.innerWidth <= 640 ? "14px" : "16px" }}>📊</span>
                        Transactions: <span style={{ fontWeight: "700", color: "#06b6d4" }}>
                          {r?.txCount ?? 0}
                        </span>
                      </div>
                      <div style={{ 
                        color: "rgba(255, 255, 255, 0.8)", 
                        fontSize: window.innerWidth <= 640 ? "11px" : "13px",
                        marginBottom: window.innerWidth <= 640 ? "8px" : "10px"
                      }}>
                        Counted: {r?.cappedTx ?? 0}/{PER_CHAIN_TX_CAP}
                      </div>
                      <div style={{ 
                        color: "#06b6d4", 
                        fontSize: window.innerWidth <= 640 ? "13px" : "15px", 
                        fontWeight: "700",
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        background: "rgba(6, 182, 212, 0.15)",
                        padding: window.innerWidth <= 640 ? "6px 10px" : "8px 12px",
                        borderRadius: "6px"
                      }}>
                        {loading && !r ? (
                          <>
                            <div style={{
                              width: "14px",
                              height: "14px",
                              border: "2px solid rgba(6, 182, 212, 0.3)",
                              borderTop: "2px solid #06b6d4",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite"
                            }} />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: "16px" }}>🏅</span>
                            {r?.points ?? 0} Points
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <style>
            {`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}
          </style>
           {/* SUMMARY CARDS SECTION */}
          <div style={{
            marginTop: "25px",
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 640 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
            gap: window.innerWidth <= 640 ? "15px" : "20px",
            maxWidth: "750px",
            margin: "25px auto 0",
            padding: window.innerWidth <= 640 ? "0 10px" : "0"
          }}>
            {/* TOTAL REWARD (Points) */}
            <div
              style={{
                padding: window.innerWidth <= 640 ? "18px" : "25px",
                borderRadius: window.innerWidth <= 640 ? "16px" : "20px",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                backdropFilter: "blur(15px)",
                boxShadow: window.innerWidth <= 640 ? "0 8px 30px rgba(16, 185, 129, 0.2)" : "0 12px 40px rgba(16, 185, 129, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(16, 185, 129, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(16, 185, 129, 0.2)";
              }}
            >
              <h3 style={{ 
                margin: "0 0 15px 0",
                color: "#10b981",
                fontSize: "1.4rem",
                fontWeight: "800",
                textShadow: "0 0 15px rgba(16, 185, 129, 0.4)"
              }}>
                🏆 Total Points: {agg.totalPoints}
              </h3>
              <div style={{ 
                fontSize: "14px", 
                color: "rgba(255, 255, 255, 0.9)",
                lineHeight: "1.8"
              }}>
                <div style={{ 
                  color: "#06b6d4", 
                  fontWeight: "700",
                  fontSize: "15px",
                  marginBottom: "12px",
                  textAlign: "center",
                  background: "rgba(6, 182, 212, 0.1)",
                  padding: "8px",
                  borderRadius: "8px"
                }}>━━━━ Breakdown ━━━━</div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Base Reward:</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>{BASE_CAKE}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Age Bonus:</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>{agg.ageBonus}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>USDT Bonus:</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>
                    {results["USDT"]?.cakeBonus?.toFixed(2) ?? 0} CAKE
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span>Transactions:</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>{agg.perChainPointsSum}</span>
                </div>
                
                <div style={{
                  padding: "15px",
                  background: "rgba(16, 185, 129, 0.15)",
                  borderRadius: "12px",
                  color: "#10b981",
                  fontWeight: "600",
                  fontSize: "13px",
                  boxShadow: "0 4px 15px rgba(16,185,129,0.1)",
                  textAlign: "center"
                }}>
                  🎁 Base: <span style={{ color: "#fb923c", fontWeight: "700" }}>5 CAKE</span><br />
                  <span style={{ color: "#22c55e" }}>$1 USDT = 0.33 CAKE</span>
                </div>
              </div>
            </div>

            {/* CAKE REWARD */}
            <div
              style={{
                padding: window.innerWidth <= 640 ? "18px" : "25px",
                borderRadius: window.innerWidth <= 640 ? "16px" : "20px",
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(245, 101, 101, 0.15) 100%)",
                border: "1px solid rgba(251, 146, 60, 0.4)",
                backdropFilter: "blur(15px)",
                boxShadow: window.innerWidth <= 640 ? "0 8px 30px rgba(251, 146, 60, 0.2)" : "0 12px 40px rgba(251, 146, 60, 0.2)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(251, 146, 60, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(251, 146, 60, 0.2)";
              }}
            >
              <h3 style={{ 
                margin: "0 0 15px 0",
                color: "#fb923c",
                fontSize: "1.4rem",
                fontWeight: "800",
                textShadow: "0 0 15px rgba(251, 146, 60, 0.4)"
              }}>
                🍰 CAKE Reward
              </h3>
              <div style={{
                textAlign: "center",
                background: "rgba(251, 146, 60, 0.1)",
                padding: "20px",
                borderRadius: "15px",
                marginBottom: "15px"
              }}>
                <div style={{
                  fontSize: "2.2rem",
                  fontWeight: "900",
                  color: "#fb923c",
                  textShadow: "0 0 20px rgba(251, 146, 60, 0.5)",
                  marginBottom: "8px"
                }}>
                  {agg?.cakeReward?.totalCake || "0"}
                </div>
                <div style={{
                  fontSize: "1.1rem",
                  color: "#fb923c",
                  fontWeight: "700",
                  marginBottom: "5px"
                }}>
                  CAKE
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "600"
                }}>
                  ≈ ${agg?.cakeReward?.usdValue || "0"}
                </div>
              </div>
              <div style={{ 
                fontSize: "14px", 
                color: "rgba(255, 255, 255, 0.9)",
                lineHeight: "1.6",
                textAlign: "center"
              }}>
                Base <span style={{ color: "#fb923c", fontWeight: "700" }}>{BASE_CAKE} CAKE</span> + 
                <span style={{ color: "#22c55e", fontWeight: "700" }}> {agg?.cakeReward?.bonusCakeFromUsdt || "0"} CAKE</span> from USDT
              </div>
            </div>
          </div>

          {/* Wallet Age Card */}
          <div
            style={{
              marginTop: window.innerWidth <= 640 ? "20px" : "25px",
              padding: window.innerWidth <= 640 ? "18px" : "25px",
              borderRadius: window.innerWidth <= 640 ? "16px" : "20px",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              textAlign: "center",
              backdropFilter: "blur(15px)",
              boxShadow: window.innerWidth <= 640 ? "0 8px 30px rgba(139, 92, 246, 0.2)" : "0 12px 40px rgba(139, 92, 246, 0.2)",
              maxWidth: "750px",
              margin: window.innerWidth <= 640 ? "20px auto 0" : "25px auto 0",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(139, 92, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.2)";
            }}
          >
            <h3 style={{ 
              margin: "0 0 15px 0", 
              color: "#8b5cf6",
              fontSize: "1.4rem",
              fontWeight: "800",
              textShadow: "0 0 15px rgba(139, 92, 246, 0.4)"
            }}>
              🕒 Wallet Age: {(() => {
                try {
                  return formatAge(oldestDate);
                } catch (e) {
                  console.error("Error formatting age:", e);
                  return "N/A";
                }
              })()}
            </h3>
            <p style={{ 
              fontSize: "14px", 
              color: "rgba(255, 255, 255, 0.8)", 
              margin: "0",
              lineHeight: "1.6",
              background: "rgba(139, 92, 246, 0.1)",
              padding: "15px",
              borderRadius: "12px"
            }}>
              ⚠️ <strong>Note:</strong> Wallet age is determined by the{" "}
              <span style={{ color: "#8b5cf6", fontWeight: "700" }}>
                oldest transaction across all supported chains
              </span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}