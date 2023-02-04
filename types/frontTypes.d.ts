type Calls = {
  contractAddress: string;
  entrypoint: string;
  calldata: (string | number | BN | any[] | undefined)[];
};

type IconProps = {
  color: string;
  width: string;
  style?:object;
};

type FullId = {
  id: string;
  domain: string;
};

type Status = "success" | "error";

type ErrorRequestData = {
  status: Status;
  error: string;
};
