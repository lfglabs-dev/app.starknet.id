import type { NextPage } from "next";
import homeStyles from "@/styles/Home.module.css";
import styles from "@/styles/search.module.css";
import RenewalV2 from "@/components/domains/renewalV2";

const RenewalPage: NextPage = () => (
  <div className={homeStyles.screen}>
    <div className={styles.container}><RenewalV2 /></div>
  </div>
);

export default RenewalPage;
