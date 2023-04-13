import React, { useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/braavos.module.css";
import ErrorScreen from "../components/UI/screens/errorScreen";
import BraavosRegister from "../components/braavos/braavosRegister";
import { useAccount } from "@starknet-react/core";
import { useDomainFromAddress } from "../hooks/naming";
import BraavosRenewal from "../components/braavos/braavosRenewal";

const BraavosDiscount: NextPage = () => {
  const { connector, address } = useAccount();
  const [twitterCta, setTwitterCta] = useState(false);
  const domain = useDomainFromAddress(address);

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {twitterCta ? (
            <BraavosRenewal domain={domain} />
          ) : (
            <div className={styles.discountContainer}>
              <div className={styles.discountBuyImageContainer}>
                <img
                  className={styles.discountBuyImage}
                  src="/braavos/shieldLevel2.png"
                />
              </div>
              <div className={styles.registerContainer}>
                <h1 className={styles.titleRegister}>
                  Register a domain and get your braavos shield for only 1$
                </h1>
                <BraavosRegister
                  expiryDuration={93}
                  showTwitterCta={() => setTwitterCta(true)}
                />
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.section}>
          <ErrorScreen
            imgSrc="/braavos/braavosLogo.svg"
            errorMessage={
              connector
                ? "You can get a Braavos Shield only with a Braavos wallet"
                : "Please connect your Braavos wallet linked with a stark domain"
            }
          />
        </section>
      )}
    </div>
  );
};

export default BraavosDiscount;
