import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/menus/sideMenu.module.css"
import CloseIcon from "../iconsComponents/icons/closeIcon";

type SideMenuProps = {
  title: string;
  onClose: () => void;
  child: React.ReactElement<any, any>;
};

const SideMenu: FunctionComponent<SideMenuProps> = ({ title, onClose, child }) => {

  return <div className={styles.container}>
      <div className='flex mb-4 items-center'>
        <div onClick={onClose} className="cursor-pointer">
          <CloseIcon color="var(--soft-brown)" width="48" />
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.child}>
        {child}
      </div>
    </div>
};

export default SideMenu;
