import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/icons.module.css";
import TwitterIcon from "./icons/twitterIcon";
import DiscordIcon from "./icons/discordIcon";
import GithubIcon from "./icons/githubIcon";
import MainIcon from "./icons/mainIcon";
import ChangeIcon from "./icons/changeIcon";
import MintsquareIcon from "./icons/mintsquareIcon";
import TransferIcon from "./icons/transferIcon";
import PlusIcon from "./icons/plusIcon";
import AddressIcon from "./icons/addressIcon";
import AspectIcon from "./icons/aspectIcon";
import { Tooltip } from "@mui/material";

type ClickableIconProps = {
  icon: string;
  onClick?: () => void;
  title?: string;
};

const ClickableIcon: FunctionComponent<ClickableIconProps> = ({
  icon,
  onClick,
  title = "",
}) => {
  return (
    <Tooltip title={title} arrow>
      <div>
        <div className={styles.clickableIcon} onClick={onClick}>
          {icon === "twitter" && <TwitterIcon width="20" color="#402D28" />}
          {icon === "discord" && <DiscordIcon width="20" color="#402D28" />}
          {icon === "github" && <GithubIcon width="20" color="#402D28" />}
          {icon === "main" && (
            <MainIcon width="40" firstColor="#402d28" secondColor="#402d28" />
          )}
          {icon === "change" && <ChangeIcon width="40" color="#402D28" />}
          {icon === "mintsquare" && (
            <MintsquareIcon width="40" color="#402D28" />
          )}
          {icon === "aspect" && <AspectIcon width="40" color="#402D28" />}
          {icon === "transfer" && <TransferIcon width="40" color="#402D28" />}
          {icon === "plus" && <PlusIcon width="40" color="#402D28" />}
          {icon === "address" && <AddressIcon width="40" color="#402D28" />}
        </div>
      </div>
    </Tooltip>
  );
};

export default ClickableIcon;
