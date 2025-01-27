import { FunctionComponent } from "react";
import styles from "../../styles/components/identitySidebar.module.css";
import PlusIcon from "../UI/iconsComponents/icons/plusIcon";
import theme from "@/styles/theme";

type IdentitySidebarProps = {
  active?: boolean;
  identities?: string[];
  onAddIdentity?: () => void;
};

const IdentitySidebar: FunctionComponent<IdentitySidebarProps> = ({
  active = false,
  identities = ["Kevils.stark"],
  onAddIdentity,
}) => {
  return (
    <aside className={styles.identityBoxSidebar}>
      <div className={styles.identityBoxSidebarItemsContainer}>
        {identities.map((item, idx) => (
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
      <div onClick={onAddIdentity} className={styles.addIdentityContainer}>
        <PlusIcon width="17" color={theme.palette.secondary.main} />
        <p className={styles.addIdentity}>Add Identities</p>
      </div>
    </aside>
  );
};

export default IdentitySidebar;
