import React from "react";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import ExternalDomainCard from "../../components/domains/externalDomainCard";
import ExternalDomainActions from "../../components/domains/externalDomainActions";
import { useAddressFromDomain, useDomainFromAddress } from "../../hooks/naming";
import { useAccount } from "@starknet-react/core";

const ExternalDomain: NextPage = () => {
  const router = useRouter();
  const domain = router.query.externalDomain as string;
  const { address } = useAccount();
  const { domain: mainDomain } = useDomainFromAddress(address);
  const { address: targetAddress } = useAddressFromDomain(domain);

  return (
    <div className={homeStyles.screen}>
      <div className={homeStyles.wrapperScreen}>
        <div className={styles.containerIdentity}>
          <div className={styles.identityBox}>
            <ExternalDomainCard
              domain={domain}
              isMainDomain={mainDomain === domain}
              targetAddress={targetAddress ?? ""}
            />
            <ExternalDomainActions
              domain={domain}
              targetAddress={targetAddress ?? ""}
              isMainDomain={mainDomain === domain}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDomain;
