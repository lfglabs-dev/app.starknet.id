import React, { useContext, useEffect, useState } from "react";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import { NextPage } from "next";
import IdentityWarnings from "../../components/identities/identityWarnings";
import IdentityCard from "../../components/identities/identityCard";
import IdentityActions from "../../components/identities/actions/identityActions";
import { decimalToHex, hexToDecimal } from "../../utils/feltService";
import { useAccount } from "@starknet-react/core";
import IdentityPageSkeleton from "../../components/identities/skeletons/identityPageSkeleton";
import UpdateProfilePic from "../../components/identities/updateProfilePic";
import TxConfirmationModal from "../../components/UI/txConfirmationModal";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
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
  const [ppImageUrl, setPpImgUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!identity || !address) return;
    setIsOwner(hexToDecimal(identity.owner_addr) === hexToDecimal(address));
  }, [identity, address]);

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
          .then((data: Identity) => {
            setIdentity(data);
            setIsIdentityADomain(Boolean(data?.domain));
          })
          .catch(() => {
            setIsIdentityADomain(false);
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId]);

  // Check if user has a pfp set
  useEffect(() => {
    if (!tokenId) return;

    const getVerifierData = async () => {
      const nftId = await starknetIdNavigator?.getExtendedVerifierData(
        tokenId,
        "nft_pp_id",
        2,
        process.env.NEXT_PUBLIC_NFT_PP_VERIFIER
      );
      const nftContract = await starknetIdNavigator?.getVerifierData(
        tokenId,
        "nft_pp_contract",
        process.env.NEXT_PUBLIC_NFT_PP_VERIFIER
      );

      if (
        nftContract &&
        nftContract !== BigInt(0) &&
        nftId &&
        nftId.length > 1
      ) {
        const nft = await fetch(
          `https://${
            process.env.NEXT_PUBLIC_IS_TESTNET === "true"
              ? "api-testnet"
              : "api"
          }.starkscan.co/api/v0/nft/${decimalToHex(
            nftContract.toString(10)
          )}/${nftId[0].toString(10)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.NEXT_PUBLIC_STARKSCAN}`,
            },
          }
        ).then((res) => res.json());
        if (nft.image_url) setPpImgUrl(nft.image_url);
        else
          setPpImgUrl(
            `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`
          );
      } else {
        setPpImgUrl(
          `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`
        );
      }
    };
    getVerifierData();
  }, [tokenId, identity, starknetIdNavigator, ppTxHash, isTxModalOpen]);

  return (
    <>
      <div className={`${homeStyles.screen} z-10 `}>
        {isIdentityADomain === undefined ? (
          <IdentityPageSkeleton />
        ) : !isUpdatingPp ? (
          <div className={homeStyles.wrapperScreen}>
            <div className={styles.containerIdentity}>
              <>
                <div className={styles.identityBox}>
                  <IdentityCard
                    identity={identity}
                    tokenId={tokenId}
                    isOwner={isOwner}
                    updateProfilePic={() => setIsUpdatingPp(true)}
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
            identity={identity}
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
