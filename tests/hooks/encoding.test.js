/* eslint-disable no-undef */
import { BN } from "bn.js";
import { totalAlphabet, useDecoded, useEncoded } from "../../hooks/naming";
import { generateString } from "../../utils/stringService";

const charactersWithBigAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-这来";

describe("Should test encoding/decoding hooks 2500 times", () => {
  it("Should test useEncoded and useDecoded hook with a random string", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, charactersWithBigAlphabet);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      expect(useDecoded([useEncoded(randomString)])).toBe(
        randomString + ".stark"
      );
    }
  });
});

describe("Should test decoding/encoding hooks 2500 times", () => {
  it("Should test useDecoded and useEncoded hook with a number", () => {
    for (let index = 0; index < 2500; index++) {
      const decoded = useDecoded([new BN(index)]);
      expect(
        useEncoded(decoded.substring(0, decoded.length - 6)).toString()
      ).toBe(index.toString());
    }
  });
});
