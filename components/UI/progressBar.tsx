import React, { FunctionComponent } from "react";
import styles from "../../styles/components/progressbar.module.css";
import DoneFilledIcon from "./iconsComponents/icons/doneFilledIcon";
import theme from "../../styles/theme";

type ProgressBarProps = {
  doneSteps: number;
  totalSteps: number;
};

const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  doneSteps,
  totalSteps,
}) => {
  return (
    <div className={styles.container}>
      {Array.from(Array(totalSteps).keys()).map((_, index) => {
        return (
          <div key={index} className={styles.milestone}>
            {index + 1 <= doneSteps ? (
              <DoneFilledIcon
                width="32"
                secondColor={theme.palette.primary.main}
                color="#FFF"
              />
            ) : (
              <div className={styles.empty_milestone}>{index + 1}</div>
            )}
          </div>
        );
      })}
      <div className={styles.base_line} />
      {totalSteps > 0 ? (
        <div
          className={styles.colored_line}
          style={{
            right:
              doneSteps >= totalSteps
                ? 8
                : `${((totalSteps - doneSteps - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />
      ) : null}
    </div>
  );
};

export default ProgressBar;
