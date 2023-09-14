import React, { FunctionComponent } from "react";

const ArrowLeftIcon: FunctionComponent<IconProps> = ({ width, color }) => {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="essential">
        <path
          id="Vector 3"
          d="M20.6868 10.9872C17.6843 10.7256 11.0953 10.8782 8.17614 10.9872C8.90593 9.89731 10.4281 7.4559 10.6784 6.40958C10.9913 5.10168 9.42731 4.77471 8.80178 6.08261C8.17624 7.3905 4.73573 10.0063 2.54636 11.3142C0.356989 12.6221 2.23359 14.257 2.54636 14.257C2.85913 14.257 6.92511 16.8728 7.55061 18.5076C8.17611 20.1425 10.3655 21.1234 10.3655 19.1616C10.3655 17.1997 6.92507 14.5839 7.55061 14.257C8.05104 13.9954 16.5166 13.93 20.6868 13.93C21.3239 13.93 22.5 13.7479 22.5 12.251C22.5 11.6446 21.9341 11.0959 20.6868 10.9872Z"
          fill={color}
        />
      </g>
    </svg>
  );
};

export default ArrowLeftIcon;
