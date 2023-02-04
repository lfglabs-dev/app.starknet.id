import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
  disabled?: boolean;
  style?: object;
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  style = {},
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={styles["nq-button"]}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
