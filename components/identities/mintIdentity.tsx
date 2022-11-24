import React, { FunctionComponent } from "react";
import MintIcon from "../UI/iconsComponents/icons/mintIcon";
import styles from "../../styles/components/icons.module.css";

type MintIdentityProps = {
  onClick: () => void;
};

const MintIdentity: FunctionComponent<MintIdentityProps> = ({ onClick }) => {
  return (
    <div className={styles.clickablePlus} onClick={onClick}>
      <MintIcon />
    </div>
  );
};

export default MintIdentity;
