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
};

type ExternalDomains = {
  domains: string[];
};
