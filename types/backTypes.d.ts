type QueryError = { error: string };

type Identity = {
  addr: string;
  domain: string;
  domain_expiry: number | null;
  is_owner_main: boolean;
  error?: string;
};

type ExternalDomains = {
  domains: string[];
};
