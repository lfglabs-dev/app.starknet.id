import { FunctionComponent } from "react";
import styles from "../../styles/search.module.css";
import ArrowIcon from "./iconsComponents/icons/arrowIcon";
import theme from "../../styles/theme";

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
      <ArrowIcon
        width="17"
        color={error ? "#D32F2F" : theme.palette.primary.main}
      />
    </div>
  );
};

export default SearchBadge;
