import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/profilePic.module.css";

const PfpSkeleton: FunctionComponent = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className={styles.nftSection}>
        <Skeleton
          variant="rounded"
          width={180}
          height={180}
          className={styles.nftImg}
        />
        <Skeleton
          variant="rounded"
          width={180}
          height={180}
          className={styles.nftImg}
        />
        <Skeleton
          variant="rounded"
          width={180}
          height={180}
          className={styles.nftImg}
        />
        <Skeleton
          variant="rounded"
          width={180}
          height={180}
          className={styles.nftImg}
        />
      </div>
    </div>
  );
};

export default PfpSkeleton;
