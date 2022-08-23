import { TextField } from "@mui/material";
import { FunctionComponent, useState } from "react";
import Button from "../UI/button";
import styles from "../../styles/home.module.css";

type RegisterProps = {
  domain: string;
  isAvailable: boolean;
};

const Register: FunctionComponent<RegisterProps> = ({
  domain,
  isAvailable,
}) => {
  const [ownerAddress, setOwnerAddress] = useState<string>(""); // mettre la get caller address par défaut
  const [duration, setDuration] = useState<number>(20);

  function changeAddress(e: any) {
    setOwnerAddress(e.target.value);
  }

  function changeDuration(e: any) {
    setDuration(e.target.value);
  }

  function register(ownerAddress: string, duration: number, domain: string) {}

  if (isAvailable)
    return (
      <div className="sm:w-full w-4/5">
        <div className="flex">
          <TextField
            className="mr-1 z-[0]"
            id="outlined-basic"
            label="Owner address"
            placeholder="Owner address"
            variant="outlined"
            onChange={changeAddress}
            color="secondary"
          />
          <TextField
            className="ml-1 z-[0]"
            id="outlined-basic"
            label="years"
            type="number"
            placeholder="years"
            variant="outlined"
            onChange={changeDuration}
            InputProps={{
              inputProps: { min: 0 },
            }}
            defaultValue={duration}
            color="secondary"
          />
        </div>
        <div className={styles.cardCenter}>
          <p>Price Approximation : 1 ETH</p>
        </div>
        <div className="text-beige mt-5">
          <Button onClick={() => register(ownerAddress, duration, domain)}>
            Register
          </Button>
        </div>
      </div>
    );

  return <p>This domain is not available you can&rsquot register it</p>;
};

export default Register;
