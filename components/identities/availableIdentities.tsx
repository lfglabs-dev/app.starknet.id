import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import IdentityCard from "../../components/identities/identityCard";
import IdentityActions from "../../components/identities/actions/identityActions";
import {
  useAccount,
  useConnect,
  useSendTransaction,
} from "@starknet-react/core";
import UpdateProfilePic from "../../components/identities/updateProfilePic";
import TxConfirmationModal from "../../components/UI/txConfirmationModal";
import { Identity } from "../../utils/apiWrappers/identity";
import { formatHexString } from "../../utils/stringService";
import { getDomainData } from "@/utils/cacheDomainData";
import { useSearchParams } from "next/navigation";
import IdentityActionsSkeleton from "@/components/identities/skeletons/identityActionsSkeleton";
import { hexToDecimal } from "@/utils/feltService";
import WalletConnect from "@/components/UI/walletConnect";
import { Connector } from "starknetkit";
import { FaPlus } from "react-icons/fa";
import IdentitiesSkeleton from "./skeletons/identitiesSkeleton";

const AvailableIdentities = ({ tokenId }: { tokenId: string }) => {
  const router = useRouter();
  const { address } = useAccount();
  //const tokenId: string = router.query.tokenId as string;
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
  const [minting, setMinting] = useState(false);
  const searchParams = useSearchParams();
  const mintingInUrl = searchParams.get("minting") === "true";
  const { connectAsync, connectors } = useConnect();
  const [ownedIdentities, setOwnedIdentities] = useState<FullId[]>([]);
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);
  const [showWalletConnectModal, setShowWalletConnectModal] =
    useState<boolean>(false);

  const callData = useMemo(() => {
    return {
      contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
      entrypoint: "mint",
      calldata: [randomTokenId.toString()],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { sendAsync: execute } = useSendTransaction({
    calls: [callData],
  });

  useEffect(() => {
    if (mintingInUrl) setMinting(true);
    else setMinting(false);
  }, [mintingInUrl]);

  const endMinting = useCallback(() => {
    router.replace(router.asPath.split("?")[0]);
    setMinting(false);
    setHideActions(false);
  }, [router]);

  useEffect(() => {
    if (minting && identity) endMinting();
  }, [minting, identity, endMinting]);

  useEffect(() => {
    if (!identity || !address) {
      setIsOwner(false);
      return;
    }
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

  const refreshData = useCallback(
    () =>
      fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/id_to_data?id=${tokenId}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(await response.text());
          }
          return response.json();
        })
        .then((data: IdentityData) => {
          if (minting) endMinting();
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
        }),
    [tokenId, minting, endMinting]
  );

  useEffect(() => {
    if (minting && tokenId && !identity) {
      const interval = setInterval(() => refreshData(), 1000);
      return () => clearInterval(interval);
    }
  }, [minting, tokenId, identity, refreshData]);

  useEffect(() => {
    if (tokenId) {
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId, refreshData]);

  function mint() {
    execute();
  }
  useEffect(() => {
    if (address) {
      // Our Indexer
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedIdentities(data.full_ids);
        });
    }
  }, [address, router.asPath]);

  const connectWallet = async (connector: Connector) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
    localStorage.setItem("SID-lastUsedConnector", connector.id);
  };

  return (
    <>
      <div className="min-h-[80vh]">
        {isIdentityADomain === undefined ? (
          <div className="">
            <IdentitiesSkeleton />
          </div>
        ) : !isUpdatingPp ? (
          <div
            className={`${styles.IDScreen} px-[16px] lg:px-0 overflow-x-hidden flex flex-col xl:flex-row justify-center items-center gap-[24px] `}
          >
            <div className="w-[100%] sm:w-[358px] xl:w-[220px]">
              <div
                className={`
                         ${"border w-[100%] md:w-auto h-[319px] xl:h-auto"} ${
                  styles.SIDENAV
                } relative flex flex-col items-center justify-between sm:px-[24px]  md:pt-[24px] m-auto shadow-sm rounded-2xl `}
              >
                <div className="h-full md:min-h-[80%] w-full overflow-y-auto hide-scrollbar flex flex-col gap-[2px] ">
                  {ownedIdentities.map((domain, index) => (
                    <button
                      className={`${
                        domain.id === router.query.tokenId ||
                        domain.id === tokenId
                          ? "text-[#402D28] hover:text-[#CDCCCC]"
                          : " text-[#CDCCCC] hover:text-[#402D28]"
                      } font-medium text-lg sm:text-md lg:text-lg leading-5 cursor-pointer border-[#4545451A] border-b-[1px] md:border-none md:py-0 py-6 md:my-3 block w-full text-center xl:text-left`}
                      key={index}
                      onClick={() => router.push(`/identities/${domain.id}`)}
                    >
                      {domain.domain ? domain.domain : domain.id}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full justify-center text-center items-center font-quickZap font-normal min-h-[40px] py-5 flex gap-2 bg-white rounded-b-2xl"
                  onClick={
                    address
                      ? () => mint()
                      : () => setShowWalletConnectModal(true)
                  }
                >
                  <FaPlus />
                  ADD IDENTITIES
                </button>
              </div>
            </div>
            <div
              className={`flex justify-center items-center ${styles.CardContainer}`}
            >
              <IdentityCard
                identity={identity}
                tokenId={tokenId}
                isOwner={isOwner}
                onPPClick={() => setIsUpdatingPp(true)}
                ppImageUrl={ppImageUrl}
              />
            </div>
            <div className="min-w-[280px]">
              {isIdentityADomain ? (
                <IdentityActions
                  isOwner={isOwner}
                  tokenId={tokenId}
                  isIdentityADomain={isIdentityADomain}
                  identity={identity}
                  hideActionsHandler={hideActionsHandler}
                />
              ) : (
                minting && <IdentityActionsSkeleton />
              )}
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
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors as Connector[]}
        connectWallet={connectWallet}
      />
    </>
  );
};

export default AvailableIdentities;
