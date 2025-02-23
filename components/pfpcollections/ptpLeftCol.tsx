import React from "react";
import styles from "../../styles/components/pfpNftCol.module.css";
import StarknetIcon from "../UI/iconsComponents/icons/starknetIcon";
import StarknetIdIcon from "../UI/iconsComponents/icons/starknetIdIcon";
import Link from "next/link";
import Image from "next/image";

import lgLand from "../../public/pfpCollections/lg-land.png";
import smLand from "../../public/pfpCollections/sm-land.png";

import smLeaves from "../../public/pfpCollections/sm-grasses.png";
import lgLeaves from "../../public/pfpCollections/lg-grasses.png";

const columnMenu = [
  {
    Icon: StarknetIdIcon,
    name: "Starknet ID Ecosystem",
    url: '',
  },
  {
    Icon: StarknetIcon,
    name: "Overall Starknet Ecosystem",
    url: '',
  },
];
const ptpLeftCol = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar_content}>
        <div className={styles.sidebar_menu}>
        {columnMenu.map((link, index) => (
          <Link href={link.url} className={styles.sidebar_item} key={index}>
            <link.Icon color="#412D29" width="16" />
            {link.name}
          </Link>
        ))}
        </div>
      <div className={styles.lgBackground}>
        <Image src={lgLand} className={styles.lg_land} alt="large land" />
        <Image src={lgLeaves} className={styles.lg_leaves} alt="large grass" />
      </div>
      <div className={styles.smBackground}>
        <Image src={smLand} className={styles.sm_land} alt="small land" />
        <Image src={smLeaves} className={styles.sm_leaves} alt="small grass" />
      </div>
      </div>
      {/* <div className={styles.menuImage}>
      </div> */}
    </div>
  );
};

export default ptpLeftCol;
