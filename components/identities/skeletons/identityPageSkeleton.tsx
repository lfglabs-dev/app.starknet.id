import React, { FunctionComponent } from "react";
import IdentityCardSkeleton from "./identityCardSkeleton";
import IdentityActionsSkeleton from "./identityActionsSkeleton";

const IdentityPageSkeleton: FunctionComponent = () => {
  return (
    <div className="flex gap-14 flex-wrap justify-center items-center">
      <IdentityCardSkeleton />
      <IdentityActionsSkeleton />
    </div>
  );
};

export default IdentityPageSkeleton;
