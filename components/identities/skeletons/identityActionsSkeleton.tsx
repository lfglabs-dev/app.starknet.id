import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/identityCard.module.css";

const identityActionsSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesActionsSkeletonButtons}>
      <Skeleton variant="rounded" width={300} height={60} />
      <Skeleton variant="rounded" width={300} height={60} />
      <Skeleton variant="rounded" width={300} height={60} />
      <Skeleton variant="rounded" width={300} height={60} />
    </div>
  );
};

export default identityActionsSkeleton;
