import React, { FunctionComponent } from "react";
import PlusIcon from "../UI/icons/plusIcon";
import styles from "../../styles/components/icons.module.css";

type MintIdentityProps = {
  onClick: () => void;
};

const MintIdentity: FunctionComponent<MintIdentityProps> = ({ onClick }) => {
  return (
    <div className={styles.clickablePlus} onClick={onClick}>
      <PlusIcon />
    </div>
  );
};

export default MintIdentity;
