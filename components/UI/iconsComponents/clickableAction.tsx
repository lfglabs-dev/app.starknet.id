import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../../styles/components/identityMenu.module.css";

type ClickableActionProps = {
  icon: ReactNode;
  onClick?: () => void;
  title?: string;
  description?: string;
  style?: "primary" | "secondary";
  width?: "fixed" | "auto";
};

const ClickableAction: FunctionComponent<ClickableActionProps> = ({
  icon,
  onClick,
  title,
  description,
  style = "secondary",
  width = "fixed",
}) => {
  return (
    <div
      className={`${
        style === "secondary"
          ? styles.clickableActionSecondary
          : styles.clickableActionPrimary
      }
        ${width === "auto" ? styles.clickableActionAutoWidth : ""}`}
      onClick={onClick}
    >
      <div
        className={
          style === "secondary"
            ? styles.clickableIconSecondary
            : styles.clickableIconPrimary
        }
      >
        {icon}
      </div>

      <div className="ml-2">
        <h1 className={styles.clickableActionTitle}>{title}</h1>
        <p className={styles.clickableActionDescription}>{description}</p>
      </div>
    </div>
  );
};

export default ClickableAction;
