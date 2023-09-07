import React, { FunctionComponent } from "react";

const LessIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M13.4091 9.22726H9.27273H7.04545H2.59091C2.27273 9.22726 1 9.2909 1 8.27272C1 7.31818 2.27273 7 2.59091 7H7.04545H9.27273H13.4091C14.0455 7 15 7.25454 15 8.27272C15 9.2909 13.7273 9.22726 13.4091 9.22726Z"
        fill={color}
      />
    </svg>
  );
};

export default LessIcon;
