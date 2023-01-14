import React, { FunctionComponent, useEffect } from 'react';
import { useState } from 'react';
import styles2 from '../../styles/jointhetribe.module.css'
import HexagonIcon from '../UI/iconsComponents/icons/hexagonIcon';

interface Dictionary<T> {
  [Key: string]: T;
}
type Member = {
  name: string;
  screen_name: string;
  profile_image_url: string;
  description: string;
  entities: Dictionary<Dictionary<Array<Dictionary<string>>>>;
  followers_count: number;
  friends_count: number;
}

type FamousMembersProps = {
  hoverMember: (e: React.MouseEvent, index:number, member: Member) => void;
};

const FamousMembers: FunctionComponent<FamousMembersProps> = ({ hoverMember }) => {
  const [famousTribeMembers, setFamousTribeMembers] = useState<Array<Member>>([]);
  const maxFamousTribeMembers = 18;

  useEffect(() => {
    fetch('/api/tribe/get_famous_members').then(res => res.json()).then((res: Dictionary<Array<Member>>) => {
      const members = res.cachedMembers as Array<Member>;
      for (let index = 0; index < members.length; index++) {
        const member = members[index];
        member.profile_image_url = member.profile_image_url.replace('_normal', '');
      }
      setFamousTribeMembers(members);
    })
  }, [])

  return <div className={styles2.tribeMembersContainer + ' ' + styles2.famous}>
  {
    famousTribeMembers.map((member, index) => 
    <div key={'famousUser_' + index} className={styles2.avatarContainer}>
      <img onMouseEnter={(e) => hoverMember(e, index, member)} width={200} height={200} alt={`@${member.screen_name}'s Twitter avatar`} src={member.profile_image_url} className={styles2.tribeMemberAvatar} />
    </div>
    )
  }
  {
    [...Array(maxFamousTribeMembers - famousTribeMembers.length)].map((_, index) => <HexagonIcon width={200} className={styles2.famousTribeMember} key={'famousUserPlaceholder_' + index} />)
  }
</div>
};

export default FamousMembers;
