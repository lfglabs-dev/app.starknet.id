import { Connector, StarknetWindowObject } from "starknetkit";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { getBrowser } from "./browserService";
import { constants } from "starknet";

export const getConnectors = () => {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
    new InjectedConnector({ options: { id: "okxwallet" } }),
    new InjectedConnector({ options: { id: "bitkeep" } }),
    ArgentMobileConnector.init({
      options: {
        dappName: "Starknet ID",
        url: process.env.NEXT_PUBLIC_APP_LINK as string,
        chainId: constants.NetworkName.SN_MAIN,
        icons: ["https://app.starknet.id/visuals/StarknetIdLogo.svg"],
      },
    }),
    new InjectedConnector({ options: { id: "keplr" } }),
    new WebWalletConnector({
      url: "https://web.argent.xyz/",
    }),
  ];

  return connectors;
};

export const sortConnectors = (connectors: Connector[]) => {
  const available: Connector[] = [];
  const notAvailable: Connector[] = [];
  connectors.forEach((connector) => {
    if (connector.available()) available.push(connector);
    else notAvailable.push(connector);
  });

  return available.concat(notAvailable);
};

export const getConnectorIcon = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id);
  if (walletData) {
    return walletData.icon;
  }
  return id;
};

export const getConnectorName = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id);
  if (walletData) {
    return walletData.name;
  }
  return id;
};

export const getConnectorDiscovery = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id);

  if (!walletData || !walletData.website)
    return "https://www.starknet-ecosystem.com"; // if no website is found, return the ecosystem website

  if (walletData.downloads && typeof navigator !== "undefined") {
    const browser = getBrowser(navigator.userAgent);
    return (
      walletData.downloads[browser as keyof typeof walletData.downloads] ??
      walletData.website
    );
  }

  return walletData.website;
};

export const getLastConnector = (): Connector | null => {
  if (localStorage.getItem("SID-lastUsedConnector")) {
    const connectordId = localStorage.getItem("SID-lastUsedConnector");
    const connector = getConnectors().find((item) => item.id === connectordId);
    return connector || null;
  }
  return null;
};

export const getLastConnected = (): Connector | null => {
  if (localStorage.getItem("SID-connectedWallet")) {
    const connectordId = localStorage.getItem("SID-connectedWallet");
    const connector = getConnectors().find((item) => item.id === connectordId);
    return connector || null;
  }
  return null;
};

export const isInArgentMobileAppBrowser = (): boolean => {
  if (typeof window === "undefined" || !window?.starknet_argentX) {
    return false;
  }

  const starknetMobile =
    window?.starknet_argentX as unknown as StarknetWindowObject & {
      isInAppBrowser: boolean;
    };

  return starknetMobile?.isInAppBrowser;
};

const wallets = [
  {
    id: "argentX",
    name: "Argent X",
    icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE4LjQwMTggNy41NTU1NkgxMy41OTgyQzEzLjQzNzcgNy41NTU1NiAxMy4zMDkxIDcuNjg3NDcgMTMuMzA1NiA3Ljg1MTQzQzEzLjIwODUgMTIuNDYwMyAxMC44NDg0IDE2LjgzNDcgNi43ODYwOCAxOS45MzMxQzYuNjU3MTEgMjAuMDMxNCA2LjYyNzczIDIwLjIxNjIgNi43MjIwMiAyMC4zNDkzTDkuNTMyNTMgMjQuMzE5NkM5LjYyODE1IDI0LjQ1NDggOS44MTQ0NCAyNC40ODUzIDkuOTQ1NTggMjQuMzg2QzEyLjQ4NTYgMjIuNDYxMyAxNC41Mjg3IDIwLjEzOTUgMTYgMTcuNTY2QzE3LjQ3MTMgMjAuMTM5NSAxOS41MTQ1IDIyLjQ2MTMgMjIuMDU0NSAyNC4zODZDMjIuMTg1NiAyNC40ODUzIDIyLjM3MTkgMjQuNDU0OCAyMi40Njc2IDI0LjMxOTZMMjUuMjc4MSAyMC4zNDkzQzI1LjM3MjMgMjAuMjE2MiAyNS4zNDI5IDIwLjAzMTQgMjUuMjE0IDE5LjkzMzFDMjEuMTUxNiAxNi44MzQ3IDE4Ljc5MTUgMTIuNDYwMyAxOC42OTQ2IDcuODUxNDNDMTguNjkxMSA3LjY4NzQ3IDE4LjU2MjMgNy41NTU1NiAxOC40MDE4IDcuNTU1NTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNzIzNiAxMC40OTJMMjQuMjIzMSA4LjkyNDM5QzI0LjEyMTMgOC42MDYxNCAyMy44NzM0IDguMzU4MjQgMjMuNTU3NyA4LjI2MDIzTDIyLjAwMzkgNy43NzU5NUMyMS43ODk1IDcuNzA5MDYgMjEuNzg3MyA3LjQwMTc3IDIyLjAwMTEgNy4zMzIwMUwyMy41NDY5IDYuODI0NjZDMjMuODYwOSA2LjcyMTQ2IDI0LjEwNiA2LjQ2OTUyIDI0LjIwMjcgNi4xNTAxMUwyNC42Nzk4IDQuNTc1MDJDMjQuNzQ1OCA0LjM1NzA5IDI1LjA0ODkgNC4zNTQ3NyAyNS4xMTgzIDQuNTcxNTZMMjUuNjE4OCA2LjEzOTE1QzI1LjcyMDYgNi40NTc0IDI1Ljk2ODYgNi43MDUzMSAyNi4yODQyIDYuODAzOUwyNy44MzggNy4yODc2MUMyOC4wNTI0IDcuMzU0NSAyOC4wNTQ3IDcuNjYxNzkgMjcuODQwOCA3LjczMjEzTDI2LjI5NSA4LjIzOTQ4QzI1Ljk4MTEgOC4zNDIxIDI1LjczNiA4LjU5NDA0IDI1LjYzOTMgOC45MTQwMkwyNS4xNjIxIDEwLjQ4ODVDMjUuMDk2MSAxMC43MDY1IDI0Ljc5MyAxMC43MDg4IDI0LjcyMzYgMTAuNDkyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==`,
    downloads: {
      chrome:
        "https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/argent-x",
      edge: "https://microsoftedge.microsoft.com/addons/detail/argent-x/ajcicjlkibolbeaaagejfhnofogocgcj",
    },
    website: "https://www.argent.xyz/argent-x/",
  },
  {
    id: "argentMobile",
    name: "Argent (mobile)",
    icon: "data:image/svg+xml;base64,PHN2ZwogICAgd2lkdGg9IjMyIgogICAgaGVpZ2h0PSIzMiIKICAgIHZpZXdCb3g9IjAgMCAzMiAzMiIKICAgIGZpbGw9Im5vbmUiCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgPgogICAgPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0ZGODc1QiIgLz4KICAgIDxwYXRoCiAgICAgIGQ9Ik0xOC4zMTYgOEgxMy42ODRDMTMuNTI5MiA4IDEzLjQwNTIgOC4xMjcyIDEzLjQwMTggOC4yODUzMUMxMy4zMDgyIDEyLjcyOTYgMTEuMDMyMyAxNi45NDc3IDcuMTE1MTMgMTkuOTM1NUM2Ljk5MDc3IDIwLjAzMDMgNi45NjI0MyAyMC4yMDg1IDcuMDUzMzUgMjAuMzM2OUw5Ljc2MzQ5IDI0LjE2NTRDOS44NTU2OSAyNC4yOTU3IDEwLjAzNTMgMjQuMzI1MSAxMC4xNjE4IDI0LjIyOTRDMTIuNjExMSAyMi4zNzM0IDE0LjU4MTIgMjAuMTM0NSAxNiAxNy42NTI5QzE3LjQxODcgMjAuMTM0NSAxOS4zODkgMjIuMzczNCAyMS44MzgzIDI0LjIyOTRDMjEuOTY0NiAyNC4zMjUxIDIyLjE0NDMgMjQuMjk1NyAyMi4yMzY2IDI0LjE2NTRMMjQuOTQ2NyAyMC4zMzY5QzI1LjAzNzUgMjAuMjA4NSAyNS4wMDkyIDIwLjAzMDMgMjQuODg1IDE5LjkzNTVDMjAuOTY3NiAxNi45NDc3IDE4LjY5MTggMTIuNzI5NiAxOC41OTgzIDguMjg1MzFDMTguNTk0OSA4LjEyNzIgMTguNDcwOCA4IDE4LjMxNiA4WiIKICAgICAgZmlsbD0id2hpdGUiCiAgICAvPgogIDwvc3ZnPg==",
    website: "https://www.argent.xyz/argent-x/",
  },
  {
    id: "argentWebWallet",
    name: "Email",
    icon: "data:image/svg+xml;base64,PHN2Zwp3aWR0aD0iMzIiCmhlaWdodD0iMjgiCnZpZXdCb3g9IjAgMCAxOCAxNCIKZmlsbD0ibm9uZSIKeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgo+CjxwYXRoCiAgZmlsbC1ydWxlPSJldmVub2RkIgogIGNsaXAtcnVsZT0iZXZlbm9kZCIKICBkPSJNMS41IDAuNDM3NUMwLjk4MjIzMyAwLjQzNzUgMC41NjI1IDAuODU3MjMzIDAuNTYyNSAxLjM3NVYxMkMwLjU2MjUgMTIuNDE0NCAwLjcyNzEyIDEyLjgxMTggMS4wMjAxNSAxMy4xMDQ5QzEuMzEzMTcgMTMuMzk3OSAxLjcxMDYgMTMuNTYyNSAyLjEyNSAxMy41NjI1SDE1Ljg3NUMxNi4yODk0IDEzLjU2MjUgMTYuNjg2OCAxMy4zOTc5IDE2Ljk3OTkgMTMuMTA0OUMxNy4yNzI5IDEyLjgxMTggMTcuNDM3NSAxMi40MTQ0IDE3LjQzNzUgMTJWMS4zNzVDMTcuNDM3NSAwLjg1NzIzMyAxNy4wMTc4IDAuNDM3NSAxNi41IDAuNDM3NUgxLjVaTTIuNDM3NSAzLjUwNjE2VjExLjY4NzVIMTUuNTYyNVYzLjUwNjE2TDkuNjMzNDkgOC45NDEwOEM5LjI3NTA3IDkuMjY5NjQgOC43MjQ5MyA5LjI2OTY0IDguMzY2NTEgOC45NDEwOEwyLjQzNzUgMy41MDYxNlpNMTQuMDg5OSAyLjMxMjVIMy45MTAxM0w5IDYuOTc4MjJMMTQuMDg5OSAyLjMxMjVaIgogIGZpbGw9ImN1cnJlbnRDb2xvciIKLz4KPC9zdmc+",
    website: "https://www.argent.xyz/argent-x/",
  },
  {
    id: "braavos",
    name: "Braavos",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aAogICAgICAgIGQ9Ik02Mi43MDUgMTMuOTExNkM2Mi44MzU5IDE0LjEzMzMgNjIuNjYyMSAxNC40MDcgNjIuNDAzOSAxNC40MDdDNTcuMTgwNyAxNC40MDcgNTIuOTM0OCAxOC41NDI3IDUyLjgzNTEgMjMuNjgxN0M1MS4wNDY1IDIzLjM0NzcgNDkuMTkzMyAyMy4zMjI2IDQ3LjM2MjYgMjMuNjMxMUM0Ny4yMzYxIDE4LjUxNTYgNDMuMDAwOSAxNC40MDcgMzcuNzk0OCAxNC40MDdDMzcuNTM2NSAxNC40MDcgMzcuMzYyNSAxNC4xMzMxIDM3LjQ5MzUgMTMuOTExMkM0MC4wMjE3IDkuNjI4MDkgNDQuNzIwNCA2Ljc1IDUwLjA5OTEgNi43NUM1NS40NzgxIDYuNzUgNjAuMTc2OSA5LjYyODI2IDYyLjcwNSAxMy45MTE2WiIKICAgICAgICBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMzcyXzQwMjU5KSIgLz4KICAgIDxwYXRoCiAgICAgICAgZD0iTTc4Ljc2MDYgNDUuODcxOEM4MC4yNzI1IDQ2LjMyOTcgODEuNzAyNSA0NS4wMDU1IDgxLjE3MTQgNDMuNTIyMkM3Ni40MTM3IDMwLjIzMzQgNjEuMzkxMSAyNC44MDM5IDUwLjAyNzcgMjQuODAzOUMzOC42NDQyIDI0LjgwMzkgMjMuMjg2OCAzMC40MDcgMTguODc1NCA0My41OTEyQzE4LjM4MjQgNDUuMDY0NSAxOS44MDgzIDQ2LjM0NDYgMjEuMjk3OCA0NS44ODgxTDQ4Ljg3MiAzNy40MzgxQzQ5LjUzMzEgMzcuMjM1NSA1MC4yMzk5IDM3LjIzNDQgNTAuOTAxNyAzNy40MzQ4TDc4Ljc2MDYgNDUuODcxOFoiCiAgICAgICAgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzM3Ml80MDI1OSkiIC8+CiAgICA8cGF0aAogICAgICAgIGQ9Ik0xOC44MTMyIDQ4LjE3MDdMNDguODkzNSAzOS4wNDcyQzQ5LjU1MDYgMzguODQ3OCA1MC4yNTI0IDM4Ljg0NzMgNTAuOTA5OCAzOS4wNDU2TDgxLjE3ODEgNDguMTc1MkM4My42OTEyIDQ4LjkzMzIgODUuNDExIDUxLjI0ODMgODUuNDExIDUzLjg3MzVWODEuMjIzM0M4NS4yOTQ0IDg3Ljg5OTEgNzkuMjk3NyA5My4yNSA3Mi42MjQ1IDkzLjI1SDYxLjU0MDZDNjAuNDQ0OSA5My4yNSA1OS41NTc3IDkyLjM2MzcgNTkuNTU3NyA5MS4yNjhWODEuNjc4OUM1OS41NTc3IDc3LjkwMzEgNjEuNzkyMSA3NC40ODU1IDY1LjI0OTggNzIuOTcyOUM2OS44ODQ5IDcwLjk0NTQgNzUuMzY4MSA2OC4yMDI4IDc2LjM5OTQgNjIuNjk5MkM3Ni43MzIzIDYwLjkyMjkgNzUuNTc0MSA1OS4yMDk0IDczLjgwMjQgNTguODU3M0M2OS4zMjI2IDU3Ljk2NjcgNjQuMzU2MiA1OC4zMTA3IDYwLjE1NjQgNjAuMTg5M0M1NS4zODg3IDYyLjMyMTkgNTQuMTQxNSA2NS44Njk0IDUzLjY3OTcgNzAuNjMzN0w1My4xMjAxIDc1Ljc2NjJDNTIuOTQ5MSA3Ny4zMzQ5IDUxLjQ3ODUgNzguNTM2NiA0OS45MDE0IDc4LjUzNjZDNDguMjY5OSA3OC41MzY2IDQ3LjA0NjUgNzcuMjk0IDQ2Ljg2OTYgNzUuNjcxMkw0Ni4zMjA0IDcwLjYzMzdDNDUuOTI0OSA2Ni41NTI5IDQ1LjIwNzkgNjIuNTg4NyA0MC45ODk1IDYwLjcwMThDMzYuMTc3NiA1OC41NDk0IDMxLjM0MTkgNTcuODM0NyAyNi4xOTc2IDU4Ljg1NzNDMjQuNDI2IDU5LjIwOTQgMjMuMjY3OCA2MC45MjI5IDIzLjYwMDcgNjIuNjk5MkMyNC42NDEgNjguMjUwNyAzMC4wODEyIDcwLjkzMDUgMzQuNzUwMyA3Mi45NzI5QzM4LjIwOCA3NC40ODU1IDQwLjQ0MjQgNzcuOTAzMSA0MC40NDI0IDgxLjY3ODlWOTEuMjY2M0M0MC40NDI0IDkyLjM2MiAzOS41NTU1IDkzLjI1IDM4LjQ1OTkgOTMuMjVIMjcuMzc1NkMyMC43MDI0IDkzLjI1IDE0LjcwNTcgODcuODk5MSAxNC41ODkxIDgxLjIyMzNWNTMuODY2M0MxNC41ODkxIDUxLjI0NDYgMTYuMzA0NSA0OC45MzE2IDE4LjgxMzIgNDguMTcwN1oiCiAgICAgICAgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzM3Ml80MDI1OSkiIC8+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzcyXzQwMjU5IiB4MT0iNDkuMzA1NyIgeTE9IjIuMDc5IiB4Mj0iODAuMzYyNyIgeTI9IjkzLjY1OTciCiAgICAgICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIgLz4KICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY5NjAwIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzM3Ml80MDI1OSIgeDE9IjQ5LjMwNTciIHkxPSIyLjA3OSIgeDI9IjgwLjM2MjciIHkyPSI5My42NTk3IgogICAgICAgICAgICBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNUQ0NUUiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGOTYwMCIgLz4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8zNzJfNDAyNTkiIHgxPSI0OS4zMDU3IiB5MT0iMi4wNzkiIHgyPSI4MC4zNjI3IiB5Mj0iOTMuNjU5NyIKICAgICAgICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjVENDVFIiAvPgogICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KPC9zdmc+",
    downloads: {
      chrome:
        "https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/braavos-wallet",
      edge: "https://microsoftedge.microsoft.com/addons/detail/braavos-wallet/hkkpjehhcnhgefhbdcgfkeegglpjchdc",
    },
    website: "https://braavos.app/",
  },
  {
    id: "bitkeep",
    name: "Bitget Wallet",
    icon: "data:image/png;base64,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",
    downloads: {
      chrome:
        "https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak",
    },
    website: "https://web3.bitget.com/",
  },
  {
    id: "okxwallet",
    name: "OKX Wallet",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
    downloads: {
      chrome:
        "https://chrome.google.com/webstore/detail/mcohilncbfahbmgdjkbpemcciiolgcge",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/okexwallet",
      edge: "https://microsoftedge.microsoft.com/addons/detail/%E6%AC%A7%E6%98%93-web3-%E9%92%B1%E5%8C%85/pbpjkcldjiffchgbbndmhojiacbgflha",
      safari: "https://apps.apple.com/us/app/okx-wallet/id6463797825",
    },
    website: "https://www.okx.com/",
  },
  {
    id: "keplr",
    name: "Keplr Wallet",
    icon: "/visuals/kepler_logo.svg",
    downloads: {
      chrome:
        "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/keplr/",
      edge: "https://microsoftedge.microsoft.com/addons/detail/keplr/ocodgmmffbkkeecmadcijjhkmeohinei",
    },
    website: "https://www.keplr.app/",
  },
];
