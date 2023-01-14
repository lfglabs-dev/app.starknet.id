import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "twitter-api-sdk";
import { Abi, Contract, ec } from "starknet";
import contractABI from "../../../abi/starknet/starknet_id_abi.json";
import { stringToHex } from "../../../utils/felt";
import { connectToDatabase } from "../../../lib/mongodb";
import { pedersen } from "starknet/dist/utils/hash";
import { sign } from "starknet/dist/utils/ellipticCurve";
import { generateString, getDomainWithoutStark, minifyAddressOrDomain } from "../../../utils/stringService";
import domainStringToFelt from "../../../utils/domain_string_to_felt";

type FullId = {
  id: string,
  domain?: string,
};

interface Dictionary<T> {
  [Key: string]: T;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { owner, domainTokenId, accessToken },
  } = req;

  const contract = new Contract(
    contractABI as Abi,
    process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
  );

  const twitterUserId = (await contract.get_verifier_data(domainTokenId, stringToHex("twitter"), process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string)).toString()

  const twitterClient = new Client(process.env.NEXT_PUBLIC_TWITTER_TOKEN as string);
  const response = await twitterClient.users.findUsersById({ ids: [twitterUserId as string] });

  const name = response.data && response.data[0].name
  
  const full_ids: Array<FullId> = [];
  const { db } = await connectToDatabase();
  const documents = db.collection("starknet_ids").find({ "owner": owner, "_chain.valid_to": null });
  const domains = db.collection("domains");
  for (const doc of await documents.toArray()) {
    const tokenId: string = doc.token_id;
    await domains.findOne({
      "token_id": tokenId,
      "_chain.valid_to": null,
    }).then((domainDoc) => {
      if (domainDoc) {
        full_ids.push({ id: tokenId, domain: domainDoc.domain });
      } else {
        full_ids.push({ id: tokenId });
      }
    });
  }

  const domain = full_ids.find((id) => id.id === domainTokenId)?.domain;

  if (domain) if (name?.includes(domain)) {
    const parsedDomain = domainStringToFelt(getDomainWithoutStark(domain))

    const hash = pedersen([owner as string, parsedDomain])
    const starkKeyPair = ec.getKeyPair(process.env.NEXT_PUBLIC_TRIBE_SIGNER_PRIVATE_KEY as string)
    const signed = sign(starkKeyPair, hash)

    const clientHeaders = new Headers();
    clientHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    clientHeaders.append("Authorization", `Bearer ${accessToken}`);
  
    const init = {
      method: "GET",
      headers: clientHeaders,
    }
  
    const followers = (await (await fetch(`https://api.twitter.com/2/users/${twitterUserId}/followers?max_results=1000`, init)).json())?.data;
    const following = (await (await fetch(`https://api.twitter.com/2/users/${twitterUserId}/following?max_results=1000`, init)).json())?.data;
    
    if (!followers || !following) res
    .setHeader("cache-control", "max-age=86400")
    .status(200)
    .json({
      error: "Twitter API Error"
    });
    
    const { db } = await connectToDatabase();
    const tribeFollowers = db.collection('tribe_followers')
    const tribeMembers = db.collection('tribe_members')
  
    tribeMembers.updateOne({ twitter_id: twitterUserId }, { $set: { twitter_id: twitterUserId } }, { upsert: true })
  
    const followersIds = followers.map((follower: Dictionary<string>) => follower.id)
    const followingIds = following.map((follower: Dictionary<string>) => follower.id)
  
    const followersInTribe = await tribeMembers.find({ "twitter_id": { $in: followersIds } }).toArray()
    const followingInTribe = await tribeMembers.find({ "twitter_id": { $in: followingIds } }).toArray()
  
    for (let index = 0; index < followersInTribe.length; index++) {
      const follower = followersInTribe[index];
      tribeFollowers.updateOne({ follower: follower.twitter_id, following: twitterUserId }, { $set: { follower: follower.twitter_id, following: twitterUserId } }, { upsert: true })
    }
  
    for (let index = 0; index < followingInTribe.length; index++) {
      const following = followingInTribe[index];
      tribeFollowers.updateOne({ follower: twitterUserId, following: following.twitter_id }, { $set: { follower: twitterUserId, following: following.twitter_id } }, { upsert: true })
    }

    res
    .setHeader("cache-control", "max-age=86400")
    .status(200)
    .json({
      signature: signed
    });
    return
  }
  res
  .setHeader("cache-control", "max-age=86400")
  .status(200)
  .json({
    error: "Invalid datas provided"
  });
}
