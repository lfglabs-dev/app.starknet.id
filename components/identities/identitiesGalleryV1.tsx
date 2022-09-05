/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";

export type IndexerIdentity = {
  image_uri: string;
  token_id: string;
};

type IdentitiesGalleryV1Props = {
  identities?: IndexerIdentity[];
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities = [],
}) => {
  const router = useRouter();

  return (
    <>
      {identities.map((data, index) => (
        <div key={index} className={styles.imageGallery}>
          <img
            width={150}
            height={150}
            src={`https://www.starknet.id/api/identicons/${data.token_id}`}
            alt="avatar"
            onClick={() => router.push(`/identities/${data.token_id}`)}
          />
        </div>
      ))}
    </>
  );
};

export default IdentitiesGalleryV1;
