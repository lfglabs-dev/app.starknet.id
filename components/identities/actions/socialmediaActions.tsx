import React, { FunctionComponent } from "react";
import ClickableDiscordIcon from "./clickable/clickableDiscordIcon";
import ClickableGithubIcon from "./clickable/clickableGithubIcon";
import ClickableTwitterIcon from "./clickable/clickableTwitterIcon";
// import ClickablePersonhoodIcon from "./clickable/clickablePersonhoodIcon";

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
            identity?.old_twitter && !identity?.twitter ? true : false
          }
          twitterId={identity?.twitter ?? identity?.old_twitter}
          domain={identity?.domain}
        />
        <ClickableDiscordIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          needUpdate={
            identity?.old_discord && !identity?.discord ? true : false
          }
          discordId={identity?.discord ?? identity?.old_discord}
          domain={identity?.domain}
        />
        <ClickableGithubIcon
          isOwner={isOwner}
          width="15"
          tokenId={tokenId}
          needUpdate={identity?.old_github && !identity?.github ? true : false}
          githubId={identity?.github ?? identity?.old_github}
          domain={identity?.domain}
        />
        {/* <ClickablePersonhoodIcon
          isOwner={isOwner}
          width="25"
          tokenId={tokenId}
          domain={identity.domain}
        /> */}
      </div>
    </>
  );
};

export default SocialMediaActions;
