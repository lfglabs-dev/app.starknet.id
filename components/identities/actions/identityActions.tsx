import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
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
import AutoRenewalModal from "./autoRenewalModal";
import { useRenewalContract } from "../../../hooks/contracts";
import { Abi } from "starknet";

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
  // AutoRenewals
  const [isAutoRenewalOpen, setIsAutoRenewalOpen] = useState<boolean>(false);
  const [hasAutoRenewalEnabled, setHasAutoRenewalEnabled] =
    useState<boolean>(false);
  const { contract: renewalContract } = useRenewalContract();

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
  const { writeAsync: set_address_to_domain } = useContractWrite({
    calls: isAccountTargetAddress
      ? set_address_to_domain_calls
      : [set_domain_to_address_calls, set_address_to_domain_calls],
  });

  const { data: renewData, error: renewError } = useContractRead({
    address: renewalContract?.address as string,
    abi: renewalContract?.abi as Abi,
    functionName: "is_renewing",
    args: [
      callDataEncodedDomain[0] === 1 ? encodedDomains[0].toString(10) : 0,
      identity?.addr,
    ],
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
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setIsOwner(checkIfOwner(data.full_ids));
          setLoading(false);
        });
    }
  }, [address, tokenId]);

  useEffect(() => {
    if (renewError || !renewData) setHasAutoRenewalEnabled(false);
    else {
      if (Number(renewData?.["res"])) setHasAutoRenewalEnabled(true);
    }
  }, [tokenId, renewData, renewError]);

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
                    {callDataEncodedDomain[0] === 1 ? (
                      <ClickableAction
                        title={`${
                          hasAutoRenewalEnabled ? "DISABLE" : "ENABLE"
                        } AUTO RENEWAL`}
                        description="Don't lose your domain!"
                        icon="change"
                        onClick={() => setIsAutoRenewalOpen(true)}
                      />
                    ) : null}
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
          <AutoRenewalModal
            handleClose={() => setIsAutoRenewalOpen(false)}
            isModalOpen={isAutoRenewalOpen}
            callDataEncodedDomain={callDataEncodedDomain}
            identity={identity}
            isEnabled={hasAutoRenewalEnabled}
          />
        </>
      )}
    </div>
  );
};

export default IdentityActions;
