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
        <h2>🔎 Multi-Chain Wallet Analyzer</h2>

        <p style={{ marginTop: "10px" }}>
          {isConnected ? `🔗 Connected: ${address}` : "❌ Wallet not connected"}
        </p>

        <button
          onClick={checkAllChains}
          disabled={!isConnected || loading}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            background: "#4caf50",
            color: "#fff",
            cursor: isConnected ? "pointer" : "not-allowed",
            width: "220px",
          }}
        >
          {loading ? "Scanning..." : "Scan Wallet"}
        </button>

        {/* Results */}
        <div style={{ marginTop: "22px", textAlign: "left" }}>
          {/* USDT FIRST */}
          {results["USDT"] && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #eee",
              }}
            >
              <img src={usdtlogo} alt="USDT" style={roundLogoStyle} />
              <div>
                <div style={{ fontWeight: 600 }}>USDT</div>
                <div>💵 Balance: {results["USDT"].balance} USDT</div>
                <div>🏅 Points: {results["USDT"].points}</div>
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
                  gap: "12px",
                  marginTop: "12px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              >
                <img src={chain.logo} alt={chain.name} style={roundLogoStyle} />
                <div>
                  <div style={{ fontWeight: 600 }}>{chain.name}</div>
                  <div>
                    📊 Tx Count: {r?.txCount ?? 0} (counted: {r?.cappedTx ?? 0}
                    /{PER_CHAIN_TX_CAP})
                  </div>
                  <div>🏅 Points: {r?.points ?? 0}</div>
                </div>
              </div>
            );
          })}
           {/* TOTAL REWARD (Points) */}
        <div
          style={{
            marginTop: "25px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#f6f7f9",
            textAlign: "left",
          }}
        >
          <h3 style={{ margin: 0 }}>
            🏆 Total Reward: {agg.totalPoints} Points
          </h3>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#555" }}> •••Breakdown••• <br />
           • Base Reward: {agg.base} <br />• Wallet Age Bonus: {agg.ageBonus} <br /> • Hold USDT
            Bonus: {agg.usdtPoints} <br />• Total Transations Done Across All Chains: {agg.perChainPointsSum}
          </p>
        </div>

        {/* 🍰 CAKE REWARD (right under points) */}
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff5f7",
            border: "1px solid #ffd6df",
            textAlign: "left",
          }}
        >
          <h3 style={{ margin: 0 }}>
            🍰 Your CAKE Reward: {agg.cakeReward.totalCake} CAKE{" "}
            <span style={{ fontSize: "14px", color: "#666" }}>
              (≈ ${agg.cakeReward.usdValue})
            </span>
          </h3>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#555" }}>
            Includes base {agg.cakeReward.baseCake} CAKE + bonus{" "}
            {agg.cakeReward.bonusCake} CAKE from points.
          </p>
        </div>

          {/* Overall wallet age */}
          <h3 style={{ marginTop: "22px", color: "#333" }}>
            🕒 Overall Wallet Age: {overallAge}
          </h3>
          <p style={{ fontSize: "14px", color: "gray", marginTop: "6px" }}>
            ⚠️ Note: Wallet age is determined by the{" "}
            <b>oldest transaction across all supported chains</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

