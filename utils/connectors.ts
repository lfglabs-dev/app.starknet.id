import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { getStarknet } from "get-starknet-core";
// import { getStarknet, IStarknetWindowObject } from "get-starknet";

const isTestnet = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

// const isOKXInjected = () => {
//   if (isTestnet) return false;
//   const _wallet = getStarknet();
//   console.log("Wallet", _wallet);
//   _wallet.getAvailableWallets().then((wallets) => {
//     console.log("Wallets", wallets);
//     const test = wallets.filter((wallet) => wallet.name.includes("OKX"));
//     console.log("test", test);
//     if (wallets.filter((wallet) => wallet.name.includes("OKX")).length > 0) {
//       return true;
//     } else {
//       return false;
//     }
//   });
// };

// export const availableConnectors = [
//   new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
//   new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
//   ...(isOKXInjected()
//     ? [new InjectedConnector({ options: { id: "okxwallet", name: "OKX" } })]
//     : []),
//   new WebWalletConnector({
//     url: isTestnet
//       ? "https://web.hydrogen.argent47.net"
//       : "https://web.argent.xyz/",
//   }),
//   new ArgentMobileConnector(),
// ];
