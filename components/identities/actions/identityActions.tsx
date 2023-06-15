import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
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
import theme from "../../../styles/theme";
import AspectIcon from "../../UI/iconsComponents/icons/aspectIcon";
import MainIcon from "../../UI/iconsComponents/icons/mainIcon";
import AddressIcon from "../../UI/iconsComponents/icons/addressIcon";
import ChangeIcon from "../../UI/iconsComponents/icons/changeIcon";
import TransferIcon from "../../UI/iconsComponents/icons/transferIcon";
import PlusIcon from "../../UI/iconsComponents/icons/plusIcon";

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
  const { addTransaction } = useTransactionManager();
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
  const { writeAsync: set_address_to_domain, data: mainDomainData } =
    useContractWrite({
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
    if (!mainDomainData?.transaction_hash) return;
    addTransaction({ hash: mainDomainData?.transaction_hash ?? "" });
  }, [mainDomainData]);

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
                  title="View on Aspect"
                  icon={
                    <AspectIcon
                      width="25"
                      color={theme.palette.secondary.main}
                    />
                  }
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
                    icon={
                      <ChangeIcon
                        width="25"
                        color={theme.palette.primary.main}
                      />
                    }
                    onClick={() => setIsRenewFormOpen(true)}
                  />
                ) : null}
                {!identity.is_owner_main && (
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
                )}
                <ClickableAction
                  title="CHANGE THE TARGET"
                  description="Change the current target address"
                  icon={
                    <AddressIcon
                      width="25"
                      color={theme.palette.secondary.main}
                    />
                  }
                  onClick={() => setIsAddressFormOpen(true)}
                />

                {viewMoreClicked ? (
                  <>
                    <ClickableAction
                      title="MOVE YOUR IDENTITY"
                      description="Move your identity to another wallet"
                      icon={
                        <TransferIcon
                          width="25"
                          color={theme.palette.secondary.main}
                        />
                      }
                      onClick={() => setIsTransferFormOpen(true)}
                    />
                    <ClickableAction
                      title="CREATE A SUBDOMAIN"
                      description="Create a new subdomain"
                      icon={
                        <PlusIcon
                          width="25"
                          color={theme.palette.secondary.main}
                        />
                      }
                      onClick={() => setIsSubdomainFormOpen(true)}
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
