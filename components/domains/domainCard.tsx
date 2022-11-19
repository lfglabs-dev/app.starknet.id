import React, { FunctionComponent } from "react";
import { ThreeDots } from "react-loader-spinner";
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
  function minifyAddressOrDomain(address: string): string | undefined {
    const characterToBreak = window.innerWidth < 640 ? 9 : 18;

    if (address.length > characterToBreak) {
      const firstPart =
        address.charAt(0) + address.charAt(1) + address.charAt(2);
      const secondPart =
        address.charAt(address.length - 3) +
        address.charAt(address.length - 2) +
        address.charAt(address.length - 1);
      return firstPart + "..." + secondPart;
    } else {
      return address;
    }
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <h2 className={styles.cardTitle}>
        {minifyAddressOrDomain(domain)}.stark
      </h2>
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
        <p className="text">{isAvailable ? "Available" : "Unavailable"}</p>
      )}
    </div>
  );
};

export default DomainCard;
