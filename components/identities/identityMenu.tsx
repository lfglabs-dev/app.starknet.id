import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identityMenu.module.css"
import { Identity } from "../../types/backTypes";
import IdentityActions from "./identitiesActions";


interface identityMenuProps {
  identity?: Identity
  tokenId: string
  isIdentityADomain: boolean
}

const IdentityMenu: FunctionComponent<identityMenuProps> = ({ identity, tokenId, isIdentityADomain }) => {
  return (
    <div className={styles.actionsContainer}>
      <IdentityActions
        identity={identity}
        tokenId={tokenId}
        isIdentityADomain={isIdentityADomain}
      />
    </div >
  )
}

export default IdentityMenu
