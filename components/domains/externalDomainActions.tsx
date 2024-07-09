import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import styles from "../../styles/components/identityMenu.module.css";
import { utils } from "starknetid.js";
import ClickableAction from "../UI/iconsComponents/clickableAction";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import theme from "../../styles/theme";
import TransferIcon from "../UI/iconsComponents/icons/transferIcon";
import { getDomainKind } from "@/utils/stringService";
import ExternalDomainsTransferModal from "./externalDomainTransferModal";
import { getResolverContract } from "@/utils/resolverService";
import resolverCalls from "@/utils/callData/resolverCalls";

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
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const domainKind = getDomainKind(domain);

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
  const { writeAsync: set_address_to_domain } = useContractWrite({
    calls: [resolverCalls.setAddresstoDomain(callDataEncodedDomain)],
  });

  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  return (
    <>
      <div className={styles.actionsContainer}>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            {isOwner && !isMainDomain && (
              <ClickableAction
                title="Set as main domain"
                description="Display this domain when connecting to dapps"
                icon={
                  <MainIcon
                    width="25"
                    firstColor={theme.palette.secondary.main}
                    secondColor={theme.palette.secondary.main}
                  />
                }
                onClick={() => setAddressToDomain()}
              />
            )}
            {isOwner &&
              (domainKind === "xplorer" || domainKind === "braavos") && (
                <ClickableAction
                  title="Transfer your domain"
                  description="Transfer your subdomain to another wallet"
                  icon={
                    <TransferIcon
                      width="25"
                      color={theme.palette.secondary.main}
                    />
                  }
                  onClick={() => setIsTransferFormOpen(true)}
                />
              )}
          </div>
        </div>
      </div>
      <ExternalDomainsTransferModal
        domain={domain}
        domainEncoded={callDataEncodedDomain[1] as string}
        resolverContract={getResolverContract(domainKind)}
        handleClose={() => setIsTransferFormOpen(false)}
        isModalOpen={isTransferFormOpen}
        domainKind={domainKind}
      />
    </>
  );
};

export default ExternalDomainActions;
