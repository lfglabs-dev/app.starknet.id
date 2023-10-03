import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import ArrowLeftIcon from "../UI/iconsComponents/icons/arrowLeftIcon";
import theme from "../../styles/theme";
import { hexToDecimal } from "../../utils/feltService";
import NftCard from "../UI/nftCard";
import ModalProfilePic from "../UI/modalProfilePic";

type UpdateProfilePicProps = {
  identity?: Identity;
  tokenId: string;
  back: () => void;
  openTxModal: () => void;
  setPfpTxHash: (hash: string) => void;
};

const UpdateProfilePic: FunctionComponent<UpdateProfilePicProps> = ({
  tokenId,
  identity,
  back,
  openTxModal,
  setPfpTxHash,
}) => {
  const [userNft, setUserNft] = useState<StarkscanNftProps[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedPic, setSelectedPic] = useState<StarkscanNftProps | null>(
    null
  );
  const whitelistedContracts = [
    // Starknet Quest contracts
    hexToDecimal(
      "0x0154520b48b692bb8b926434bbd24d797e806704af28b6cdcea30ea7db6a996b"
    ),
    // Identicons
    hexToDecimal(
      "0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d"
    ),
    // Braavos shield
    hexToDecimal(
      "0x04353bb6424de0b468ec4c984e01637fb2fafd3bdf81f4af367077fcbb9382c1"
    ),
    // Briq
    hexToDecimal(
      "0x01435498bf393da86b4733b9264a86b58a42b31f8d8b8ba309593e5c17847672"
    ),
    // Eykar
    hexToDecimal(
      "0x041e1382e604688da7f22e7fbb6113ba3649b84a87b58f4dc1cf5bfa96dfc2cf"
    ),
  ];

  useEffect(() => {
    if (!identity?.addr) return;
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      identity.addr
    ).then((data) => {
      console.log(data.data);
      filterAssets(data.data);
    });
  }, [tokenId, identity]);

  // Retrieve assets from Starkscan API
  const retrieveAssets = async (
    url: string,
    addr: string,
    accumulatedAssets: StarkscanNftProps[] = []
  ): Promise<StarkscanApiResult> => {
    return fetch(`${url}?addr=${addr}`)
      .then((res) => res.json())
      .then((data) => {
        const assets = [...accumulatedAssets, ...data.data];
        if (data.next_url) {
          return retrieveAssets(
            `${url}?addr=${addr}&next_url=${data.next_url}`,
            addr,
            assets
          );
        } else {
          return {
            data: assets,
          };
        }
      });
  };

  // Filter assets received from Starkscan API & filter solo buildings represented on the land
  const filterAssets = async (assets: StarkscanNftProps[]) => {
    const filteredAssets: StarkscanNftProps[] = [];
    assets.forEach((asset: StarkscanNftProps) => {
      if (whitelistedContracts.includes(hexToDecimal(asset.contract_address))) {
        filteredAssets.push(asset);
      }
    });
    setUserNft(filteredAssets);
  };

  const selectPicture = (nft: StarkscanNftProps) => {
    setOpenModal(true);
    setSelectedPic(nft);
  };

  const goBack = () => {
    setOpenModal(false);
    openTxModal();
    back();
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.arrows} onClick={() => back()}>
          <ArrowLeftIcon width="24" color={theme.palette.secondary.main} />
          <p>Back</p>
        </div>
        <div className={styles.gallery}>
          <p className={styles.subtitle}>Your NFTs</p>
          <h2 className={styles.title}>Choose your nft identity</h2>
          <div className={styles.nftSection}>
            {userNft && userNft.length > 0 ? (
              userNft.map((nft, index) => {
                return (
                  <NftCard
                    key={index}
                    image={nft.image_url as string}
                    name={nft.name as string}
                    selectPicture={() => selectPicture(nft)}
                  />
                );
              })
            ) : (
              <p>You don&apos;t own any whitelisted NFTs yet. </p>
            )}
          </div>
        </div>
      </div>
      <ModalProfilePic
        open={openModal}
        closeModal={goBack}
        nft={selectedPic as StarkscanNftProps}
        id={tokenId}
        setPfpTxHash={setPfpTxHash}
      />
    </>
  );
};

export default UpdateProfilePic;
