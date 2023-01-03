/* eslint-disable no-undef */
import { basicAlphabet } from "../../hooks/naming";
import {
  is1234Domain,
  getDomainWithoutStark,
  isStarkDomain,
  isHexString,
  isSubdomain,
  minifyAddress,
  minifyDomain,
  generateString,
} from "../../utils/stringService";

describe("Should test is1234Domain", () => {
  it("Should return false cause there are valid 1234 domains", () => {
    expect(is1234Domain("1231")).toBe(true);
    expect(is1234Domain("0231")).toBe(true);
    expect(is1234Domain("1204")).toBe(true);
    expect(is1234Domain("0430")).toBe(true);
  });

  it("Should return false cause there are invalid 1234 domains", () => {
    expect(is1234Domain("1232575")).toBe(false);
    expect(is1234Domain("231")).toBe(false);
    expect(is1234Domain("12043")).toBe(false);
    expect(is1234Domain("1234")).toBe(false);
  });
});

describe("Should test minifyAddress", () => {
  it("Should return the right minify address ", () => {
    expect(
      minifyAddress(
        "0x072D4F3FA4661228ed0c9872007fc7e12a581E000FAd7b8f3e3e5bF9E6133207"
      )
    ).toBe("0x07...207");
  });
});

describe("Should test minifyDomain", () => {
  it("Should return the entire domain ", () => {
    expect(minifyDomain("ben.stark")).toBe("ben.stark");
  });

  it("Should return the minified domain", () => {
    expect(minifyDomain("bennnnnnnnnnnnnnnn.stark")).toBe("benn...");
  });
});

describe("Should test getDomainWithoutStark", () => {
  it("Should return string without stark", () => {
    expect(getDomainWithoutStark("1232575")).toBe("1232575");
    expect(getDomainWithoutStark("1232575.stark")).toBe("1232575");
    expect(getDomainWithoutStark("1232575.sta")).toBe("1232575.sta");
  });
});

describe("Should test isStarkDomain", () => {
  it("Should return true cause string is a stark domain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, basicAlphabet);
      expect(isStarkDomain(randomString + ".stark")).toBe(true);
    }
  });

  it("Should return false cause string does not end with .stark", () => {
    expect(isStarkDomain("test.star")).toBe(false);
  });

  it("Should return false cause string contains a wrong character", () => {
    expect(isStarkDomain("test)ben.stark")).toBe(false);
    expect(isStarkDomain("test,ben.stark")).toBe(false);
    expect(isStarkDomain("qsd12$)ben.stark")).toBe(false);
    expect(isStarkDomain("_.stark")).toBe(false);
  });
});

describe("Should test isHexString", () => {
  it("Should return false cause string is not an hex", () => {
    expect(isHexString("1232575.stark")).toBe(false);
  });

  it("Should return true cause string is hex", () => {
    expect(
      isHexString(
        "0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3"
      )
    ).toBe(true);
  });
});

describe("Should test isSubdomain", () => {
  it("Should return false cause string is not a subdomain", () => {
    expect(isSubdomain("1232575.stark")).toBe(false);
    expect(isSubdomain("")).toBe(false);
  });

  it("Should return false cause string is a subdomain", () => {
    expect(isSubdomain("1232575.ben.stark")).toBe(true);
    expect(isSubdomain("qsdqsdqsd.fricoben.stark")).toBe(true);
  });
});
