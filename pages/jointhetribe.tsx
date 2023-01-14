import React, { ReactElement, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import styles2 from '../styles/jointhetribe.module.css'
import TextCopy from '../components/UI/textCopy';
import HexagonIcon from '../components/UI/iconsComponents/icons/hexagonIcon';
import SearchMembers from '../components/tribe/searchMembers';
import Button from '../components/UI/button';
import Claim from '../components/tribe/claim';
import { getCookie, setCookie } from '../utils/cookies';
import MemberHoverMenu from '../components/tribe/memberHoverMenu';
import { useAccount } from '@starknet-react/core';
import { hexToFelt } from '../utils/felt';
import ModalMessage from '../components/UI/modalMessage';
import FamousMembers from '../components/tribe/famousMembers';

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

const JoinTheTribe: NextPage = () => {
  const [menu, setMenu] = useState<ReactElement<any, any> | null>(null);
  const [twitterToken, setTwitterToken] = useState<string>('');
  const { address } = useAccount();
  const [mainDomain, setMainDomain] = useState<string>('');

  useEffect(() => {
    if (address) fetch(`/api/indexer/addr_to_domain?addr=${hexToFelt(address)}`)
    .then((response) => response.json())
    .then((data) => {
      const domain = data.domain;
      setMainDomain(domain);
    });
  }, [address]);

  async function twitterRequest(state = 'state', url: string, init: Dictionary<any> = {}) {
    const authURL = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID}&redirect_uri=${window.location.href}&scope=users.read%20tweet.read%20follows.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`
    if (!twitterToken) return document.location.href = authURL
    const res = await fetch(url, init)
    if (res.status !== 200) return document.location.href = authURL
    const json = await res.json()
    if (json.error) return document.location = authURL
    return json
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) getTwitterToken();
    async function getTwitterToken() {
      window.location.href = `#${state}`;
      if (state === 'join') setMenu(<Claim twitterToken={twitterToken} twitterRequest={twitterRequest} setMenu={setMenu} />)
      const res = await fetch(`/api/twitter/oauth/request_oauth_token?code=${code}&redirect_uri=${window.location.href.split('?')[0]}`);
      const data = await res.json();
      setTwitterToken(data.accessToken);
      setCookie('twitterToken', data.accessToken, 360);
      window.history.pushState('', '', '/jointhetribe');
    }
  }, []);

  useEffect(() => {
    if (twitterToken) return;
    const token = getCookie('twitterToken');
    if (token) setTwitterToken(token);
  }, [twitterToken]);

  const parseTwitterDescription = (description: string, entities: Dictionary<Dictionary<Array<Dictionary<string>>>>) => {
    const urls = entities.description?.urls;
    if (!urls) return description;
    let parsedDescription = description;
    urls.forEach((url: Dictionary<string>) => {
      parsedDescription = parsedDescription.replace(url.url, `<a href='${url.expanded_url}' target='_blank'>${url.display_url}</a>`);
    })
    return parsedDescription;
  }

  const hoverMember = (e: React.MouseEvent, index: number, member: Member) => {
    const windowWidth = window.innerWidth;

    if (windowWidth > 700) {
      const element = e.target as HTMLElement;
      const rect = element.getBoundingClientRect();
      const left = rect.left
      const right = rect.right;
      const marginX = 90;
      const width = 350;
      const style: Dictionary<string | number> = { top: rect.top + window.scrollY };
      if (left + width + marginX + 10 >= window.innerWidth) style.left = right - width - marginX;
      else style.left = left + marginX;
      const interval: NodeJS.Timer = setInterval(() => {
        const memberMenu = document.getElementById('memberHoverMenu_' + index);
        if (!memberMenu) return clearInterval(interval);
        if (!element.matches(':hover') && !memberMenu.matches(':hover')) {
          setMenu(null);
          return clearInterval(interval);
        }
      }, 10);
      setMenu(<MemberHoverMenu parseTwitterDescription={parseTwitterDescription} id={index} member={member} style={style} />)
    }
    else {
      setMenu(<ModalMessage title={member.name} message={
      <div className={styles2.tribeMemberMenu}>
        <div className={styles2.avatarContainer}>
          <img alt={`@${member.name}'s Twitter avatar`} src={member.profile_image_url as string} className={styles2.avatar} />
        </div>
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
      } closeModal={() => setMenu(null)} open={true} />)
    }
  }

  return (
    <>
      <div className={styles.screen}>
        <section className={'mb-32 ' + styles2.section}>
          <h1 className='title'>Join the tribe</h1>
          <div className={'flex flex-wrap items-center mt-6 mb-8 ' + styles2.center}>
            <p className={styles2.center}>
              wear the stark signal
            </p>
            <br />
            <br />
            <p className='m-2' />
            <div className={'ml-4 ' + styles2.center}>
              <TextCopy text={mainDomain ? mainDomain : 'yourname.stark'} />
            </div>
          </div>
          <FamousMembers hoverMember={hoverMember} />
          <div className={styles2.thirdLeaf}>
            <img alt='leaf' src='/leaves/leaf_3.png' />
          </div>
        </section>

        <section id='join' className={'mb-32 ' + styles2.section}>
          <h1 className='title'>How early are you ?</h1>
          <div className={'mt-6 mb-8 ' + styles2.center + ' ' + styles2.famList}>
            <div className={styles2.famContainer}>
              <HexagonIcon width={350} />
              <h2>#1 GOLD FAM</h2>
              <p>Be one of the first 2000 members of the tribe</p>
            </div>
            <div className={styles2.famContainer}>
              <HexagonIcon width={350} />
              <h2>#2 SILVER FAM</h2>
              <p>Be on the first 5000 members of the tribe</p>
            </div>
            <div className={styles2.famContainer}>
              <HexagonIcon width={350} />
              <h2>#3 BRONZE FAM</h2>
              <p>Be a member of the tribe</p>
            </div>
          </div>
          <div className={styles2.center}>
            <Button onClick={() => setMenu(<Claim twitterToken={twitterToken} twitterRequest={twitterRequest} setMenu={setMenu} />)}>
              <p className={styles2.claimButtonText}>Claim</p>
            </Button>
          </div>
        </section>

        <section className={styles2.section}>
          <h1 className='title'>Me and the tribe</h1>
          <p className='mt-4'>
            Do we know each other ? Find out how many of us follow you.
          </p>
          <SearchMembers hoverMember={hoverMember} />
        </section>

        <div className={styles2.firstLeaf}>
          <img alt='leaf' src='/leaves/leaf_1.png' />
        </div>
        <div className={styles2.secondLeaf}>
          <img alt='leaf' src='/leaves/leaf_2.png' />
        </div>
      </div>
      {menu}
    </>
  );
};

export default JoinTheTribe;
