type QueryError = { error: string };

type Identity = {
  addr: string;
  domain: string;
  domain_expiry: number | null;
  is_owner_main: boolean;
  owner_addr: string;
  discord?: string;
  twitter?: string;
  github?: string;
  old_discord?: string;
  old_twitter?: string;
  old_github?: string;
  proof_of_personhood?: boolean;
  starknet_id?: string;
  error?: string;
  img_url?: string;
};

type ExternalDomains = {
  domains: string[];
};

type StarkscanNftProps = {
  animation_url: string | null;
  attributes: Attribute[];
  contract_address: string;
  description: string | null;
  external_url: string;
  image_url: string | null;
  image_medium_url: string | null;
  image_small_url: string | null;
  minted_at_transaction_hash: string | null;
  minted_by_address: string | null;
  token_id: string;
  name: string | null;
  nft_id: string | null;
  token_uri: string | null;
  minted_at_timestamp: number;
};

type Attribute = {
  trait_type: string;
  value: string | number;
};

type StarkscanApiResult = {
  data: StarkscanNftProps[];
  next_url?: string;
  remainder?: StarkscanNftProps[];
};
