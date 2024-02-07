import React, { FunctionComponent } from "react";
import pyramidSVG from "../../../../public/icons/pyramidIcon.svg";
import Image from "next/image";

const PyramidIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <Image
      src={pyramidSVG}
      width={parseInt(width)}
      height={parseInt(width)}
      alt="Pyramid"
    />
  );
};

export default PyramidIcon;
