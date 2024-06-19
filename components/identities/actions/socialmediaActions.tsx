import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";
import ClickablePersonhoodIcon from "./clickable/clickablePersonhoodIcon";
import { Identity } from "../../../utils/apiWrappers/identity";
import styles from "../../../styles/components/registerV3.module.css";

type SocialMediaActionsProps = {
  tokenId: string;
  isOwner: boolean;
  identity?: Identity;
};

const SocialMediaActions: FunctionComponent<SocialMediaActionsProps> = ({
  tokenId,
  isOwner,
  identity,
}) => {
  return (
    <div className=" lg:mt-6 mt-2 flex lg:justify-start justify-center lg:items-start items-center">
      <div className={styles.socialmediaActions}>
        <div className="flex flex-row gap-3">
          <ClickableTwitterIcon
            isOwner={isOwner}
            width="24"
            tokenId={tokenId}
            needUpdate={
              identity?.oldTwitterData && !identity?.twitterData ? true : false
            }
            twitterId={identity?.twitterData ?? identity?.oldTwitterData}
            domain={identity?.domain}
          />
          <ClickableDiscordIcon
            isOwner={isOwner}
            width="28"
            tokenId={tokenId}
            needUpdate={
              identity?.oldDiscordData && !identity?.discordData ? true : false
            }
            discordId={identity?.discordData ?? identity?.oldDiscordData}
            domain={identity?.domain}
          />
          <ClickableGithubIcon
            isOwner={isOwner}
            width="24"
            tokenId={tokenId}
            needUpdate={
              identity?.oldGithubData && !identity?.githubData ? true : false
            }
            githubId={identity?.githubData ?? identity?.oldGithubData}
            domain={identity?.domain}
          />
          <ClickablePersonhoodIcon
            isOwner={isOwner}
            width="35"
            tokenId={tokenId}
            domain={identity?.domain}
            isVerified={identity?.pop}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialMediaActions;
