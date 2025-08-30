
import { useEffect } from "react";

function AntiInspect() {
  useEffect(() => {
    // Disable right-click
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Block shortcuts
    document.onkeydown = function(e) {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === "I".charCodeAt(0)) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === "J".charCodeAt(0)) ||
        (e.ctrlKey && e.keyCode === "U".charCodeAt(0))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Console ban detection
    const handler = setInterval(function () {
      const before = new Date();
      debugger;
      if (new Date() - before > 100) {
        document.body.innerHTML =
          "<h1 style='color:yellow;text-align:center;margin-top:20%'>You can’t be sad when you’re holding cake.😊🍰</h1>";
        clearInterval(handler);
      }
    }, 1000);

    return () => {
      // Cleanup on unmount
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
      document.onkeydown = null;
      clearInterval(handler);
    };
  }, []);

  return null; // This runs in background
}

export default AntiInspect;
