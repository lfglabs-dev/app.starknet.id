import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";

const isTestnet = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export const availableConnectors = [
  new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
  new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
  ...(!isTestnet
    ? [new InjectedConnector({ options: { id: "okxwallet", name: "OKX" } })]
    : []),
  new WebWalletConnector({
    url: isTestnet
      ? "https://web.hydrogen.argent47.net"
      : "https://web.argent.xyz/",
  }),
  new ArgentMobileConnector(),
];
