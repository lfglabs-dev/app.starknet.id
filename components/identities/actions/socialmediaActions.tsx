import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";
import ClickablePersonhoodIcon from "./clickable/clickablePersonhoodIcon";
import { Identity } from "../../../utils/apiObjects";

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
    <>
      <div className="flex flex-row gap-3">
        <ClickableTwitterIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          needUpdate={
            identity?.getOldTwitterData() && !identity?.getTwitterData()
              ? true
              : false
          }
          twitterId={
            identity?.getTwitterData() ?? identity?.getOldTwitterData()
          }
          domain={identity?.getDomain()}
        />
        <ClickableDiscordIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          needUpdate={
            identity?.getOldDiscordData() && !identity?.getDiscordData()
              ? true
              : false
          }
          discordId={
            identity?.getDiscordData() ?? identity?.getOldDiscordData()
          }
          domain={identity?.getDomain()}
        />
        <ClickableGithubIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          needUpdate={
            identity?.getOldGithubData() && !identity?.getGithubData()
              ? true
              : false
          }
          githubId={identity?.getGithubData() ?? identity?.getOldGithubData()}
          domain={identity?.getDomain()}
        />
        <ClickablePersonhoodIcon
          isOwner={isOwner}
          width="28"
          tokenId={tokenId}
          domain={identity?.getDomain()}
          isVerified={identity?.getPop()}
        />
      </div>
    </>
  );
};

export default SocialMediaActions;
