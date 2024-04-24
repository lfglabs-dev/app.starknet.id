import React, { useEffect, useState } from "react";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import IdentityWarnings from "../../components/identities/identityWarnings";
import IdentityCard from "../../components/identities/identityCard";
import IdentityActions from "../../components/identities/actions/identityActions";
import { useAccount } from "@starknet-react/core";
import IdentityPageSkeleton from "../../components/identities/skeletons/identityPageSkeleton";
import UpdateProfilePic from "../../components/identities/updateProfilePic";
import TxConfirmationModal from "../../components/UI/txConfirmationModal";
import BackButton from "../../components/UI/backButton";
import { Identity } from "../../utils/apiWrappers/identity";
import { formatHexString } from "../../utils/stringService";
import { getDomainData } from "@/utils/cacheDomainData";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const [isIdentityADomain, setIsIdentityADomain] = useState<
    boolean | undefined
  >();
  const [hideActions, setHideActions] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [isUpdatingPp, setIsUpdatingPp] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [ppTxHash, setPpTxHash] = useState<string>();
  const [ppImageUrl, setPpImageUrl] = useState("");

  useEffect(() => {
    if (!identity || !address) return;
    setIsOwner(identity.ownerAddress === formatHexString(address));
  }, [identity, address]);

  useEffect(() => {
    if (!identity) {
      setPpImageUrl("");
      return;
    }

    const fetchProfilePic = async () => {
      try {
        const imgUrl = await identity.getPfpFromVerifierData();
        setPpImageUrl(imgUrl);
      } catch (error) {
        setPpImageUrl("");
      }
    };

    fetchProfilePic();
  }, [identity]);

  const hideActionsHandler = (state: boolean) => {
    if (state == true) {
      setHideActions(true);
    } else {
      setHideActions(false);
    }
  };

  useEffect(() => {
    if (tokenId) {
      const refreshData = () =>
        fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/id_to_data?id=${tokenId}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(await response.text());
            }
            return response.json();
          })
          .then((data: IdentityData) => {
            setIdentity(new Identity(data));
            setIsIdentityADomain(Boolean(data?.domain));
          })
          .catch(() => {
            // Domain data might not be indexed yet, so we check local storage
            const domainData = getDomainData(tokenId);
            if (domainData) {
              setIdentity(new Identity(domainData));
              setIsIdentityADomain(Boolean(domainData?.domain));
            } else {
              setIsIdentityADomain(false);
            }
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId]);

  return (
    <>
      <div className={styles.screen}>
        {isIdentityADomain === undefined ? (
          <IdentityPageSkeleton />
        ) : !isUpdatingPp ? (
          <div className={homeStyles.wrapperScreen}>
            <div className={styles.backButton}>
              <BackButton onClick={() => window.history.back()} />
            </div>
            <div className={styles.containerIdentity}>
              <>
                <div className={styles.identityBox}>
                  <IdentityCard
                    identity={identity}
                    tokenId={tokenId}
                    isOwner={isOwner}
                    onPPClick={() => setIsUpdatingPp(true)}
                    ppImageUrl={ppImageUrl}
                  />
                  {!hideActions && (
                    <IdentityActions
                      isOwner={isOwner}
                      tokenId={tokenId}
                      isIdentityADomain={isIdentityADomain}
                      identity={identity}
                      hideActionsHandler={hideActionsHandler}
                    />
                  )}
                </div>
                <IdentityWarnings
                  isIdentityADomain={isIdentityADomain}
                  identity={identity}
                />
              </>
            </div>
          </div>
        ) : (
          <UpdateProfilePic
            tokenId={tokenId}
            back={() => setIsUpdatingPp(false)}
            openTxModal={() => setIsTxModalOpen(true)}
            setPfpTxHash={setPpTxHash}
          />
        )}
      </div>
      <TxConfirmationModal
        txHash={ppTxHash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your new profile picture is being set !"
      />
    </>
  );
};

export default TokenIdPage;
