/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, FunctionComponent } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa";
import styles from "../styles/navbar.module.css";
import Button from "./button";

const Navbar: FunctionComponent = () => {
  const [nav, setNav] = useState(false);
  const green = "#19AA6E";
  const brown = "#402d28";

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className={"fixed w-full h-20 z-[100] bg-beige"}>
      <div className="flex justify-between items-center w-full h-full px-2 2xl:px-16">
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
          <ul className="hidden md:flex uppercase items-center">
            <Link href="#info">
              <li className={styles.menuItem}>What is Starknet.id ?</li>
            </Link>
            <Link href="#roadmap">
              <li className={styles.menuItem}>Roadmap</li>
            </Link>
            <Link href="https://twitter.com/starknet_id">
              <li className="ml-10 mr-10 text-sm uppercase cursor-pointer">
                <FaTwitter color={green} size={"30px"} />
              </li>
            </Link>
            <div className="text-beige mr-5">
              <Button onClick={() => window.open("")}>Launch App</Button>
            </div>
          </ul>
          <div onClick={handleNav} className="md:hidden">
            <AiOutlineMenu color={brown} size={25} className="mr-3" />
          </div>
        </div>
      </div>

      <div
        className={
          nav ? "md:hidden fixed left-0 top-0 w-full h-screen bg-black/10" : ""
        }
      >
        <div
          className={
            nav
              ? " fixed left-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-screen bg-beige p-10 ease-in duration-500"
              : "fixed left-[-100%] top-0 p-10 ease-in duration-500"
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
              <p className="w-[85%] md:w-[90%] py-4 text-babe-blue">
                Own your on-chain identity
              </p>
            </div>
          </div>
          <div className="py-4 flex flex-col">
            <ul className="uppercase text-babe-blue">
              <Link href="#info">
                <li
                  onClick={() => setNav(false)}
                  className={styles.menuItemSmall}
                >
                  What is starknet.id ?
                </li>
              </Link>
              <Link href="#roadmap">
                <li
                  onClick={() => setNav(false)}
                  className={styles.menuItemSmall}
                >
                  Roadmap
                </li>
              </Link>
            </ul>
            <div className="pt-40">
              <p className="uppercase tracking-widest white">
                Claim your starknet identity
              </p>
              <div className="flex items-center my-4 w-full sm:w-[80%]">
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
                  <Link href="https://twitter.com/Starknet_id">
                    <FaTwitter size={20} color={green} />
                  </Link>
                </div>
                <div className="text-beige ml-3">
                  <Button onClick={() => window.open("")}>Launch App</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
