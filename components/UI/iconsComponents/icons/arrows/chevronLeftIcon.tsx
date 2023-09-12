import React, { FunctionComponent } from "react";

const ChevronLeftIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M11.693 13.9841C11.693 12.1531 9.51385 9.94556 9.25038 9.4065L9.24577 9.39707C8.81431 8.51436 8.56004 7.99417 9.79319 6.35474C10.4265 5.33749 11.7473 3.05884 11.9645 2.08228C12.236 0.86157 10.8789 0.556397 10.3361 1.7771C9.79327 2.9978 6.80779 5.43921 4.90797 6.65992C3.00816 7.88062 4.63657 9.4065 4.90797 9.4065C5.17938 9.4065 8.70761 11.8479 9.25038 13.3738C9.79316 14.8997 11.693 15.8152 11.693 13.9841Z"
        fill={color}
      />
    </svg>
  );
};

export default ChevronLeftIcon;
