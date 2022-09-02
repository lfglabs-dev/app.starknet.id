/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";

export type IndexerIdentity = {
  image_uri: string;
  token_id: string;
};

type IdentitiesGalleryV1Props = {
  identities: number[];
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities,
}) => {
  const router = useRouter();

  return (
    <>
      {identities.map((tokenId, index) => (
        <div key={index} className={styles.imageGallery}>
          <img
            width={150}
            height={150}
            src={`https://www.starknet.id/api/identicons/${tokenId}`}
            alt="avatar"
            onClick={() => router.push(`/identities/${tokenId}`)}
          />
        </div>
      ))}
    </>
  );
};

export default IdentitiesGalleryV1;
