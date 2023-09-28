import React, { FunctionComponent } from "react";

const DoneFilledIcon: FunctionComponent<IconProps> = ({
  width,
  color,
  filled,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
    >
      <circle cx="8" cy="8.5" r="7" fill={filled} />
      <path
        d="M7.28009 11.7868C6.80247 11.1292 5.36288 9.73649 4.70279 9.12232C4.30668 8.74861 4.68921 7.87968 5.47996 8.49242C6.11256 8.98262 7.06373 9.92501 7.46023 10.3349C7.83184 8.46672 10.1498 5.33448 10.5372 4.91599C10.9247 4.4975 10.9247 4.4975 11.3189 4.70032C11.6343 4.86258 11.4549 5.18214 11.3257 5.32163C9.20151 8.24464 8.24872 10.7406 8.25551 11.3619C8.2623 11.9832 7.87711 12.6088 7.28009 11.7868Z"
        fill={color}
      />
    </svg>
  );
};

export default DoneFilledIcon;
