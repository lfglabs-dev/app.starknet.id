import React, { FunctionComponent } from "react";
import IdentityCardSkeleton from "./identityCardSkeleton";
import IdentityActionsSkeleton from "./identityActionsSkeleton";
import styles from "@/styles/components/identitiesV1.module.css";

const IdentityPageSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.identitySkeleton}>
      <IdentityCardSkeleton />
      <IdentityActionsSkeleton />
    </div>
  );
};

export default IdentityPageSkeleton;
