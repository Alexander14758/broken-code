// Mainpage.jsx
import { AppKitProvider } from "../Appkitprovider";
import { useAppKitAccount } from "@reown/appkit/react";

function WalletInfo() {
  const { address, isConnected } = useAppKitAccount();

  return (
    <div className="p-4">
      {isConnected ? (
        <p className="text-green-500">Connected: {address}</p>
      ) : (
        <p className="text-red-500">Not connected</p>
      )}
    </div>
  );
}

export default function Mainpage() {
  return (
    <AppKitProvider>
      <WalletInfo />
    </AppKitProvider>
  );
}
