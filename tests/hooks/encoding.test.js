/* eslint-disable no-undef */
import BN from "bn.js";
import {
  totalAlphabet,
  useDecoded,
  useEncoded,
  useEncodedSeveral,
} from "../../hooks/naming";
import { generateString } from "../../utils/stringService";

describe("Should test encoding/decoding hooks 2500 times", () => {
  it("Should test useEncoded and useDecoded hook with a random string", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      expect(useDecoded([useEncoded(randomString)])).toBe(
        randomString + ".stark"
      );
    }
  });

  it("Should test useEncodedSeveral with subdomain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      const randomString1 = generateString(10, totalAlphabet);
      const encoded = useEncodedSeveral([randomString, randomString1]).map(
        (element) => new BN(element)
      );

      expect(useDecoded(encoded)).toBe(
        randomString + "." + randomString1 + ".stark"
      );
    }
  });
});

describe("Should test decoding/encoding hooks", () => {
  it("Should test useDecoded and useEncoded hook with a number", () => {
    for (let index = 0; index < 2500; index++) {
      const decoded = useDecoded([new BN(index)]);
      expect(
        useEncoded(decoded.substring(0, decoded.length - 6)).toString()
      ).toBe(index.toString());
    }
  });

  it("Should test useDecoded and useEncoded with a subdomain", () => {
    const decoded = useDecoded([new BN(1499554868251), new BN(18925)]);
    expect(decoded).toBe("fricoben.ben.stark");
  });
});
