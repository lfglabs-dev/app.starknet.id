import React, { FunctionComponent } from "react";
import styles from "../../../../styles/components/icons.module.css";
import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";
import WarningIcon from "../../../UI/iconsComponents/icons/warningIcon";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

const WarningTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#FFFFFF",
    border: "2px solid #FFFFFF",
    borderRadius: "12px",
    color: "#E1DCEA",
    maxWidth: 257,
    padding: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow:
      "0px 5px 14px 0px rgba(8, 15, 52, 0.04), 0px 1px 1px 0px rgba(23, 15, 73, 0.04), 0px 0px 1px 0px rgba(23, 15, 73, 0.03)",
  },
  [`& .${tooltipClasses.tooltip}:hover`]: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

type ClickableWarningIconProps = {
  startVerification: () => void;
  icon: React.ReactNode;
  className: string;
};

const ClickableWarningIcon: FunctionComponent<ClickableWarningIconProps> = ({
  startVerification,
  icon,
  className,
}) => {
  function handleClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    event.preventDefault();
    event.stopPropagation();
    startVerification();
  }

  return (
    <WarningTooltip
      title={
        <React.Fragment>
          <div className={styles.tooltip}>
            <div>
              <WarningIcon width={"18"} color={"#F57C00"} />
            </div>
            <div>
              <div className={styles.tooltipTitle}>
                Update Verification Status
              </div>
              <div className={styles.tooltipSub}>
                Update to the new StarkNet version to maintain your verification
                status.
              </div>
            </div>
            <div>
              <ArrowForwardIosRoundedIcon
                sx={{ color: "#402D28", fontSize: "12px" }}
              />
            </div>
          </div>
        </React.Fragment>
      }
      PopperProps={{
        onClick: handleClick,
      }}
    >
      <div className={className} onClick={() => startVerification()}>
        <div className={styles.verifiedIcon}>
          <WarningIcon width={"18"} color={"#F57C00"} />
        </div>
        {icon}
      </div>
    </WarningTooltip>
  );
};

export default ClickableWarningIcon;
