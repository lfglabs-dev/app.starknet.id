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
import { useRouter } from "next/router";
import BraavosRenewal from "../components/braavos/braavosRenewal";
import BraavosConfirmation from "../components/braavos/braavosConfirmation";
import Link from "next/link";

const Braavos: NextPage = () => {
  const [domainKind, setDomainKind] = useState<DomainKind | undefined>();
  const { address, connector } = useAccount();
  const domain = useDomainFromAddress(address);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [ownedShields, setOwnedShields] = useState([]);
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

  // A function to check if of the object contained in ownedShields has the property name that is equal to "Gold Shield of Braavos - Level 3"
  function checkIfShieldIsOwned() {
    return ownedShields.some(
      (shield) => (shield as any).name === "Gold Shield of Braavos - Level 3"
    );
  }

  return (
    <div className={homeStyles.screen}>
      {connector && connector.id() === "braavos" ? (
        <section id="join" className={styles.section}>
          {!domainKind || !expiryDate ? (
            <BraavosShieldSkeleton />
          ) : domainKind === "root" ? (
            mintDataLevel3?.transaction_hash ? (
              <BraavosConfirmation
                confirmationText={
                  <p className="mb-5 text-justify">
                    Thanks, the transaction is on going. Once the transaction
                    will be completed:{" "}
                    <ul className="list-disc list-outside">
                      <li className="ml-5">
                        Check your NFT gallery to see the Goden Shied of Braavos
                      </li>
                      <li className="ml-5">
                        Check the new expiry date of your domain on&nbsp; on{" "}
                        <Link href="/identities" className="underline">
                          the identities page
                        </Link>{" "}
                        click on &quot;Renew your Identity&quot; to see the
                        expiry date
                      </li>
                    </ul>
                  </p>
                }
                title={`Congrats, you just minted your gold shield with ${domain} !`}
                imageSrc={"/braavos/shieldLevel3.png"}
              />
            ) : expiryDate > new Date(2026, 3, 1) ? (
              ownedShields.length > 0 && checkIfShieldIsOwned() ? (
                <ErrorScreen
                  errorMessage="You already minted your gold shield, check your gallery to see it :)"
                  buttonText="Go back to your identities"
                  onClick={() => router.push("/identities")}
                />
              ) : (
                <BraavosShield
                  title="Mint your Gold Shield Now"
                  imgSrc="/braavos/shieldLevel3.png"
                  desc="Gold Shield of Braavos (level 3)"
                  condition="Only for stark root domain owner with +3 years in expiry"
                  mint={() => mint()}
                />
              )
            ) : (
              <BraavosRenewal domain={domain} />
            )
          ) : (
            <ErrorScreen
              errorMessage="You need a stark root domain registered for 3 years or plus of expiry to get mint your Braavos Gold Shield"
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
