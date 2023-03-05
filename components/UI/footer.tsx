import React, { FunctionComponent } from "react";
import styles from "../styles/components/footer.module.css";

const Footer: FunctionComponent = () => {
  return (
    <div className="relative">
      <footer className={styles.footer}>
        Powered by&nbsp;<strong>Starknet</strong>
      </footer>
    </div>
  );
};

export default Footer;
