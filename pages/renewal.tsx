import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import RenewalV2 from "../components/domains/renewalV2";
import { FormProvider } from "@/context/FormProvider";

const RenewalPage: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <FormProvider>
          <RenewalV2
            groups={[
              process.env.NEXT_PUBLIC_MAILING_LIST_GROUP_AUTO_RENEWAL ?? "",
            ]}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default RenewalPage;
