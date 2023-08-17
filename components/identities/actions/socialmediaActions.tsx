import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";
import ClickablePersonhoodIcon from "./clickable/clickablePersonhoodIcon";

type SocialMediaActionsProps = {
  tokenId: string;
  isOwner: boolean;
  domain?: string;
};

const SocialMediaActions: FunctionComponent<SocialMediaActionsProps> = ({
  tokenId,
  isOwner,
  domain = "",
}) => {
  return (
    <>
      <div className="flex flex-row gap-3">
        <ClickableTwitterIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          domain={domain}
        />
        <ClickableDiscordIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          domain={domain}
        />
        <ClickableGithubIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          domain={domain}
        />
        <ClickablePersonhoodIcon
          isOwner={isOwner}
          width="25"
          tokenId={tokenId}
          domain={domain}
        />
      </div>
    </>
  );
};

export default SocialMediaActions;
