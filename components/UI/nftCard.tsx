import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import theme from "../../styles/theme";
import AddIcon from "./iconsComponents/icons/addIcon";
import { useMediaQuery } from "@mui/material";

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
  const [imageUri, setImageUri] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:425px)");

  useEffect(() => {
    if (!image) return;
    if (image.startsWith("ipfs://")) {
      setImageUri(
        image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      );
    } else {
      setImageUri(image);
    }
  }, [image]);

  if (!image) return null;

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
          <img src={imageUri} alt={`Image of ${name}`} />
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
