import React, { FunctionComponent } from "react";

const ArrowDownIcon: FunctionComponent<IconProps> = ({
  width,
  className,
  color,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.9841 4.307C12.1531 4.307 9.94556 6.48615 9.4065 6.74962L9.39707 6.75423C8.51436 7.18569 7.99417 7.43996 6.35474 6.20681C5.33749 5.57354 3.05884 4.2527 2.08228 4.03551C0.86157 3.76402 0.556397 5.12112 1.7771 5.66392C2.9978 6.20673 5.43921 9.19221 6.65992 11.092C7.88062 12.9918 9.4065 11.3634 9.4065 11.092C9.4065 10.8206 11.8479 7.29239 13.3738 6.74962C14.8997 6.20684 15.8152 4.307 13.9841 4.307Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowDownIcon;
