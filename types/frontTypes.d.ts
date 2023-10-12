type IconProps = {
  color: string;
  width: string;
  className?: string;
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

type SearchResult = {
  name: string;
  error: boolean;
  message: string;
  lastAccessed: number;
};

type UsState = {
  name: string;
  abbreviation: string;
};

type Discount = {
  duration: number;
  customMessage: string;
  discountId: string;
  price: string;
  desc: string;
  title: { desc: string; catch: string };
  image?: string;
};

type SignRequestData = {
  status: Status;
  name: string;
  user_id: string;
  sign0: string;
  sign1: string;
  timestamp: number;
};

type DiscordSignRequestData = {
  status: Status;
  username: string;
  user_id: number;
  sign0: string;
  sign1: string;
  timestamp: number;
  discriminator: string;
};
