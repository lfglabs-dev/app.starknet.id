type IconProps = {
  color: string;
  width: string;
};

type FullId = {
  id: string;
  domain: string;
  domain_expiry: number | null;
};

type ErrorRequestData = {
  status: Status;
  error: string;
};

type Status = "success" | "error";
type DomainKind = "braavos" | "root" | "subdomain" | "none";
type Context = { children: ReactNode };
type ScreenState = "mint" | "loading" | "success" | "error";
