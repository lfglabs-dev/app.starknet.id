import React, { FunctionComponent } from "react";

type MainIconProps = {
  width: string;
  firstColor: string;
  secondColor: string;
};

const MainIcon: FunctionComponent<MainIconProps> = ({
  width,
  firstColor,
  secondColor,
}) => {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 501.28 501.28"
      xmlSpace="preserve"
      width={width}
      height={width}
    >
      <g>
        <polygon
          style={{ fill: firstColor }}
          points="501.28,194.37 335.26,159.33 250.64,12.27 250.64,419.77 405.54,489.01 387.56,320.29 	"
        />
        <polygon
          style={{ fill: secondColor }}
          points="166.02,159.33 0,194.37 113.72,320.29 95.74,489.01 250.64,419.77 250.64,12.27 	"
        />
      </g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
    </svg>
  );
};

export default MainIcon;
