import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount, useContractWrite } from "@starknet-react/core";
import styles from "../../styles/components/identityMenu.module.css";
import { utils } from "starknetid.js";
import ClickableAction from "../UI/iconsComponents/clickableAction";

type ExternalDomainActionsProps = {
  domain: string;
  targetAddress: string;
  isMainDomain: boolean;
};

const ExternalDomainActions: FunctionComponent<ExternalDomainActionsProps> = ({
  domain,
  targetAddress,
  isMainDomain,
}) => {
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    if (targetAddress === address) {
      setIsOwner(true);
    }
  }, [targetAddress, address]);

  // Add all subdomains to the parameters
  const encodedDomains = utils.encodeDomain(domain);
  const callDataEncodedDomain: (number | string)[] = [encodedDomains.length];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain.toString(10));
  });

  //Set as main domain execute
  const set_address_to_domain_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: callDataEncodedDomain,
  };
  const { writeAsync: set_address_to_domain } = useContractWrite({
    calls: set_address_to_domain_calls,
  });

  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  return (
    <div className={styles.actionsContainer}>
      <div className="flex flex-col items-center justify-center">
        {isOwner && !isMainDomain && (
          <div className="flex flex-col items-center justify-center">
            <ClickableAction
              title="Set as main domain"
              description="Set this domain as your main domain"
              icon="main"
              onClick={() => setAddressToDomain()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalDomainActions;
