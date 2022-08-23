import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
};

const Button: FunctionComponent<ButtonProps> = ({ children, onClick }) => {
  return (
    <div className="text-beige">
      <button onClick={onClick} className={styles["nq-button"]}>
        {children}
      </button>
    </div>
  );
};

export default Button;
