
import React, { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import "./Scanner.css";

function Scanner() {
  const { address: connectedAddress, isConnected } = useAppKitAccount();
  const [address, setAddress] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-scan when wallet is connected
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setAddress(connectedAddress);
      // Auto-scan the connected wallet
      handleScan(connectedAddress);
    }
  }, [isConnected, connectedAddress]);

  // Store token data globally for use in other components
  useEffect(() => {
    if (result.length > 0) {
      localStorage.setItem('walletTokens', JSON.stringify(result));
      localStorage.setItem('lastScannedAddress', address);
    }
  }, [result, address]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

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

  const handleScan = async (targetAddress = null) => {
    const scanAddress = targetAddress || address;
    
    if (!scanAddress) {
      alert("Please enter a wallet address or connect your wallet");
      return;
    }

    setLoading(true);

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

    const url = `https://deep-index.moralis.io/api/v2/${scanAddress}/erc20?${params}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
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

      setResult(sortedTokens);

      if (sortedTokens.length === 0) {
        alert("No tokens found matching your criteria.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleScan();
  };

  return (
    <div className="App">
      <h1>Token Scanner</h1>
      <h3 style={{textAlign:"center"}}>Fast Token Balance Checker</h3>
      
      {isConnected && (
        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#e8f5e8",
          borderRadius: "5px",
          color: "#2e7d32"
        }}>
          ✅ Wallet Connected - Auto-scanning: {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Wallet Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            disabled={isConnected}
          />
        </div>
        <button type="submit" disabled={loading || (isConnected && !address)}>
          {loading ? "Scanning..." : "Scan Wallet"}
        </button>
      </form>

      {result.length > 0 && (
        <div className="table-container">
          <h3>Found {result.length} verified tokens (sorted by USD value)</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Symbol</th>
                <th>Contract Address</th>
                <th>Balance</th>
                <th>Price (USD)</th>
                <th>USD Value</th>
                <th>Verified</th>
                <th>Security Score</th>
              </tr>
            </thead>
            <tbody>
              {result.map((token, index) => (
                <tr key={index}>
                  <td>
                    <div className="token-info">
                      {token.logo && (
                        <img src={token.logo} alt={token.symbol} className="token-logo" />
                      )}
                      <span>{token.name}</span>
                    </div>
                  </td>
                  <td>{token.symbol}</td>
                  <td>
                    <div className="contract-address">
                      <span className="address-text">
                        {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                      </span>
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(token.token_address)}
                        title="Copy contract address"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>{token.tokenBalance ? token.tokenBalance.toFixed(4) : "0"}</td>
                  <td>${token.tokenPrice ? token.tokenPrice.toFixed(6) : "0.000000"}</td>
                  <td className="usd-value">${token.usdValue ? token.usdValue.toFixed(2) : "0.00"}</td>
                  <td>
                    <span className={token.verified_contract ? "verified" : "unverified"}>
                      {token.verified_contract ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>
                  <td>{token.security_score || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Scanner;
