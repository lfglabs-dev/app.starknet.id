import React, { FunctionComponent } from "react";

const DoneIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width}
      viewBox="0 0 16 17"
    >
      <path
        d="M6.92846 14.0075C6.08115 12.9031 3.5267 10.5645 2.35538 9.53321C1.6525 8.9057 2.33256 7.44528 3.73586 8.47401C4.8585 9.297 6.54626 10.8795 7.24981 11.5678C7.91153 8.42837 12.0301 3.16305 12.7185 2.45948C13.4068 1.75591 13.4068 1.75591 14.1066 2.09629C14.6664 2.36859 14.3474 2.90571 14.118 3.14023C10.3435 8.05381 8.6493 12.2486 8.66071 13.2926C8.67212 14.3365 7.98759 15.388 6.92846 14.0075Z"
        fill={color}
      />
    </svg>
  );
};

export default DoneIcon;
