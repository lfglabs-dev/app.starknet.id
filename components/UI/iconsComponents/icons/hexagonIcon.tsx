import React, { FunctionComponent } from "react";
import styles from "../../../../styles/components/hexagon.module.css";

type HexagonProps = {
  width?: number | string;
  className?: string;
};

const Hexagon: FunctionComponent<HexagonProps> = ({ width=120, className='' }) => {
  return <svg className={[styles.hexagon, className].join(' ')} width={width} height={width} viewBox="0 0 327.846 318.144">
  <path d="M172.871,0a28.906,28.906,0,0,1,25.009,14.412L245.805,97.1a28.906,28.906,0,0,1,0,28.989L197.88,208.784A28.906,28.906,0,0,1,172.871,223.2H76.831a28.906,28.906,0,0,1-25.009-14.412L3.9,126.092A28.906,28.906,0,0,1,3.9,97.1L51.821,14.412A28.906,28.906,0,0,1,76.831,0Z" transform="translate(111.598) rotate(30)"/>
</svg>
};

export default Hexagon;
