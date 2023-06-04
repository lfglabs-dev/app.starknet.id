import React, { FunctionComponent } from "react";
import { useState } from "react";
import styles from "../../styles/components/inputAction.module.css";

type InputActionProps = {
  placeholder: string;
  buttonName: string;
  onClick: (text: string) => void;
};

const InputAction: FunctionComponent<InputActionProps> = ({
  placeholder,
  buttonName,
  onClick,
}) => {
  const [inputValue, setInputValue] = useState("");

  function handleClick(e: React.MouseEvent): void {
    e.preventDefault();
    onClick(inputValue);
  }

  return (
    <form className={styles.container}>
      <input
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.input}
        placeholder={placeholder}
      />
      <button onClick={handleClick} className={styles.button}>
        {buttonName}
      </button>
    </form>
  );
};

export default InputAction;
