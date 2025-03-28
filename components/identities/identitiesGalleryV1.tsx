import { FunctionComponent, useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";
import { hexToDecimal } from "../../utils/feltService";

type IdentitiesGalleryV1Props = {
  identities: FullId[];
  externalDomains?: string[];
  address: string;
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities,
  externalDomains = [],
  address,
}) => {
  const router = useRouter();
  const [needAutoRenewal, setNeedAutoRenewal] = useState<string[]>();

  useEffect(() => {
    fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_LINK
      }/renewal/get_non_subscribed_domains?addr=${hexToDecimal(address)}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Remove duplicates
        const filteredData: string[] = Array.from(new Set(data));

        setNeedAutoRenewal(filteredData);
      });
  }, [address]);

  return (
    // // Our Indexer
    // <>
    //   {identities.map((tokenId, index) => (
    //     <div key={index} className={styles.imageGallery}>
    //       <img
    //         width={150}
    //         height={150}
    //         src={`https://www.starknet.id/api/identicons/${tokenId}`}
    //         alt="avatar"
    //         onClick={() => router.push(`/identities/${tokenId}`)}
    //       />
    //     </div>
    //   ))}
    // </>

    // Aspect indexer
    <>
      {identities.map((asset, index) => (
        <div key={index} className={styles.imageGallery}>
          <img
            width={150}
            height={150}
            src={`https://www.starknet.id/api/identicons/${asset.token_id}`}
            alt="avatar"
            onClick={() => router.push(`/identities/${asset.token_id}`)}
          />
        </div>
      ))}
    </>
  );
};

export default IdentitiesGalleryV1;
