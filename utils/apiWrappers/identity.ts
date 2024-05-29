import { shortString } from "starknet";
import { fromUint256, hexToDecimal } from "../feltService";
import { formatHexString, getImgUrl } from "../stringService";
import {
  DISCORD,
  GITHUB,
  PROOF_OF_PERSONHOOD,
  STARKNET,
  TWITTER,
  NFT_PP_CONTRACT,
  NFT_PP_ID,
  EVM_ADDRESS,
} from "../verifierFields";

export class Identity {
  private _data: IdentityData;
  private userDataMap: Map<string, string>;
  private verifierDataMap: Map<string, string>;
  private extendedVerifierDataMap: Map<string, string[]>;

  constructor(identityData: IdentityData) {
    this._data = identityData;

    this.userDataMap = new Map();
    identityData.user_data.forEach((ud) => {
      this.userDataMap.set(ud.field, ud.data);
    });

    this.verifierDataMap = new Map();
    identityData.verifier_data.forEach((vd) => {
      this.verifierDataMap.set(`${vd.verifier}_${vd.field}`, vd.data);
    });

    this.extendedVerifierDataMap = new Map();
    identityData.extended_verifier_data.forEach((vd) => {
      this.extendedVerifierDataMap.set(
        `${vd.verifier}_${vd.field}`,
        vd.extended_data
      );
    });
  }
  get data(): IdentityData {
    return this._data;
  }

  getUserData(field: string): string | undefined {
    return this.userDataMap.get(field);
  }

  getVerifierData(verifier: string, field: string): string | undefined {
    return this.verifierDataMap.get(`${verifier}_${field}`);
  }

  getExtendedVerifierData(
    verifier: string,
    field: string
  ): string[] | undefined {
    return this.extendedVerifierDataMap.get(`${verifier}_${field}`);
  }

  get domain(): string | undefined {
    return this._data.domain?.domain;
  }

  get domainExpiry(): number | undefined {
    return this._data.domain?.expiry;
  }

  get isMain(): boolean {
    return (
      this._data.main ||
      (this._data.domain?.rev_address
        ? this._data.domain?.rev_address === this._data.domain?.legacy_address
        : false)
    );
  }

  get id(): string {
    return this._data.id;
  }

  get ownerAddress(): string {
    return this._data.owner;
  }

  get targetAddress(): string {
    let legacyAddress = this._data.domain?.legacy_address;
    if (
      legacyAddress &&
      legacyAddress !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      return legacyAddress;
    }
    let starknetFromId = this.getUserData(STARKNET);
    if (
      starknetFromId &&
      starknetFromId !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      return starknetFromId;
    }
    return this._data.owner;
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

  get twitterData(): string | undefined {
    return this.getSocialData(TWITTER);
  }

  get oldTwitterData(): string | undefined {
    return this.getOldSocialData(TWITTER);
  }

  get discordData(): string | undefined {
    return this.getSocialData(DISCORD);
  }

  get oldDiscordData(): string | undefined {
    return this.getOldSocialData(DISCORD);
  }

  get githubData(): string | undefined {
    return this.getSocialData(GITHUB);
  }

  get oldGithubData(): string | undefined {
    return this.getOldSocialData(GITHUB);
  }

  get pop(): boolean {
    return (
      this.getVerifierData(
        formatHexString(
          process.env.NEXT_PUBLIC_VERIFIER_POP_CONTRACT as string
        ),
        PROOF_OF_PERSONHOOD
      ) === "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  }

  async getPfpFromVerifierData(): Promise<string> {
    const identiconsUrl = `${
      process.env.NEXT_PUBLIC_STARKNET_ID
    }/api/identicons/${Number(this.id)}`;
    // Get NFT contract address from verifier_data
    const contractAddress = this.getVerifierData(
      formatHexString(process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string),
      NFT_PP_CONTRACT
    );
    // Get NFT token id from extended_verifier_data and convert it to a BigInt array
    const id = this.getExtendedVerifierData(
      formatHexString(process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string),
      NFT_PP_ID
    )?.map((hex) => BigInt(hex));

    if (!id || !contractAddress || Number(contractAddress) === 0)
      return identiconsUrl;

    // Convert token id from uint256 to a string
    const nftId = fromUint256(id[0], id[1]);

    try {
      const response = await fetch(
        `https://${
          process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "api-sepolia" : "api"
        }.starkscan.co/api/v0/nft/${contractAddress}/${nftId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.NEXT_PUBLIC_STARKSCAN}`,
          },
        }
      );
      const data = await response.json();
      if (!data || !data.image_url) return identiconsUrl;
      return getImgUrl(data.image_url);
    } catch (error) {
      return identiconsUrl;
    }
  }

  get evmAddress(): string | undefined {
    const data = this.getUserData(EVM_ADDRESS);
    if (!data) return;
    try {
      return "0x" + data.slice(2).replace(/^0+/, "");
    } catch (error) {
      console.error("Invalid EVM address format:", error);
      return undefined;
    }
  }
}
