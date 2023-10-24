import React, { FunctionComponent } from "react";
import styles from "../../styles/components/backButton.module.css";
import ArrowLeftIcon from "./iconsComponents/icons/arrowLeftIcon";
import theme from "../../styles/theme";

type BackButtonProps = {
  onClick: () => void;
};

const BackButton: FunctionComponent<BackButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.backButton}>
      <ArrowLeftIcon
        className={styles.arrowIcon}
        color={theme.palette.secondary.main}
        width="24"
      />
      <p className={styles.backButtonLabel}>Back</p>
    </button>
  );
};

export default BackButton;
