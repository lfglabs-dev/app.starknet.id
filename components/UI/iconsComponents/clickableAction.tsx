import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/identityMenu.module.css";
import ChangeIcon from "./icons/changeIcon";
import MintsquareIcon from "./icons/mintsquareIcon";
import TransferIcon from "./icons/transferIcon";
import PlusIcon from "./icons/plusIcon";
import AddressIcon from "./icons/addressIcon";
import AspectIcon from "./icons/aspectIcon";

type ClickacbleActionProps = {
  icon: string;
  onClick?: () => void;
  title?: string;
};

const ClickacbleAction: FunctionComponent<ClickacbleActionProps> = ({
  icon,
  onClick,
  title,
}) => {
  return (
    <div className={styles.clickableAction} onClick={onClick}>
      {icon === "change" && <ChangeIcon width="40" color="#402D28" />}
      {icon === "mintsquare" && (
        <MintsquareIcon width="40" color="#402D28" />
      )}
      {icon === "aspect" && <AspectIcon width="40" color="#402D28" />}
      {icon === "transfer" && <TransferIcon width="40" color="#402D28" />}
      {icon === "plus" && <PlusIcon width="40" color="#402D28" />}
      {icon === "address" && <AddressIcon width="40" color="#402D28" />}
      <h1 className={styles.clickableActionText}>{title}</h1>
    </div>
  )

};

export default ClickacbleAction;
