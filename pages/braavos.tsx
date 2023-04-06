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
  const domain = useDomainFromAddress(address);

  // Shield Minting
  const callDataLevel1 = {
    contractAddress: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
    entrypoint: "mint",
    calldata: [0],
  };
  const callDataLevel2 = {
    contractAddress: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
    entrypoint: "mint",
    calldata: [1],
  };
  const { execute: executeLevel1, data: mintDataLevel1 } = useStarknetExecute({
    calls: callDataLevel1,
  });

  const { execute: executeLevel2, data: mintDataLevel2 } = useStarknetExecute({
    calls: callDataLevel2,
  });

  function mint(level: number) {
    level == 0 ? executeLevel1() : executeLevel2();
  }

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

    if (!address) {
      setDomainKind(undefined);
    }
  }, [domain, address]);

  useEffect(() => {
    if (mintDataLevel2?.transaction_hash) {
      window.open(
        `https://twitter.com/intent/tweet?text=Just%20minted%20a%20Silver%20Shield%20of%20Braavos%20with%20my%20domain%20${domain}%20%F0%9F%9B%A1%EF%B8%8F%0A%0AGo%20mint%20yours%20for%20free%20on%20app.starknet.id%2Fbraavos%20if%20you%20already%20have%20a%20stark%20domain%20or%20subdomain%20!%0A%0ABe%20quick%2C%20it%20might%20not%20last%20forever%20%F0%9F%91%80`
      );
    }
  }, [mintDataLevel2]);

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {domainKind === "braavos" || domainKind === "subdomain" ? (
            !mintDataLevel1?.transaction_hash ? (
              <BraavosShield
                title="Mint your Bronze Shield Now"
                imgSrc="/braavos/shieldLevel1.png"
                desc="Bronze Shield of Braavos (Level 1)"
                condition="Only for Stark subdomain wallet (example: john.braavos.stark)"
                mint={() => mint(0)}
              />
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
                  <BraavosRegister expiryDuration={93} />
                </div>
              </div>
            )
          ) : null}
          {domainKind === "root" && (
            <BraavosShield
              title="Mint your Silver Shield Now"
              imgSrc="/braavos/shieldLevel2.png"
              desc="Silver Shield of Braavos (level 2)"
              condition="Only for stark root domain wallet (example: john.stark)"
              mint={() => mint(1)}
            />
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
                : "Please connect your Braavos wallet linked with a stark domain"
            }
          />
        </section>
      )}
    </div>
  );
};

export default Braavos;
