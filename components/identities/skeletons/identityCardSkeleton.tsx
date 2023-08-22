import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/identityCard.module.css";

const IdentityCardSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identityCardSkeleton}>
      <Skeleton variant="rounded" width={"100%"} height={"100%"} />
    </div>
  );
};

export default IdentityCardSkeleton;
