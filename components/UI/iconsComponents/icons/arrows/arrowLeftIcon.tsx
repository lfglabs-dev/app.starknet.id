import React, { FunctionComponent } from "react";

const ArrowLeftIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M2.20877 10.1752C4.21048 10.3496 8.60313 10.2478 10.5492 10.1752C10.0627 10.9018 9.04794 12.5294 8.88108 13.2269C8.6725 14.0989 9.71512 14.3169 10.1321 13.4449C10.5492 12.573 12.8428 10.8291 14.3024 9.9572C15.762 9.08527 14.5109 7.99536 14.3024 7.99536C14.0939 7.99536 11.3833 6.25149 10.9663 5.16158C10.5493 4.07167 9.08966 3.41772 9.08966 4.72561C9.08966 6.03351 11.3833 7.77737 10.9663 7.99536C10.6326 8.16974 4.98893 8.21334 2.20877 8.21334C1.78406 8.21334 1 8.33474 1 9.33264C1 9.73695 1.37726 10.1027 2.20877 10.1752Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowLeftIcon;