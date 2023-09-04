import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/identityCard.module.css";
import {
  convertNumberToFixedLengthString,
  minifyAddress,
  shortenDomain,
} from "../../utils/stringService";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import SocialMediaActions from "./actions/socialmediaActions";
import { decimalToHex } from "../../utils/feltService";
import { Tooltip } from "@mui/material";
import Notification from "../UI/notification";
import CalendarIcon from "../UI/iconsComponents/icons/calendarIcon";
import StarknetIcon from "../UI/iconsComponents/icons/starknetIcon";
import theme from "../../styles/theme";
import { timestampToReadableDate } from "../../utils/dateService";
import DoneIcon from "../UI/iconsComponents/icons/doneIcon";
import CopyIcon from "../UI/iconsComponents/icons/copyIcon";

type IdentityCardProps = {
  identity?: Identity;
  tokenId: string;
  isOwner: boolean;
};

const IdentityCard: FunctionComponent<IdentityCardProps> = ({
  tokenId,
  identity,
  isOwner,
}) => {
  const responsiveDomainOrId = identity
    ? shortenDomain(identity.domain as string, 25)
    : `SID: ${tokenId}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    navigator.clipboard.writeText(decimalToHex(identity?.addr));
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className="lg:mt-10 flex items-center lg:justify-between justify-center gap-3 sm:gap-5 my-2 flex-wrap lg:flex-row ">
          <div className="my-2">
            <img
              src={`${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`}
              height={170}
              width={170}
              alt="identicon"
              className="mt-1 mb-3"
            />
            {identity?.domain_expiry ? (
              <Tooltip title="Expiry date of this domain" arrow>
                <div className={styles.expiryContainer}>
                  <CalendarIcon width="16" color={theme.palette.primary.main} />
                  <p className={styles.expiryText}>
                    {timestampToReadableDate(identity.domain_expiry)}
                  </p>
                </div>
              </Tooltip>
            ) : null}
          </div>
          <div>
            <div className="flex flex-row items-center justify-center">
              <h1 className={styles.domain}>{responsiveDomainOrId}</h1>
              {identity && identity.is_owner_main && (
                <div className="ml-2">
                  <MainIcon
                    width="30"
                    firstColor={theme.palette.primary.main}
                    secondColor={theme.palette.primary.main}
                  />
                </div>
              )}
            </div>
            {identity?.addr ? (
              <>
                <div className="flex flex-row lg:mt-6 mt-2">
                  <StarknetIcon width="32px" color="" />
                  <h2 className="ml-3 text-xl">
                    {minifyAddress(decimalToHex(identity.addr))}
                  </h2>
                  <div className="cursor-pointer ml-3">
                    {!copied ? (
                      <Tooltip title="Copy" arrow>
                        <div
                          className={styles.contentCopy}
                          onClick={() => copyToClipboard()}
                        >
                          <CopyIcon width="25" color={"currentColor"} />
                        </div>
                      </Tooltip>
                    ) : (
                      <DoneIcon color={theme.palette.primary.main} width="25" />
                    )}
                  </div>
                </div>
              </>
            ) : null}

            <div className=" lg:mt-6 mt-2 flex lg:justify-start justify-center lg:items-start items-center">
              <SocialMediaActions
                identity={identity}
                isOwner={isOwner}
                tokenId={tokenId}
              />
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

      <Notification visible={copied} severity="success">
        <>&nbsp;Address copied !</>
      </Notification>
    </div>
  );
};

export default IdentityCard;
