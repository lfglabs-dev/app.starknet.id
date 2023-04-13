import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/braavos.module.css";
import { useDomainFromAddress, useExpiryFromDomain } from "../hooks/naming";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { getDomainKind, getDomainWithoutStark } from "../utils/stringService";
import ErrorScreen from "../components/UI/screens/errorScreen";
import BraavosShieldSkeleton from "../components/braavos/braavosShieldSkeleton";
import BraavosShield from "../components/braavos/braavosShield";
import TwitterCta from "../components/braavos/twitterCta";
import { useRouter } from "next/router";
import BraavosRenewal from "../components/braavos/braavosRenewal";

const Braavos: NextPage = () => {
  const [domainKind, setDomainKind] = useState<DomainKind | undefined>();
  const { address, connector } = useAccount();
  const domain = useDomainFromAddress(address);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const router = useRouter();
  // Shield Minting
  const callDataLevel3 = {
    contractAddress: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string,
    entrypoint: "mint",
    calldata: [2],
  };

  const { execute: executeLevel3, data: mintDataLevel3 } = useStarknetExecute({
    calls: callDataLevel3,
  });

  function mint() {
    executeLevel3();
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

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {!domainKind || !expiryDate ? (
            <BraavosShieldSkeleton />
          ) : domainKind === "root" ? (
            mintDataLevel3?.transaction_hash ? (
              <TwitterCta
                twitterLink={`https://twitter.com/intent/tweet?text=Just%20minted%20a%20Gold%20Shield%20of%20Braavos%20with%20my%20domain%20${domain}%20%F0%9F%9B%A1%EF%B8%8F%0A%0AGo%20mint%20yours%20on%20app.starknet.id%2Fbraavos%20!%0A%0ABe%20quick%2C%20it%20might%20not%20last%20forever%20%F0%9F%91%80`}
              />
            ) : expiryDate > new Date(2025, 3, 1) ? (
              <BraavosShield
                title="Mint your Gold Shield Now"
                imgSrc="/braavos/shieldLevel3.png"
                desc="Gold Shield of Braavos (level 3)"
                condition="Only for stark root domain owner with +2 years in expiry"
                mint={() => mint()}
              />
            ) : (
              <BraavosRenewal domain={domain} />
            )
          ) : (
            <ErrorScreen
              errorMessage="You need a stark root domain registered for 2 years or plus of expiry to get mint your Braavos Gold Shield"
              buttonText="Get a root domain"
              onClick={() => router.push("/")}
            />
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
