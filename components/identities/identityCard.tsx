import React, { type FunctionComponent } from "react";
import { Skeleton, Tooltip, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import styles from "../../styles/components/identityCard.module.css";
import CalendarIcon from "../UI/iconsComponents/icons/calendarValidateIcon";
import theme from "../../styles/theme";
import CopyContent from "../UI/copyContent";
import { IdentityAvatar } from "@/components/IdentityAvatar";
import type { IdentityView } from "@/lib/ui/identity";
import {
  identitySerial,
  readableDate,
  shortAddress,
  shortDomain,
} from "@/lib/ui/identity";

type IdentityCardProps = {
  identity?: IdentityView;
  tokenId: string;
};

const IdentityCard: FunctionComponent<IdentityCardProps> = ({
  tokenId,
  identity,
}) => {
  const responsiveDomainOrId = identity?.domain
    ? shortDomain(identity.domain, 25)
    : `SID: ${tokenId}`;
  const isMobile = useMediaQuery("(max-width:1124px)");
  const router = useRouter();
  const minting = router.query.minting === "true";
  const isDomainExpired = identity?.domainExpiry
    ? new Date(identity.domainExpiry * 1000) < new Date()
    : false;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className="flex flex-col flex-wrap items-center justify-center gap-3 my-2 lg:mt-10 lg:justify-between sm:text-center sm:gap-5 lg:flex-row sm:flex-col">
          <div className="my-2 text-center">
            <div className={styles.pfpSection}>
              <IdentityAvatar
                tokenId={tokenId}
                size={170}
                className={styles.pfpImg}
              />
            </div>
            {identity?.domainExpiry ? (
              <Tooltip title="Expiry date of this domain" arrow>
                <div
                  className={
                    isDomainExpired
                      ? styles.expiryContainer
                      : styles.notExpiryContainer
                  }
                >
                  <CalendarIcon
                    width="16"
                    color={
                      isDomainExpired
                        ? theme.palette.error.main
                        : theme.palette.primary.main
                    }
                  />
                  <p
                    className={
                      isDomainExpired ? styles.expiryText : styles.notExpiryText
                    }
                  >
                    {readableDate(identity.domainExpiry)}
                  </p>
                </div>
              </Tooltip>
            ) : null}
          </div>
          {minting ? (
            <div className="h-full py-2 text-left">
              <h1 className="text-3xl font-bold font-quickZap">
                Minting your identity...
              </h1>
              <p>This page will refresh automatically</p>
              <Skeleton className="mt-3" variant="rounded" height={30} />
              <Skeleton className="mt-3" variant="rounded" height={58} />
            </div>
          ) : null}
          <div className="">
            <div className="lg:ml-8 sm:ml-0 sm:justify-center">
              <div className="flex flex-row items-center justify-center gap-5 mb-5">
                <div className="flex flex-col mt-4">
                  {isMobile ? (
                    <>
                      {identity?.targetAddress ? (
                        <>
                          <div className="flex flex-row items-center justify-center">
                            <div className={styles.starknetAddr}>
                              <h1 className={styles.domain}>
                                {responsiveDomainOrId}
                              </h1>
                            </div>
                          </div>
                          {identity?.domain ? (
                            <div className={styles.addressBar}>
                              <h2>{shortAddress(identity.targetAddress)}</h2>
                              <CopyContent
                                value={identity.targetAddress}
                                className="ml-3 cursor-pointer"
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {identity?.targetAddress ? (
                        <>
                          {identity?.domain ? (
                            <div className={styles.addressBar}>
                              <h2>{shortAddress(identity.targetAddress)}</h2>
                              <CopyContent
                                value={identity.targetAddress}
                                className="ml-3 cursor-pointer"
                              />
                            </div>
                          ) : null}
                          <div className="flex flex-row items-center justify-center">
                            <div className={styles.starknetAddr}>
                              <h1 className={styles.domain}>
                                {responsiveDomainOrId}
                              </h1>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>

            <img
              alt="leaf"
              src="/leaves/new/leaf02.webp"
              className={styles.lg1}
            />
            <img
              alt="leaf"
              src="/leaves/new/leaf01.webp"
              className={styles.lg2}
            />
            <img
              alt="logo"
              src="/visuals/detoured_logo.svg"
              className={styles.detouredLogo}
            />
            <img
              alt="logo"
              src="/visuals/text.svg"
              className={styles.detouredTextLogo}
            />
          </div>
        </div>
      </div>
      <div className={styles.cardCode}>
        <p>
          <span>{identitySerial(tokenId)}</span>
        </p>
        <svg
          className="w-full hidden sm:block sm:w-[200px] md:w-[300px]"
          height="6"
          viewBox="0 0 380 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="380" height="6" rx="3" fill="#e2dfde" />
        </svg>
      </div>
    </div>
  );
};

export default IdentityCard;
