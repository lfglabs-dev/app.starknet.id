import React, { FunctionComponent } from "react";
import styles from "../../styles/components/pfpNftCard.module.css";

type NftCardProps = {
  image: string;
  name: string;
  onClick?: () => void;
};

const PfpNftCard: FunctionComponent<NftCardProps> = ({
  image,
  name,
  onClick,
}) => {
  return (
    <div className={styles.nftCard} onClick={onClick}>
      <div
        style={{ backgroundImage: `url(${image})` }}
        className={styles.nftCardImg}
      />
      <div className={styles.nftCollectionName}>{name}</div>
    </div>
  );
};

export default PfpNftCard;
