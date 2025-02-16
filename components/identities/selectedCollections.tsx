import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { NftCollections } from "../../utils/constants";
import ClickableAction from "../UI/iconsComponents/clickableAction";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import theme from "../../styles/theme";
import { useRouter } from "next/router";

const SelectedCollections: FunctionComponent = () => {
  const router = useRouter();

    const nftMarketPlace : React.MouseEventHandler<HTMLButtonElement> = () => {
      window.open("https://unframed.co/", "_blank");
    };
  return (
    <>
      <div
        className={`mx-auto flex flex-col justify-center ${styles.nftCollectionWraper}`}>
        {NftCollections.map((collection, index) => {
          return (
            <div
              className={styles.nftCollectionCard}
              key={index}
              onClick={() => window.open(collection.externalLink)}>
              <div
                style={{ backgroundImage: `url(${collection.imageUri})` }}
                className={styles.nftCollectionImg}
              />
              <div className={styles.nftCollectionName}>{collection.name}</div>
            </div>
          );
        })}
      </div>
      <div className={` ${styles.btnWrapper}`}>
        <div className="flex flex-col gap-[12px] items-center">
          
          <button onClick={nftMarketPlace} className="flex text-[#454545] transition-colors duration-300 hover:text-[#454545]/80 items-center gap-[10px] w-fit justify-center border-[rgba(69, 69, 69, 0.1)]   shadow-[0px_2px_30px_0px_#0000000F] p-[10px_16px] rounded-[8px] bg-white  border-[1px] text-[14px] font-normal font-[QuickZap] ">
            <ArrowRightIcon width="25" color={theme.palette.secondary.main} />
            <span>GET YOUR NFT</span>
          </button>
          <div className="">
            <div className={styles.cancelBtn} onClick={() => router.push("/")}>
              Cancel
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectedCollections;
