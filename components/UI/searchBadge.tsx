import React, { FunctionComponent } from "react";
import styles from "../../styles/search.module.css";
import theme from "../../styles/theme";
import ChevronRightIcon from "./iconsComponents/icons/arrows/chevronRightIcon";

type SearchBadgeProps = {
  message: string;
  error: boolean;
};

const SearchBadge: FunctionComponent<SearchBadgeProps> = ({
  error,
  message,
}) => {
  return (
    <div className={`${styles.badge} ${error ? styles.error : styles.success}`}>
      <span>{message}</span>
      <ChevronRightIcon
        width="14"
        color={error ? "#D32F2F" : theme.palette.primary.main}
      />
    </div>
  );
};

export default SearchBadge;
