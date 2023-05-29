import { Skeleton, useMediaQuery } from "@mui/material";
import React, { FunctionComponent } from "react";

const MembersSkeleton: FunctionComponent = () => {
  const matches = useMediaQuery("(max-width:1024px)");

  return (
    <Skeleton variant="rounded" width={matches ? 340 : 500} height={200} />
  );
};

export default MembersSkeleton;
