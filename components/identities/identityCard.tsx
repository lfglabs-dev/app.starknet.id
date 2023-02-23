import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identityCard.module.css"
import { Identity } from "../../types/backTypes";
import SocialMediaActions from "./actions/socialmediaActions";

interface identityCardProps {
  identity?: Identity
  domain?: string
  tokenId: string
}

const IdentityCard: FunctionComponent<identityCardProps> = ({ tokenId, domain, identity }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.domain}>{domain}</h1>
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
    </div >
  )
}

export default IdentityCard
