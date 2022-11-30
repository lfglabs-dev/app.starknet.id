import { useDecoded, useEncoded } from "../../hooks/naming";
import { generateString } from "../../hooks/string";

describe("Should test encoding/decoding hooks 50 times", () => {
  for (let index = 0; index < 50; index++) {
    it("Should test useEncoded and useDecoded hook with a random string", () => {
      const randomString = generateString(10);

      expect(useDecoded([useEncoded(randomString)])).toBe(
        randomString + ".stark"
      );
    });
  }
});
