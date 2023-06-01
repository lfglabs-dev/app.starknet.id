import Link from "next/link";
import React, { useState, useEffect, FunctionComponent } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa";
import styles from "../../styles/components/navbar.module.css";
import Button from "./button";
import { useConnectors, useAccount, useStarknet } from "@starknet-react/core";
import Wallets from "./wallets";
import LogoutIcon from "@mui/icons-material/Logout";
import SelectNetwork from "./selectNetwork";
import ModalMessage from "./modalMessage";
import { useDisplayName } from "../../hooks/displayName.tsx";

const Navbar: FunctionComponent = () => {
  const [nav, setNav] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const { address } = useAccount();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const { available, connect, disconnect } = useConnectors();
  const { library } = useStarknet();
  const domainOrAddress = useDisplayName(address ?? "");
  const green = "#19AA6E";
  const brown = "#402d28";
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";

  function disconnectByClick(): void {
    disconnect();
    setIsConnected(false);
    setIsWrongNetwork(false);
    setHasWallet(false);
  }

  useEffect(() => {
    // to handle autoconnect starknet-react adds connector id in local storage
    // if there is no value stored, we show the wallet modal
    if (!localStorage.getItem("lastUsedConnector")) setHasWallet(true);
  }, []);

  useEffect(() => {
    address ? setIsConnected(true) : setIsConnected(false);
  }, [address]);

  useEffect(() => {
    if (!isConnected) return;

    const STARKNET_NETWORK = {
      mainnet: "0x534e5f4d41494e",
      testnet: "0x534e5f474f45524c49",
    };

    if (library.chainId === STARKNET_NETWORK.testnet && network === "mainnet") {
      setIsWrongNetwork(true);
    } else if (
      library.chainId === STARKNET_NETWORK.mainnet &&
      network === "testnet"
    ) {
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, [library, network, isConnected]);

  function handleNav(): void {
    setNav(!nav);
  }

  function onTopButtonClick(): void {
    if (!isConnected) {
      if (available.length > 0) {
        if (available.length === 1) {
          connect(available[0]);
        } else {
          setHasWallet(true);
        }
      } else {
        setHasWallet(true);
      }
    } else {
      disconnectByClick();
    }
  }

  function topButtonText(): string | undefined {
    const textToReturn = isConnected ? domainOrAddress : "connect";

    return textToReturn;
  }

  return (
    <>
      <div className={"fixed w-full z-[1] bg-beige"}>
        <div className={styles.navbarContainer}>
          <div className="ml-4">
            <Link href="/" className="cursor-pointer">
              <img
                className="cursor-pointer"
                src="/visuals/StarknetIdLogo.svg"
                alt="Starknet.id Logo"
                width={90}
                height={90}
              />
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex uppercase items-center">
              <Link href="/identities">
                <li className={styles.menuItem}>Identities</li>
              </Link>
              <Link href="/">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              {/* <Link href="/jointhetribe">
                <li className={styles.menuItem}>Join the tribe</li>
              </Link> */}
              <Link href="https://twitter.com/starknet_id">
                <li className="ml-10 mr-5 text-sm uppercase cursor-pointer">
                  <FaTwitter color={green} size={"30px"} />
                </li>
              </Link>
              <SelectNetwork network={network} />
              <div className="text-beige mr-5">
                <Button
                  onClick={
                    isConnected
                      ? () => disconnectByClick()
                      : available.length === 1
                      ? () => connect(available[0])
                      : () => setHasWallet(true)
                  }
                >
                  {isConnected ? (
                    <div className="flex justify-center items-center">
                      <div>{domainOrAddress}</div>
                      <LogoutIcon className="ml-3" />
                    </div>
                  ) : (
                    "connect"
                  )}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="lg:hidden">
              <AiOutlineMenu color={brown} size={25} className="mr-3" />
            </div>
          </div>
        </div>

        <div
          className={
            nav
              ? "lg:hidden fixed left-0 top-0 w-full h-screen bg-black/10"
              : ""
          }
        >
          <div
            className={
              nav
                ? "fixed left-0 top-0 w-[75%] sm:w-[60%] lg:w-[45%] h-screen bg-beige p-10 ease-in duration-500 flex justify-between flex-col"
                : "fixed left-[-100%] top-0 p-10 ease-in h-screen flex justify-between flex-col"
            }
          >
            <div>
              <div className="flex w-full items-center justify-between">
                <div className="">
                  <Link href="/">
                    <img
                      src="/visuals/starknetIdLongLogo.webp"
                      alt="Starknet.id Logo"
                      width={250}
                      height={100}
                    />
                  </Link>
                </div>

                <div
                  onClick={handleNav}
                  className="rounded-full cursor-pointer"
                >
                  <AiOutlineClose color={brown} />
                </div>
              </div>
              <div className="border-b border-soft-brown-300 my-4">
                <p className="w-[85%] lg:w-[90%] py-4 text-babe-blue">
                  Own your on-chain identity
                </p>
              </div>
              <div className="py-4 flex flex-col">
                <ul className="uppercase text-babe-blue">
                  <Link href="/identities">
                    <li
                      onClick={() => setNav(false)}
                      className={styles.menuItemSmall}
                    >
                      Identities
                    </li>
                  </Link>
                  <Link href="/">
                    <li
                      onClick={() => setNav(false)}
                      className={styles.menuItemSmall}
                    >
                      Domains
                    </li>
                  </Link>
                  {/* <Link href="/jointhetribe">
                    <li
                      onClick={() => setNav(false)}
                      className={styles.menuItemSmall}
                    >
                      Tribe
                    </li>
                  </Link> */}
                </ul>
              </div>
            </div>

            <div>
              <p className="uppercase tracking-widest white">
                Claim your starknet identity
              </p>
              <div className="flex items-center my-4 w-full sm:w-[80%]">
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
                  <Link href="https://twitter.com/Starknet_id">
                    <FaTwitter size={20} color={green} />
                  </Link>
                </div>
                <div className="text-beige">
                  <Button onClick={onTopButtonClick}>{topButtonText()}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalMessage
        open={isWrongNetwork}
        title={"Wrong network"}
        closeModal={() => setIsWrongNetwork(false)}
        message={
          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <p>
              This app only supports Starknet {network}, you have to change your
              network to be able use it.
            </p>
            <div className="mt-3">
              <Button onClick={() => disconnectByClick()}>
                {`Disconnect`}
              </Button>
            </div>
          </div>
        }
      />
      <Wallets
        closeWallet={() => setHasWallet(false)}
        hasWallet={Boolean(hasWallet && !isWrongNetwork)}
      />
    </>
  );
};

export default Navbar;
