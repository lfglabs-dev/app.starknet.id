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
import BraavosRegister from "../components/braavos/braavosRegister";
import BraavosRenewal from "../components/braavos/braavosRenewal";
import BraavosConfirmation from "../components/braavos/braavosConfirmation";
import Link from "next/link";
import { useRouter } from "next/router";

const Braavos: NextPage = () => {
  const [domainKind, setDomainKind] = useState<DomainKind | undefined>();
  const { address, connector } = useAccount();
  const domain = useDomainFromAddress(address);
  const [showGoldPage, setShowGoldPage] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [ownedShields, setOwnedShields] = useState([]);
  const router = useRouter();

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

    // Aspect Indexer
    fetch(
      `https://api${
        process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "-testnet" : ""
      }.aspect.co/api/v0/assets?contract_address=${
        process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT as string
      }&owner_address=${address}&sort_by=minted_at&order_by=desc`
    )
      .then((response) => response.json())
      .then((data) => {
        setOwnedShields(data.assets);
      });
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

  function checkGoldShield(): boolean {
    return ownedShields.some(
      (shield) => (shield as any).name === "Gold Shield of Braavos - Level 3"
    );
  }

  function checkSilverShield() {
    return ownedShields.some(
      (shield) => (shield as any).name === "Silver Shield of Braavos - Level 2"
    );
  }

  function checkBronzeShield() {
    return ownedShields.some(
      (shield) => (shield as any).name === "Bronze Shield of Braavos - Level 1"
    );
  }

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
                  !checkBronzeShield() ? (
                    <BraavosShield
                      title="Mint your Bronze Shield Now"
                      imgSrc="/braavos/shieldlevel1.webp"
                      desc="Bronze Shield of Braavos (Level 1)"
                      condition="Only for Stark subdomain wallet (example: john.braavos.stark)"
                      mint={() => mint(0)}
                    />
                  ) : (
                    <div className={styles.discountContainer}>
                      <div className={styles.discountBuyImageContainer}>
                        <img
                          className={styles.discountBuyImage}
                          src="/braavos/shieldlevel2.webp"
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
                        src="/braavos/shieldlevel2.webp"
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
                expiryDate > new Date(2026, 1, 1) ? (
                  mintDataLevel3?.transaction_hash ? (
                    <BraavosConfirmation
                      confirmationText={
                        <p className="mb-5 text-justify">
                          Thanks, the transaction is on going. Once the
                          transaction will be completed:{" "}
                          <ul className="list-disc list-outside">
                            <li className="ml-5">
                              Check your NFT gallery to see the Goden Shied of
                              Braavos
                            </li>
                            <li className="ml-5">
                              Check the new expiry date of your domain on&nbsp;
                              on{" "}
                              <Link href="/identities" className="underline">
                                the identities page
                              </Link>{" "}
                              click on &quot;Renew your Identity&quot; to see
                              the expiry date
                            </li>
                          </ul>
                        </p>
                      }
                      title={`Congrats, you just minted your gold shield with ${domain} !`}
                      imageSrc={"/braavos/shieldlevel3.webp"}
                    />
                  ) : ownedShields.length > 0 && checkGoldShield() ? (
                    <ErrorScreen
                      errorMessage="You already minted your gold shield, check your gallery to see it :)"
                      buttonText="Go back to your identities"
                      onClick={() => router.push("/identities")}
                    />
                  ) : (
                    <BraavosShield
                      title="Mint your Gold Shield Now"
                      imgSrc="/braavos/shieldlevel3.webp"
                      desc="Gold Shield of Braavos (level 3)"
                      condition="Only for stark root domain owner with +3 years in expiry"
                      mint={() => mint(2)}
                    />
                  )
                ) : mintDataLevel2?.transaction_hash ? (
                  <BraavosRenewal domain={domain} />
                ) : !checkSilverShield() ? (
                  <BraavosShield
                    title="Mint your Silver Shield Now"
                    imgSrc="/braavos/shieldlevel2.webp"
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
