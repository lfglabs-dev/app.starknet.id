import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identityCard.module.css";
import { Identity } from "../../types/backTypes";
import { shortenDomain } from "../../utils/stringService";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import SocialMediaActions from "./actions/socialmediaActions";

type IdentityCardProps = {
  identity?: Identity;
  domain?: string;
  tokenId: string;
};

const IdentityCard: FunctionComponent<IdentityCardProps> = ({
  tokenId,
  domain,
  identity,
}) => {
  const responsiveDomain = shortenDomain(domain as string);

  return (
    <div className={styles.container}>
      <div className="m-2 flex flex-row items-center justify-between gap-5 my-2 flex-wrap">
        <h1 className={styles.domain}>{responsiveDomain}</h1>
        {identity && identity.is_owner_main && (
          <MainIcon width="40" firstColor="#19aa6e" secondColor="#19aa6e" />
        )}
      </div>
      <div className="my-2">
        <img
          src={`https://www.starknet.id/api/identicons/${tokenId}`}
          height={170}
          width={170}
          alt="identicon"
        />
      </div>
      <SocialMediaActions
        domain={identity?.domain}
        isOwner={true}
        tokenId={tokenId}
      />
      <img
        alt="leaf"
        src="/leaves/identityCardLeaves/PNG/lg1.png"
        className={styles.lg1}
      />
      <img
        alt="leaf"
        src="/leaves/identityCardLeaves/PNG/lg2.png"
        className={styles.lg2}
      />
    </div>
  );
};

export default IdentityCard;
