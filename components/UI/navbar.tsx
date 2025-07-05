"use client"

import Link from "next/link"
import { useState, useEffect, type FunctionComponent, useContext } from "react"
import { AiOutlineMenu } from "react-icons/ai"
import TwitterIcon from "./iconsComponents/icons/twitterIcon"
import DiscordIcon from "./iconsComponents/icons/discordIcon"
import GitHubIcon2 from "./iconsComponents/icons/githubIcon2"
import styles from "../../styles/components/navbar.module.css"
import connectStyles from "../../styles/components/walletConnect.module.css"
import Button from "./button"
import { useConnect, useAccount, useDisconnect, useSwitchChain } from "@starknet-react/core"
import ModalMessage from "./modalMessage"
import { useDisplayName } from "../../hooks/displayName.tsx"
import { useMediaQuery } from "@mui/material"
import { CircularProgress } from "@mui/material"
import ModalWallet from "./modalWallet"
import { useTheme } from "@mui/material/styles"
import ProfilFilledIcon from "./iconsComponents/icons/profilFilledIcon"
import DesktopNav from "./desktopNav"
import CloseFilledIcon from "./iconsComponents/icons/closeFilledIcon"
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider"
import { StarknetChainId, type StarkProfile } from "starknetid.js"
import type { Connector } from "starknetkit"
import { getConnectorIcon, getLastConnected, getLastConnector, supportSwitchNetwork } from "@/utils/connectorWrapper"
import WalletConnect from "./walletConnect"
import ArrowDownIcon from "./iconsComponents/icons/arrowDownIcon"
import errorLottie from "../../public/visuals/errorLottie.json"
import { useRouter } from "next/router"
import useIsWrongNetwork from "@/hooks/isWrongNetwork"

const Navbar: FunctionComponent = () => {
  const theme = useTheme()
  const [nav, setNav] = useState<boolean>(false)
  const [desktopNav, setDesktopNav] = useState<boolean>(false)
  const { address } = useAccount()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const { connectAsync, connectors, connector } = useConnect()
  const { disconnect } = useDisconnect()
  const isMobile = useMediaQuery("(max-width:425px)")
  const domainOrAddress = useDisplayName(address ?? "", isMobile)
  const network = process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet"
  const [txLoading, setTxLoading] = useState<number>(0)
  const [showWallet, setShowWallet] = useState<boolean>(false)
  const [profile, setProfile] = useState<StarkProfile | undefined>(undefined)
  const { starknetIdNavigator } = useContext(StarknetIdJsContext)
  const { isWrongNetwork, setIsWrongNetwork } = useIsWrongNetwork()
  const [showWalletConnectModal, setShowWalletConnectModal] = useState<boolean>(false)
  const router = useRouter()
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId: network === "testnet" ? StarknetChainId.SN_SEPOLIA : StarknetChainId.SN_MAIN,
    },
  })

  useEffect(() => {
    const pageName = router.pathname.split("/")[1]
    if (pageName !== "gift" && pageName !== "register") return
    if (isMobile) setShowWalletConnectModal(true)
  }, [isMobile, router.pathname])

  const [lastConnector, setLastConnector] = useState<Connector | null>(null)

  // could be replaced by a useProfileData from starknet-react when updated
  useEffect(() => {
    if (starknetIdNavigator !== null && address !== undefined) {
      starknetIdNavigator.getProfileData(address).then(setProfile)
    }
  }, [address, starknetIdNavigator])

  const connectWallet = async (connector: Connector) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await connectAsync({ connector })
      localStorage.setItem("SID-connectedWallet", connector.id)
      localStorage.setItem("SID-lastUsedConnector", connector.id)
    } catch (e) {
      // Restart the connection if there is an error except if the user has rejected the connection
      console.error(e)
      const error = e as Error
      if (error.name !== "UserRejectedRequestError") setTimeout(() => connectWallet(connector), 200)
    }
  }

  // Autoconnect
  useEffect(() => {
    const connectToStarknet = async () => {
      if (isConnected || isMobile) return
      const connector = getLastConnected()
      if (connector && connector.available()) await connectWallet(connector)
    }
    connectToStarknet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectors]) // Disable to make sure it only runs once

  useEffect(() => {
    address ? setIsConnected(true) : setIsConnected(false)
  }, [address])

  useEffect(() => {
    setLastConnector(getLastConnector())
  }, [isConnected])

  function disconnectByClick(): void {
    disconnect()
    setIsConnected(false)
    setShowWallet(false)
    localStorage.removeItem("SID-connectedWallet")
  }

  function handleNav(): void {
    setNav(!nav)
  }

  function handleDesktopNav(): void {
    setDesktopNav(!desktopNav)
  }

  function onTopButtonClick(): void {
    if (!isConnected) {
      setShowWalletConnectModal(true)
    } else {
      setShowWallet(true)
    }
  }

  function topButtonText(): string | undefined {
    const textToReturn = isConnected ? domainOrAddress : "connect wallet"
    return textToReturn
  }

  const switchNetwork = async () => {
    if (supportSwitchNetwork(connector)) {
      const res = await switchChainAsync()
      if (res) setIsWrongNetwork(false)
    } else {
      disconnectByClick()
    }
  }

  // Fixed function to handle mobile navigation clicks
  const handleMobileNavClick = (href: string) => {
    // Close the mobile menu first
    setNav(false)
    // Small delay to ensure menu closes before navigation
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  return (
    <>
      <div className={"fixed w-full z-20 bg-background-nav top-0"}>
        <div className={styles.navbarContainer}>
          <div className="ml-4 ">
            <Link href="/" className="cursor-pointer flex gap-2 items-center">
              <img
                className={styles.starknetIdLogo}
                src="/visuals/MbLogo.svg"
                alt="Starknet.id Logo"
                width={isMobile ? 40 : 40}
                height={isMobile ? 40 : 90}
              />
              <p
                className={`${styles.starknetId} text-[#454545] text-lg  tracking-wide whitespace-nowrap text-nowrap leading-10 font-quickZap ${
                  isMobile ? "hidden" : "block"
                }`}
              >
                StarkNet ID
              </p>
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex gap-1 items-center">
              <Link href="/identities">
                <li className={styles.menuItem}>My Identities</li>
              </Link>
              <Link href="/">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              {/* <Link href="/jointhetribe">
                <li className={styles.menuItem}>Join the tribe</li>
              </Link> */}
              <div onClick={handleDesktopNav} className={styles.menuBurger} aria-expanded={nav} id="burger">
                <AiOutlineMenu color={theme.palette.secondary.main} size={25} />
                {desktopNav ? <DesktopNav close={handleDesktopNav} /> : null}
              </div>
              <div className="text-beige mx-5">
                <Button
                  onClick={
                    isConnected
                      ? () => setShowWallet(true)
                      : lastConnector
                        ? () => connectWallet(lastConnector)
                        : () => setShowWalletConnectModal(true)
                  }
                  variation={isConnected ? "white" : "primary"}
                  radius="8px"
                >
                  {isConnected ? (
                    <>
                      {txLoading > 0 ? (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{txLoading} on hold</p>
                          <CircularProgress
                            sx={{
                              color: theme.palette.secondary.main,
                            }}
                            size={25}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{domainOrAddress}</p>
                          {profile?.profilePicture ? (
                            <img
                              src={profile?.profilePicture || "/placeholder.svg"}
                              width="32"
                              height="32"
                              className="rounded-full"
                            />
                          ) : (
                            <ProfilFilledIcon width="24" color={theme.palette.secondary.main} />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={connectStyles.connectBtn}>
                      {lastConnector ? (
                        <img
                          src={getConnectorIcon(lastConnector.id) || "/placeholder.svg"}
                          className={connectStyles.btnIcon}
                        />
                      ) : null}
                      <p>connect</p>
                      {lastConnector ? (
                        <div
                          className={connectStyles.arrowDown}
                          onClick={(e) => {
                            setShowWalletConnectModal(true)
                            e.stopPropagation()
                          }}
                        >
                          <ArrowDownIcon width="18" color="#FFF" className={connectStyles.arrowDownIcon} />
                        </div>
                      ) : null}
                    </div>
                  )}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="lg:hidden">
              <AiOutlineMenu color={theme.palette.secondary.main} size={25} className="mr-3" />
            </div>
          </div>
        </div>
        <div className={nav ? "lg:hidden fixed left-0 top-0 w-full h-screen bg-black/10 z-10" : ""}>
          <div
            className={`fixed left-0 top-0 w-full sm:w-[60%] lg:w-[45%] h-screen bg-[#FCFFFE] px-5 ease-in flex justify-between flex-col overflow-auto ${
              nav ? styles.mobileNavbarShown : styles.mobileNavbarHidden
            }`}
          >
            <div className="h-full flex flex-col">
              <div className={styles.mobileNavBarHeader}>
                <div className="flex gap-2 items-center">
                  <Link href="/" className="cursor-pointer">
                    <img
                      className={styles.starknetIdLogo}
                      src="/visuals/MbLogo.svg"
                      alt="Starknet.id Logo"
                      width={35}
                      height={30}
                    />
                  </Link>
                  <p
                    className={`${styles.starknetId} text-[#454545] text-lg  tracking-wide whitespace-nowrap text-nowrap leading-10 font-quickZap ${
                      isMobile ? "hidden" : "block"
                    }`}
                  >
                    StarkNet ID
                  </p>
                </div>
                <div onClick={handleNav} className="cursor-pointer p-1 rounded-full">
                  <CloseFilledIcon width="32" color={theme.palette.background.default} />
                </div>
              </div>
              <div className="py-4 my-auto text-center font-extrabold">
                <div>
                  <ul className="uppercase">
                    {/* Fixed mobile navigation links */}
                    <li className={styles.menuItemSmall} onClick={() => handleMobileNavClick("/identities")}>
                      My Identities
                    </li>
                    <li className={styles.menuItemSmall} onClick={() => handleMobileNavClick("/")}>
                      Domains
                    </li>
                    <li className={styles.menuItemSmall} onClick={() => handleMobileNavClick("/pfpcollections")}>
                      PFP collections
                    </li>
                    <li className={styles.menuItemSmall} onClick={() => handleMobileNavClick("/newsletter")}>
                      Newsletter
                    </li>
                    <li
                      className={styles.menuItemSmall}
                      onClick={() => {
                        setNav(false)
                        window.open(process.env.NEXT_PUBLIC_STARKNET_ID as string, "_blank")
                      }}
                    >
                      Website
                    </li>
                    <li
                      className={styles.menuItemSmall}
                      onClick={() => {
                        setNav(false)
                        window.open("https://docs.starknet.id/", "_blank")
                      }}
                    >
                      Documentation
                    </li>
                    <li
                      className={styles.menuItemSmall}
                      onClick={() => {
                        setNav(false)
                        window.open(
                          `${process.env.NEXT_PUBLIC_STARKNET_ID as string}/affiliates/individual-program`,
                          "_blank",
                        )
                      }}
                    >
                      Affiliation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center my-4 w-full">
              <div className="text-background">
                <Button className="!text-lg" onClick={onTopButtonClick}>
                  {topButtonText()}
                </Button>
              </div>
              <div className="flex">
                <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
                  <Link href="https://twitter.com/Starknet_id" target="_blank">
                    <TwitterIcon width="28" color="black" />{" "}
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-4 cursor-pointer">
                  <Link href="https://discord.com/invite/8uS2Mgcsza" target="_blank">
                    <DiscordIcon width="28" color="#5865F2" />
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-4">
                  <Link href="https://github.com/lfglabs-dev" target="_blank">
                    <GitHubIcon2 width="28" color="black" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalMessage
        open={isWrongNetwork}
        title={"Wrong network"}
        closeModal={() => setIsWrongNetwork(false)}
        message={
          <div className="mt-3 flex flex-col items-center justify-center text-center mx-3">
            <p>This app only supports Starknet {network}, you have to change your network to be able use it.</p>
            <div className="mt-5">
              <Button onClick={() => switchNetwork()}>
                {supportSwitchNetwork(connector) ? `Switch to ${network}` : "Disconnect"}
              </Button>
            </div>
          </div>
        }
        lottie={errorLottie}
      />
      <ModalWallet
        domain={domainOrAddress}
        open={showWallet}
        closeModal={() => setShowWallet(false)}
        disconnectByClick={disconnectByClick}
        setTxLoading={setTxLoading}
      />
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors as Connector[]}
        connectWallet={connectWallet}
      />
    </>
  )
}

export default Navbar
