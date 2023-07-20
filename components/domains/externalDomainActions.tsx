import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import styles from "../../styles/components/identityMenu.module.css";
import { utils } from "starknetid.js";
import ClickableAction from "../UI/iconsComponents/clickableAction";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import theme from "../../styles/theme";
import TxConfirmationModal from "../UI/txConfirmationModal";
import { posthog } from "posthog-js";

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
  const { addTransaction } = useTransactionManager();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

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
  const { writeAsync: set_address_to_domain, data: mainDomainData } =
    useContractWrite({
      calls: set_address_to_domain_calls,
    });

  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  useEffect(() => {
    if (!mainDomainData?.transaction_hash) return;
    posthog?.capture("setAsMainDomain");
    addTransaction({ hash: mainDomainData?.transaction_hash ?? "" });
    setIsTxModalOpen(true);
  }, [mainDomainData]);

  return (
    <div className={styles.actionsContainer}>
      <div className="flex flex-col items-center justify-center">
        {isOwner && !isMainDomain && (
          <div className="flex flex-col items-center justify-center">
            <ClickableAction
              title="Set as main domain"
              description="Set this domain as your main domain"
              icon={
                <MainIcon
                  width="25"
                  firstColor={theme.palette.secondary.main}
                  secondColor={theme.palette.secondary.main}
                />
              }
              onClick={() => setAddressToDomain()}
            />
          </div>
        )}
      </div>
      <TxConfirmationModal
        txHash={mainDomainData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your Transaction is on it's way !"
      />
    </div>
  );
};

export default ExternalDomainActions;
