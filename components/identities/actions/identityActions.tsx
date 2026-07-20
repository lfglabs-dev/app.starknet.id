import React, { type FunctionComponent, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/router";
import ChangeAddressModal from "./changeAddressModal";
import TransferFormModal from "./transferFormModal";
import SubdomainModal from "./subdomainModal";
import ClickableAction from "../../UI/iconsComponents/clickableAction";
import styles from "../../../styles/components/identityMenu.module.css";
import theme from "../../../styles/theme";
import MainIcon from "../../UI/iconsComponents/icons/mainIcon";
import TransferIcon from "../../UI/iconsComponents/icons/transferIcon";
import PlusIcon from "../../UI/iconsComponents/icons/plusIcon";
import TxConfirmationModal from "../../UI/txConfirmationModal";
import UnframedIcon from "../../UI/iconsComponents/icons/unframedIcon";
import SignsIcon from "../../UI/iconsComponents/icons/signsIcon";
import PyramidIcon from "../../UI/iconsComponents/icons/pyramidIcon";
import RenewalIcon from "@/components/UI/iconsComponents/icons/renewalIcon";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import { prepareSetMainIntent } from "@/lib/transactions/intents";
import { SN_MAIN } from "@/lib/chain/manifest";
import type { OwnedIdentity } from "@/lib/core/types";
import type { IdentityView } from "@/lib/ui/identity";
import { readableDate } from "@/lib/ui/identity";

type IdentityActionsProps = {
  identity?: IdentityView;
  tokenId: string;
  isOwner: boolean;
  identities?: OwnedIdentity[];
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
  isOwner,
  identities = [],
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isSubdomainFormOpen, setIsSubdomainFormOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [viewMoreClicked, setViewMoreClicked] = useState(false);
  const { address } = useAccount();
  const router = useRouter();
  const submitPrepared = usePreparedTransaction();
  const isMainDomain = Boolean(identity?.isMain);
  const isExpired = Boolean(
    identity?.domainExpiry &&
      identity.domainExpiry < Math.floor(Date.now() / 1000)
  );
  const isRootDomain = Boolean(
    identity?.domain && identity.domain.slice(0, -6).split(".").length === 1
  );
  const showChangeTargetButtonByDefault = !isRootDomain;

  async function setMainId(): Promise<void> {
    if (!address) return;
    try {
      const hash = await submitPrepared(() =>
        prepareSetMainIntent(address, tokenId)
      );
      setTxHash(hash);
      setIsTxModalOpen(true);
    } catch (error) {
      console.error("Failed to set the main identity:", error);
    }
  }

  return (
    <div className={styles.actionsContainer}>
      <>
        <div className={styles.identityActions}>
          {identity && (!isOwner || !address) && identity.domain && (
            <>
              <ClickableAction
                title="View on Unframed"
                icon={
                  <UnframedIcon
                    width="30"
                    color={theme.palette.secondary.main}
                  />
                }
                description="Check this identity on Unframed"
                onClick={() =>
                  window.open(
                    `https://unframed.co/item/${SN_MAIN.contracts.identity.address}/${tokenId}`
                  )
                }
              />
              <ClickableAction
                title="View on Pyramid"
                icon={
                  <PyramidIcon
                    width="25"
                    color={theme.palette.secondary.main}
                  />
                }
                description="Check this identity on Pyramid"
                onClick={() =>
                  window.open(
                    `https://pyramid.market/collection/${SN_MAIN.contracts.identity.address}/${tokenId}`
                  )
                }
              />
            </>
          )}
          {identity && isOwner && address && identity.domain && (
            <div className={styles.identityActions}>
              {isExpired ? (
                <ClickableAction
                  title="RENEW YOUR DOMAIN"
                  severe={true}
                  style="primary"
                  description={`Expired on ${readableDate(
                    identity.domainExpiry ?? 0
                  )}`}
                  icon={<RenewalIcon width="18" color="#d32f2f" />}
                  onClick={() => router.push("/renewal")}
                />
              ) : (
                <>
                  {isRootDomain ? (
                    <ClickableAction
                      title="RENEW YOUR DOMAIN"
                      style="primary"
                      description={`Will expire on ${readableDate(
                        identity.domainExpiry ?? 0
                      )}`}
                      icon={
                        <RenewalIcon
                          width="18"
                          color={theme.palette.primary.main}
                        />
                      }
                      onClick={() => router.push("/renewal")}
                    />
                  ) : null}

                  {showChangeTargetButtonByDefault && (
                    <ClickableAction
                      title="CHANGE DOMAIN TARGET"
                      description="Change target address"
                      icon={
                        <SignsIcon
                          width="23"
                          color={theme.palette.secondary.main}
                        />
                      }
                      onClick={() => setIsAddressFormOpen(true)}
                    />
                  )}

                  {viewMoreClicked ? (
                    <>
                      {!showChangeTargetButtonByDefault && (
                        <ClickableAction
                          title="CHANGE DOMAIN TARGET"
                          description="Change target address"
                          icon={
                            <SignsIcon
                              width="23"
                              color={theme.palette.secondary.main}
                            />
                          }
                          onClick={() => setIsAddressFormOpen(true)}
                        />
                      )}
                      <ClickableAction
                        title="MOVE YOUR IDENTITY NFT"
                        description="Transfer your identity to another wallet"
                        icon={
                          <TransferIcon
                            width="20"
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
                            width="18"
                            color={theme.palette.secondary.main}
                          />
                        }
                        onClick={() => setIsSubdomainFormOpen(true)}
                      />
                      {!isMainDomain && (
                        <ClickableAction
                          title="Set as main domain"
                          description="Set this identity as your main id"
                          icon={
                            <MainIcon
                              width="21"
                              firstColor={theme.palette.secondary.main}
                              secondColor={theme.palette.secondary.main}
                            />
                          }
                          onClick={() => void setMainId()}
                        />
                      )}
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
                </>
              )}
            </div>
          )}
        </div>
        <ChangeAddressModal
          handleClose={() => setIsAddressFormOpen(false)}
          isModalOpen={isAddressFormOpen}
          identity={identity}
          tokenId={tokenId}
          currentTargetAddress={identity?.targetAddress}
        />
        <TransferFormModal
          tokenId={tokenId}
          handleClose={() => setIsTransferFormOpen(false)}
          isModalOpen={isTransferFormOpen}
        />
        <SubdomainModal
          handleClose={() => setIsSubdomainFormOpen(false)}
          isModalOpen={isSubdomainFormOpen}
          domain={identity?.domain}
          identities={identities}
        />
        <TxConfirmationModal
          txHash={txHash}
          isTxModalOpen={isTxModalOpen}
          closeModal={() => setIsTxModalOpen(false)}
          title="Your Transaction is on it's way !"
        />
      </>
    </div>
  );
};

export default IdentityActions;
