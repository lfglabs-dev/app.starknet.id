import { Db, MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_LINK;

let client: MongoClient | undefined = undefined;
let db: Db | undefined = undefined;

export async function connectToDatabase() {

    if (client && db) {
        return { client, db };
    }
    if (process.env.NODE_ENV === "development") {
        if (!global._client) {
            client = await (new MongoClient(uri as string)).connect();
            global._client = client;
        } else {
            client = global._client;
        }
    } else {
        client = await (new MongoClient(uri as string)).connect();
    }
    db = (client as MongoClient).db("starknet_id");
    return { client, db };

}