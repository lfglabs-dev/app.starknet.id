import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import theme from "../../styles/theme";
import AddIcon from "./iconsComponents/icons/addIcon";
import { useMediaQuery } from "@mui/material";
import { getImgUrl } from "../../utils/stringService";

type NftCardProps = {
  image: string;
  name: string;
  selectPicture: () => void;
};

const NftCard: FunctionComponent<NftCardProps> = ({
  image,
  name,
  selectPicture,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:425px)");

  return (
    <div
      className={styles.nftCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered || isMobile ? (
        <div
          className={styles.nftImg}
          onClick={() => isMobile && selectPicture()}
        >
          <img src={getImgUrl(image)} alt={`Image of ${name}`} />
        </div>
      ) : (
        <div className={styles.nftHovered} onClick={selectPicture}>
          <AddIcon width="28" color={theme.palette.secondary.main} />
          <p>Add this NFT</p>
        </div>
      )}
    </div>
  );
};

export default NftCard;
