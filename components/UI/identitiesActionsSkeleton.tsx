import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";


const identitiesActionsSkeleton: FunctionComponent = () => {
  return (
        <div className={styles.identitiesActionsSkeletonContainer}>
            <Skeleton variant="text" width={110} height={60} /> 
            <div className={styles.identitiesActionsSkeletonButtons}>
                <Skeleton variant="circular" width={60} height={60} />
                <Skeleton variant="circular" width={60} height={60} />
                <Skeleton variant="circular" width={60} height={60} />
                <Skeleton variant="circular" width={60} height={60} />
                <Skeleton variant="circular" width={60} height={60} />
            </div>
        </div>
      )
};

export default identitiesActionsSkeleton;
