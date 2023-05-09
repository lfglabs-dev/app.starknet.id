import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";

const identitiesSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesSkeleton}>
      <Skeleton variant="circular" width={150} height={150} />
      <Skeleton variant="circular" width={150} height={150} />
      <Skeleton variant="circular" width={150} height={150} />
    </div>
  );
};

export default identitiesSkeleton;
