import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/button.module.css";

type ButtonProps = {
  onClick?: () => void;
  children: string | ReactNode;
  className?: string;
  disabled?: boolean;
  variation?: "primary" | "secondary" | "danger" | "success";
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
      className={
        `${className} ${styles["nq-button"]} ${styles[variation]} px-4 py-2 font-semibold text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-opacity-50 `
      }
      style={radius ? { borderRadius: radius } : undefined}
    >
      {children}
    </button>
  );
};

export default Button;
