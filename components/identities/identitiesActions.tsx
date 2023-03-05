import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useEncodedSeveral } from "../../hooks/naming";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import ChangeAddressModal from "./actions/changeAddressModal";
import { getDomainWithoutStark } from "../../utils/stringService";
import TransferFormModal from "./actions/transferFormModal";
import SubdomainModal from "./actions/subdomainModal";
import RenewalModal from "./actions/renewalModal";
import { Identity } from "../../types/backTypes";
import { hexToDecimal } from "../../utils/feltService";
import IdentitiesActionsSkeleton from "../UI/identitiesActionsSkeleton";
import ClickacbleAction from "../UI/iconsComponents/clickableAction";
import styles from "../../styles/components/identityMenu.module.css";

type IdentityActionsProps = {
  identity?: Identity;
  tokenId: string;
  isIdentityADomain: boolean;
  hideActionsHandler: (state: boolean) => void;
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
  isIdentityADomain,
  hideActionsHandler,
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [isRenewFormOpen, setIsRenewFormOpen] = useState<boolean>(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const [isSubdomainFormOpen, setIsSubdomainFormOpen] =
    useState<boolean>(false);
  const { address } = useAccount();
  const encodedDomains = useEncodedSeveral(
    getDomainWithoutStark(identity ? identity.domain : "").split(".") ?? []
  );
  const isAccountTargetAddress = identity?.addr === hexToDecimal(address);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Add all subdomains to the parameters
  const callDataEncodedDomain: (number | string)[] = [encodedDomains.length];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain);
  });

  //Set as main domain execute
  const set_address_to_domain_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: callDataEncodedDomain,
  };
  const set_domain_to_address_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_domain_to_address",
    calldata: [...callDataEncodedDomain, hexToDecimal(address)],
  };
  const { execute: set_address_to_domain } = useStarknetExecute({
    calls: isAccountTargetAddress
      ? set_address_to_domain_calls
      : [set_domain_to_address_calls, set_address_to_domain_calls],
  });

  function setAddressToDomain(): void {
    set_address_to_domain();
  }

  useEffect(() => {
    type fullIds = { id: string; domain: string };

    function checkIfOwner(fullIds: fullIds[]): boolean {
      let isOwner = false;

      for (let i = 0; i < fullIds.length; i++) {
        if (fullIds[i].id === tokenId) {
          isOwner = true;
        }
      }

      return isOwner;
    }

    if (address && tokenId) {
      setLoading(true);
      // Our Indexer
      fetch(`/api/indexer/addr_to_full_ids?addr=${hexToDecimal(address)}`)
        .then((response) => response.json())
        .then((data) => {
          setIsOwner(checkIfOwner(data.full_ids));
          setLoading(false);
        });
    }
  }, [address, tokenId]);

  if (!isIdentityADomain) {
    hideActionsHandler(true);
  } else {
    hideActionsHandler(false);
  }

  return (
    <div className={styles.actionsContainer}>
      {loading ? (
        <IdentitiesActionsSkeleton />
      ) : (
        <>
          <div className="flex flex-col items-center justify-center">
            {identity && !isOwner && isIdentityADomain && (
              <>
                <div className="m-2">
                  <ClickacbleAction
                    title="View on Mintsquare"
                    icon="mintsquare"
                    onClick={() =>
                      window.open(
                        `https://mintsquare.io/asset/starknet/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                      )
                    }
                  />
                </div>
                <div className="m-2">
                  <ClickacbleAction
                    title="View on Aspect"
                    icon="aspect"
                    onClick={() =>
                      window.open(
                        `https://aspect.co/asset/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                      )
                    }
                  />
                </div>
              </>
            )}
            {identity && isOwner && (
              <>
                {callDataEncodedDomain[0] === 1 ? (
                  <div className="m-2">
                    <ClickacbleAction
                      title="RENEW YOUR IDENTITY"
                      icon="change"
                      onClick={() => setIsRenewFormOpen(true)}
                    />
                  </div>
                ) : null}
                <div className="m-2">
                  <ClickacbleAction
                    title="CHANGE THE TARGET"
                    icon="address"
                    onClick={() => setIsAddressFormOpen(true)}
                  />
                </div>
                <div className="m-2">
                  <ClickacbleAction
                    title="MOVE YOUR IDENTITY"
                    icon="transfer"
                    onClick={() => setIsTransferFormOpen(true)}
                  />
                </div>
                <div className="m-2">
                  <ClickacbleAction
                    title="CREATE A SUBDOMAIN"
                    icon="plus"
                    onClick={() => setIsSubdomainFormOpen(true)}
                  />
                </div>
                {!identity.is_owner_main && (
                  <div className="m-2">
                    <ClickacbleAction
                      title="Set as main domain"
                      icon="main"
                      onClick={() => setAddressToDomain()}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <RenewalModal
            handleClose={() => setIsRenewFormOpen(false)}
            isModalOpen={isRenewFormOpen}
            callDataEncodedDomain={callDataEncodedDomain}
            identity={identity}
          />
          <ChangeAddressModal
            handleClose={() => setIsAddressFormOpen(false)}
            isModalOpen={isAddressFormOpen}
            callDataEncodedDomain={callDataEncodedDomain}
            domain={identity?.domain}
            currentTargetAddress={identity?.addr}
          />
          <TransferFormModal
            handleClose={() => setIsTransferFormOpen(false)}
            isModalOpen={isTransferFormOpen}
            callDataEncodedDomain={callDataEncodedDomain}
            domain={identity?.domain}
          />
          <SubdomainModal
            handleClose={() => setIsSubdomainFormOpen(false)}
            isModalOpen={isSubdomainFormOpen}
            callDataEncodedDomain={callDataEncodedDomain}
            domain={identity?.domain}
          />
        </>
      )}
    </div>
  );
};

export default IdentityActions;
