import React, { FunctionComponent, useEffect, useState } from 'react';
import styles from '../../styles/components/tribe/claim.module.css'
import Loading from '../UI/loading';
import SideMenu from '../UI/menus/sideMenu';
import { hexToFelt, stringToHex } from '../../utils/felt';
import {
  useAccount, useStarknetCall, useStarknetExecute
} from '@starknet-react/core';
import Button from '../UI/button';
import { useStarknetIdContract } from '../../hooks/contracts';
import SuccessScreen from '../UI/screens/successScreen';
import { getDomainWithoutStark } from '../../utils/stringService';
import domainStringToFelt from '../../utils/domain_string_to_felt';

interface Dictionary<T> {
  [Key: string]: T;
}

interface Signature {
  low: string;
  high: string;
}

type ClaimProps = {
  setMenu: (menu: React.ReactElement<any, any> | null) => void;
  twitterToken: string;
  twitterRequest: (state: string, url: string, init?: Dictionary<any>) => Promise<any>;
};

const Claim: FunctionComponent<ClaimProps> = ({ twitterRequest, twitterToken, setMenu }) => {
  const [mainDomain, setMainDomain] = useState<string | undefined>('');
  const [mainDomainId, setMainDomainId] = useState<string>('');
  const [twitterUserId, setTwitterUserId] = useState<string | undefined>(undefined);
  const [twitterUsername, setTwitterUsername] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [signature, setSignature] = useState<Signature>({ low: '0', high: '0' });
  const { address } = useAccount();
  const { execute } = useStarknetExecute({ 
    calls: {
        contractAddress: process.env.NEXT_PUBLIC_TRIBE_CONTRACT as string,
        entrypoint: 'mint',
        calldata: [signature.low, signature.high, domainStringToFelt(getDomainWithoutStark(mainDomain || ''))]
    }
  });

  const { contract } = useStarknetIdContract();
  const { data: twitterData } = useStarknetCall({
    contract: contract,
    method: 'get_verifier_data',
    args: [
      mainDomainId,
      stringToHex('twitter'),
      process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
    ],
  });

  useEffect(() => {
    if (signature.low !== '0' && address) execute().then(transaction => {
      console.log(transaction)
      setMenu(<div className='fixed z-10 bg-[color:var(--beige)] inset-0 flex items-center justify-center'>
          <SuccessScreen buttonText='Close' onClick={() => setMenu(null)} successMessage="You've joined the tribe!" />
      </div>);
    })
  }, [signature, address, execute])

  const steps = [
    {
      name: 'Wallet',
      error: 'You haven\'t connected any wallet.',
      help: 'To show the wallet menu, you can reload the page.',
      helpLinks: [
        {
          text: 'Reload',
          link: '/jointhetribe'
        }
      ]
    },
    {
      name: 'Main domain',
      error: 'You haven\'t set a main domain yet.',
      help: 'You can set a domain as main by clicking the star icon on one of your domains.',
      helpLinks: [
        {
          text: 'Set main domain',
          link: 'https://goerli.app.starknet.id/'
        }
      ]
    },
    {
      name: 'Twitter account',
      error: 'You haven\'t linked a twitter account yet.',
      help: 'You can link a twitter account to your domain by clicking the twitter icon on your main domain.',
      helpLinks: [
        {
          text: 'Link twitter account',
          link: 'https://goerli.app.starknet.id/identities/' + mainDomainId
        }
      ]
    },
    {
      name: 'Twitter username',
      error: 'Your account name should contain your main domain.',
      help: `To wear the stark signal, you simply need to add your main domain in your account name${twitterUsername ? !twitterUsername.includes(mainDomain || '') ? `.You could rename it to '${twitterUsername} - ${mainDomain}' for example.` : ` : ${twitterUsername}` : '.'}`,
      helpLinks: [
        {
          text: 'Change twitter account name',
          link: 'https://twitter.com/settings/profile'
        }
      ]
    },
  ]

  useEffect(() => {
    if (address) fetch(`/api/indexer/addr_to_domain?addr=${hexToFelt(address)}`)
    .then((response) => response.json())
    .then((data) => {
      const domain = data.domain;
      setMainDomain(domain);
      if (domain) fetch(`/api/indexer/addr_to_full_ids?addr=${hexToFelt(address)}`)
      .then((response) => response.json())
      .then((data) => {
        const ids = data.full_ids
        const domainId = ids.find((id: Dictionary<any>) => id.domain === domain).id;
        setMainDomainId(domainId);
      });
    });
  }, [address]);

  useEffect(() => {
    if (!address) return setStep(1);
    setStep(2);
    if (mainDomain === '') return setStep(3);
    if (mainDomain === undefined) return setStep(4);
    setStep(5);
    if (!twitterData) return;
    setTwitterUserId(twitterData[0].toString());
    if (twitterUserId === undefined) return setStep(6);
    if (twitterUserId === '0') return setStep(7);
    setStep(8);
    if (twitterUsername === '') return setStep(9);
    if (!twitterUsername.includes(mainDomain)) return setStep(10);
    setStep(11);
    setCanJoin(true)
  }, [address, mainDomain, twitterUserId, twitterData, twitterUsername]);

  useEffect(() => {
    if (twitterUserId && twitterUserId !== '0') fetch(`/api/twitter/get_username?id=${twitterUserId}`)
    .then((response) => response.json())
    .then((data) => {
      setTwitterUsername(data[0].name);
    });
  }, [twitterUserId]);

  function getState(index: number) {
    return ~~(step/3) > index ? 'success' : ~~(step/3) < index ? 'loading' : step % 3 === 0 ? 'loading' : step % 3 === 1 ? 'error' : 'success'
  }

  function handleJoin() {
    twitterRequest('join', `/api/tribe/join?owner=${hexToFelt(address)}&domainTokenId=${mainDomainId}&accessToken=${twitterToken}`)
    .then((data) => {
      const sig = data.signature;
      if (sig) setSignature({ low: sig[0], high: sig[1] });
    })
  }

  return <SideMenu child={
      <div className={styles.container}>
        <div className={styles.stepsContainer}>
          {
            steps.map((stepDatas, index) => <div key={'step_' + index}>
              <div className='flex items-center'>
                <Loading state={getState(index)} />
                <p className={'ml-3 ' + styles.text}>{stepDatas.name}</p>
              </div>
              {getState(index) === 'error' ? <div className={styles.stepError}>
                <p>
                  {stepDatas.error}
                  <br></br>
                  {stepDatas.help}
                </p>
                {stepDatas.helpLinks?.map((link, index) => <a key={'link_' + index} href={link.link} target={'_blank'} rel='noreferrer'>
                  {link.text}
                </a>)}
              </div>
              :
              <p className={styles.stepHelp}>{stepDatas.help}</p>
              }
            </div>
            )
          }
        </div>
        <div className={styles.joinContainer}>
          <div className={styles.firstLeaf}>
            <img alt='leaf' src='/leaves/leaf_2.png' />
          </div>
          <div className={styles.secondLeaf}>
            <img alt='leaf' src='/leaves/leaf_3.png' />
          </div>
          <div className={styles.thirdLeaf}>
            <img alt='leaf' src='/leaves/leaf_1.png' />
          </div>
          {
            canJoin ? 
            <Button onClick={handleJoin}>
              Join the tribe
            </Button>
            :
            <h1 className={styles.joinTitle}>
              You have to complete all the steps to join the tribe.
            </h1>
          }
        </div>
      </div>
  } onClose={() => setMenu(null)} title='Join the tribe' />
};

export default Claim;
