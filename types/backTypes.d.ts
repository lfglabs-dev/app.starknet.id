export type QueryError = { error: string };

export type Identity = {
  addr: string;
  domain: string;
  domain_expiry: string;
  is_owner_main: Boolean;
  error?: string;
};
