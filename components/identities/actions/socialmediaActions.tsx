import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";

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
    <div className="flex flex-row gap-4">
      <div className="m-1">
        <ClickableTwitterIcon
          isOwner={isOwner}
          color="#55ACEE"
          width="30"
          tokenId={tokenId}
          domain={domain}
        />
      </div>
      <div className="m-1">
        <ClickableDiscordIcon
          isOwner={isOwner}
          color="#5865F2"
          width="35"
          tokenId={tokenId}
          domain={domain}
        />
      </div>
      <div className="m-1">
        <ClickableGithubIcon
          isOwner={isOwner}
          color="#402D28"
          width="30"
          tokenId={tokenId}
          domain={domain}
        />
      </div>
    </div>
  );
};

export default SocialMediaActions;
