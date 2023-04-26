/* eslint-disable no-undef */
import { basicAlphabet } from "../../utils/constants";
import {
  is1234Domain,
  getDomainWithoutStark,
  isStarkRootDomain,
  isHexString,
  isSubdomain,
  minifyAddress,
  minifyDomain,
  generateString,
  isStarkDomain,
  numberToString,
  isBraavosSubdomain,
  getDomainKind,
  shortenDomain,
} from "../../utils/stringService";


describe("Should test is1234Domain", () => {
  it("Should return false cause there are valid 1234 domains", () => {
    expect(is1234Domain("1231")).toBeTruthy();
    expect(is1234Domain("0231")).toBeTruthy();
    expect(is1234Domain("1204")).toBeTruthy();
    expect(is1234Domain("0430")).toBeTruthy();
  });

  it("Should return false cause there are invalid 1234 domains", () => {
    expect(is1234Domain("1232575")).toBeFalsy();
    expect(is1234Domain("231")).toBeFalsy();
    expect(is1234Domain("12043")).toBeFalsy();
    expect(is1234Domain("1234")).toBeFalsy();
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

describe("Should test isStarkRootDomain", () => {
  it("Should return true cause string is a stark domain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, basicAlphabet);
      expect(isStarkRootDomain(randomString + ".stark")).toBeTruthy();
    }
  });

  it("Should return false cause string does not end with .stark", () => {
    expect(isStarkRootDomain("test.star")).toBeFalsy();
  });

  it("Should return false cause string contains a wrong character", () => {
    expect(isStarkRootDomain("test)ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("test,ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("qsd12$)ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("_.stark")).toBeFalsy();
    expect(isStarkRootDomain("test.ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("..stark")).toBeFalsy();
    expect(isStarkRootDomain("..starkq")).toBeFalsy();
  });
});

describe("Should test isStarkDomain", () => {
  it("Should return true cause string is a stark subdomain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, basicAlphabet);
      const randomString2 = generateString(10, basicAlphabet);
      const randomString3 = generateString(10, basicAlphabet);
      const randomString4 = generateString(10, basicAlphabet);

      expect(
        isStarkDomain(
          randomString +
            "." +
            randomString2 +
            "." +
            randomString3 +
            "." +
            randomString4 +
            ".stark"
        )
      ).toBeTruthy();
    }
  });

  it("Should return true cause string is a stark subdomain", () => {
    for (let index = 0; index < 500; index++) {
      const randomString = generateString(10, basicAlphabet);

      expect(isStarkDomain(randomString + ".stark")).toBeTruthy();
    }
  });

  it("Should return false cause these are not stark domains", () => {
    const randomString = generateString(10, basicAlphabet);
    const randomString2 = generateString(10, basicAlphabet);

    expect(
      isStarkDomain(randomString + "." + randomString2 + ".starkqsd") &&
        isStarkDomain(
          randomString.concat("_") + "." + randomString2 + ".stark"
        ) &&
        isStarkDomain(randomString + "." + randomString2 + "..stark") &&
        isStarkDomain(randomString + "." + randomString2 + "..stark") &&
        isStarkDomain("." + randomString + ".." + randomString2 + ".stark") &&
        isStarkDomain("." + randomString + "." + randomString2 + ".stark")
    ).toBeFalsy();
  });
});

describe("Should test isHexString", () => {
  it("Should return false cause string is not an hex", () => {
    expect(isHexString("1232575.stark")).toBeFalsy();
    expect(isHexString("1232575")).toBeFalsy();
    expect(
      isHexString(
        "061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3"
      )
    ).toBeFalsy();
    expect(
      isHexString(
        "0061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3"
      )
    ).toBeFalsy();
  });

  it("Should return true cause string is hex", () => {
    expect(
      isHexString(
        "0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3"
      )
    ).toBeTruthy();
  });
});

describe("Should test isSubdomain", () => {
  it("Should return false cause string is not a subdomain", () => {
    expect(isSubdomain("1232575.stark")).toBeFalsy();
    expect(isSubdomain("")).toBeFalsy();
  });

  it("Should return false cause string is a subdomain", () => {
    expect(isSubdomain("1232575.ben.stark")).toBeTruthy();
    expect(isSubdomain("qsdqsdqsd.fricoben.stark")).toBeTruthy();
  });
});

describe("numberToString", () => {
  it("Should returns an empty string if the element is undefined", () => {
    const result = numberToString(undefined);
    const result2 = numberToString(0);

    expect(result).toEqual("");
    expect(result2).toEqual("0");
  });

  it("Should converts a number to its decimal string representation", () => {
    const result = numberToString(123);
    expect(result).toEqual("123");
  });

  it("Should converts a negative number to its decimal string representation", () => {
    const result = numberToString(-456);
    expect(result).toEqual("-456");
  });
});

describe("isBraavosSubdomain", () => {
  it("returns true for valid Braavos subdomains", () => {
    expect(isBraavosSubdomain("ben.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("john.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("jeremy.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("johnny.braavos.stark")).toBe(true);
  });

  it("returns false for invalid Braavos subdomains", () => {
    expect(isBraavosSubdomain("arya.braavoos.stark")).toBe(false);
    expect(isBraavosSubdomain("braavos.stark")).toBe(false);
    expect(isBraavosSubdomain("winterf.ell.braavos.stark")).toBe(false);
    expect(isBraavosSubdomain("johén.braavos.stark")).toBe(false);
    expect(isBraavosSubdomain(undefined)).toBe(false);
  });
});

describe("getDomainKind", () => {
  it("returns 'root' for valid root stark root domains", () => {
    expect(getDomainKind("stark.stark")).toBe("root");
    expect(getDomainKind("starkqqsdqsd.stark")).toBe("root");
    expect(getDomainKind("benqsd.stark")).toBe("root");
  });

  it("returns 'braavos' for valid Braavos subdomains", () => {
    expect(getDomainKind("ben.braavos.stark")).toBe("braavos");
    expect(getDomainKind("john.braavos.stark")).toBe("braavos");
    expect(getDomainKind("jeremy.braavos.stark")).toBe("braavos");
    expect(getDomainKind("johnny.braavos.stark")).toBe("braavos");
  });

  it("returns 'subdomain' for any other valid domain", () => {
    expect(getDomainKind("winterfell.stark.stark")).toBe("subdomain");
    expect(getDomainKind("north.everai.stark")).toBe("subdomain");
  });

  it("returns 'none' for invalid domains", () => {
    expect(getDomainKind("invalid$.go.stark")).toBe("none");
    expect(getDomainKind("invalid")).toBe("none");
    expect(getDomainKind("allélafrance.stark")).toBe("none");
    expect(getDomainKind(undefined)).toBe("none");
  });
});

describe("Should test shortenDomain function", () => {
  it("Should return the same domain if the length is less than the default characterToBreak", () => {
    expect(shortenDomain("example.com")).toEqual("example.com");
  });

  it("Should return the shortened domain if the length is greater than the default characterToBreak", () => {
    expect(shortenDomain("averylongdomainnametoshorten.com")).toEqual(
      "aver...com"
    );
  });

  it("Should return the same domain if the length is less than the custom characterToBreak", () => {
    expect(shortenDomain("example.com", 15)).toEqual("example.com");
  });

  it("Should return the shortened domain if the length is greater than the custom characterToBreak", () => {
    expect(shortenDomain("averylongdomainnametoshorten.com", 15)).toEqual(
      "aver...com"
    );
  });

  it("Should return an empty string if the domain is undefined", () => {
    expect(shortenDomain(undefined)).toEqual("");
  });

  it("Should return an empty string if the domain is an empty string", () => {
    expect(shortenDomain("")).toEqual("");
  });
});
