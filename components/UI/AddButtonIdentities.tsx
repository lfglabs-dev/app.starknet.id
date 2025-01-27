import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/addIdentitiesButton.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
  disabled?: boolean;
  variation?: string;
  radius?: string; 
};

const AddButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variation = "primary",
  radius,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={` ${styles["iq-button"]} ${styles[variation]}`}
       style={radius ? { borderRadius: radius } : undefined}
    >
      {children}
    </button>
  );
};

export default AddButton;
