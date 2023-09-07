import React, { FunctionComponent } from "react";

const ChevronUpIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M2.01586 11.693C3.84692 11.693 6.05444 9.51385 6.5935 9.25038L6.60293 9.24577C7.48564 8.81431 8.00583 8.56004 9.64526 9.79319C10.6625 10.4265 12.9412 11.7473 13.9177 11.9645C15.1384 12.236 15.4436 10.8789 14.2229 10.3361C13.0022 9.79327 10.5608 6.80779 9.34008 4.90797C8.11938 3.00816 6.5935 4.63657 6.5935 4.90797C6.5935 5.17938 4.15209 8.70761 2.62621 9.25038C1.10033 9.79316 0.184806 11.693 2.01586 11.693Z"
        fill={color}
      />
    </svg>
  );
};

export default ChevronUpIcon;
