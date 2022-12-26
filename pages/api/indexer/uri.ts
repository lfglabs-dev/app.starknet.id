import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import NextCors from "nextjs-cors";
import { QueryError } from "../../../types/backTypes";

type TokenURI = {
    name: string;
    description: string;
    image: string;
    expiry?: number;
    attributes?: Array<{
        trait_type: string;
        value: string | number | Array<string>;
    }>
};

type DomainQueryResult = {
    domain: string;
    expiry: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TokenURI | QueryError>
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
    let document: DomainQueryResult | null = null;
    await domainCollection
        .findOne({ token_id: id, "_chain.valid_to": null })
        .then((doc) => {
            document = doc as DomainQueryResult | null;
        });
    document = document as DomainQueryResult | null;

    if (!document) {
        res
            .setHeader("cache-control", "max-age=30")
            .status(200)
            .json({
                name: "Starknet ID: " + id,
                description: "This token represents an identity on StarkNet.",
                image: "https://starknet.id/api/identicons/" + id,
            });
        return;
    }

    const expiryDate = new Date(document.expiry * 1000);
    // format date as "Jan 1, 2021"
    const expiryDateString = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'][expiryDate.getUTCMonth()]
        + " " + expiryDate.getUTCDate() + ", " + expiryDate.getUTCFullYear();
    res
        .setHeader("cache-control", "max-age=30")
        .status(200)
        .json({
            name: document.domain,
            description: "This token represents an identity on StarkNet.",
            image: "https://starknet.id/api/identicons/" + id,
            expiry: document.expiry,
            attributes: [
                {
                    trait_type: "Subdomain",
                    value: document.domain.substring(0, document.domain.length - 6).includes(".") ? "yes" : "no",
                },
                {
                    trait_type: "Domain expiry",
                    value: [expiryDateString],
                },
                {
                    trait_type: "Domain expiry timestamp",
                    value: document.expiry,
                }
            ]
        });
}
