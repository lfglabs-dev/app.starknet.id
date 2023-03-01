import React, { FunctionComponent } from "react";
import styles from "../styles/components/footer.module.css";

const Footer: FunctionComponent = () => {
    return (
        <div className="relative">
            <div className={styles.fifthLeaf}>
                <img width={"100%"} alt="leaf" src="/leaves/leaf_3.png" />
            </div>
            <div className={styles.sixthLeaf}>
                <img width={"100%"} alt="leaf" src="/leaves/leaf_1.png" />
            </div>
            <footer className={styles.footer}>
                Powered by&nbsp;<strong>Starknet</strong>
            </footer>
        </div>
    );
};

export default Footer;
