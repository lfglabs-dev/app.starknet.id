import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { utils } from "starknetid.js";

type DomainToAddrData = { addr: string; domain_expiry: number | null };

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
  if (
    typeof domain === "string" &&
    // todo: add utils function for Xplorer subdomains
    (utils.isBraavosSubdomain(domain) || domain.endsWith(".Xplorer.stark"))
  ) {
    await db
      .collection("subdomains")
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
              ? { addr: domainDoc.addr, domain_expiry: null }
              : { error: "no address found" }
          );
      });
  } else {
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
}
