// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import whitelistsData from "../whitelistsData.json";

type Data = {
  address?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { address },
  } = req;
  res.status(200).json(
    whitelistsData[address as string] ?? {
      error: "Not whitelisted",
    }
  );
}
