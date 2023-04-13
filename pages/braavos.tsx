import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/braavos.module.css";
import { useDomainFromAddress, useExpiryFromDomain } from "../hooks/naming";
import {
  useAccount,
  useStarknetCall,
  useStarknetExecute,
} from "@starknet-react/core";
import { getDomainKind, getDomainWithoutStark } from "../utils/stringService";
import ErrorScreen from "../components/UI/screens/errorScreen";
import BraavosShieldSkeleton from "../components/braavos/braavosShieldSkeleton";
import BraavosShield from "../components/braavos/braavosShield";
import BraavosRegister from "../components/braavos/braavosRegister";
import BraavosRenewal from "../components/braavos/braavosRenewal";
import TwitterCta from "../components/braavos/twitterCta";
import { useBraavosNftContract } from "../hooks/contracts";

const Braavos: NextPage = () => {
  const [domainKind, setDomainKind] = useState<DomainKind | undefined>();
  const { address, connector } = useAccount();
  const domain = useDomainFromAddress(address);
  const [showGoldPage, setShowGoldPage] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [isEligible, setIsEligible] = useState<boolean>(false);

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
  const callDataLevel3 = {
    contractAddress: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
    entrypoint: "mint",
    calldata: [2],
  };
  const { execute: executeLevel1, data: mintDataLevel1 } = useStarknetExecute({
    calls: callDataLevel1,
  });

  const { execute: executeLevel2, data: mintDataLevel2 } = useStarknetExecute({
    calls: callDataLevel2,
  });

  const { execute: executeLevel3, data: mintDataLevel3 } = useStarknetExecute({
    calls: callDataLevel3,
  });

  function mint(level: number) {
    level == 0 ? executeLevel1() : executeLevel2();
    if (level == 0) {
      executeLevel1();
    } else if (level == 1) {
      executeLevel2();
    } else if (level == 2) {
      executeLevel3();
    }
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

  const { expiry: expiryData, error: expiryError } = useExpiryFromDomain(
    getDomainWithoutStark(domain)
  );

  useEffect(() => {
    if (expiryError) {
      return;
    } else {
      if (expiryData) {
        setExpiryDate(new Date(expiryData?.["expiry"].toNumber() * 1000));
      }
    }
  }, [expiryData, expiryError]);

  const { contract: braavosNftContract } = useBraavosNftContract();
  const { data: isEligibleData, error: isEligibleDataError } = useStarknetCall({
    contract: braavosNftContract,
    method: "is_eligible_for_level",
    args: [
      [domain],
      domainKind === "root"
        ? expiryDate && expiryDate > new Date(2025, 3, 1)
          ? 2
          : 1
        : 0,
    ],
  });

  useEffect(() => {
    if (isEligibleDataError || !isEligibleData) setIsEligible(false);
    else {
      setIsEligible(true);
    }
  }, [isEligibleData, isEligibleDataError]);

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {!domainKind || !expiryDate ? (
            <BraavosShieldSkeleton />
          ) : (
            <>
              {domainKind === "braavos" || domainKind === "subdomain" ? (
                !mintDataLevel1?.transaction_hash ? (
                  isEligible ? (
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
                          Register a domain and get your braavos shield for only
                          1$
                        </h1>
                        <BraavosRegister
                          expiryDuration={93}
                          showTwitterCta={() => setShowGoldPage(true)}
                        />
                      </div>
                    </div>
                  )
                ) : showGoldPage ? (
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
                        Register a domain and get your braavos shield for only
                        1$
                      </h1>
                      <BraavosRegister
                        expiryDuration={93}
                        showTwitterCta={() => setShowGoldPage(true)}
                      />
                    </div>
                  </div>
                )
              ) : null}
              {domainKind === "root" ? (
                expiryDate > new Date(2025, 3, 1) ? (
                  mintDataLevel3?.transaction_hash ? (
                    <TwitterCta
                      twitterLink={`https://twitter.com/intent/tweet?text=Just%20minted%20a%20Gold%20Shield%20of%20Braavos%20with%20my%20domain%20${domain}%20%F0%9F%9B%A1%EF%B8%8F%0A%0AGo%20mint%20yours%20on%20app.starknet.id%2Fbraavos%20!%0A%0ABe%20quick%2C%20it%20might%20not%20last%20forever%20%F0%9F%91%80`}
                    />
                  ) : (
                    <BraavosShield
                      title="Mint your Gold Shield Now"
                      imgSrc="/braavos/shieldLevel3.png"
                      desc="Gold Shield of Braavos (level 3)"
                      condition="Only for stark root domain owner with +2 years in expiry"
                      mint={() => mint(2)}
                    />
                  )
                ) : mintDataLevel2?.transaction_hash ? (
                  <BraavosRenewal domain={domain} />
                ) : isEligible ? (
                  <BraavosShield
                    title="Mint your Silver Shield Now"
                    imgSrc="/braavos/shieldLevel2.png"
                    desc="Silver Shield of Braavos (level 2)"
                    condition="Only for stark root domain wallet (example: john.stark)"
                    mint={() => mint(1)}
                  />
                ) : (
                  <BraavosRenewal domain={domain} />
                )
              ) : null}
              {domainKind === "none" && (
                <ErrorScreen errorMessage="You need to own a .stark domain to get a shield but don't worry you can get a free .braavos.stark subdomain in the Braavos app now !" />
              )}
            </>
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

export default Braavos;
