import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { FaCircle, FaPlus } from "react-icons/fa";
import IdentitiesSkeleton from "./skeletons/identitiesSkeleton";
import { Tooltip } from "@mui/material";
import { isIdentityExpired } from "../../utils/dateService";
import DomainExpiredModal from "@/components/UI/domainExpiredModal";
import { useIdentityRefresh } from "../../hooks/useIdentityRefresh";

const AvailableIdentities = ({ tokenId }: { tokenId: string }) => {
  const router = useRouter();
  const { address } = useAccount();
  
  let registerRefreshCallback: ((tokenId: string, callback: () => void) => void) | null = null;
  let unregisterRefreshCallback: ((tokenId: string) => void) | null = null;
  try {
    const context = useIdentityRefresh();
    registerRefreshCallback = context.registerRefreshCallback;
    unregisterRefreshCallback = context.unregisterRefreshCallback;
  } catch {
    console.error("Unable to refresh user identity.");
  }
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
  const [domainExpiredModalOpen, setDomainExpiredModalOpen] = useState(false);
  const [selectedExpiredDomain, setSelectedExpiredDomain] =
    useState<FullId | null>(null);
  const hasOpenedModal = useRef(false);

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
      
      if (registerRefreshCallback) {
        registerRefreshCallback(tokenId, refreshData);
      }
      
      return () => {
        clearInterval(timer);
        if (unregisterRefreshCallback) {
          unregisterRefreshCallback(tokenId);
        }
      };
    }
  }, [tokenId, refreshData, registerRefreshCallback, unregisterRefreshCallback]);

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

  const isCurrentIdentityExpired = useMemo(() => {
    if (!identity || !isIdentityADomain) return false;
    return identity?.domainExpiry
      ? new Date(identity.domainExpiry * 1000) < new Date()
      : false;
  }, [identity, isIdentityADomain]);

  useEffect(() => {
    if (
      isCurrentIdentityExpired &&
      isOwner &&
      !domainExpiredModalOpen &&
      identity &&
      !hasOpenedModal.current
    ) {
      setSelectedExpiredDomain({
        id: tokenId,
        domain: identity.domain,
        domain_expiry: identity.domainExpiry,
      } as FullId);
      setDomainExpiredModalOpen(true);
      hasOpenedModal.current = true;
    }
  }, [
    isCurrentIdentityExpired,
    isOwner,
    domainExpiredModalOpen,
    identity,
    tokenId,
    selectedExpiredDomain,
  ]);

  const connectWallet = async (connector: Connector) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
    localStorage.setItem("SID-lastUsedConnector", connector.id);
  };

  return (
    <>
      <div className="min-h-[88vh]">
        {isIdentityADomain === undefined ? (
          <div>
            <IdentitiesSkeleton />
          </div>
        ) : !isUpdatingPp ? (
          <div
            className={`${styles.IDScreen} px-[16px] lg:px-0 overflow-x-hidden flex flex-col xl:flex-row justify-center items-center gap-[24px] `}
          >
            {/*          LEFT SIDE NAV            */}
            <div className=" w-[100%] sm:w-[358px] xl:min-w-[220px] xl:w-fit xl:max-w-[310px]">
              {ownedIdentities.length !== 0 && (
                <div
                  className={`
                         ${styles.sideNav} border w-[100%] md:w-auto h-[319px] xl:h-auto relative flex flex-col items-center md:justify-between sm:px-[24px] md:pt-[24px] m-auto shadow-sm rounded-2xl mt-[1rem] md:mt-0`}
                >
                  <div className="h-full md:min-h-[80%] w-full overflow-y-auto hide-scrollbar flex flex-col gap-[2px] ">
                    {ownedIdentities.map((domain, index) => (
                      <div key={index} className="w-full">
                        <button
                          className={`${
                            domain.id === router.query.tokenId ||
                            domain.id === tokenId
                              ? "text-[#402D28]"
                              : "text-[#CDCCCC] font-normal hover:text-[#402D28]"
                          } font-bold text-lg sm:text-md lg:text-md leading-5 cursor-pointer transition-all duration-300 border-[#4545451A] border-b-[1px] md:border-none md:py-0 py-6 md:my-3 w-full max-sm:pl-4 text-left items-center flex justify-center xl:justify-start`}
                          onClick={() => {
                            router.push(`/identities/${domain.id}`);
                            if (isIdentityExpired(domain)) {
                              setSelectedExpiredDomain(domain);
                              setDomainExpiredModalOpen(true);
                            }
                          }}
                        >
                          <span className="flex items-center gap-1">
                            {domain.domain ? domain.domain : domain.id}
                            {isIdentityExpired(domain) && (
                              <Tooltip
                                title={
                                  <span className="w-full text-sm font-medium leading-5 tracking-normal text-center text-white font-poppins">
                                    Domain Expired
                                  </span>
                                }
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: "#402D28",
                                      height: "36px",
                                      width: "135px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "8px",
                                      boxShadow:
                                        "0px 4px 12px rgba(0, 0, 0, 0.2)",
                                      padding: "0 12px",
                                    },
                                  },
                                }}
                              >
                                <FaCircle className="text-red-500 text-[8px]" />
                              </Tooltip>
                            )}
                          </span>
                        </button>
                      </div>
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
            {/*           MAIN CARD            */}
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
            {/*           RIGHT SIDE ACTIONS            */}
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
      <DomainExpiredModal
        open={domainExpiredModalOpen}
        onClose={() => {
          setDomainExpiredModalOpen(false);
        }}
        onRenew={() => {
          setDomainExpiredModalOpen(false);
          router.push("/renewal");
        }}
      />
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
