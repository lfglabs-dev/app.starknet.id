import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/identityCard.module.css";
import {
  convertNumberToFixedLengthString,
  getEnsFromStark,
  minifyAddress,
  shortenDomain,
} from "../../utils/stringService";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import SocialMediaActions from "./actions/socialmediaActions";
import { Skeleton, Tooltip, useMediaQuery } from "@mui/material";
import Notification from "../UI/notification";
import CalendarIcon from "../UI/iconsComponents/icons/calendarValidateIcon";
import theme from "../../styles/theme";
import { timestampToReadableDate } from "../../utils/dateService";
import DoneIcon from "../UI/iconsComponents/icons/doneIcon";
import CopyIcon from "../UI/iconsComponents/icons/copyIcon";
import EditIcon from "../UI/iconsComponents/icons/editIcon";
import { debounce } from "../../utils/debounceService";
import { Identity } from "../../utils/apiWrappers/identity";
import PlusIcon from "../UI/iconsComponents/icons/plusIcon";
import AddEvmAddrModal from "./actions/addEvmAddrModal";

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
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const evmAddress = identity?.getUserDataWithField("evm-address") ?? undefined;
  const [openModal, setOpenModal] = useState(false);
  const [addrAdded, setAddrAdded] = useState(false);
  const isMobile = useMediaQuery("(max-width:1124px)");

  const copyToClipboard = (copiedAddr: string | undefined) => {
    if (!copiedAddr) return;
    setCopied(true);
    navigator.clipboard.writeText(copiedAddr);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleMouseEnter = debounce(() => setIsHovered(true), 50);
  const handleMouseLeave = debounce(() => setIsHovered(false), 50);

  const closeModal = () => {
    setAddrAdded(true);
    setOpenModal(false);
    setTimeout(() => {
      setAddrAdded(false);
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className="lg:mt-10 flex items-center lg:justify-between justify-center gap-3 sm:gap-5 my-2 flex-wrap lg:flex-row">
          <div className="my-2">
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
          <div>
            <div className="flex flex-row items-center justify-center gap-5 mb-5">
              <div className="flex flex-col">
                {identity?.targetAddress ? (
                  <>
                    <div className={styles.addressBar}>
                      <h2>{minifyAddress(identity.targetAddress)}</h2>
                      <div className="cursor-pointer ml-3">
                        {!copied ? (
                          <Tooltip title="Copy" arrow>
                            <div
                              className={styles.contentCopy}
                              onClick={() =>
                                copyToClipboard(identity?.targetAddress)
                              }
                            >
                              <CopyIcon width="20" color={"currentColor"} />
                            </div>
                          </Tooltip>
                        ) : (
                          <DoneIcon
                            color={theme.palette.primary.main}
                            width="20"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-center">
                      <div className={styles.starknetAddr}>
                        <h1 className={styles.domain}>
                          {responsiveDomainOrId}
                        </h1>
                        {identity && identity.isMain && (
                          <div className="ml-2">
                            <MainIcon
                              width="20"
                              firstColor={theme.palette.primary.main}
                              secondColor={theme.palette.primary.main}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            {identity?.domain ? (
              evmAddress ? (
                <div
                  className={styles.evmAddr}
                  onClick={() => setOpenModal(true)}
                >
                  <img className={styles.evmIcon} src="/icons/ens.svg" />
                  <h2>{getEnsFromStark(identity.domain)}</h2>
                  <EditIcon width="16" color={theme.palette.secondary.main} />
                </div>
              ) : (
                <div
                  className={styles.evmAddrBtn}
                  onClick={() => setOpenModal(true)}
                >
                  <img className={styles.evmIcon} src="/icons/ens.svg" />
                  <h2>Add EVM address</h2>
                  <PlusIcon width="12" color={theme.palette.secondary.main} />
                </div>
              )
            ) : null}
            <div className=" lg:mt-6 mt-2 flex lg:justify-start justify-center lg:items-start items-center">
              <div className={styles.socialmediaActions}>
                <SocialMediaActions
                  identity={identity}
                  isOwner={isOwner}
                  tokenId={tokenId}
                />
              </div>
            </div>
            <img
              alt="leaf"
              src="/leaves/new/leavesGroup01.svg"
              className={styles.lg1}
            />
            <img
              alt="leaf"
              src="/leaves/new/leavesGroup02.svg"
              className={styles.lg2}
            />
            <img
              alt="logo"
              src="/visuals/detouredLogo.svg"
              className={styles.detouredLogo}
            />
            <img
              alt="logo"
              src="/visuals/detouredTextLogo.svg"
              className={styles.detouredTextLogo}
            />
          </div>
        </div>
      </div>
      <div className={styles.cardCode}>
        <p>{convertNumberToFixedLengthString(tokenId)}</p>
        <svg
          width="300"
          height="6"
          viewBox="0 0 380 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="380" height="6" rx="3" fill="#EAE0D5" />
        </svg>
      </div>

      <AddEvmAddrModal
        handleClose={closeModal}
        isModalOpen={openModal}
        identity={identity}
      />

      <Notification visible={copied} severity="success">
        <>&nbsp;Address copied !</>
      </Notification>
      <Notification visible={addrAdded} severity="success">
        <>&nbsp;Your address was added!</>
      </Notification>
    </div>
  );
};

export default IdentityCard;
