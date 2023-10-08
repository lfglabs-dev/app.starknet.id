import React, { FunctionComponent, ReactNode } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";
import { getDomainKind, minifyDomain } from "../../utils/stringService";
import ErrorIcon from "@mui/icons-material/Error";
import { Tooltip } from "@mui/material";
import {
  isIdentityExpiringSoon,
  timestampToReadableDate,
} from "../../utils/dateService";
import ArgentIcon from "../UI/iconsComponents/icons/argentIcon";

type IdentitiesGalleryV1Props = {
  identities: FullId[];
  externalDomains?: string[];
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities,
  externalDomains = [],
}) => {
  const router = useRouter();
  return (
    // Our Indexer
    <div className={styles.galeryContainer}>
      {identities.map((identity, index) => {
        return (
          <div key={index} className={styles.imageGallery}>
            {isIdentityExpiringSoon(identity) ? (
              <div className={styles.expiryWarning}>
                <Tooltip
                  title={`Be careful, this domain will expire on ${timestampToReadableDate(
                    identity?.domain_expiry ?? 0
                  )}`}
                  arrow
                >
                  <ErrorIcon color="error" />
                </Tooltip>
              </div>
            ) : null}
            <img
              width={150}
              height={150}
              src={`${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${identity.id}`}
              alt="avatar"
              onClick={() => router.push(`/identities/${identity.id}`)}
            />

            <p className="font-bold font-quickZap">
              {identity.domain
                ? minifyDomain(identity.domain)
                : `ID: ${identity.id}`}
            </p>
          </div>
        );
      })}
      {externalDomains.map((domain, index) => {
        const domainKind = getDomainKind(domain);

        function getIdentityImage(domainKind: DomainKind): ReactNode {
          console.log(domainKind);
          switch (domainKind) {
            case "braavos":
              return (
                <img
                  width={150}
                  height={150}
                  src={"/braavos/braavosLogoWithBackground.webp"}
                  alt="avatar"
                  onClick={() => router.push(`/externaldomains/${domain}`)}
                  className="rounded-[16px]"
                />
              );
            case "xplorer":
              return (
                <div
                  onClick={() => router.push(`/externaldomains/${domain}`)}
                  className="bg-[#ffebd8] p-[16px] rounded-[16px]"
                >
                  <ArgentIcon width={"118px"} color="#f36a3d" />
                </div>
              );
            default:
              return (
                <img
                  width={150}
                  height={150}
                  src={`${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/0`}
                  alt="avatar"
                  onClick={() => router.push(`/externaldomains/${domain}`)}
                />
              );
          }
        }

        return (
          <div key={index} className={styles.imageGallery}>
            {getIdentityImage(domainKind)}
            <p className="font-bold font-quickZap">{minifyDomain(domain)}</p>
            <div className={styles.expiryWarning}>
              <Tooltip
                title="This is domain is an external domain and is not an identity, you won't see it on your wallet."
                arrow
              >
                <ErrorIcon color="warning" />
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IdentitiesGalleryV1;
