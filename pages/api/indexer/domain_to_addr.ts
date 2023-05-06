import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

type DomainToAddrData = { addr: string; domain_expiry: number };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DomainToAddrData | QueryError>
) {
  await NextCors(req, res, {
    methods: ["GET"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const {
    query: { domain },
  } = req;
  const { db } = await connectToDatabase();
  await db
    .collection("domains")
    .findOne({
      domain: domain,
      "_chain.valid_to": null,
    })
    .then((domainDoc) => {
      res
        .setHeader("cache-control", "max-age=60")
        .status(200)
        .json(
          domainDoc
            ? { addr: domainDoc.addr, domain_expiry: domainDoc.expiry }
            : { error: "no address found" }
        );
    });
}
