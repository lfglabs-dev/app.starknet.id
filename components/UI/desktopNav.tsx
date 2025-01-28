import React, { FunctionComponent, MouseEvent, useEffect } from "react";
import styles from "../../styles/components/desktopNav.module.css";
import Link from "next/link";
import TwitterIcon from "./iconsComponents/icons/twitterIcon";
import DiscordIcon from "./iconsComponents/icons/discordIcon";
import GitHubIcon2 from "./iconsComponents/icons/githubIcon2";
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
      const burger = document?.getElementById("burger");
      if (burger && !burger.contains(e.target as Node)) {
        close();
      }
    };
    // Bind the event listener
    document?.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document?.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav onClick={handleClick} className={styles.navContainer}>
      <div className={styles.columns}>
        <div className={styles.column} onClick={close}>
          <Link href="/pfpcollections">
            <li className={styles.burgerItemTopLeft}>PFP collections</li>
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_STARKNET_ID as string}
            target="_blank"
          >
            <li className={styles.burgerItem}>Website</li>
          </Link>
          <Link href="/newsletter">
            <li className={styles.burgerItem}>Newsletter</li>
          </Link>
          <Link
            href={`${
              process.env.NEXT_PUBLIC_STARKNET_ID as string
            }/affiliates/individual-program`}
            target="_blank"
          >
            <li className={styles.burgerItem}>Affiliation</li>
          </Link>
        </div>
        <div className={styles.column}>
          <Link href="https://docs.starknet.id/" target="_blank">
            <li className={styles.burgerItemTopRight}>Documentation</li>
          </Link>
          <Link href="https://www.starknet.id/pdfs/Terms.pdf" target="_blank">
            <li className={styles.burgerItem}>Terms of use</li>
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
        <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
          <Link href="https://twitter.com/Starknet_id" target="_blank">
            <TwitterIcon width="28" color="black" />{" "}
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
          <Link href="https://discord.com/invite/8uS2Mgcsza" target="_blank">
            <DiscordIcon width="28" color="#5865F2" />
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
          <Link href="https://github.com/lfglabs-dev" target="_blank">
            <GitHubIcon2 width="28" color="black" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
