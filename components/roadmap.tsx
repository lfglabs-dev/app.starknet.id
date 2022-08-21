import React, { FunctionComponent } from "react";
import styles from "../styles/roadmap.module.css";

const Roadmap: FunctionComponent = () => {
  return (
    <div className="flex flex-col relative">
      <h1 className={styles.title}>Roadmap</h1>
      <div className="my-5">
        <h2 className={styles.secondTitle}>Phase 1 : Eclosion</h2>
        <p className="text-center text-xl">Recruiting</p>
        <p className="text-center text-xl">First partnership (Eykar quests)</p>
        <p className="text-center text-xl">Live testnet</p>
      </div>
      <div className="my-5">
        <h2 className={styles.secondTitle}>Phase 2 : Growth</h2>
        <p className="text-center text-xl">Live mainnet</p>
        <p className="text-center text-xl">Wallet support</p>
        <p className="text-center text-xl">
          New partnerships (cartridge, Imperium Wars, Only Dust, Matchbox ...)
        </p>
        <p className="text-center text-xl">ENS bridge</p>
      </div>
      <div className="my-5">
        <h2 className={styles.secondTitle}>Phase 3 : Launch</h2>
        <p className="text-center text-xl">
          Eternal contract (deleting upgradable functions)
        </p>
        <p className="text-center text-xl">
          DAO based on game theory and identities
        </p>
      </div>
    </div>
  );
};

export default Roadmap;
