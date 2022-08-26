import React, { FunctionComponent, useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useAddressFromDomain } from "../../hooks/naming";
import styles from "../../styles/home.module.css";

type DomainCardProps = {
  domain: string;
  onClick: () => void;
  isAvailable?: boolean;
};

const DomainCard: FunctionComponent<DomainCardProps> = ({
  domain,
  onClick,
  isAvailable,
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <h2 className={styles.cardTitle}>{domain}.stark</h2>
      {isAvailable === undefined ? (
        <ThreeDots
          height="25"
          width="80"
          radius="9"
          color="#19AA6E"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      ) : (
        <p>{isAvailable ? "Available" : "Unavailable"}</p>
      )}
    </div>
  );
};

export default DomainCard;
