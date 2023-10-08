import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identitiesV1.module.css";

const IdentitiesSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitiesSkeleton}>
      <Skeleton variant="rounded" width={198} height={246} />
      <Skeleton variant="rounded" width={198} height={246} />
      <Skeleton variant="rounded" width={198} height={246} />
    </div>
  );
};

export default IdentitiesSkeleton;
