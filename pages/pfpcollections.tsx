import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PfpNftCard from "../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../utils/constants";
import Image from "next/image";

// Define a type for the sections
type Section = "Starknet Id Ecosystem" | "Overall Starknet Ecosystem" | "Your Nfts";

const PFPCollections: NextPage = () => {
  // State to track the currently selected section
  const [selectedSection, setSelectedSection] = useState<Section>("Starknet Id Ecosystem");

  // State to toggle between blur and dark modes
  const [inactiveMode, setInactiveMode] = useState<"blur" | "dark">("blur");

  // Function to handle section selection
  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
  };

  // Function to toggle between blur and dark modes
  const toggleInactiveMode = () => {
    setInactiveMode((prevMode) => (prevMode === "blur" ? "dark" : "blur"));
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.mypage}>
        {/* Sidebar Items */}
        <div
          className={`${styles.sidebartext} ${
            selectedSection === "Your Nfts"
              ? styles.active
              : inactiveMode === "blur"
              ? styles.blur
              : styles.dark
          }`}
          
        >
          <div className={styles.ava}>
            <Image
              src="/pfpCollections/Avataricon.png"
              width={16}
              height={16}
              alt="img"
              className={styles.allImage}
            />
          </div>
          <div>Your Nfts</div>
        </div>
        <div
          className={`${styles.sidebartext} ${
            selectedSection === "Starknet Id Ecosystem"
              ? styles.active
              : inactiveMode === "blur"
              ? styles.blur
              : styles.dark
          }`}
          onClick={() => handleSectionClick("Starknet Id Ecosystem")}
        >
          <div className={styles.longname}>
            <Image
              src={
                selectedSection === "Starknet Id Ecosystem"
                  ? "/pfpCollections/starknetbox.png"
                  : "/pfpCollections/idstarkneticon.png"
              }
              width={16}
              height={16}
              alt="img"
              className={styles.black}
            />
          </div>
          <div className={styles.idname}>
            <div>Starknet Id</div> 
            <div className={styles.eco}>Ecosystem</div>
          </div>
        </div>
        <div
          className={`${styles.sidebartext} ${
            selectedSection === "Overall Starknet Ecosystem"
              ? styles.active
              : inactiveMode === "blur"
              ? styles.blur
              : styles.dark
          }`}
          onClick={() => handleSectionClick("Overall Starknet Ecosystem")}
        >
          <div className={styles.overall}>
            <Image
             src={
              selectedSection === "Starknet Id Ecosystem"
                ? "/pfpCollections/Symbol-Starknet.png"
                : "/pfpCollections/starknetIDIcon.png"
            }
              width={16}
              height={16}
              alt="img"
              className={styles.black}
            />
          </div>
          <div>Overall Starknet Ecosystem</div>
        </div>
        {/* Background Image */}
        <div className={styles.myimage}>
          <Image
            src="/register/grass.png"
            width={447.1688232421875}
            height={218.77442932128906}
            className={styles.mygrass}
            alt="img"
          />
        </div>
      </div>

      {/* Main Content */}
      <div>
        {selectedSection === "Your Nfts" && (
          <section>
            <p className={styles.subtitle}>Your NFTs</p>
          </section>
        )}
        {selectedSection === "Starknet Id Ecosystem" && (
          <section>
            <div className={styles.leftbox}>
              <div className={styles.nfts}>
                {ourNfts.map((collection, index) => (
                  <PfpNftCard
                    key={index}
                    image={collection.imageUri}
                    name={collection.name}
                    onClick={() => window.open(collection.infoPage)}
                  />
                ))}
              </div>
              <div className={styles.button}>
                <button>CANCEL</button>
              </div>
            </div>
          </section>
        )}
        {selectedSection === "Overall Starknet Ecosystem" && (
          <section>
            <div className={styles.leftbox}>
              <div className={styles.nfts}>
                {NftCollections.map((collection, index) => (
                  <PfpNftCard
                    key={index}
                    image={collection.imageUri}
                    name={collection.name}
                    onClick={() => window.open(collection.externalLink)}
                  />
                ))}
              </div>
              <div className={styles.button}>
                <div className={styles.arrbut}>
                  <button className={styles.get}>
                    <div>
                      <Image
                        src="/pfpCollections/arrow.png"
                        width={89}
                        height={24}
                        className={styles.arrow}
                        alt="img"
                      />
                    </div>
                    <div>GET YOUR NFT</div>
                  </button>
                </div>
                <button>CANCEL</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PFPCollections;