/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import Footer from "../components/footer";
import Roadmap from "../components/roadmap";
import styles from "../styles/home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.section1}>
        <div className="flex flex-col items-center justify-center text min-h-screen mx-10">
          <h1 className={styles.title}>Starknet.id</h1>
          <h3 className={styles.subtitle}>
            &rdquo;All in one identity service on starknet&rdquo;
          </h3>
        </div>
      </div>
      <div id="info" className={styles.section2}>
        <div className={styles.subsection}>
          <div className={styles.card}>
            <div className="flex justify-center">
              <img
                alt="identicon"
                height={250}
                width={250}
                src="/identicons/identicon_3.svg"
              />
            </div>
            <h2 className={styles.secondTitle}>
              #1 Claim your on-chain identity
            </h2>
            <div className="text-md max-w-3xl mt-4 sm:mt-10">
              <p className="text-xl">
                Mint your starknet identity for free and confirm it by linking
                your twitter, discord or github.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className="flex justify-center">
              <img
                alt="identicon"
                height={250}
                width={250}
                src="/identicons/identicon_4.svg"
              />
            </div>
            <h2 className={styles.secondTitle}>
              #2 Claim your .stark username
            </h2>
            <div className="text-md max-w-3xl mt-4 sm:mt-10">
              <p className="text-xl">
                You’re not 0x072d4…b2Be7, transact directly from domain to
                domain instead of a cryptic key by claiming your unique .stark
                domain that can be used, transferred or sold on our marketplace.
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <div className="flex justify-center">
              <img
                alt="identicon"
                height={250}
                width={250}
                src="/identicons/identicon_5.svg"
              />
            </div>
            <h2 className={styles.secondTitle}>#3 Get a free .eth domain</h2>
            <div className="text-md max-w-3xl mt-4 sm:mt-10">
              <p className="text-xl">
                We&rsquo;ll implement a bridging system to permit to each .stark
                domain owners to get a free .starknet.eth domain on ethereum.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.subsection}>
          <div className={styles.card2}>
            <div className="flex justify-center w-full my-5">
              <img
                className="md:w-1/2"
                alt="identicon"
                src="/visuals/Partners.png"
              />
            </div>
            <h2 className={styles.secondTitle}>
              #4 Contribute and get rewarded
            </h2>
            <p className="text-justify text-xl mt mt-4 sm:mt-10">
              By connecting your starknet.id to one of our partners protocols,
              you&rsquo;ll be able to be rewarded for your off-chain
              contributions (retweet something, invite people on discord ...)
              but also for your on-chain actions (testing an alpha game, minting
              an NFT ...). In that sense, starknet.id is the unique tool that
              enabled all starknet protocols to reward their true community by
              making the difference between engaged users and airdrop farmers or
              bots. Therefore If you want to contribute in the starknet
              ecosystem and be rewarded to do so, you should mint a starknet
              identity.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.section3}>
        <div className={styles.thirdLeaf}>
          <img width={"100%"} alt="leaf" src="/leaves/leaf_2.png" />
        </div>
        <div className={styles.fourthLeaf}>
          <img width={"100%"} alt="leaf" src="/leaves/leaf_1.png" />
        </div>
        <Roadmap />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
