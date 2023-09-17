import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/search.module.css";
import Renewal from "../../components/domains/renewal";
import { useRouter } from "next/router";
import {
  getDomainWithoutStark,
  isStarkRootDomain,
} from "../../utils/stringService";

const RenewaPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    if (
      router?.query?.domainToRenew &&
      isStarkRootDomain(router.query.domainToRenew as string)
    ) {
      setDomain(router.query.domainToRenew as string);
    }
  }, [router]);
  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <Renewal
          domain={getDomainWithoutStark(domain)}
          groups={[process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? ""]}
        />
      </div>
    </div>
  );
};

export default RenewaPage;
