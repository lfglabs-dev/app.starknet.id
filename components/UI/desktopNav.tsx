import type { FunctionComponent, MouseEvent } from "react";
import { useEffect } from "react";
import Link from "next/link";
import TwitterIcon from "./iconsComponents/icons/twitterIcon";
import DiscordIcon from "./iconsComponents/icons/discordIcon";
import GitHubIcon2 from "./iconsComponents/icons/githubIcon2";
import styles from "../../styles/components/desktopNav.module.css";

type DesktopNavProps = {
  close: () => void;
};

const DesktopNav: FunctionComponent<DesktopNavProps> = ({ close }) => {
  useEffect(() => {
    const handleClickOutside: EventListener = (event) => {
      const burger = document.getElementById("burger");
      if (burger && !burger.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  function handleClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  return (
    <nav onClick={handleClick} className={styles.navContainer}>
      <div className={styles.columns}>
        <div className={styles.column} onClick={close}>
          <Link href="https://www.starknet.id" target="_blank">
            <li className={styles.burgerItemTopLeft}>Website</li>
          </Link>
        </div>
        <div className={styles.column} onClick={close}>
          <Link href="https://docs.starknet.id/" target="_blank">
            <li className={styles.burgerItemTopRight}>Documentation</li>
          </Link>
          <Link href="https://www.starknet.id/pdfs/Terms.pdf" target="_blank">
            <li className={styles.burgerItem}>Terms of use</li>
          </Link>
          <Link href="https://starknet.id/pdfs/PrivacyPolicy.pdf" target="_blank">
            <li className={styles.burgerItem}>Privacy policy</li>
          </Link>
        </div>
      </div>
      <hr className={styles.hr} />
      <div className={styles.socials}>
        <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
          <Link href="https://twitter.com/Starknet_id" target="_blank">
            <TwitterIcon width="28" color="black" />
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
