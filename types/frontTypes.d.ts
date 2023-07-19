type IconProps = {
  color: string;
  width: string;
  onClick?: () => void;
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
type DomainKind = "braavos" | "root" | "subdomain" | "none" | "xplorer";
type Context = { children: ReactNode };
type ScreenState = "mint" | "loading" | "success" | "error";

type PublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

type Member = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  description: string;
  public_metrics: PublicMetrics;
};
