import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";
import { minifyAddressOrDomain } from "../../utils/stringService";

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
      {identities.map((identity, index) => (
        <div key={index} className={styles.imageGallery}>
          <img
            width={150}
            height={150}
            src={`https://www.starknet.id/api/identicons/${identity.id}`}
            alt="avatar"
            onClick={() => router.push(`/identities/${identity.id}`)}
          />
          {identity.domain ? (
            <p className="font-bold">
              {minifyAddressOrDomain(identity.domain, 18)}
            </p>
          ) : null}
        </div>
      ))}
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
