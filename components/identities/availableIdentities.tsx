import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FaCircle, FaPlus } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import styles from "@/styles/components/identitiesV1.module.css";
import IdentityCard from "@/components/identities/identityCard";
import IdentityActions from "@/components/identities/actions/identityActions";
import IdentitiesSkeleton from "@/components/identities/skeletons/identitiesSkeleton";
import IdentityActionsSkeleton from "@/components/identities/skeletons/identityActionsSkeleton";
import DomainExpiredModal from "@/components/UI/domainExpiredModal";
import { useOwnedIdentities } from "@/hooks/useOwnedIdentities";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import { ownedIdentityToView, type IdentityView } from "@/lib/ui/identity";
import { readDomainExpiry } from "@/lib/chain/contracts";
import { prepareMintIntent } from "@/lib/transactions/intents";
import type { OwnedIdentityState } from "@/hooks/useOwnedIdentities";

export default function AvailableIdentities({
  tokenId,
  ownedIdentities,
}: {
  tokenId: string;
  ownedIdentities?: OwnedIdentityState;
}) {
  const router = useRouter();
  const submitPrepared = usePreparedTransaction();
  const localDiscovery = useOwnedIdentities(!ownedIdentities);
  const discovery = ownedIdentities ?? localDiscovery;
  const [views, setViews] = useState<IdentityView[]>([]);
  const [domainExpiredModalOpen, setDomainExpiredModalOpen] = useState(false);
  const [minting, setMinting] = useState(false);
  const attemptedRouteImport = useRef("");
  const openedExpiredToken = useRef("");

  useEffect(() => {
    let cancelled = false;
    async function hydrateDomains(): Promise<void> {
      const next = await Promise.all(
        discovery.identities.map(async (owned) => {
          const view = ownedIdentityToView(owned);
          if (!view.domain) return view;
          try {
            return {
              ...view,
              domainExpiry: Number(await readDomainExpiry(view.domain)),
            };
          } catch {
            return view;
          }
        })
      );
      if (!cancelled) setViews(next);
    }
    void hydrateDomains();
    return () => {
      cancelled = true;
    };
  }, [discovery.identities]);

  useEffect(() => {
    if (
      !tokenId ||
      discovery.loading ||
      discovery.identities.some((identity) => identity.tokenId === tokenId) ||
      attemptedRouteImport.current === tokenId
    )
      return;
    attemptedRouteImport.current = tokenId;
    void discovery.importIdentity(tokenId).catch(() => undefined);
  }, [discovery, tokenId]);

  const selected = useMemo(
    () => views.find((identity) => identity.tokenId === tokenId) ?? views[0],
    [tokenId, views]
  );

  useEffect(() => {
    const expired = Boolean(
      selected?.domainExpiry && selected.domainExpiry * 1000 < Date.now()
    );
    if (
      expired &&
      selected?.tokenId &&
      openedExpiredToken.current !== selected.tokenId
    ) {
      openedExpiredToken.current = selected.tokenId;
      setDomainExpiredModalOpen(true);
    }
  }, [selected]);

  async function mintIdentity(): Promise<void> {
    if (minting) return;
    setMinting(true);
    try {
      await submitPrepared(() => prepareMintIntent());
    } catch (error) {
      console.error("Failed to mint an identity:", error);
    } finally {
      setMinting(false);
    }
  }

  if (discovery.loading && !views.length) {
    return (
      <div className="min-h-[88vh]">
        <IdentitiesSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[88vh]">
        {!selected ? (
          <div>
            <IdentitiesSkeleton />
          </div>
        ) : (
          <div
            className={`${styles.IDScreen} px-[16px] lg:px-0 overflow-x-hidden flex flex-col xl:flex-row justify-center items-center gap-[24px] `}
          >
            <div className=" w-[100%] sm:w-[358px] xl:min-w-[220px] xl:w-fit xl:max-w-[310px]">
              {views.length !== 0 && (
                <div
                  className={`${styles.sideNav} border w-[100%] md:w-auto h-[319px] xl:h-auto relative flex flex-col items-center md:justify-between sm:px-[24px] md:pt-[24px] m-auto shadow-sm rounded-2xl mt-[1rem] md:mt-0`}
                >
                  <div className="h-full md:min-h-[80%] w-full overflow-y-auto hide-scrollbar flex flex-col gap-[2px] ">
                    {views.map((identity, index) => {
                      const expired = Boolean(
                        identity.domainExpiry &&
                          identity.domainExpiry * 1000 < Date.now()
                      );
                      return (
                        <div key={index} className="w-full">
                          <button
                            className={`${
                              identity.tokenId === selected.tokenId
                                ? "text-[#402D28]"
                                : "text-[#CDCCCC] font-normal hover:text-[#402D28]"
                            } font-bold text-lg sm:text-md lg:text-md leading-5 cursor-pointer transition-all duration-300 border-[#4545451A] border-b-[1px] md:border-none md:py-0 py-6 md:my-3 w-full max-sm:pl-4 text-left items-center flex justify-center xl:justify-start`}
                            onClick={() => {
                              void router.push(`/identities/${identity.tokenId}`);
                              if (expired) setDomainExpiredModalOpen(true);
                            }}
                          >
                            <span className="flex items-center gap-1">
                              {identity.domain
                                ? identity.domain
                                : identity.tokenId}
                              {expired && (
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
                                  <span className="flex">
                                    <FaCircle className="text-red-500 text-[8px]" />
                                  </span>
                                </Tooltip>
                              )}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="w-full justify-center text-center items-center font-quickZap font-normal min-h-[40px] py-5 flex gap-2 bg-white rounded-b-2xl"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void mintIdentity();
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
              <IdentityCard identity={selected} tokenId={selected.tokenId} />
            </div>
            <div className=" min-w-[280px]">
              {selected.domain ? (
                <IdentityActions
                  isOwner
                  tokenId={selected.tokenId}
                  identity={selected}
                  identities={discovery.identities}
                />
              ) : minting ? (
                <IdentityActionsSkeleton />
              ) : null}
            </div>
          </div>
        )}
      </div>
      <DomainExpiredModal
        open={domainExpiredModalOpen}
        onClose={() => setDomainExpiredModalOpen(false)}
        onRenew={() => {
          setDomainExpiredModalOpen(false);
          void router.push("/renewal");
        }}
      />
    </>
  );
}
