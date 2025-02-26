import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/identityCard.module.css";
import {
  convertNumberToFixedLengthString,
  minifyAddress,
  shortenDomain,
} from "../../utils/stringService";
import SocialMediaActions from "./actions/socialmediaActions";
import { Skeleton, Tooltip, useMediaQuery } from "@mui/material";
import CalendarIcon from "../UI/iconsComponents/icons/calendarValidateIcon";
import theme from "../../styles/theme";
import { timestampToReadableDate } from "../../utils/dateService";
import EditIcon from "../UI/iconsComponents/icons/editIcon";
import { debounce } from "../../utils/debounceService";
import { Identity } from "../../utils/apiWrappers/identity";
import CopyContent from "../UI/copyContent";
import AddEvmAction from "./actions/addEvmAction";
import { useSearchParams } from "next/navigation";

type IdentityCardProps = {
  identity?: Identity;
  tokenId: string;
  isOwner: boolean;
  onPPClick?: () => void;
  ppImageUrl: string;
};

const IdentityCard: FunctionComponent<IdentityCardProps> = ({
  tokenId,
  identity,
  isOwner,
  onPPClick,
  ppImageUrl,
}) => {
  const responsiveDomainOrId = identity?.domain
    ? shortenDomain(identity.domain, 25)
    : `SID: ${tokenId}`;
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width:1124px)");
  const handleMouseEnter = debounce(() => setIsHovered(true), 50);
  const handleMouseLeave = debounce(() => setIsHovered(false), 50);
  const searchParams = useSearchParams();
  const minting = searchParams.get("minting") === "true";

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className="lg:mt-10 flex-col flex items-center lg:justify-between justify-center sm:text-center gap-3 sm:gap-5 my-2 flex-wrap lg:flex-row sm:flex-col">
          <div className="my-2 text-center">
            <div
              className={styles.pfpSection}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {isHovered && isOwner && !isMobile ? (
                <div
                  className={styles.pfp}
                  onClick={() => onPPClick && onPPClick()}
                >
                  <EditIcon width="28" color={theme.palette.secondary.main} />
                  <p>Edit your NFT</p>
                </div>
              ) : (
                <>
                  {ppImageUrl ? (
                    <img
                      src={ppImageUrl}
                      height={170}
                      width={170}
                      alt="identicon"
                      className={styles.pfpImg}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width={170}
                      height={170}
                      className={styles.pfpImg}
                    />
                  )}
                  {isOwner && isMobile ? (
                    <div
                      className={styles.mobilePfp}
                      onClick={() => onPPClick && onPPClick()}
                    >
                      <EditIcon
                        width="16"
                        color={theme.palette.secondary.main}
                      />
                      <p>Edit</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {identity?.domainExpiry ? (
              <Tooltip title="Expiry date of this domain" arrow>
                <div className={styles.expiryContainer}>
                  <CalendarIcon width="16" color={theme.palette.primary.main} />
                  <p className={styles.expiryText}>
                    {timestampToReadableDate(identity.domainExpiry)}
                  </p>
                </div>
              </Tooltip>
            ) : null}
          </div>
          {minting ? (
            <div className="text-left h-full py-2">
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
                              <h2>{minifyAddress(identity.targetAddress)}</h2>
                              <CopyContent
                                value={identity?.targetAddress}
                                className="cursor-pointer ml-3"
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
                              <h2>{minifyAddress(identity.targetAddress)}</h2>
                              <CopyContent
                                value={identity?.targetAddress}
                                className="cursor-pointer ml-3"
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
              <AddEvmAction identity={identity} isOwner={isOwner} />
              <SocialMediaActions
                identity={identity}
                isOwner={isOwner}
                tokenId={tokenId}
              />
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
          <span >{convertNumberToFixedLengthString(tokenId)}</span>
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
