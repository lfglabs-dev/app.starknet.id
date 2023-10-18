import React, { FunctionComponent } from "react";
import useProfilePicture from "../../hooks/useProfilePicture";
import { Skeleton } from "@mui/material";

type IdentityImageProps = {
  tokenId: string;
};

const IdentityImage: FunctionComponent<IdentityImageProps> = ({ tokenId }) => {
  const image = useProfilePicture(tokenId);
  return image ? (
    <img
      width={150}
      height={150}
      src={image}
      alt="avatar"
      className="rounded-[20px]"
    />
  ) : (
    <Skeleton
      width={150}
      height={150}
      variant="rounded"
      className="rounded-[20px]"
    />
  );
};

export default IdentityImage;
