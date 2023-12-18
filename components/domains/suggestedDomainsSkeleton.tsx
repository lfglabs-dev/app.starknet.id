import React, { FunctionComponent } from "react";
import { Skeleton } from "@mui/material";
import styles from "../../styles/search.module.css";

const SuggestedDomainsSkeleton: FunctionComponent = () => {
  return (
    <Skeleton
      variant="rounded"
      height={296}
      className={styles.suggestedDomainsSkeleton}
    />
  );
};

export default SuggestedDomainsSkeleton;
