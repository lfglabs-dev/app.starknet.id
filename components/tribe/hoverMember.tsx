import React, { FunctionComponent } from "react";
import styles from "../../styles/jointhetribe.module.css";

type hoverMemberProps = {
  member: Member;
  showAvatar?: boolean;
  showName?: boolean;
};

const HoverMember: FunctionComponent<hoverMemberProps> = ({
  member,
  showAvatar = false,
  showName = true,
}) => {
  return (
    <div className={styles.tribeMemberMenu}>
      {showName ? (
        <h4 className={styles.tribeMemberTitle}>{member.name}</h4>
      ) : null}
      {showAvatar ? (
        <div className="flex justify-center">
          <img
            alt={`@${member.name}'s Twitter avatar`}
            src={member.profile_image_url as string}
            className={styles.avatar}
          />
        </div>
      ) : null}
      <p>{member.description}</p>
      <div className={styles.stats}>
        <div className={styles.column}>
          <strong>Following</strong>
          <p>{member.public_metrics.following_count}</p>
        </div>
        <div className={styles.column}>
          <strong>Followers</strong>
          <p>{member.public_metrics.followers_count}</p>
        </div>
      </div>
      {/* <div className="flex flex-col justify-start">
        <strong>External link</strong>
        <TwitterIcon color="#1DA1F2" width="100px" />
      </div> */}
    </div>
  );
};

export default HoverMember;
