import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/identitiesV1.module.css";

const IdentitiesSkeleton: FunctionComponent = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className={styles.identitiesSkeleton}>
        <Skeleton variant="rounded" width={198} height={246} />
        <Skeleton variant="rounded" width={198} height={246} />
        <Skeleton variant="rounded" width={198} height={246} />
      </div>
      <div className="flex justify-center align-center">
        <Skeleton className="self" variant="rounded" width={358} height={80} />
      </div>
    </div>
  );
};

export default IdentitiesSkeleton;
