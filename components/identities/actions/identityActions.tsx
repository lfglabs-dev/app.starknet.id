import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import ChangeAddressModal from "./changeAddressModal";
import TransferFormModal from "./transferFormModal";
import SubdomainModal from "./subdomainModal";
import RenewalModal from "./renewalModal";
import { hexToDecimal } from "../../../utils/feltService";
import IdentitiesActionsSkeleton from "./identitiesActionsSkeleton";
import ClickableAction from "../../UI/iconsComponents/clickableAction";
import styles from "../../../styles/components/identityMenu.module.css";
import { timestampToReadableDate } from "../../../utils/dateService";
import { utils } from "starknetid.js";

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
  const encodedDomains = utils.encodeDomain(identity?.domain);
  const isAccountTargetAddress = identity?.addr === hexToDecimal(address);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  //UseState viewMoreClicked
  const [viewMoreClicked, setViewMoreClicked] = useState<boolean>(false);

  // Add all subdomains to the parameters
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
                <ClickableAction
                  title="View on Mintsquare"
                  icon="mintsquare"
                  description="Check this identity on Mintsquare"
                  onClick={() =>
                    window.open(
                      `https://mintsquare.io/asset/starknet/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                    )
                  }
                />

                <ClickableAction
                  title="View on Aspect"
                  icon="aspect"
                  description="Check this identity on Aspect"
                  onClick={() =>
                    window.open(
                      `https://aspect.co/asset/${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT}/${tokenId}`
                    )
                  }
                />
              </>
            )}
            {identity && isOwner && (
              <div className="flex flex-col items-center justify-center">
                {callDataEncodedDomain[0] === 1 ? (
                  <ClickableAction
                    title="RENEW YOUR DOMAIN"
                    style="primary"
                    description={`Expires on ${timestampToReadableDate(
                      identity?.domain_expiry ?? 0
                    )}`}
                    icon="change"
                    onClick={() => setIsRenewFormOpen(true)}
                  />
                ) : null}
                {!identity.is_owner_main && (
                  <ClickableAction
                    title="Set as main domain"
                    description="Set this domain as your main domain"
                    icon="main"
                    onClick={() => setAddressToDomain()}
                  />
                )}
                <ClickableAction
                  title="CHANGE THE TARGET"
                  description="Change the current target address"
                  icon="address"
                  onClick={() => setIsAddressFormOpen(true)}
                />

                {viewMoreClicked ? (
                  <>
                    <ClickableAction
                      title="MOVE YOUR IDENTITY"
                      description="Move your identity to another wallet"
                      icon="transfer"
                      onClick={() => setIsTransferFormOpen(true)}
                    />
                    <ClickableAction
                      title="CREATE A SUBDOMAIN"
                      description="Create a new subdomain"
                      icon="plus"
                      onClick={() => setIsSubdomainFormOpen(true)}
                    />
                    <ClickableAction
                      title="ENABLE AUTOMATIC RENEWAL"
                      description="Ensure your domain is renewed automatically"
                      icon="change"
                      onClick={() => setIsTransferFormOpen(true)}
                    />
                    <p
                      onClick={() => setViewMoreClicked(false)}
                      className={styles.viewMore}
                    >
                      View less
                    </p>
                  </>
                ) : (
                  <p
                    onClick={() => setViewMoreClicked(true)}
                    className={styles.viewMore}
                  >
                    View more
                  </p>
                )}
              </div>
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
