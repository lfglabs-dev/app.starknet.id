import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/braavos.module.css";
import { useDomainFromAddress } from "../hooks/naming";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { getDomainKind } from "../utils/stringService";
import ErrorScreen from "../components/UI/screens/errorScreen";
import BraavosShieldSkeleton from "../components/braavos/braavosShieldSkeleton";
import BraavosShield from "../components/braavos/braavosShield";
import BraavosRegister from "../components/braavos/braavosRegister";

const Braavos: NextPage = () => {
  const [domainKind, setDomainKind] = useState<DomainKind | undefined>();
  const { address, connector } = useAccount();
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);

  // Shield Minting
  const callData = {
    contractAddress: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
    entrypoint: "mint",
    calldata: [randomTokenId],
  };
  const { execute, data: mintData } = useStarknetExecute({
    calls: callData,
  });

  function mint() {
    execute();
  }
  const domain = useDomainFromAddress(address);

  useEffect(() => {
    domain && setDomainKind(getDomainKind(domain));
  }, [domain]);

  useEffect(() => {
    if (!domain) {
      const timer = setTimeout(() => {
        setDomainKind("none");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [domain]);

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {domainKind === "braavos" &&
            (!mintData?.transaction_hash ? (
              <BraavosShield
                imgSrc="/braavos/shield.png"
                desc="Braavos Soldier (level 1)"
                condition="Only for .braavos.stark owners"
                mint={mint}
              />
            ) : (
              <div className={styles.discountContainer}>
                <div className={styles.discountBuyImageContainer}>
                  <img
                    className={styles.discountBuyImage}
                    src="/braavos/shield.png"
                  />
                </div>
                <div className={styles.registerContainer}>
                  <h1 className={styles.titleRegister}>
                    Register a domain and get your braavos shield for only 1$
                  </h1>
                  <BraavosRegister expiryDuration={93} />
                </div>
              </div>
            ))}
          {domainKind === "root" && (
            // <BraavosShield
            //   imgSrc="/braavos/shield.png"
            //   desc="Braavos Officer (level 2)"
            //   condition="Only for stark root domain owners"
            //   mint={mint}
            // />
            <div className={styles.discountContainer}>
              <div className={styles.discountBuyImageContainer}>
                <img
                  className={styles.discountBuyImage}
                  src="/braavos/shield.png"
                />
              </div>
              <div className={styles.registerContainer}>
                <h1 className={styles.titleRegister}>
                  Register a domain and get your braavos shield for only 1$
                </h1>
                <BraavosRegister expiryDuration={93} />
              </div>
            </div>
          )}
          {domainKind === "none" && (
            <ErrorScreen errorMessage="You need to own a .stark domain to get a shield but don't worry you can get a free .braavos.stark subdomain in the Braavos app now !" />
          )}
          {!domainKind && <BraavosShieldSkeleton />}
        </section>
      ) : (
        <section className={styles.section}>
          <ErrorScreen
            imgSrc="/braavos/braavosLogo.svg"
            errorMessage={
              connector
                ? "You can get a Braavos Shield only with a Braavos wallet"
                : "Please connect your Braavos wallet"
            }
          />
        </section>
      )}
    </div>
  );
};

export default Braavos;
