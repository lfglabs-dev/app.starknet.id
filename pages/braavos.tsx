import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/braavos.module.css";
import Button from "../components/UI/button";
import { useDomainFromAddress } from "../hooks/naming";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { getDomainKind } from "../utils/stringService";
import ErrorScreen from "../components/UI/screens/errorScreen";
import BraavosShieldSkeleton from "../components/braavos/braavosShieldSkeleton";
import BraavosShield from "../components/braavos/braavosShield";
import Register from "../components/domains/register";

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
    domain ? setDomainKind(getDomainKind(domain)) : setDomainKind(undefined);
  }, [domain]);

  return (
    <div className={homeStyles.screen}>
      <div className="firstLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup02.svg" />
      </div>
      <div className="secondLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup01.svg" />
      </div>
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
              <>
                <h1 className="title">Get your Braavos shield !</h1>
                <div className={styles.sbtContainer}>
                  <Register isAvailable={true} domain={"fricoben.stark"} />
                  <div className={styles.sbtImageContainer}>
                    <img
                      className={styles.sbtImage}
                      src="/braavos/shield.png"
                    />
                    <h5 className="text-center text-lg font-quickZap">
                      Braavos Soldier (level 1)
                    </h5>
                    <p className="text-center text-sm">
                      Only for .braavos.stark owners
                    </p>
                  </div>
                </div>
                <Button onClick={mint}>GET MY SHIELD</Button>
              </>
            ))}
          {domainKind === "root" && (
            // <BraavosShield
            //   imgSrc="/braavos/shield.png"
            //   desc="Braavos Officer (level 2)"
            //   condition="Only for stark root domain owners"
            //   mint={mint}
            // />
            <>
              <h1 className="title">Get your Braavos shield !</h1>
              <div className={styles.discountContainer}>
                <div className={styles.registerContainer}>
                  <Register isAvailable={true} domain={"fricoben.stark"} />
                </div>
                <div className={styles.sbtImageContainer}>
                  <img className={styles.sbtImage} src="/braavos/shield.png" />
                  <h5 className="text-center text-lg font-quickZap">
                    Braavos Soldier (level 1)
                  </h5>
                  <p className="text-center text-sm">
                    Only for .braavos.stark owners
                  </p>
                </div>
              </div>
            </>
          )}
          {domainKind === "none" && (
            <ErrorScreen errorMessage="You need to own a .stark domain to get a shield. You can get a free .braavos.subdomain" />
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
