import React, { FunctionComponent } from "react";

const CloseIcon: FunctionComponent<IconProps> = ({ color, width }) => {
  return (
        <svg width={width} stroke={color !== 'black' ? color : undefined} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
    );
};

export default CloseIcon;
