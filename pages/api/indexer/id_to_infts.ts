import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

type IdentityNFT = {
  contract: string;
  inft_id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<IdentityNFT> | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { id },
  } = req;
  const { db } = await connectToDatabase();
  const domainCollection = db.collection("equipped_infts");
  const output: Array<IdentityNFT> = [];
  await domainCollection
    .find({ starknet_id: id, "_chain.valid_to": null })
    .forEach((doc) => {
      output.push({ contract: doc.contract, inft_id: doc.inft_id });
    });

  res.setHeader("cache-control", "max-age=30").status(200).json(output);
}
