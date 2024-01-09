import React, { FunctionComponent, MouseEvent, useEffect } from "react";
import styles from "../../styles/components/desktopNav.module.css";
import Link from "next/link";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import theme from "../../styles/theme";

type DesktopNavProps = {
  close: () => void;
};

const DesktopNav: FunctionComponent<DesktopNavProps> = ({ close }) => {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  // Close when clicking outside the nav
  useEffect(() => {
    const handleClickOutside: EventListener = (e) => {
      const burger = document.getElementById("burger");
      if (burger && !burger.contains(e.target as Node)) {
        close();
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav onClick={handleClick} className={styles.navContainer}>
      <div className={styles.columns}>
        <div className={styles.column} onClick={close}>
          <Link href="/pfpcollections">
            <li className={styles.burgerItem}>PFP collections</li>
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_STARKNET_ID as string}
            target="_blank"
          >
            <li className={styles.burgerItem}>Website</li>
          </Link>
          <Link href="https://www.starknet.id/pdfs/Terms.pdf" target="_blank">
            <li className={styles.burgerItem}>Term of use</li>
          </Link>
        </div>
        <div className={styles.column}>
          <Link href="https://docs.starknet.id/" target="_blank">
            <li className={styles.burgerItem}>Documentation</li>
          </Link>
          <Link
            href={`${
              process.env.NEXT_PUBLIC_STARKNET_ID as string
            }/affiliates/individual-program`}
            target="_blank"
          >
            <li className={styles.burgerItem}>Affiliation</li>
          </Link>
          <Link
            href="https://starknet.id/pdfs/PrivacyPolicy.pdf"
            target="_blank"
          >
            <li className={styles.burgerItem}>Privacy policy</li>
          </Link>
        </div>
      </div>
      <hr className={styles.hr} />
      <div className={styles.socials}>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://twitter.com/Starknet_id" target="_blank">
            <FaTwitter size={24} color={theme.palette.secondary.main} />
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://discord.com/invite/8uS2Mgcsza" target="_blank">
            <FaDiscord size={24} color={theme.palette.secondary.main} />
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://github.com/starknet-id" target="_blank">
            <FaGithub size={24} color={theme.palette.secondary.main} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
