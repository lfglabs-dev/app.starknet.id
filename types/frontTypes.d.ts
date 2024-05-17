type IconProps = {
  color: string;
  width: string;
  secondColor?: string;
  className?: string;
};

type FullId = {
  id: string;
  domain: string;
  domain_expiry: number | null;
  pp_url: string | null;
};

type ErrorRequestData = {
  status: Status;
  error: string;
};

type Status = "success" | "error";
type DomainKind = "braavos" | "root" | "subdomain" | "none" | "xplorer" | "sol";
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

// Here we can add more types of notifications
type NotificationData = TransactionData;

type SIDNotification<T> = {
  address?: string; // decimal address
  timestamp: number;
  subtext: string;
  type: NotificationType;
  data: T;
};

type TransactionData = {
  type: TransactionType;
  hash: string;
  status: "pending" | "success" | "error";
  txStatus?:
    | "NOT_RECEIVED"
    | "RECEIVED"
    | "ACCEPTED_ON_L2"
    | "ACCEPTED_ON_L1"
    | "REJECTED"
    | "REVERTED";
};

type StarknetSig = {
  r: string;
  s: string;
  max_validity: number;
};

type SnsDomainData = {
  name: string;
  signature: StarknetSig | undefined;
  sent: boolean;
};

type TokenBalance = {
  [key in CurrencyType]: string;
};

type MulticallCallData = {
  execution: CairoCustomEnum;
  to: CairoCustomEnum;
  selector: CairoCustomEnum;
  calldata: CairoCustomEnum[];
};

type Upsell = {
  duration: number; // duration you get
  paidDuration: number; // duration you pay for
  maxDuration: number; // if user selects a duration higer, upsell won't be applied
  discountId: string;
  imageUrl: string;
  title: {
    desc: string;
    catch: string;
  };
  desc: string;
};

type FreeRenewal = {
  duration: number; // duration you get
  paidDuration: number; // duration you pay for
  maxDuration: number; // if user selects a duration higer, upsell won't be applied
  discountId: string;
  imageUrl: string;
  title: {
    desc: string;
    catch: string;
  };
  desc: string;
};

type HexString = `0x${string}`;

type EvmFields =
  | "evm-address"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "optimism"
  | "polygon";
