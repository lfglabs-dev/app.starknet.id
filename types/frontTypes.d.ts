type Calls = {
  contractAddress: string;
  entrypoint: string;
  calldata: (string | number | BN | any[] | undefined)[];
};

type IconProps = {
  color: string;
  width: string;
};

type FullId = {
  id: string;
  domain: string;
};

type ErrorRequestData = {
  status: Status;
  error: string;
};

type Status = "success" | "error";
type DomainKind = "braavos" | "root" | "subdomain" | "none";
