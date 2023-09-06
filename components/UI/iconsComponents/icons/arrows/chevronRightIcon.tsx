import React, { FunctionComponent } from "react";

const ChevronRightIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M4.307 2.01586C4.307 3.84692 6.48615 6.05444 6.74962 6.5935L6.75423 6.60293C7.18569 7.48564 7.43996 8.00583 6.20682 9.64526C5.57354 10.6625 4.2527 12.9412 4.03551 13.9177C3.76402 15.1384 5.12112 15.4436 5.66392 14.2229C6.20673 13.0022 9.19221 10.5608 11.092 9.34008C12.9918 8.11938 11.3634 6.5935 11.092 6.5935C10.8206 6.5935 7.2924 4.15209 6.74962 2.62621C6.20685 1.10033 4.307 0.184806 4.307 2.01586Z"
        fill={color}
      />
    </svg>
  );
};

export default ChevronRightIcon;
