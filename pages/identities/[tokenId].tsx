import React, { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import styles2 from "../../styles/components/identitiesV1.module.css";
import { useRouter } from "next/router";
import Button from "../../components/UI/button";
import { NextPage } from "next";
import { ThreeDots } from "react-loader-spinner";
import IdentityActions from "../../components/identities/identitiesActions";
import { Identity } from "../../types/backTypes";
import IdentityWarnings from "../../components/identities/identityWarnings";
import { url } from "inspector";
import EditIcon from "../../components/UI/iconsComponents/icons/editIcon";
import ModalMessage from "../../components/UI/modalMessage";
import NftsGallery from "../../components/nfts/NftsGallery";

const TokenIdPage: NextPage = () => {
  const router = useRouter();
  const tokenId: string = router.query.tokenId as string;
  const [identity, setIdentity] = useState<Identity>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isIdentityADomain, setIsIdentityADomain] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (tokenId) {
      const refreshData = () =>
        fetch(`/api/indexer/id_to_data?id=${tokenId}`)
          .then((response) => response.json())
          .then((data: Identity) => {
            if (data.error) {
              setIsIdentityADomain(false);
              return;
            }
            setIdentity(data);
            setIsIdentityADomain(true);
          });
      refreshData();
      const timer = setInterval(() => refreshData(), 30e3);
      return () => clearInterval(timer);
    }
  }, [tokenId]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles2.containerIdentity}>
        {isIdentityADomain === undefined ? (
          <div className="h-full flex items-center justify-center">
            <ThreeDots
              height="25"
              width="80"
              radius="9"
              color="#19AA6E"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          <>
            <h1 className="sm:text-5xl text-4xl my-5 break-all mx-3">
              {isIdentityADomain
                ? identity?.domain
                : `Starknet ID : ${tokenId}`}
            </h1>
            <div className={styles2.hexagonContainer}>
              <div className={styles2.hexagon + " " + styles2.hexagon1}>
                <div className={styles2["hexagon-in1"]}>
                  <div
                    className={styles2["hexagon-in2"]}
                    style={{
                      backgroundImage: `url(https://www.starknet.id/api/identicons/${tokenId})`,
                      // backgroundImage:
                      //   "url(https://starkware.co/wp-content/uploads/2022/11/Token-post-image_media.png)",
                    }}
                  >
                    <div
                      className={styles2.editContainer}
                      onClick={() => setModalOpen(true)}
                    >
                      {/* <img className={styles2.editIcon} src="/icons/edit.png" /> */}
                      <div className={styles2.editIcon}>
                        <EditIcon width="30" color="white" />
                      </div>
                      <span className={styles2.editText}>Edit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <IdentityActions
              identity={identity}
              tokenId={tokenId}
              isIdentityADomain={isIdentityADomain}
            />

            <IdentityWarnings identity={identity} />
            <div className="mt-5">
              <Button onClick={() => router.push("/")}>
                Back to your identities
              </Button>
            </div>
            <ModalMessage
              open={modalOpen}
              title={"Select your NFT"}
              closeModal={() => setModalOpen(false)}
              message={
                <NftsGallery
                  identities={[
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                    { id: "973639193985" },
                  ]}
                />
              }
              menuCustomStyle={{ width: "70%", maxWidth: "unset" }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TokenIdPage;
