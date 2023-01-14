import React, { FunctionComponent, MouseEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import styles2 from '../../styles/jointhetribe.module.css'
import HexagonIcon from '../UI/iconsComponents/icons/hexagonIcon';
import InputAction from '../UI/inputAction';
import Loading from '../UI/loading';

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

type SearchMembersProps = {
  hoverMember: (e: React.MouseEvent, index:number, member: Member) => void;
};

const SearchMembers: FunctionComponent<SearchMembersProps> = ({ hoverMember }) => {
  const maxShownMembers = 12;
  const [followers, setFollowers] = useState<Array<any>>([])
  const [selectedUserList, setSelectedUserList] = useState<Array<any>>([])
  const [totalUserLength, setTotalUserLength] = useState<number>(0)
  const [search, setSearch] = useState<string>('')
  const [user, setUser] = useState<undefined | Dictionary<any>>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  function handleSearch(search: string) {
    if (search[0] === '@') setSearch(search.substring(1));
    else setSearch(search);
  }

  useEffect(() => {
    if (search) {
      setLoading(true);
      fetch(`/api/tribe/find_followers?username=${encodeURI(search)}`)
      .then(res => res.json())
      .then((res: Dictionary<any>) => {
        setLoading(false);
        setUser(res.user);
        if (res.followers && res.following && (res.followers.length || res.following.length)) {
          setFollowers(res.followers);
        }
        else {
          setFollowers([]);
          setTotalUserLength(0);
        }
      })
    }
  }, [search])

  useEffect(() => {
      setTotalUserLength(followers.length);
      // Remove all the user that exceed maxShownMembers
      const followersCopy = [...followers];
      followersCopy.length = Math.min(followers.length, maxShownMembers);
      setSelectedUserList(followersCopy);
  }, [followers])
  
  return <div id='me-and-the-tribe'>
    <InputAction placeholder='@Twitter username'  className={'my-6 ' + styles2.center} maxTextLength={15} buttonName='show me' action={handleSearch} />
    {
      loading ?
      <div className={styles2.center}>
        <Loading />
      </div>
      :
      user ? <>
      <p>Tribe followers: {followers.length}</p>
      <div className={styles2.tribeMembersContainer}>
        {
          selectedUserList.map((follower:Member, index:number) =>
            <div key={'user_' + index} className={styles2.avatarContainer}>
              <img onMouseEnter={(e) => hoverMember(e, index, follower)} width={200} height={200} alt={`@${follower.name}'s Twitter avatar`} src={follower.profile_image_url as string} className={styles2.tribeMemberAvatar} />
            </div>
          )
        }
        {
          totalUserLength < maxShownMembers ?
          // Placeholders
          [...Array(maxShownMembers - totalUserLength)].map((_, index) =>
            <HexagonIcon width={200} key={'placeholder_' + index} />
          ) : null
        }
      </div>
      </>
      : search ?
      <p>
        User not found
      </p>
      : <p>
        Please enter a Twitter username and click &quot;Show me&quot;
      </p>
    }
    {
      totalUserLength > maxShownMembers && <p className='mt-2'>
        + {totalUserLength - maxShownMembers} more
      </p>
    }
  </div>
};

export default SearchMembers;
