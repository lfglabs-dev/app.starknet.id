import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
  className?: string;
  disabled?: boolean;
  variation?: string;
  radius?: string;
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className = "",
  onClick,
  disabled = false,
  variation = "primary",
  radius,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${className} ${styles["nq-button"]} ${styles[variation]}`} 
      style={radius ? { borderRadius: radius } : undefined}
    >
      {children}
    </button>
  );
};

export default Button;
