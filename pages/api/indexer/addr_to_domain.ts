import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../types/backTypes";

type AddrToDomainData = { domain: string; domain_expiry: number };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddrToDomainData | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { addr },
  } = req;
  const { db } = await connectToDatabase();
  await db
    .collection("domains")
    .findOne({
      addr: addr,
      rev_addr: addr,
      "_chain.valid_to": null,
    })
    .then((domainDoc) => {
      res
        .setHeader("cache-control", "max-age=30")
        .status(200)
        .json(
          domainDoc
            ? { domain: domainDoc.domain, domain_expiry: domainDoc.expiry }
            : { error: "no domain found" }
        );
    });
}
