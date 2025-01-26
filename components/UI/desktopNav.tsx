import React, { FunctionComponent, MouseEvent, useEffect } from "react";
import styles from "../../styles/components/desktopNav.module.css";
import Link from "next/link";
import { FaDiscord, FaGithub } from "react-icons/fa";
import theme from "../../styles/theme";

type DesktopNavProps = {
  close: () => void;
};

const DesktopNav: FunctionComponent<DesktopNavProps> = ({ close }) => {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  // Close when clicking outside the nav
  useEffect(() => {
    const handleClickOutside: EventListener = (e) => {
      const burger = document?.getElementById("burger");
      if (burger && !burger.contains(e.target as Node)) {
        close();
      }
    };
    // Bind the event listener
    document?.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document?.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav onClick={handleClick} className={styles.navContainer}>
      <div className={styles.columns}>
        <div className={styles.column} onClick={close}>
          <Link href="/pfpcollections">
            <li className={styles.burgerItem}>PFP collections</li>
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_STARKNET_ID as string}
            target="_blank"
          >
            <li className={styles.burgerItem}>Website</li>
          </Link>
          <Link href="/newsletter">
            <li className={styles.burgerItem}>Newsletter</li>
          </Link>
          <Link
            href={`${
              process.env.NEXT_PUBLIC_STARKNET_ID as string
            }/affiliates/individual-program`}
            target="_blank"
          >
            <li className={styles.burgerItem}>Affiliation</li>
          </Link>
        </div>
        <div className={styles.column}>
          <Link href="https://docs.starknet.id/" target="_blank">
            <li className={styles.burgerItem}>Documentation</li>
          </Link>
          <Link href="https://www.starknet.id/pdfs/Terms.pdf" target="_blank">
            <li className={styles.burgerItem}>Terms of use</li>
          </Link>
          <Link
            href="https://starknet.id/pdfs/PrivacyPolicy.pdf"
            target="_blank"
          >
            <li className={styles.burgerItem}>Privacy policy</li>
          </Link>
        </div>
      </div>
      <hr className={styles.hr} />
      <div className={styles.socials}>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://twitter.com/Starknet_id" target="_blank">
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.025 2H14.172L9.482 7.374L15 14.688H10.68L7.294 10.253L3.424 14.688H1.275L6.291 8.938L1 2.001H5.43L8.486 6.054L12.025 2ZM11.27 13.4H12.46L4.78 3.221H3.504L11.27 13.4Z"
                fill="black"
              />
            </svg>

            {/* <FaTwitter size={24} color={theme.palette.secondary.main} /> */}
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://discord.com/invite/8uS2Mgcsza" target="_blank">
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.8593 3.90765C11.9412 3.47806 10.9699 3.17282 9.97104 3C9.84663 3.22493 9.70127 3.52746 9.60102 3.76814C8.52412 3.60619 7.45711 3.60619 6.4 3.76814C6.29981 3.52752 6.15117 3.22493 6.02561 3C5.02581 3.1729 4.05367 3.47891 3.1351 3.90989C1.30723 6.6721 0.811707 9.36562 1.05944 12.021C2.27181 12.9264 3.44671 13.4764 4.60182 13.8363C4.88892 13.4415 5.14268 13.0235 5.3605 12.5867C4.94577 12.4288 4.54595 12.2342 4.1658 12.0053C4.26583 11.9311 4.36351 11.8538 4.45871 11.7736C6.76225 12.851 9.26519 12.851 11.5413 11.7736C11.6369 11.8533 11.7345 11.9306 11.8341 12.0053C11.4534 12.2349 11.0528 12.4298 10.6372 12.5879C10.8563 13.0265 11.1096 13.4448 11.3959 13.8374C12.5521 13.4775 13.7281 12.9275 14.9405 12.021C15.2312 8.94278 14.4439 6.27398 12.8593 3.90765ZM5.67435 10.388C4.98283 10.388 4.41572 9.74242 4.41572 8.95629C4.41572 8.17015 4.97074 7.52347 5.67435 7.52347C6.37796 7.52347 6.94507 8.16901 6.93299 8.95629C6.93408 9.74242 6.37802 10.388 5.67435 10.388ZM10.3256 10.388C9.63406 10.388 9.067 9.74242 9.067 8.95629C9.067 8.17015 9.62197 7.52347 10.3256 7.52347C11.0292 7.52347 11.5963 8.16901 11.5842 8.95629C11.5842 9.74242 11.0292 10.388 10.3256 10.388Z"
                fill="#5865F2"
              />
            </svg>

            {/* <FaDiscord size={24} color={theme.palette.secondary.main} /> */}
          </Link>
        </div>
        <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
          <Link href="https://github.com/starknet-id" target="_blank">
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1993_14729)">
                <path
                  d="M9.65267 3.73943C8.56611 3.48695 7.43613 3.48695 6.34956 3.73943C5.72201 3.35454 5.2429 3.17766 4.89445 3.10299C4.74573 3.06942 4.59356 3.05361 4.44112 3.05588C4.37175 3.05776 4.30272 3.06609 4.2349 3.08077L4.22601 3.08254L4.22245 3.08432H4.21979L4.34156 3.51188L4.21979 3.08521C4.15734 3.10286 4.09951 3.13397 4.05037 3.17635C4.00123 3.21873 3.96197 3.27136 3.93534 3.33054C3.6731 3.91784 3.62313 4.57803 3.79401 5.1981C3.35146 5.73442 3.1103 6.40855 3.11223 7.10388C3.11223 8.48432 3.51934 9.41232 4.21356 10.0088C4.69979 10.4265 5.29001 10.6488 5.88201 10.7759C5.78885 11.0495 5.75373 11.3395 5.7789 11.6274V12.159C5.41712 12.2345 5.16645 12.2105 4.98779 12.1519C4.76467 12.0781 4.59312 11.9297 4.42867 11.7163C4.34271 11.6013 4.26261 11.4821 4.18867 11.359L4.13801 11.2763C4.07403 11.1699 4.00764 11.065 3.9389 10.9617C3.77001 10.7119 3.51934 10.399 3.11401 10.2923L2.68379 10.1794L2.45801 11.0399L2.88823 11.1528C2.95934 11.1705 3.05179 11.2372 3.20379 11.4603C3.26229 11.5484 3.3186 11.6379 3.37267 11.7288L3.43312 11.8265C3.51667 11.9617 3.61267 12.111 3.72379 12.2568C3.94867 12.5501 4.25534 12.8461 4.71045 12.9963C5.02156 13.0994 5.37534 13.1243 5.7789 13.0621V14.7217C5.7789 14.8395 5.82572 14.9526 5.90907 15.0359C5.99242 15.1193 6.10547 15.1661 6.22334 15.1661H9.7789C9.89677 15.1661 10.0098 15.1193 10.0932 15.0359C10.1765 14.9526 10.2233 14.8395 10.2233 14.7217V11.5545C10.2233 11.2745 10.2109 11.0177 10.1318 10.7785C10.7211 10.6541 11.3069 10.4319 11.7905 10.0141C12.4838 9.41321 12.89 8.47632 12.89 7.08788V7.08699C12.8878 6.39735 12.6465 5.72982 12.2073 5.1981C12.378 4.5783 12.328 3.91847 12.066 3.33143C12.0396 3.27218 12.0005 3.21944 11.9515 3.1769C11.9025 3.13437 11.8448 3.10307 11.7825 3.08521L11.6607 3.51188C11.7825 3.08521 11.7816 3.08521 11.7807 3.08521L11.7789 3.08432L11.7753 3.08254L11.7673 3.08077C11.7454 3.07506 11.7231 3.07061 11.7007 3.06743C11.6541 3.06064 11.6072 3.05678 11.5602 3.05588C11.4078 3.05363 11.2556 3.06944 11.1069 3.10299C10.7593 3.17766 10.2802 3.35454 9.65267 3.73943Z"
                  fill="#402D28"
                />
              </g>
              <defs>
                <clipPath id="clip0_1993_14729">
                  <rect
                    width="13.3333"
                    height="13.3333"
                    fill="white"
                    transform="translate(1.33301 1.8335)"
                  />
                </clipPath>
              </defs>
            </svg>

            {/* <FaGithub size={24} color={theme.palette.secondary.main} /> */}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
