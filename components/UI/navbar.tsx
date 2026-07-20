import Link from "next/link";
import React, { useEffect, useState, type FunctionComponent } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import TwitterIcon from "./iconsComponents/icons/twitterIcon";
import DiscordIcon from "./iconsComponents/icons/discordIcon";
import GitHubIcon2 from "./iconsComponents/icons/githubIcon2";
import styles from "../../styles/components/navbar.module.css";
import connectStyles from "../../styles/components/walletConnect.module.css";
import Button from "./button";
import {
  type Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "@starknet-react/core";
import ModalMessage from "./modalMessage";
import { CircularProgress, useMediaQuery } from "@mui/material";
import ModalWallet from "./modalWallet";
import { useTheme } from "@mui/material/styles";
import ProfilFilledIcon from "./iconsComponents/icons/profilFilledIcon";
import DesktopNav from "./desktopNav";
import CloseFilledIcon from "./iconsComponents/icons/closeFilledIcon";
import WalletConnect from "./walletConnect";
import ArrowDownIcon from "./iconsComponents/icons/arrowDownIcon";
import errorLottie from "../../public/visuals/errorLottie.json";
import { useRouter } from "next/router";
import { IdentityAvatar } from "@/components/IdentityAvatar";
import { readMainId, readReverseDomain } from "@/lib/chain/contracts";
import { SN_MAIN } from "@/lib/chain/manifest";
import { shortAddress } from "@/lib/core/address";

const Navbar: FunctionComponent = () => {
  const theme = useTheme();
  const [nav, setNav] = useState<boolean>(false);
  const [desktopNav, setDesktopNav] = useState<boolean>(false);
  const { address, chainId, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const isMobile = useMediaQuery("(max-width:425px)");
  const [domain, setDomain] = useState("");
  const [mainIdentityId, setMainIdentityId] = useState("");
  const domainOrAddress = domain || (address ? shortAddress(address) : "");
  const [txLoading, setTxLoading] = useState<number>(0);
  const [showWallet, setShowWallet] = useState<boolean>(false);
  const [showWalletConnectModal, setShowWalletConnectModal] =
    useState<boolean>(false);
  const [wrongNetworkDismissed, setWrongNetworkDismissed] = useState(false);
  const router = useRouter();
  const { switchChainAsync } = useSwitchChain({
    params: { chainId: SN_MAIN.chainId },
  });
  const isWrongNetwork = Boolean(isConnected && chainId !== BigInt(SN_MAIN.chainId));
  const [lastConnector, setLastConnector] = useState<Connector | null>(null);

  useEffect(() => {
    const pageName = router.pathname.split("/")[1];
    if (pageName !== "register") return;
    if (isMobile) setShowWalletConnectModal(true);
  }, [isMobile, router.pathname]);

  useEffect(() => {
    let cancelled = false;
    if (!address || isWrongNetwork) {
      setDomain("");
      setMainIdentityId("");
      return;
    }
    Promise.all([readReverseDomain(address), readMainId(address)])
      .then(([nextDomain, nextMainId]) => {
        if (cancelled) return;
        setDomain(nextDomain);
        setMainIdentityId(nextMainId === "0" ? "" : nextMainId);
      })
      .catch(() => {
        if (cancelled) return;
        setDomain("");
        setMainIdentityId("");
      });
    return () => {
      cancelled = true;
    };
  }, [address, isWrongNetwork]);

  const connectWallet = async (connector: Connector) => {
    try {
      await connectAsync({ connector });
      localStorage.setItem("SID-connectedWallet", connector.id);
      localStorage.setItem("SID-lastUsedConnector", connector.id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const lastConnectorId = localStorage.getItem("SID-lastUsedConnector");
    const savedConnector = connectors.find(
      (candidate) =>
        candidate.id === lastConnectorId && candidate.available()
    );
    setLastConnector(savedConnector ?? null);
  }, [connectors, isConnected]);

  useEffect(() => {
    setWrongNetworkDismissed(false);
  }, [chainId]);

  function disconnectByClick(): void {
    disconnect();
    setShowWallet(false);
    localStorage.removeItem("SID-connectedWallet");
  }

  function handleNav(): void {
    setNav(!nav);
  }

  function handleDesktopNav(): void {
    setDesktopNav(!desktopNav);
  }

  function onTopButtonClick(): void {
    if (!isConnected) {
      setShowWalletConnectModal(true);
    } else {
      setShowWallet(true);
    }
  }

  function topButtonText(): string | undefined {
    return isConnected ? domainOrAddress : "connect wallet";
  }

  const switchNetwork = async () => {
    try {
      await switchChainAsync();
    } catch (error) {
      console.error(error);
      disconnectByClick();
    }
  };

  return (
    <>
      <div className={"fixed w-full z-20 bg-background-nav top-0"}>
        <div className={styles.navbarContainer}>
          <div className="ml-4 ">
            <Link href="/" className="cursor-pointer flex gap-2 items-center">
              <img
                className={styles.starknetIdLogo}
                src="/visuals/MbLogo.svg"
                alt="Starknet.id Logo"
                width={isMobile ? 40 : 40}
                height={isMobile ? 40 : 90}
              />
              <p
                className={`${
                  styles.starknetId
                } text-[#454545] text-lg  tracking-wide whitespace-nowrap text-nowrap leading-10 font-quickZap ${
                  isMobile ? "hidden" : "block"
                }`}
              >
                StarkNet ID
              </p>
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex gap-1 items-center">
              <Link href="/identities">
                <li className={styles.menuItem}>My Identities</li>
              </Link>
              <Link href="/">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              <div
                onClick={handleDesktopNav}
                className={styles.menuBurger}
                aria-expanded={nav}
                id="burger"
              >
                <AiOutlineMenu color={theme.palette.secondary.main} size={25} />
                {desktopNav ? <DesktopNav close={handleDesktopNav} /> : null}
              </div>
              <div className="text-beige mx-5">
                <Button
                  onClick={
                    isConnected
                      ? () => setShowWallet(true)
                      : lastConnector
                      ? () => void connectWallet(lastConnector)
                      : () => setShowWalletConnectModal(true)
                  }
                  variation={isConnected ? "white" : "primary"}
                  radius="8px"
                >
                  {isConnected ? (
                    <>
                      {txLoading > 0 ? (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{txLoading} on hold</p>
                          <CircularProgress
                            sx={{ color: theme.palette.secondary.main }}
                            size={25}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{domainOrAddress}</p>
                          {mainIdentityId ? (
                            <IdentityAvatar tokenId={mainIdentityId} size={32} />
                          ) : (
                            <ProfilFilledIcon
                              width="24"
                              color={theme.palette.secondary.main}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={connectStyles.connectBtn}>
                      {lastConnector ? (
                        <img
                          src="/braavos/braavosLogo.svg"
                          className={connectStyles.btnIcon}
                          alt="Braavos logo"
                        />
                      ) : null}
                      <p>connect</p>
                      {lastConnector ? (
                        <div
                          className={connectStyles.arrowDown}
                          onClick={(event) => {
                            setShowWalletConnectModal(true);
                            event.stopPropagation();
                          }}
                        >
                          <ArrowDownIcon
                            width="18"
                            color="#FFF"
                            className={connectStyles.arrowDownIcon}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="lg:hidden">
              <AiOutlineMenu
                color={theme.palette.secondary.main}
                size={25}
                className="mr-3"
              />
            </div>
          </div>
        </div>
        <div
          className={
            nav
              ? "lg:hidden fixed left-0 top-0 w-full h-screen bg-black/10 z-10"
              : ""
          }
        >
          <div
            style={{ display: nav ? undefined : "none" }}
            className={`fixed left-0 top-0 w-full sm:w-[60%] lg:w-[45%] h-screen bg-[#FCFFFE] px-5 ease-in flex justify-between flex-col overflow-auto
              ${nav ? styles.mobileNavbarShown : styles.mobileNavbarHidden}`}
          >
            <div className="h-full flex flex-col">
              <div className={styles.mobileNavBarHeader}>
                <div className="flex gap-2 items-center">
                  <Link href="/" className="cursor-pointer">
                    <img
                      className={styles.starknetIdLogo}
                      src="/visuals/MbLogo.svg"
                      alt="Starknet.id Logo"
                      width={35}
                      height={30}
                    />
                  </Link>
                  <p
                    className={`${
                      styles.starknetId
                    } text-[#454545] text-lg  tracking-wide whitespace-nowrap text-nowrap leading-10 font-quickZap ${
                      isMobile ? "hidden" : "block"
                    }`}
                  >
                    StarkNet ID
                  </p>
                </div>

                <div
                  onClick={handleNav}
                  className="cursor-pointer p-1 rounded-full"
                >
                  <CloseFilledIcon
                    width="32"
                    color={theme.palette.background.default}
                  />
                </div>
              </div>
              <div className="py-4 my-auto text-center font-extrabold">
                <div>
                  <ul className="uppercase">
                    <Link href="/identities">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        My Identities
                      </li>
                    </Link>
                    <Link href="/">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Domains
                      </li>
                    </Link>
                    <Link href="https://www.starknet.id" target="_blank">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Website
                      </li>
                    </Link>
                    <Link href="https://docs.starknet.id/" target="_blank">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Documentation
                      </li>
                    </Link>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center my-4 w-full">
              <div className="text-background">
                <Button className="!text-lg" onClick={onTopButtonClick}>
                  {topButtonText()}
                </Button>
              </div>
              <div className="flex">
                <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
                  <Link href="https://twitter.com/Starknet_id" target="_blank">
                    <TwitterIcon width="28" color="black" />{" "}
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
                  <Link
                    href="https://discord.com/invite/8uS2Mgcsza"
                    target="_blank"
                  >
                    <DiscordIcon width="28" color="#5865F2" />
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-4">
                  <Link href="https://github.com/lfglabs-dev" target="_blank">
                    <GitHubIcon2 width="28" color="black" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalMessage
        open={isWrongNetwork && !wrongNetworkDismissed}
        title={"Wrong network"}
        closeModal={() => setWrongNetworkDismissed(true)}
        message={
          <div className="mt-3 flex flex-col items-center justify-center text-center mx-3">
            <p>
              This app only supports Starknet mainnet, you have to change your
              network to be able use it.
            </p>
            <div className="mt-5">
              <Button onClick={() => void switchNetwork()}>
                Switch to mainnet
              </Button>
            </div>
          </div>
        }
        lottie={errorLottie}
      />
      <ModalWallet
        address={address}
        domain={domainOrAddress}
        open={showWallet}
        closeModal={() => setShowWallet(false)}
        disconnectByClick={disconnectByClick}
        setTxLoading={setTxLoading}
      />
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors}
        connectWallet={(connector) => void connectWallet(connector)}
      />
    </>
  );
};

export default Navbar;
