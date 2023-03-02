import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../types/backTypes";

type Data = {
  starknet_id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { verifier, field, data },
  } = req;
  const { db } = await connectToDatabase();

  await db
    .collection("starknet_ids_data")
    .findOne({ verifier, field, data, "_chain.valid_to": null })
    .then((doc) => {
      if (doc) {
        res
          .setHeader("cache-control", "max-age=30")
          .status(200)
          .json({ starknet_id: doc.token_id });
      } else {
        res
          .setHeader("cache-control", "max-age=30")
          .status(200)
          .json({ error: "no tokenid associated to this data was found" });
      }
    });
}
