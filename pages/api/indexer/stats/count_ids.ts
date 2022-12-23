import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../../types/backTypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        count: number;
      }
    | QueryError
  >
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { since },
  } = req;
  const sinceTime = parseInt(since as string) * 1000;
  const { db } = await connectToDatabase();
  const domainCollection = db.collection("starknet_ids");

  await domainCollection
    .countDocuments({
      creation_date: {
        $gte: new Date(sinceTime),
      },
      "_chain.valid_to": { $eq: null },
    })
    .then((count) => {
      res.setHeader("cache-control", "max-age=30").status(200).json({
        count: count,
      });
    });
}
