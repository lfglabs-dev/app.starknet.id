import { useMediaQuery } from "@mui/material";
import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/jointhetribe.module.css";
import { changeTwitterProfilePic } from "../../utils/stringService";
import ModalMessage from "../UI/modalMessage";
import HoverMember from "./hoverMember";
import MemberTooltip from "./memberTooltip";

type MemberProps = {
  member: Member;
};

const Member: FunctionComponent<MemberProps> = ({ member }) => {
  const matches = useMediaQuery("(max-width:1024px)");
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <div className={styles.avatarContainer}>
      <MemberTooltip title={<HoverMember member={member} />}>
        <img
          onClick={matches ? () => setOpenModal(true) : undefined}
          alt={`@${member.name}'s Twitter avatar`}
          src={changeTwitterProfilePic(member.profile_image_url)}
          className={styles.tribeMemberAvatar}
        />
      </MemberTooltip>
      <ModalMessage
        title={member.name}
        message={<HoverMember member={member} showAvatar showName={false} />}
        closeModal={() => setOpenModal(false)}
        open={openModal}
      />
    </div>
  );
};

export default Member;
