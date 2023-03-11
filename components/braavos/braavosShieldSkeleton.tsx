import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";

const BraavosShieldSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesActionsSkeletonButtons}>
      <Skeleton variant="rounded" width={300} height={50} />
      <Skeleton variant="rounded" width={300} height={400} />
    </div>
  );
};

export default BraavosShieldSkeleton;
