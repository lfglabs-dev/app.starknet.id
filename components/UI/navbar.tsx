/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, FunctionComponent, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa";
import styles from "../../styles/components/navbar.module.css";
import Button from "./button";
import { useConnectors, useAccount } from "@starknet-react/core";
import Wallets from "./wallets";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUpdatedDomainFromAddress } from "../../hooks/naming";
import SelectNetwork from "./selectNetwork";
import { minifyAddressOrDomain } from "../../utils/stringService";

const Navbar: FunctionComponent = () => {
  const [nav, setNav] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const { address } = useAccount();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDisconnectedOnClick, setIsDisconnectedOnClick] =
    useState<boolean>(false);
  const green = "#19AA6E";
  const brown = "#402d28";
  const { available, connect, disconnect } = useConnectors();

  const domain = useUpdatedDomainFromAddress(address);

  function disconnectByClick(): void {
    disconnect();
    setIsDisconnectedOnClick(true);
  }

  useEffect(() => {
    address ? setIsConnected(true) : setIsConnected(false);
  }, [address]);

  useEffect(() => {
    if (!isDisconnectedOnClick && !isConnected) {
      available.length === 1 ? connect(available[0]) : setHasWallet(true);
    }
  }, [isConnected]);

  const handleNav = () => {
    setNav(!nav);
  };

  function onTopButtonClick(): void {
    if (available.length > 0) {
      if (available.length === 1) {
        connect(available[0]);
      } else {
        setHasWallet(true);
      }
    } else {
      setHasWallet(true);
    }
  }

  function topButtonText(): string | undefined {
    const textToReturn = isConnected
      ? minifyAddressOrDomain(domain ? domain : address ?? "", 8)
      : "connect";

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
                src="/visuals/StarknetIdLogo.png"
                alt="Starknet.id Logo"
                width={90}
                height={90}
              />
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex uppercase items-center">
              <Link href="/">
                <li className={styles.menuItem}>Identities</li>
              </Link>
              <Link href="/domains">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              <Link href="https://twitter.com/starknet_id">
                <li className="ml-10 mr-5 text-sm uppercase cursor-pointer">
                  <FaTwitter color={green} size={"30px"} />
                </li>
              </Link>
              <SelectNetwork />
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
                      <div>
                        {minifyAddressOrDomain(
                          domain ? domain : address ?? "",
                          24
                        )}
                      </div>
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
                      src="/visuals/StarknetIdLongLogo.png"
                      alt="Starknet.id Logo"
                      width={250}
                      height={100}
                    />
                  </Link>
                </div>

                <div onClick={handleNav} className="rounded-fullcursor-pointer">
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
                  <Link href="/">
                    <li
                      onClick={() => setNav(false)}
                      className={styles.menuItemSmall}
                    >
                      Identities
                    </li>
                  </Link>
                  <Link href="/domains">
                    <li
                      onClick={() => setNav(false)}
                      className={styles.menuItemSmall}
                    >
                      Domains
                    </li>
                  </Link>
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
      <Wallets closeWallet={() => setHasWallet(false)} hasWallet={hasWallet} />
    </>
  );
};

export default Navbar;
