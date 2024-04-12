import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import theme from "../../styles/theme";
import { getImgUrl } from "../../utils/stringService";
import DoneFilledIcon from "./iconsComponents/icons/doneFilledIcon";

type NftCardProps = {
  image: string;
  name: string;
  selectPicture: () => void;
  isHovered: boolean;
  isSelected?: boolean;
};

const NftCard: FunctionComponent<NftCardProps> = ({
  image,
  name,
  selectPicture,
  isHovered,
  isSelected,
}) => {
  return (
    <div className={styles.nftCard}>
      <div
        className={`${styles.nftImg} ${
          isHovered || isSelected ? styles.nftImgSelected : ""
        }`}
        onClick={selectPicture}
      >
        {isHovered || isSelected ? (
          <div className={styles.selectedIcon}>
            <DoneFilledIcon
              width="28"
              color="#FFF"
              secondColor={theme.palette.primary.main}
            />
          </div>
        ) : null}
        <img src={getImgUrl(image)} alt={`Image of ${name}`} />
      </div>
    </div>
  );
};

export default NftCard;
