type QueryError = { error: string };

interface IdentityData {
  id: string;
  owner: string;
  main: boolean;
  creation_date: number;
  domain?: Domain;
  user_data: UserData[];
  verifier_data: VerifierData[];
  extended_verifier_data: ExtendedVerifierData[];
}

interface Domain {
  domain: string;
  migrated: boolean;
  root: boolean;
  creation_date: number;
  expiry?: number;
  resolver?: string;
  legacy_address?: string;
  rev_address?: string;
}

interface UserData {
  field: string;
  data: string;
}

interface VerifierData {
  verifier: string;
  field: string;
  data: string;
}

interface ExtendedVerifierData {
  verifier: string;
  field: string;
  extended_data: string[];
}

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

type QuoteQueryData = {
  quote: string;
  r: string;
  s: string;
  max_quote_validity: number;
};
