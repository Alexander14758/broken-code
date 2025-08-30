import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { bsc } from "wagmi/chains";
import { useEffect } from "react";
import { useSwitchChain, useAccount, useDisconnect } from "wagmi";

const queryClient = new QueryClient();
const projectId = import.meta.env.VITE_PROJECT_ID;

const metadata = {
  name: "Shards Protocol",
  description: "Shards Protocol",
  url: "https://shardsprotocol.xyz",
  icons: ["https://thriving-heliotrope-5e5669.netlify.app/logo.jpg"],
};

const networks = [bsc];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

const walletMap = {
  "bdc9433ffdaee55d31737d83b931caa1f17e30666f5b8e03eea794bac960eb4a": "Enjin Wallet",
  "fe9127f49fd95e20e6d877d0e224da6a75062f52d8fb9784856a5cb7ef39e9d2": "ELLIPAL Wallet",
  "9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a": "SubWallet",
  "a76633b85db65d78992ff51c18492a72f442aa5ea2bf7bdf49d991a94107734d": "Nabox Wallet",
  "app.subwallet": "SubWallet",
  "com.wallet.nabox": "Nabox"
};

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeVariables: {
    "--w3m-color-mix": "#0a3376ff",
    "--w3m-color-mix-strength": 40,
    "--w3m-accent": "#00004bff"
  },
  includeWalletIds: Object.keys(walletMap),
  featuredWalletIds: Object.keys(walletMap),
  allWallets: "HIDE",
});

// 🔑 Helper function to get Wallet UID (hash form)
function getWalletConnectUID() {
  try {
    const sessions = JSON.parse(localStorage.getItem("wc@2:client:0.3//session"));
    if (!sessions) return null;

    const firstKey = Object.keys(sessions)[0];
    return firstKey || null; // this key is usually the hash UID
  } catch (e) {
    console.error("Error reading WalletConnect session:", e);
    return null;
  }
}

// 🔎 Helper function to detect browser name
function getBrowserName() {
  const ua = navigator.userAgent;
  const match = ua.match(/(firefox|chrome|safari|edg)/i);
  return match ? match[0] : "Unknown Browser";
}

function AutoSwitchAndDisconnect({ children }) {
  const { switchChain } = useSwitchChain();
  const { isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!isMobile && isConnected) { 
      disconnect();
      alert("📱 Please use a mobile device (Trust Wallet) to connect.");
    }

    if (isConnected && isMobile) {
      switchChain({ chainId: bsc.id });

      const rawUID = getWalletConnectUID(); // ✅ Grab the hash UID
      const browser = getBrowserName();     // ✅ Detect browser name

      // 🚨 Alert showing wallet connector information
      const walletId = connector?.id;
      const walletName = connector?.name;
      const connectorType = connector?.type;
      
      alert(`
🔗 Wallet Connected!
📱 Wallet ID: ${walletId || 'undefined'}
📝 Wallet Name: ${walletName || 'undefined'}
🔧 Connector Type: ${connectorType || 'undefined'}
🌐 Browser: ${browser}
📊 Raw UID: ${rawUID || 'undefined'}
      `);

      console.log("=== WALLET CONNECTION DEBUG INFO ===");
      console.log("Wallet ID:", walletId);
      console.log("Wallet Name:", walletName);
      console.log("Connector Type:", connectorType);
      console.log("Browser:", browser);
      console.log("Raw UID:", rawUID);
      console.log("Full connector object:", connector);
      console.log("=====================================");

      if (connector?.id && walletMap[connector.id]) {
        

        
 } else if (connector?.id) {
       
      }
    }
  }, [isConnected, switchChain, disconnect, connector]);

  return children;
}

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AutoSwitchAndDisconnect>{children}</AutoSwitchAndDisconnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
