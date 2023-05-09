import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";

const ExternalDomainsSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesSkeleton}>
      <Skeleton variant="rectangular" width={358} height={60} />
    </div>
  );
};

export default ExternalDomainsSkeleton;
