import Link from "next/link";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/icons.module.css";
import TwitterIcon from "./twitterIcon";
import DiscordIcon from "./discordIcon";
import GithubIcon from "./githubIcon";
import Verified from "./verified";

type ClickableIconProps = {
  icon: string;
  onClick: () => void;
};

const ClickableIcon: FunctionComponent<ClickableIconProps> = ({
  icon,
  onClick,
}) => {
  return (
    <div className="relative">
      <div className={styles.clickableIcon} onClick={onClick}>
        {icon === "twitter" && <TwitterIcon width="40" color="#402D28" />}
        {icon === "discord" && <DiscordIcon width="40" color="#402D28" />}
        {icon === "github" && <GithubIcon width="40" color="#402D28" />}
      </div>
      {icon === "github" && <Verified type="github" width="15" />}
      {icon === "twitter" && <Verified type="twitter" width="15" />}
      {icon === "discord" && <Verified type="discord" width="15" />}
    </div>
  );
};

export default ClickableIcon;
