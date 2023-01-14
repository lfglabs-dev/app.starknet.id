import React, { FunctionComponent } from "react";
import { useState } from "react";
import styles from "../../styles/components/inputAction.module.css";

type InputActionProps = {
  placeholder: string;
  className?: string;
  maxTextLength?: number;
  buttonName: string;
  action: (text: string) => void;
};

const InputAction: FunctionComponent<InputActionProps> = ({ placeholder, className='', maxTextLength=20, buttonName, action }) => {
  const [inputValue, setInputValue] = useState('');

  function handleClick(e: any) {
    e.preventDefault();
    const textbox = e.target.parentNode.children[0]

    const text = inputValue
    const parsedText = text.slice(0, maxTextLength)
    if (text !== parsedText) textbox.value = parsedText;
    action(parsedText);
  }

  return <form className={[styles.container, className].join(' ')}>
      <input onChange={(e) => setInputValue(e.target.value)} className={styles.input} placeholder={placeholder} />
      <button onClick={handleClick} className={styles.button}>{buttonName}</button>
    </form>
};

export default InputAction;
