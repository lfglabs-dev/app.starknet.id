import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import homeStyles from "@/styles/Home.module.css";
import styles from "@/styles/search.module.css";
import RegisterV3 from "@/components/domains/registerV3";
import { isRootDomain, normalizeDomain } from "@/lib/chain/domain";

const RegistrationPage: NextPage = () => {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof router.query.domainToRegister !== "string") return;
    try {
      const normalized = normalizeDomain(router.query.domainToRegister);
      if (isRootDomain(normalized)) setDomain(normalized);
      else void router.replace("/");
    } catch {
      void router.replace("/");
    }
  }, [router]);

  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        {domain ? <RegisterV3 domain={domain} setDomain={setDomain} /> : null}
      </div>
    </div>
  );
};

export default RegistrationPage;
