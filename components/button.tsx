import React, { FunctionComponent } from "react";
import styles from "../styles/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string;
};

const Button: FunctionComponent<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className={styles["nq-button"]}>
      {children}
    </button>
  );
};

export default Button;
