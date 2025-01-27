import { FunctionComponent } from "react";
import styles from "../../styles/components/identitySidebar.module.css";
import PlusIcon from "../UI/iconsComponents/icons/plusIcon";
import theme from "@/styles/theme";

type IdentitySidebarProps = {
  active?: boolean;
};

const dummyData = ["Kevils.stark"];

const IdentitySidebar: FunctionComponent<IdentitySidebarProps> = ({
  active = false,
}) => {
  return (
    <aside className={styles.identityBoxSidebar}>
      <div className={styles.identityBoxSidebarItemsContainer}>
        {dummyData.map((item, idx) => (
          <p
            className={
              active
                ? styles.identityBoxSidebarItemActive
                : styles.identityBoxSidebarItem
            }
            key={idx}
          >
            {item}
          </p>
        ))}
      </div>
      <div className={styles.addIdentityContainer}>
        <PlusIcon width="17" color={theme.palette.secondary.main} />
        <p onClick={() => {}} className={styles.addIdentity}>
          Add Identities
        </p>
      </div>
    </aside>
  );
};

export default IdentitySidebar;
