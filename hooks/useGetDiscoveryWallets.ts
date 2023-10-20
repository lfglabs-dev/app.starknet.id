import { useEffect, useState } from "react";
import { WalletProvider } from "get-starknet-core";
import { getBrowser } from "../utils/browserService";

export default function useGetDiscoveryWallets(
  getDiscoveryWallets: Promise<WalletProvider[]>
) {
  const [argentX, setArgentX] = useState<string>("");
  const [braavos, setBraavos] = useState<string>("");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      getDiscoveryWallets.then((wallets) => {
        const browser = getBrowser(navigator.userAgent);

        wallets.map((wallet) => {
          if (wallet.id === "argentX") {
            setArgentX(
              browser
                ? wallet.downloads[browser as keyof typeof wallet.downloads]
                : "https://www.argent.xyz/argent-x/"
            );
          } else if (wallet.id === "braavos") {
            setBraavos(
              browser
                ? wallet.downloads[browser as keyof typeof wallet.downloads]
                : "https://braavos.app/download-braavos-wallet/"
            );
          }
        });
      });
    }
  }, [getDiscoveryWallets]);

  return { argentX, braavos };
}
