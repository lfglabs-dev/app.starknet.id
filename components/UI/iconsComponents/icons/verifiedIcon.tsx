import React, { FunctionComponent } from "react";

const VerifiedIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="7" fill={color} />
      <path
        d="M7.28009 11.2867C6.80247 10.6291 5.36288 9.23637 4.70279 8.6222C4.30668 8.24849 4.68921 7.37956 5.47996 7.9923C6.11256 8.48249 7.06373 9.42489 7.46023 9.83481C7.83184 7.96659 10.1498 4.83436 10.5372 4.41587C10.9247 3.99738 10.9247 3.99738 11.3189 4.2002C11.6343 4.36246 11.4549 4.68201 11.3257 4.82151C9.20151 7.74452 8.24872 10.2405 8.25551 10.8618C8.2623 11.4831 7.87711 12.1087 7.28009 11.2867Z"
        fill="white"
      />
    </svg>
  );
};

export default VerifiedIcon;
