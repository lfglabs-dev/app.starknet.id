import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";

const shouldAddOkx = process.env.REACT_APP_ADD_OKX === "true";

export const availableConnectors = [
  new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
  new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
  ...(shouldAddOkx
    ? [new InjectedConnector({ options: { id: "okwwallet", name: "OKX" } })]
    : []),
  new WebWalletConnector({
    url:
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? "https://web.hydrogen.argent47.net"
        : "https://web.argent.xyz/",
  }),
  new ArgentMobileConnector(),
];
