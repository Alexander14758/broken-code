// AppKitProvider.jsx
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
  includeWalletIds: [
     "bdc9433ffdaee55d31737d83b931caa1f17e30666f5b8e03eea794bac960eb4a", // Enjin Wallet
     "9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a", //sub wallet
     "fe9127f49fd95e20e6d877d0e224da6a75062f52d8fb9784856a5cb7ef39e9d2", // ELLIPAL wallet 
     "a76633b85db65d78992ff51c18492a72f442aa5ea2bf7bdf49d991a94107734d", // nabox wallet
  ],
  featuredWalletIds: [
    "bdc9433ffdaee55d31737d83b931caa1f17e30666f5b8e03eea794bac960eb4a", // Enjin Wallet
     "9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a", //sub wallet
     "fe9127f49fd95e20e6d877d0e224da6a75062f52d8fb9784856a5cb7ef39e9d2", // ELLIPAL wallet 
     "a76633b85db65d78992ff51c18492a72f442aa5ea2bf7bdf49d991a94107734d", // nabox wallet
],
  allWallets: "SHOW",
});

function AutoSwitchAndDisconnect({ children }) {
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!isMobile && isConnected) {
      disconnect();
      alert("📱 Please use a mobile device (Trust Wallet) to connect.");
    }

    if (isConnected && isMobile) {
      switchChain({ chainId: bsc.id });
    }
  }, [isConnected, switchChain, disconnect]);

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
