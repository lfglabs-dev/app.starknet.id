import { Skeleton } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/profilePic.module.css";

const PfpSkeleton: FunctionComponent = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className={styles.nftSection}>
        {[...Array(8)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width={200}
            height={200}
            className={styles.nftImg}
          />
        ))}
      </div>
    </div>
  );
};

export default PfpSkeleton;
