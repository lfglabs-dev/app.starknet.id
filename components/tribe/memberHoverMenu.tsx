import React, { FunctionComponent } from 'react';
import styles2 from '../../styles/jointhetribe.module.css';

interface Dictionary<T> {
  [Key: string]: T;
}

type Member = {
  name: string;
  profile_image_url: string;
  description: string;
  entities: Dictionary<Dictionary<Array<Dictionary<string>>>>;
  followers_count: number;
  friends_count: number;
}

type MemberHoverMenuProps = {
  id: number;
  member: Member;
  parseTwitterDescription: (description: string, entities: Dictionary<Dictionary<Array<Dictionary<string>>>>) => string;
  style?: React.CSSProperties;
};

const MemberHoverMenu: FunctionComponent<MemberHoverMenuProps> = ({ id, member, parseTwitterDescription, ...props }) => {
  return <div style={props.style} className={styles2.tribeMemberMenuContainer} id={'memberHoverMenu_' + id}>
      <div className={styles2.tribeMemberMenu}>
        <div className={styles2.avatarContainer}>
          <img alt={`@${member.name}'s Twitter avatar`} src={member.profile_image_url as string} className={styles2.avatar} />
        </div>
        <strong>{member.name}</strong>
        <p dangerouslySetInnerHTML={{__html: parseTwitterDescription(member.description, member.entities)}}></p>
        <div className={styles2.stats}>
          <div className={styles2.column}>
            <strong>Followers</strong>
            <p>{member.followers_count}</p>
          </div>
          <div className={styles2.column}>
            <strong>Following</strong>
            <p>{member.friends_count}</p>
          </div>
        </div>
      </div>
  </div>
};

export default MemberHoverMenu;
