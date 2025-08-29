import { useEffect, useState } from "react";

export default function MobileOnlyWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="p-6 rounded-2xl shadow-lg bg-white text-center">
          <h2 className="text-xl font-semibold mb-2">Mobile Only</h2>
          <p className="text-gray-600">
            Please connect using <b>TrustWallet</b> on your mobile device.  
            Desktop connections are not supported.
          </p>
        </div>
      </div>
    );
  }

  // Allow normal app if mobile
  return children;
}
