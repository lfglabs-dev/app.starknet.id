import React, { FunctionComponent } from "react";

const CloseIcon: FunctionComponent<IconProps> = ({ color, width }) => {
  return (
    <svg fill="transparent" color={color} width={width} height={width} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    );
};

export default CloseIcon;
