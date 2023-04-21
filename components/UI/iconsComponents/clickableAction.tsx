import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/identityMenu.module.css";
import ChangeIcon from "./icons/changeIcon";
import MintsquareIcon from "./icons/mintsquareIcon";
import TransferIcon from "./icons/transferIcon";
import PlusIcon from "./icons/plusIcon";
import AddressIcon from "./icons/addressIcon";
import AspectIcon from "./icons/aspectIcon";
import MainIcon from "./icons/mainIcon";

type ClickableActionProps = {
  icon: string;
  onClick?: () => void;
  title?: string;
  description?: string;
  style?: "primary" | "secondary";
};

const ClickableAction: FunctionComponent<ClickableActionProps> = ({
  icon,
  onClick,
  title,
  description,
  style = "secondary",
}) => {
  const color = style === "secondary" ? "#402D28" : "#19aa6e";
  return (
    <div
      className={
        style === "secondary"
          ? styles.clickableActionSecondary
          : styles.clickableActionPrimary
      }
      onClick={onClick}
    >
      <div
        className={
          style === "secondary"
            ? styles.clickableIconSecondary
            : styles.clickableIconPrimary
        }
      >
        {icon === "change" && <ChangeIcon width="25" color={color} />}
        {icon === "mintsquare" && <MintsquareIcon width="25" color={color} />}
        {icon === "main" && (
          <MainIcon width="25" firstColor={color} secondColor={color} />
        )}
        {icon === "aspect" && <AspectIcon width="25" color={color} />}
        {icon === "transfer" && <TransferIcon width="25" color={color} />}
        {icon === "plus" && <PlusIcon width="25" color={color} />}
        {icon === "address" && <AddressIcon width="25" color={color} />}
      </div>

      <div className="ml-2">
        <h1 className={styles.clickableActionTitle}>{title}</h1>
        <p className={styles.clickableActionDescription}>{description}</p>
      </div>
    </div>
  );
};

export default ClickableAction;
