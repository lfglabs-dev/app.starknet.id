import React, { FunctionComponent } from "react";

const ConnexionIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.6007 2.89978C11.9673 2.66645 8.56067 2.33978 8.00067 2.89978C7.30067 3.59978 6.60067 13.3999 8.00067 14.0999C9.12067 14.6599 12.2005 14.3332 13.6004 14.0999"
        stroke={color}
        strokeWidth="1.4"
      />
      <path d="M2.40039 8.5L13.6004 8.5" stroke={color} strokeWidth="1.4" />
      <circle cx="13.5997" cy="14.1001" r="1.4" fill={color} />
      <circle cx="13.5997" cy="8.5001" r="1.4" fill={color} />
      <circle cx="13.5997" cy="2.9" r="1.4" fill={color} />
      <circle cx="2.4" cy="8.5001" r="1.4" fill={color} />
    </svg>
  );
};

export default ConnexionIcon;
