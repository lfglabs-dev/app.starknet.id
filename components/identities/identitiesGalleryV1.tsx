/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/identitiesV1.module.css";

export type Identity = {
  image_uri: string;
  token_id: string;
};

type IdentitiesGalleryV1Props = {
  identities: Identity[];
};

const IdentitiesGalleryV1: FunctionComponent<IdentitiesGalleryV1Props> = ({
  identities,
}) => {
  const router = useRouter();

  return (
    <>
      {identities.map((Identity, index) => (
        <div key={index} className={styles.imageGallery}>
          <img
            width={150}
            height={150}
            src={`https://www.starknet.id/api/identicons/${Identity.token_id}`}
            alt="avatar"
            onClick={() => router.push(`/identities/${Identity.token_id}`)}
          />
        </div>
      ))}
    </>
  );
};

export default IdentitiesGalleryV1;
