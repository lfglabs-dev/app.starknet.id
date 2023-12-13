import { hexToDecimal, stringToFelt } from "./feltService";
import { formatHexString } from "./stringService";

const STARKNET = formatHexString(stringToFelt("starknet"));
const DISCORD = formatHexString(stringToFelt("discord"));
const TWITTER = formatHexString(stringToFelt("twitter"));
const GITHUB = formatHexString(stringToFelt("github"));
const PROOF_OF_PERSONHOOD = formatHexString(
  stringToFelt("proof_of_personhood")
);

export class Identity {
  private data: IdentityData;
  private userDataMap: Map<string, string>;
  private verifierDataMap: Map<string, string>;

  constructor(identityData: IdentityData) {
    this.data = identityData;

    this.userDataMap = new Map();
    identityData.user_data.forEach((ud) => {
      this.userDataMap.set(ud.field, ud.data);
    });

    this.verifierDataMap = new Map();
    identityData.verifier_data.forEach((vd) => {
      this.verifierDataMap.set(`${vd.verifier}_${vd.field}`, vd.data);
    });
  }

  getData(): IdentityData {
    return this.data;
  }

  getUserData(field: string): string | undefined {
    return this.userDataMap.get(field);
  }

  getVerifierData(verifier: string, field: string): string | undefined {
    return this.verifierDataMap.get(`${verifier}_${field}`);
  }

  getDomain(): string | undefined {
    return this.data.domain?.domain;
  }

  getDomainExpiry(): number | undefined {
    return this.data.domain?.expiry;
  }

  isMain(): boolean {
    return (
      this.data.main ||
      (this.data.domain?.rev_address
        ? this.data.domain?.rev_address === this.data.domain?.legacy_address
        : false)
    );
  }

  getId(): string {
    return this.data.id;
  }

  getOwnerAddress(): string {
    return this.data.owner;
  }

  getTargetAddress(): string {
    let legacyAddress = this.data.domain?.legacy_address;
    if (
      legacyAddress &&
      legacyAddress !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      return legacyAddress;
    }
    let starknetFromId = this.getUserData(STARKNET);
    if (starknetFromId) {
      return starknetFromId;
    }
    return this.data.owner;
  }

  getSocialData(field: string): string | undefined {
    const lastVerifier = this.getVerifierData(
      formatHexString(process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string),
      field
    );
    if (lastVerifier) {
      return lastVerifier;
    }
    return hexToDecimal(
      this.getVerifierData(
        formatHexString(
          process.env.NEXT_PUBLIC_DEPRECATED_VERIFIER_CONTRACT as string
        ),
        field
      )
    );
  }

  getOldSocialData(field: string): string | undefined {
    return hexToDecimal(
      this.getVerifierData(
        formatHexString(
          process.env.NEXT_PUBLIC_OLD_VERIFIER_CONTRACT as string
        ),
        field
      )
    );
  }

  getTwitterData(): string | undefined {
    return this.getSocialData(TWITTER);
  }

  getOldTwitterData(): string | undefined {
    return this.getOldSocialData(TWITTER);
  }

  getDiscordData(): string | undefined {
    return this.getSocialData(DISCORD);
  }

  getOldDiscordData(): string | undefined {
    return this.getOldSocialData(DISCORD);
  }

  getGithubData(): string | undefined {
    return this.getSocialData(GITHUB);
  }

  getOldGithubData(): string | undefined {
    return this.getOldSocialData(GITHUB);
  }

  getPop(): boolean {
    return (
      this.getVerifierData(
        formatHexString(
          process.env.NEXT_PUBLIC_VERIFIER_POP_CONTRACT as string
        ),
        PROOF_OF_PERSONHOOD
      ) === "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  }
}
