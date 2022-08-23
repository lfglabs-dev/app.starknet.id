import React, { FunctionComponent } from "react";
import styles from "../../styles/home.module.css";

type DomainCardProps = {
  isAvailable: boolean;
  value: string;
  onClick: () => void;
};

const DomainCard: FunctionComponent<DomainCardProps> = ({
  isAvailable,
  value,
  onClick,
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <h2 className={styles.cardTitle}>{value}.stark</h2>
      <p>{isAvailable ? "Available" : "Unavailable"}</p>
    </div>
  );
};

export default DomainCard;
