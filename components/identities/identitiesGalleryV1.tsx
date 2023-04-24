import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";
import { minifyDomain } from "../../utils/stringService";
import ErrorIcon from "@mui/icons-material/Error";
import { Tooltip } from "@mui/material";
import {
  isIdentityExpiringSoon,
  timestampToReadableDate,
} from "../../utils/dateService";

type IdentitiesGalleryV1Props = {
  identities: FullId[];
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities,
}) => {
  const router = useRouter();

  return (
    // Our Indexer
    <>
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
              src={`https://www.starknet.id/api/identicons/${identity.id}`}
              alt="avatar"
              onClick={() => router.push(`/identities/${identity.id}`)}
            />
            {identity.domain ? (
              <p className="font-bold">{minifyDomain(identity.domain)}</p>
            ) : null}
          </div>
        );
      })}
    </>

    // // Aspect indexer
    // <>
    //   {identities.map((asset, index) => (
    //     <div key={index} className={styles.imageGallery}>
    //       <img
    //         width={150}
    //         height={150}
    //         src={`https://www.starknet.id/api/identicons/${asset.token_id}`}
    //         alt="avatar"
    //         onClick={() => router.push(`/identities/${asset.token_id}`)}
    //       />
    //     </div>
    //   ))}
    // </>
  );
};

export default IdentitiesGalleryV1;
