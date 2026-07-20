import { describe, expect, test } from "bun:test";
import { SN_MAIN } from "@/lib/chain/manifest";
import { decodePriceResult } from "@/lib/chain/contracts";
import { normalizeAddress } from "@/lib/core/address";
import {
  buildMintIntent,
  buildRegisterIntent,
  buildRenewIntent,
  buildSetMainIntent,
  buildSetTargetIntent,
  buildSubdomainIntent,
  buildTransferIntent,
} from "@/lib/transactions/intents";

describe("transaction intent snapshots", () => {
  test("mint", () => {
    expect(buildMintIntent("42").calls).toEqual([
      {
        contractAddress: SN_MAIN.contracts.identity.address,
        entrypoint: "mint",
        calldata: ["42"],
      },
    ]);
  });

  test("register preserves mint/approve/buy/main order and zero metadata fields", () => {
    const value = buildRegisterIntent({
      domain: "alice.stark",
      days: 365,
      tokenId: "42",
      price: 123n,
      mintIdentity: true,
      setMain: true,
    });
    expect(value.calls.map((call) => call.entrypoint)).toEqual([
      "mint",
      "approve",
      "buy",
      "set_main_id",
    ]);
    expect(value.calls[1]).toEqual({
      contractAddress: SN_MAIN.contracts.eth.address,
      entrypoint: "approve",
      calldata: [SN_MAIN.contracts.naming.address, "123", "0"],
    });
    expect(value.calls[2]).toEqual({
      contractAddress: SN_MAIN.contracts.naming.address,
      entrypoint: "buy",
      calldata: ["42", "8462258", "365", "0", "0", "0", "0"],
    });
  });

  test("register can use an existing identity without mint/main", () => {
    expect(
      buildRegisterIntent({
        domain: "alice.stark",
        days: 365,
        tokenId: "42",
        price: 123n,
        mintIdentity: false,
        setMain: false,
      }).calls.map((call) => call.entrypoint)
    ).toEqual(["approve", "buy"]);
  });

  test("register resets an existing reverse record before changing main ID", () => {
    expect(
      buildRegisterIntent({
        domain: "alice.stark",
        days: 365,
        tokenId: "42",
        price: 123n,
        mintIdentity: false,
        setMain: true,
        resetReverse: true,
        clearMainTarget: true,
      }).calls.map((call) => call.entrypoint)
    ).toEqual([
      "approve",
      "buy",
      "reset_address_to_domain",
      "set_user_data",
      "set_main_id",
    ]);
  });

  test("renew has exact ETH approval followed by renew", () => {
    const value = buildRenewIntent({
      domain: "alice.stark",
      days: 730,
      tokenId: "42",
      price: 999n,
    });
    expect(value.calls).toEqual([
      {
        contractAddress: SN_MAIN.contracts.eth.address,
        entrypoint: "approve",
        calldata: [SN_MAIN.contracts.naming.address, "999", "0"],
      },
      {
        contractAddress: SN_MAIN.contracts.naming.address,
        entrypoint: "renew",
        calldata: ["8462258", "730", "0", "0", "0"],
      },
    ]);
  });

  test("target customization uses deployed selector and calldata", () => {
    expect(buildSetTargetIntent("42", "0x123").calls[0]).toMatchObject({
      entrypoint: "set_user_data",
      calldata: ["42", "0x737461726b6e6574", "0x123", "0"],
    });
  });

  test("main ID includes required reset, target clear, migration, and main calls", () => {
    expect(
      buildSetMainIntent({
        tokenId: "42",
        resetReverse: true,
        clearTarget: true,
        migrateDomain: "alice.stark",
      }).calls.map((call) => call.entrypoint)
    ).toEqual([
      "reset_address_to_domain",
      "set_user_data",
      "migrate_domain",
      "set_main_id",
    ]);
  });

  test("transfer serializes the identity as uint256", () => {
    expect(buildTransferIntent("42", "0x123", "0x456").calls[0]).toEqual({
      contractAddress: SN_MAIN.contracts.identity.address,
      entrypoint: "transfer_from",
      calldata: ["0x123", "0x456", "42", "0"],
    });
  });

  test("subdomain supports existing and atomic mint branches", () => {
    const existing = buildSubdomainIntent({
      subdomain: "sub.alice.stark",
      targetTokenId: "42",
      mintIdentity: false,
    });
    expect(existing.calls).toEqual([
      {
        contractAddress: SN_MAIN.contracts.naming.address,
        entrypoint: "transfer_domain",
        calldata: ["2", "2222", "8462258", "42"],
      },
    ]);
    expect(
      buildSubdomainIntent({
        subdomain: "sub.alice.stark",
        targetTokenId: "43",
        mintIdentity: true,
      }).calls.map((call) => call.entrypoint)
    ).toEqual(["mint", "transfer_domain"]);
  });

  test("decodes pricing token and uint256 amount", () => {
    expect(
      decodePriceResult([SN_MAIN.contracts.eth.address, "5", "1"])
    ).toEqual({
      tokenAddress: normalizeAddress(SN_MAIN.contracts.eth.address),
      amount: (1n << 128n) + 5n,
    });
  });
});
