import React from "react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/search.module.css";
import {
  getDomainWithoutStark,
  isStarkRootDomain,
} from "../../utils/stringService";
import RegisterV3 from "../../components/domains/registerV3";
import { FormProvider } from "@/context/FormProvider";

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
    <FormProvider>
      <div className={homeStyles.screen}>
        <div className={styles.container}>
          <RegisterV3
            domain={getDomainWithoutStark(domain)}
            setDomain={setDomain}
            groups={[
              process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? "",
              process.env.NEXT_PUBLIC_MAILING_LIST_GROUP_AUTO_RENEWAL ?? "",
            ]}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default RegistrationPage;
