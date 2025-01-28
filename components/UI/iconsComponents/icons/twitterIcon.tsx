import React, { FunctionComponent } from "react";

const TwitterIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 26 23"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.0437 0.625H23.801L15.5935 10.0295L25.25 22.829H17.69L11.7645 15.0677L4.992 22.829H1.23125L10.0092 12.7665L0.75 0.62675H8.5025L13.8505 7.7195L20.0437 0.625ZM18.7225 20.575H20.805L7.365 2.76175H5.132L18.7225 20.575Z"
        fill="black"
      />
    </svg>

    
  );
};

export default TwitterIcon;
