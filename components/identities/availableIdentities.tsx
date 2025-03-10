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
import { Tooltip } from 'react-tooltip';

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

  const isDomainExpired = (expiryTimestamp: number | null): boolean =>
    expiryTimestamp ? Math.floor(Date.now() / 1000) > expiryTimestamp : false;

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

  useEffect(() => setHideActions(!isIdentityADomain), [isIdentityADomain]);

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
        `${process.env.NEXT_PUBLIC_SERVER_LINK
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
      <div className="min-h-[88vh] overflow-x-hidden">
        {isIdentityADomain === undefined ? (
          <div>
            <IdentitiesSkeleton />
          </div>
        ) : !isUpdatingPp ? (
          <div
            className={`${styles.IDScreen} px-[16px] lg:px-0 flex flex-col xl:flex-row justify-center items-center gap-6 xl:flex-flex-nowrap`}
          >
            <div className=" w-[100%] sm:w-[358px] xl:w-[220px]">
              {ownedIdentities.length !== 1 && (
                <div
                  className={`
                         ${styles.sideNav} border w-[100%] md:w-auto h-[319px] xl:h-auto relative flex flex-col items-center justify-between sm:px-[24px] md:pt-[24px] m-auto shadow-sm rounded-2xl `}
                >
                  <div className="h-full md:min-h-[80%] w-full flex flex-col gap-[2px] hide-scrollbar overflow-y-scroll">
                    {ownedIdentities.map((domain, index) => (
                      <button
                        className={`${
                          domain.id === router.query.tokenId ||
                            domain.id === tokenId
                            ? "text-[#402D28]"
                            : " text-[#CDCCCC] hover:text-[#402D28]"
                          } font-medium text-lg sm:text-md lg:text-lg leading-5 cursor-pointer border-[#4545451A] border-b-[1px] md:border-none md:py-0 py-6 md:my-3 block w-full text-center xl:text-left`}
                        key={index}
                        onClick={() => router.push(`/identities/${domain.id}`)}
                      >
                        <div className="flex md:flex-row items-center justify-center md:justify-between w-auto md:w-full p-2 text-center">
                          <div className="truncate max-w-full">
                            {domain.domain ? domain.domain : domain.id}
                          </div>
                          {isDomainExpired(domain.domain_expiry) && (
                            <div className="group z-50 text-sm p-1">
                              <a
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Domain Expired"
                                data-tooltip-place="right"
                                color="secondary"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full">
                                </div>
                              </a>
                              <Tooltip id="my-tooltip" noArrow={true} style={{ padding: '8px 12px' }} globalCloseEvents={{ scroll: true }} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    className="w-full justify-center text-center items-center font-quickZap font-normal min-h-[40px] py-5 flex gap-2 bg-white rounded-b-2xl"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      address ? mint() : setShowWalletConnectModal(true);
                    }}
                  >
                    <FaPlus />
                    ADD IDENTITIES
                  </button>
                </div>
              )}
            </div>
            <div
              className={` flex justify-center items-center ${styles.CardContainer}`}
            >
              <IdentityCard
                identity={identity}
                tokenId={tokenId}
                isOwner={isOwner}
                onPPClick={() => setIsUpdatingPp(true)}
                ppImageUrl={ppImageUrl}
              />
            </div>
            <div className=" min-w-[280px]">
              {hideActions ? (
                minting && <IdentityActionsSkeleton />
              ) : (
                <IdentityActions
                  isOwner={isOwner}
                  tokenId={tokenId}
                  isIdentityADomain={isIdentityADomain}
                  identity={identity}
                />
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
