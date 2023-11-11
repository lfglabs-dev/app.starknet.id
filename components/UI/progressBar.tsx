import React, { FunctionComponent } from "react";
import styles from "../../styles/components/progressbar.module.css";
import Milestone from "../../public/visuals/doneFilledIcon.svg";
import Image from "next/image";

type ProgressBarProps = {
  done: number;
  total: number;
};

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ done, total }) => {
  return (
    <div className={styles.container}>
      {Array.from(Array(total).keys()).map((_, index) => {
        return (
          <div key={index} className={styles.milestone}>
            {index + 1 <= done ? (
              <Image src={Milestone} alt="milestone" width="32" height="32" />
            ) : (
              <div className={styles.empty_milestone}>{index + 1}</div>
            )}
          </div>
        );
      })}
      <div className={styles.base_line} />
      {total > 0 && done > 0 && (
        <div
          className={styles.colored_line}
          style={{
            right:
              done >= total
                ? 8
                : `${((total - done - 1) / (total - 1)) * 100}%`,
          }}
        />
      )}
    </div>
  );
};

export default ProgressBar;
