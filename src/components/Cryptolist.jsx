// src/components/Crypto.jsx
import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  // Rewards (tweak if you like)
  const BASE_REWARD = 10;                  // everyone gets this
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
    let oldestDate = null;

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
          if (!oldestDate || firstTxDate < oldestDate) {
            oldestDate = firstTxDate;
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
      const usdtBalanceUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokenbalance&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&tag=latest&apikey=${apiKey}`;
      const usdtRes = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(usdtBalanceUrl)}`
      );
      const usdtData = await usdtRes.json();

      let usdtBalance = "0.00";
      let usdtPoints = 0;

      if (usdtData.status === "1") {
        const raw = BigInt(usdtData.result); // 6 decimals
        const human = Number(raw) / 1e6;
        usdtBalance = human.toFixed(2);

        // +5 points per $100, max +50
        usdtPoints = Math.min(
          Math.floor(human / 100) * USDT_POINTS_PER_100,
          USDT_POINTS_CAP
        );
      }

      newResults["USDT"] = { balance: usdtBalance, points: usdtPoints };

      // ✅ Overall wallet age from oldest tx
      let ageDays = 0;
      if (oldestDate) {
        ageDays = Math.floor(
          (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setOverallAge(`${ageDays} days (since ${oldestDate.toDateString()})`);
      } else {
        setOverallAge("N/A");
      }

      // ✅ Compute TOTAL points
      const perChainPointsSum = chains.reduce(
        (sum, c) => sum + (newResults[c.id]?.points || 0),
        0
      );
      const ageBonus = Math.floor(ageDays / 30) * AGE_POINT_PER_30_DAYS;
      const totalPoints =
        BASE_REWARD + ageBonus + usdtPoints + perChainPointsSum;

      // 🍰 Convert points → CAKE
      const bonusCake = Math.floor(totalPoints / POINTS_PER_CAKE);
      let totalCake = BASE_CAKE + bonusCake;
      if (totalCake > MAX_CAKE) totalCake = MAX_CAKE;
      const usdValue = (totalCake * CAKE_PRICE).toFixed(2);

      // ✅ Save to localStorage
         localStorage.setItem("cakeReward", totalCake.toString());


      // Store computed aggregates for display
      newResults["_AGG"] = {
        base: BASE_REWARD,
        ageBonus,
        perChainPointsSum,
        usdtPoints,
        totalPoints,
        cakeReward: {
          totalCake,
          bonusCake,
          usdValue,
          baseCake: BASE_CAKE,
        },
      };

      setResults(newResults);
    } catch (error) {
      console.error(error);
      alert("❌ Error fetching data.");
    }

    setLoading(false);
  };

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
        padding: "40px",
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
                Scanning...
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
        <div style={{ marginTop: "22px", textAlign: "left" }}>
          {/* USDT FIRST */}
          {results["USDT"] && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginTop: "15px",
                padding: "15px 18px",
                borderRadius: "15px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <img src={usdtlogo} alt="USDT" style={{
                ...roundLogoStyle,
                border: "2px solid rgba(34, 197, 94, 0.5)",
                boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)"
              }} />
              <div>
                <div style={{ 
                  fontWeight: 700, 
                  color: "#22c55e",
                  fontSize: "1.1rem",
                  marginBottom: "4px"
                }}>USDT</div>
                <div style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                  💵 Balance: {results["USDT"].balance} USDT
                </div>
                <div style={{ color: "#06b6d4", fontSize: "14px", fontWeight: "600" }}>
                  🏅 Points: {results["USDT"].points}
                </div>
              </div>
            </div>
          )}

          {/* CHAINS LIST */}
          {chains.map((chain) => {
            const r = results[chain.id];
            return (
              <div
                key={chain.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginTop: "15px",
                  padding: "15px 18px",
                  borderRadius: "15px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.15)";
                  e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                <img src={chain.logo} alt={chain.name} style={{
                  ...roundLogoStyle,
                  border: "2px solid rgba(59, 130, 246, 0.3)",
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)"
                }} />
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    color: "#3b82f6",
                    fontSize: "1.1rem",
                    marginBottom: "4px"
                  }}>{chain.name}</div>
                  <div style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                    📊 Tx Count: {r?.txCount ?? 0} (counted: {r?.cappedTx ?? 0}
                    /{PER_CHAIN_TX_CAP})
                  </div>
                  <div style={{ color: "#06b6d4", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  {loading && !r ? (
                    <>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        border: "1.5px solid rgba(6, 182, 212, 0.3)",
                        borderTop: "1.5px solid #06b6d4",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                      Loading...
                    </>
                  ) : (
                    <>🏅 Points: {r?.points ?? 0}</>
                  )}
                </div>
                </div>
              </div>
            );
          })}
           {/* TOTAL REWARD (Points) */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            textAlign: "left",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.2)"
          }}
        >
          <h3 style={{ 
            margin: 0,
            color: "#10b981",
            fontSize: "1.5rem",
            fontWeight: "700",
            textShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
          }}>
            🏆 Total Reward: {agg.totalPoints} Points
          </h3>
          <p style={{ 
            margin: "12px 0 0 0", 
            fontSize: "15px", 
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: "1.6"
          }}>
            <span style={{ 
              color: "#06b6d4", 
              fontWeight: "600",
              fontSize: "16px"
            }}>•••Breakdown•••</span> <br />
            • Base Reward: <span style={{ color: "#10b981", fontWeight: "600" }}>{agg.base}</span> <br />
            • Wallet Age Bonus: <span style={{ color: "#10b981", fontWeight: "600" }}>{agg.ageBonus}</span> <br />
            • Hold USDT Bonus: <span style={{ color: "#10b981", fontWeight: "600" }}>{agg.usdtPoints}</span> <br />
            • Total Transactions Done Across All Chains: <span style={{ color: "#10b981", fontWeight: "600" }}>{agg.perChainPointsSum}</span>
          </p>
        </div>

        {/* 🍰 CAKE REWARD (right under points) */}
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(245, 101, 101, 0.15) 100%)",
            border: "1px solid rgba(251, 146, 60, 0.4)",
            textAlign: "left",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(251, 146, 60, 0.2)"
          }}
        >
          <h3 style={{ 
            margin: 0,
            color: "#fb923c",
            fontSize: "1.5rem",
            fontWeight: "700",
            textShadow: "0 0 10px rgba(251, 146, 60, 0.3)"
          }}>
            🍰 Your CAKE Reward: {agg.cakeReward.totalCake} CAKE{" "}
            <span style={{ 
              fontSize: "16px", 
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: "500"
            }}>
              (≈ ${agg.cakeReward.usdValue})
            </span>
          </h3>
          <p style={{ 
            margin: "12px 0 0 0", 
            fontSize: "15px", 
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: "1.6"
          }}>
            Includes base <span style={{ color: "#fb923c", fontWeight: "600" }}>{agg.cakeReward.baseCake} CAKE</span> + bonus{" "}
            <span style={{ color: "#fb923c", fontWeight: "600" }}>{agg.cakeReward.bonusCake} CAKE</span> from points.
          </p>
        </div>

          {/* Overall wallet age */}
          <div style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.2)"
          }}>
            <h3 style={{ 
              margin: "0 0 10px 0", 
              color: "#8b5cf6",
              fontSize: "1.3rem",
              fontWeight: "700",
              textShadow: "0 0 10px rgba(139, 92, 246, 0.3)"
            }}>
              🕒 Overall Wallet Age: {overallAge}
            </h3>
            <p style={{ 
              fontSize: "14px", 
              color: "rgba(255, 255, 255, 0.8)", 
              margin: "0",
              lineHeight: "1.5"
            }}>
              ⚠️ Note: Wallet age is determined by the{" "}
              <span style={{ color: "#8b5cf6", fontWeight: "600" }}>
                oldest transaction across all supported chains
              </span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}