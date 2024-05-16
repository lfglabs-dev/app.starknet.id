import { Tooltip } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/identityCard.module.css";
import CopyIcon from "./iconsComponents/icons/copyIcon";
import DoneIcon from "./iconsComponents/icons/doneIcon";
import theme from "@/styles/theme";
import Notification from "./notification";
import { useCopyToClipboard } from "@/hooks/useCopy";

type CopyContentProps = {
  value: string | undefined;
  className?: string;
};

const CopyContent: FunctionComponent<CopyContentProps> = ({
  value,
  className,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <>
      <div className={className}>
        {!copied ? (
          <Tooltip title="Copy" arrow>
            <div
              className={styles.contentCopy}
              onClick={() => copyToClipboard(value)}
            >
              <CopyIcon width="20" color={"currentColor"} />
            </div>
          </Tooltip>
        ) : (
          <DoneIcon color={theme.palette.primary.main} width="20" />
        )}
      </div>
      <Notification visible={copied} severity="success">
        <>&nbsp;Address copied !</>
      </Notification>
    </>
  );
};

export default CopyContent;
