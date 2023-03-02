import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";

const identitiesActionsSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesActionsSkeletonButtons}>
      <Skeleton variant="rounded" width={300} height={50} />
      <Skeleton variant="rounded" width={300} height={50} />
      <Skeleton variant="rounded" width={300} height={50} />
      <Skeleton variant="rounded" width={300} height={50} />
    </div>
  );
};

export default identitiesActionsSkeleton;
