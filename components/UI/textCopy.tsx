import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/textCopy.module.css";

type TextCopyProps = {
  text: string;
};

const TextCopy: FunctionComponent<TextCopyProps> = ({ text }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  }

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return <div className={styles.container}>
      <p className="ml-1">{text}</p>
      <button onClick={copy} className={styles.copyButton}>copy</button>
      {
        copied ? <p className={styles.copied}>copied!</p> : ""
      }
    </div>
};

export default TextCopy;
