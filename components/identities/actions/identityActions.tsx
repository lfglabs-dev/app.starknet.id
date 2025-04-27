import React, { useContext, useMemo } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import ChangeAddressModal from "./changeAddressModal";
import TransferFormModal from "./transferFormModal";
import SubdomainModal from "./subdomainModal";
import { hexToDecimal } from "../../../utils/feltService";
import ClickableAction from "../../UI/iconsComponents/clickableAction";
import styles from "../../../styles/components/identityMenu.module.css";
import { timestampToReadableDate } from "../../../utils/dateService";
import { utils } from "starknetid.js";
import theme from "../../../styles/theme";
import MainIcon from "../../UI/iconsComponents/icons/mainIcon";
import TransferIcon from "../../UI/iconsComponents/icons/transferIcon";
import PlusIcon from "../../UI/iconsComponents/icons/plusIcon";
import TxConfirmationModal from "../../UI/txConfirmationModal";
import UnframedIcon from "../../UI/iconsComponents/icons/unframedIcon";
import SignsIcon from "../../UI/iconsComponents/icons/signsIcon";
import { Call } from "starknet";
import { useRouter } from "next/router";
import autoRenewalCalls from "../../../utils/callData/autoRenewalCalls";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { posthog } from "posthog-js";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import PyramidIcon from "../../UI/iconsComponents/icons/pyramidIcon";
import { StarknetIdJsContext } from "@/context/StarknetIdJsProvider";
import RenewalIcon from "@/components/UI/iconsComponents/icons/renewalIcon";
import ActiveSubscriptionCard from "./ActiveSubscriptionCard";
import Button from "@/components/UI/button";

type IdentityActionsProps = {
  identity?: Identity;
  tokenId: string;
  isIdentityADomain: boolean;
  isOwner: boolean;
};

const IdentityActions: FunctionComponent<IdentityActionsProps> = ({
  identity,
  tokenId,
  isIdentityADomain,
  isOwner,
}) => {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState<boolean>(false);
  const [isSubdomainFormOpen, setIsSubdomainFormOpen] =
    useState<boolean>(false);
  const { address } = useAccount();
  const encodedDomains = utils.encodeDomain(identity?.domain);
  const { addTransaction } = useNotificationManager();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [viewMoreClicked, setViewMoreClicked] = useState<boolean>(false);
  const [isMainDomain, setIsMainDomain] = useState<boolean>(
    identity ? identity.isMain : false
  );

  const router = useRouter();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);

  const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState({
    domain: "",
    enabled: false,
  });
  const [autoRenewalData, setAutoRenewalData] = useState<RenewalData[]>([]);
  const [hasReverseAddressRecord, setHasReverseAddressRecord] =
    useState<boolean>(false);
  const [disableRenewalCalldata, setDisableRenewalCalldata] = useState<Call[]>(
    []
  );

  const { sendAsync: disableRenewal, data: disableRenewalData } =
    useSendTransaction({
      calls: disableRenewalCalldata,
    });

  useEffect(() => {
    if (starknetIdNavigator !== null && address !== undefined) {
      starknetIdNavigator.getStarkName(address).then((name: string) => {
        if (name !== identity?.domain) setIsMainDomain(false);
      });
    }
  }, [address, identity, starknetIdNavigator]);

  const nextAutoRenew = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const monthInSeconds = 60 * 60 * 24 * 30;
    if (identity?.domainExpiry) {
      if (identity?.domainExpiry + monthInSeconds < now) {
        return "Next today";
      } else {
        return (
          "Next payment on " +
          timestampToReadableDate(identity?.domainExpiry - monthInSeconds)
        );
      }
    }
  }, [identity]);

  const callDataEncodedDomain: string[] = [encodedDomains.length.toString()];
  encodedDomains.forEach((domain) => {
    callDataEncodedDomain.push(domain.toString(10));
  });

  const { sendAsync: setMainId, data: mainDomainData } = useSendTransaction({
    calls: identity
      ? identityChangeCalls.setAsMainId(
          identity,
          hasReverseAddressRecord,
          callDataEncodedDomain
        )
      : [],
  });

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/addr_has_rev?addr=${address}`)
      .then((response) => response.json())
      .then((reverseAddressData) => {
        setHasReverseAddressRecord(reverseAddressData.has_rev);
      });
  }, [address]);

  useEffect(() => {
    if (!identity?.domain) return;
    setIsAutoRenewalEnabled((prev) => ({
      domain: identity.domain as string,
      enabled: prev.enabled,
    }));
  }, [identity]);

  useEffect(() => {
    if (!address || !identity?.domain || !isOwner) return;
    fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_LINK
      }/renewal/get_renewal_data?addr=${hexToDecimal(address)}&domain=${
        identity.domain
      }`
    )
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching renewal data:", error);
      })
      .then((data) => {
        let res = false;
        if (data && !data.error && data.length > 0) {
          const filteredData = data.filter((elem: RenewalData) => elem.enabled);
          if (filteredData.length > 0) {
            res = true;
            setAutoRenewalData(filteredData);
          } else {
            res = false;
          }
        }
        setIsAutoRenewalEnabled((prev) =>
          prev.domain === identity.domain
            ? {
                domain: identity.domain as string,
                enabled: res,
              }
            : prev
        );
      });
  }, [address, tokenId, identity, isOwner]);

  useEffect(() => {
    if (!mainDomainData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: "Set as main id",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.MAIN_DOMAIN,
        hash: mainDomainData.transaction_hash,
        status: "pending",
      },
    });
    setTxHash(mainDomainData.transaction_hash);
    setIsTxModalOpen(true);
  }, [mainDomainData]);

  useEffect(() => {
    if (isAutoRenewalEnabled.enabled) {
      const disableCallData: Call[] = [];
      autoRenewalData.forEach((renewalData) => {
        disableCallData.push(
          autoRenewalCalls.disableRenewal(
            renewalData.auto_renew_contract ??
              (process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string),
            callDataEncodedDomain[1].toString()
          )
        );
      });
      setDisableRenewalCalldata(disableCallData);
    }
  }, [autoRenewalData, isAutoRenewalEnabled.enabled]);

  useEffect(() => {
    if (!disableRenewalData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Disabled auto renewal for ${identity?.domain}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.DISABLE_AUTORENEW,
        hash: disableRenewalData.transaction_hash,
        status: "pending",
      },
    });
    setTxHash(disableRenewalData.transaction_hash);
    setIsTxModalOpen(true);
    posthog?.capture("disable-ar");
  }, [disableRenewalData]);

  const isExpired = useMemo(() => {
    return identity?.domainExpiry
      ? identity.domainExpiry < Math.floor(Date.now() / 1000)
      : false;
  }, [identity]);

  // Determine whether to show change target button by default or in the "view more" section
  // Show by default for subdomains (callDataEncodedDomain[0] !== "1") or when auto-renewal is enabled
  const showChangeTargetButtonByDefault = !(
    callDataEncodedDomain?.[0] === "1" && !isAutoRenewalEnabled.enabled
  );

  return (
    <div className={styles.actionsContainer}>
      <>
        <div className={styles.identityActions}>
          {identity && (!isOwner || !address) && isIdentityADomain && (
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
                    `https://unframed.co/item/${process.env.NEXT_PUBLIC_IDENTITY_CONTRACT}/${tokenId}`
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
                    `https://pyramid.market/collection/${process.env.NEXT_PUBLIC_IDENTITY_CONTRACT}/${tokenId}`
                  )
                }
              />
            </>
          )}
          {identity && isOwner && address && (
            <div className={styles.identityActions}>
              {isExpired ? (
                <ClickableAction
                  title="RENEW YOUR DOMAIN"
                  severe={true}
                  style="primary"
                  description={`Expired on ${timestampToReadableDate(
                    identity?.domainExpiry ?? 0
                  )}`}
                  icon={<RenewalIcon width="18" color="#d32f2f" />}
                  onClick={() => router.push("/renewal")}
                />
              ) : (
                <>
                  {callDataEncodedDomain[0] === "1" ? (
                    <ClickableAction
                      title="RENEW YOUR DOMAIN"
                      style="primary"
                      description={`Will expire on ${timestampToReadableDate(
                        identity?.domainExpiry ?? 0
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

                  {callDataEncodedDomain?.[0] === "1" &&
                    !isAutoRenewalEnabled.enabled && (
                      <div
                        className="w-full mt-4 h-[124px] pt-4 pr-3 pb-4 pl-3 gap-4 rounded-[16px] border-[1px] border-[#4545451A] bg-white shadow-[0px_2px_30px_0px_rgba(0,0,0,0.06)]"
                        aria-label="Inactive subscription information"
                      >
                        {/* Content for subscription */}
                        <Button
                          onClick={() => router.push("/subscription")}
                        >
                          Activate subscription
                        </Button>
                      </div>
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
                          onClick={() => setMainId()}
                        />
                      )}

                      {callDataEncodedDomain?.[0] === "1" &&
                        isAutoRenewalEnabled.enabled && (
                          <ActiveSubscriptionCard identity={identity} />
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
          callDataEncodedDomain={callDataEncodedDomain}
          identity={identity}
          currentTargetAddress={identity?.targetAddress}
        />
        <TransferFormModal
          identity={identity}
          handleClose={() => setIsTransferFormOpen(false)}
          isModalOpen={isTransferFormOpen}
        />
        <SubdomainModal
          handleClose={() => setIsSubdomainFormOpen(false)}
          isModalOpen={isSubdomainFormOpen}
          callDataEncodedDomain={callDataEncodedDomain}
          domain={identity?.domain}
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
