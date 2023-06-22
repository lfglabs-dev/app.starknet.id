import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/externalDomainCard.module.css";
import {
  getDomainKind,
  minifyAddress,
  shortenDomain,
} from "../../utils/stringService";
import MainIcon from "../UI/iconsComponents/icons/mainIcon";
import { ContentCopy } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import Notification from "../UI/notification";
import CopiedIcon from "../UI/iconsComponents/icons/copiedIcon";
import StarknetIcon from "../UI/iconsComponents/icons/starknetIcon";
import theme from "../../styles/theme";

type ExternalDomainCardProps = {
  domain: string;
  targetAddress: string;
  isMainDomain: boolean;
};

const ExternalDomainCard: FunctionComponent<ExternalDomainCardProps> = ({
  domain,
  targetAddress,
  isMainDomain,
}) => {
  const responsiveDomain = shortenDomain(domain as string);
  const [copied, setCopied] = useState(false);
  const domainKind = getDomainKind(domain as string);

  const copyToClipboard = () => {
    setCopied(true);
    navigator.clipboard.writeText(targetAddress ?? "");
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className="flex items-center justify-center gap-5 my-2 flex-wrap lg:flex-row ">
          <div className="my-2">
            <img
              src={
                domainKind === "braavos"
                  ? "/braavos/braavosLogo.svg"
                  : `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/0`
              }
              height={150}
              width={150}
              alt="identicon"
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row items-center justify-center">
              <h1 className={styles.domain}>{responsiveDomain}</h1>
              {isMainDomain && (
                <div className="ml-2">
                  <MainIcon
                    width="30"
                    firstColor={theme.palette.primary.main}
                    secondColor={theme.palette.primary.main}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-row lg:mt-6 mt-2">
              <StarknetIcon width="32px" color="" />
              <h2 className="ml-3 text-xl">{minifyAddress(targetAddress)}</h2>
              <div className="cursor-pointer ml-3">
                {!copied ? (
                  <Tooltip title="Copy" arrow>
                    <ContentCopy
                      className={styles.contentCopy}
                      onClick={() => copyToClipboard()}
                    />
                  </Tooltip>
                ) : (
                  <CopiedIcon color={theme.palette.primary.main} width="25" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Notification visible={copied} severity="success">
        <>&nbsp;Address copied !</>
      </Notification>
    </div>
  );
};

export default ExternalDomainCard;
