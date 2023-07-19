import React, { FunctionComponent } from "react";
import { ThreeDots } from "react-loader-spinner";
import styles from "../../styles/Home.module.css";
import { minifyDomain } from "../../utils/stringService";
import theme from "../../styles/theme";
import { useMediaQuery } from "@mui/material";

type DomainCardProps = {
  domain: string;
  isAvailable?: boolean;
  isConnected?: boolean;
};

const DomainCard: FunctionComponent<DomainCardProps> = ({
  domain,
  isAvailable,
  isConnected,
}) => {
  const isMobile = useMediaQuery("(max-width:425px)");
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        {minifyDomain(domain, isMobile ? 15 : 18)}
      </h2>
      {isAvailable === undefined ? (
        <ThreeDots
          height="25"
          width="80"
          radius="9"
          color={theme.palette.primary.main}
          ariaLabel="three-dots-loading"
          visible={true}
        />
      ) : (
        <p className="text">
          {isConnected
            ? isAvailable
              ? "Available"
              : "Unavailable"
            : "Connect your wallet first"}
        </p>
      )}
    </div>
  );
};

export default DomainCard;
