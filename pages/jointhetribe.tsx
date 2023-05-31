import React from "react";
import type { NextPage } from "next";
import styles from "../styles/jointhetribe.module.css";
import Button from "../components/UI/button";
import { useAccount } from "@starknet-react/core";
import { useDomainFromAddress } from "../hooks/naming";
import FamousMembers from "../components/tribe/famousMembers";
import TextCopy from "../components/UI/textCopy";
import SearchMembers from "../components/tribe/searchMembers";

const JoinTheTribe: NextPage = () => {
  const { address } = useAccount();
  const mainDomain = useDomainFromAddress(address ?? "");

  return (
    <div className={styles.page}>
      <section className={styles.section1}>
        <h1 className="title">Join the tribe</h1>
        <div className={styles.centeredContainer}>
          <p className="mr-5">Wear the stark signal</p>
          <TextCopy text={mainDomain ? mainDomain.domain : "yourname.stark"} />
        </div>
        <FamousMembers />
      </section>

      <div className={styles.firstLeaf}>
        <img alt="leaf" src="/leaves/new/leaf02.svg" />
      </div>
      <div className={styles.secondLeaf}>
        <img alt="leaf" src="/leaves/new/leaf03.svg" />
      </div>
      <div className={styles.thirdLeaf}>
        <img alt="leaf" src="/leaves/new/leaf02.svg" />
      </div>
      <div className={styles.fourthLeaf}>
        <img alt="leaf" src="/leaves/new/leaf03.svg" />
      </div>
      <section id="join" className={styles.section2}>
        <h1 className="title">Get your tribe NFT !</h1>
        <div className={styles.centeredContainer}>
          <p className="text-center">
            Join the tribe to mint a special NFT depending on your domain !
            <br></br>
          </p>
        </div>
        <div className={styles.sbtContainer}>
          <div className={styles.sbtImageContainer}>
            <img className={styles.sbtImage} src="/tribe/tribeLevel1.webp" />
            <h5 className="text-center text-lg font-quickZap">
              Hunter NFT (level 1)
            </h5>
            <p className="text-center text-sm">
              Only for subdomain tribe members
            </p>
          </div>

          <div className={styles.sbtImageContainer}>
            <img className={styles.sbtImage} src="/tribe/tribeLevel2.webp" />
            <h5 className="text-center text-lg font-quickZap">
              Trapper NFT (level 2)
            </h5>
            <p className="text-center text-sm">
              Only for root domain tribe members
            </p>
          </div>
          <div className={styles.sbtImageContainer}>
            <img className={styles.sbtImage} src="/tribe/tribeLevel3.webp" />
            <h5 className="text-center text-lg font-quickZap">
              Chef NFT (level 3)
            </h5>
            <p className="text-center text-sm">
              Only for long term tribe members (domain registered for +3 years)
            </p>
          </div>
        </div>
        <div className="mw-1/2">
          <Button onClick={() => window.open("https://starknet.quest")}>
            JOIN THE TRIBE NOW
          </Button>
        </div>
      </section>

      <section className={styles.section3}>
        <h1 className="title">Me and the tribe</h1>
        <p className="mt-4 text-center">
          Do we know each other ? Find out how many of us you follow.
        </p>
        <SearchMembers />
      </section>
    </div>
  );
};

export default JoinTheTribe;
