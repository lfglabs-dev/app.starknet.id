import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";

type Data = {
  domain: string;
  addr?: string;
  domain_expiry: number | null;
  is_owner_main: boolean;
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
    query: { id },
  } = req;
  const { db } = await connectToDatabase();
  const domainCollection = db.collection("domains");
  let domain: string | undefined;
  let addr: string | undefined;
  let expiry: number | null;
  await domainCollection
    .findOne({ token_id: id, "_chain.valid_to": null })
    .then((doc) => {
      if (doc) {
        domain = doc.domain;
        addr = doc.addr;
        expiry = doc.expiry;
      } else {
        domain = undefined;
      }
    });

  let owner: string | undefined;

  await db
    .collection("starknet_ids")
    .findOne({ token_id: id, "_chain.valid_to": null })
    .then((doc: any) => {
      if (doc) owner = doc.owner;
    });

  if (!domain || !owner) {
    res
      .setHeader("cache-control", "max-age=30")
      .status(200)
      .json({ error: "no domain associated to this starknet id was found" });
    return;
  }

  await domainCollection
    .findOne({
      domain: domain,
      addr: owner,
      rev_addr: owner,
      "_chain.valid_to": null,
    })
    .then((doc) => {
      if (addr)
        res
          .setHeader("cache-control", "max-age=30")
          .status(200)
          .json({
            domain: domain as string,
            addr: addr,
            domain_expiry: expiry,
            is_owner_main: doc ? true : false,
          });
      else
        res
          .setHeader("cache-control", "max-age=30")
          .status(200)
          .json({
            domain: domain as string,
            domain_expiry: expiry,
            is_owner_main: doc ? true : false,
          });
    });
}
