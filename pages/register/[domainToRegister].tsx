import React from "react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/search.module.css";
import SearchBar from "../../components/UI/searchBar";
import {
  getDomainWithoutStark,
  isStarkRootDomain,
} from "../../utils/stringService";
import RegisterV3 from "../../components/domains/registerV3";

const RegistrationPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    if (
      router?.query?.domainToRegister &&
      isStarkRootDomain(router.query.domainToRegister as string)
    ) {
      setDomain(router.query.domainToRegister as string);
    }
  }, [router]);

  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <div className="sm:w-2/5 w-4/5 mt-5 mb-5">
          <SearchBar
            onChangeTypedValue={(typeValue: string) => setDomain(typeValue)}
            showHistory={false}
          />
        </div>
        <RegisterV3
          domain={getDomainWithoutStark(domain)}
          groups={[
            process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? "",
            process.env.NEXT_PUBLIC_MAILING_LIST_GROUP_AUTO_RENEWAL ?? "",
          ]}
        />
      </div>
    </div>
  );
};

export default RegistrationPage;
