import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";
import ClickablePersonhoodIcon from "./clickable/clickablePersonhoodIcon";

type SocialMediaActionsProps = {
  tokenId: string;
  isOwner: boolean;
  identity: Identity;
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
          twitterId={identity.old_twitter}
          domain={identity.domain}
        />
        <ClickableDiscordIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          discordId={identity.old_discord}
          domain={identity.domain}
        />
        <ClickableGithubIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          githubId={identity.old_github}
          domain={identity.domain}
        />
        <ClickablePersonhoodIcon
          isOwner={isOwner}
          width="25"
          tokenId={tokenId}
          domain={identity.domain}
        />
      </div>
    </>
  );
};

export default SocialMediaActions;
