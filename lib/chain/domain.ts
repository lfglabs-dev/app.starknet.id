const BASIC_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789-";
const BIG_ALPHABET = "这来";
const BASIC_SIZE = BigInt(BASIC_ALPHABET.length);
const BASIC_SIZE_PLUS_ONE = BASIC_SIZE + 1n;
const BIG_SIZE = BigInt(BIG_ALPHABET.length);
const BIG_SIZE_PLUS_ONE = BIG_SIZE + 1n;

function extractTrailingStars(value: string): [string, number] {
  let count = 0;
  while (value.endsWith(BIG_ALPHABET[BIG_ALPHABET.length - 1])) {
    value = value.slice(0, -1);
    count += 1;
  }
  return [value, count];
}

function encodeLabel(input: string): bigint {
  let decoded = input;
  let encoded = 0n;
  let multiplier = 1n;
  if (!decoded) return encoded;

  if (decoded.endsWith(BIG_ALPHABET[0] + BASIC_ALPHABET[1])) {
    const [value, count] = extractTrailingStars(decoded.slice(0, -2));
    decoded = value + BIG_ALPHABET[1].repeat(2 * (count + 1));
  } else {
    const [value, count] = extractTrailingStars(decoded);
    if (count) decoded = value + BIG_ALPHABET[1].repeat(1 + 2 * (count - 1));
  }

  for (let index = 0; index < decoded.length; index += 1) {
    const character = decoded[index];
    const basicIndex = BASIC_ALPHABET.indexOf(character);
    if (basicIndex !== -1) {
      if (index === decoded.length - 1 && character === BASIC_ALPHABET[0]) {
        encoded += multiplier * BASIC_SIZE;
        multiplier *= BASIC_SIZE_PLUS_ONE * BASIC_SIZE_PLUS_ONE;
      } else {
        encoded += multiplier * BigInt(basicIndex);
        multiplier *= BASIC_SIZE_PLUS_ONE;
      }
      continue;
    }
    const bigIndex = BIG_ALPHABET.indexOf(character);
    if (bigIndex === -1) throw new Error(`Unsupported domain character: ${character}`);
    encoded += multiplier * BASIC_SIZE;
    multiplier *= BASIC_SIZE_PLUS_ONE;
    encoded += multiplier * BigInt(bigIndex + (index === decoded.length - 1 ? 1 : 0));
    multiplier *= BIG_SIZE;
  }
  return encoded;
}

function decodeLabel(input: bigint): string {
  let felt = input;
  let decoded = "";
  while (felt !== 0n) {
    const code = felt % BASIC_SIZE_PLUS_ONE;
    felt /= BASIC_SIZE_PLUS_ONE;
    if (code === BASIC_SIZE) {
      const next = felt / BIG_SIZE_PLUS_ONE;
      if (next === 0n) {
        const secondCode = felt % BIG_SIZE_PLUS_ONE;
        felt = next;
        decoded += secondCode === 0n ? BASIC_ALPHABET[0] : BIG_ALPHABET[Number(secondCode) - 1];
      } else {
        const secondCode = felt % BIG_SIZE;
        decoded += BIG_ALPHABET[Number(secondCode)];
        felt /= BIG_SIZE;
      }
    } else {
      decoded += BASIC_ALPHABET[Number(code)];
    }
  }
  const [value, count] = extractTrailingStars(decoded);
  if (count) {
    decoded =
      value +
      (count % 2 === 0
        ? BIG_ALPHABET[1].repeat(count / 2 - 1) + BIG_ALPHABET[0] + BASIC_ALPHABET[1]
        : BIG_ALPHABET[1].repeat((count - 1) / 2 + 1));
  }
  return decoded;
}

export function normalizeDomain(input: string): string {
  const lowered = input.trim().toLowerCase();
  const domain = lowered.endsWith(".stark") ? lowered : `${lowered}.stark`;
  if (!isValidStarkDomain(domain)) {
    throw new Error("Use 1–48 characters per label: a-z, 0-9, hyphen, 这, or 来");
  }
  return domain;
}

export function isValidStarkDomain(domain: string): boolean {
  if (!domain.endsWith(".stark")) return false;
  const labels = domain.slice(0, -6).split(".");
  return (
    labels.length > 0 &&
    labels.every(
      (label) =>
        label.length >= 1 &&
        label.length <= 48 &&
        Array.from(label).every(
          (character) => BASIC_ALPHABET.includes(character) || BIG_ALPHABET.includes(character)
        )
    )
  );
}

export function isRootDomain(domain: string): boolean {
  return isValidStarkDomain(domain) && domain.slice(0, -6).split(".").length === 1;
}

export function renewableDomains(domains: readonly string[]): string[] {
  return Array.from(new Set(domains.filter(isRootDomain)));
}

export function encodeDomain(domain: string): bigint[] {
  const normalized = normalizeDomain(domain);
  return normalized
    .slice(0, -6)
    .split(".")
    .map(encodeLabel);
}

export function decodeDomain(encoded: readonly (string | bigint)[]): string {
  if (encoded.length === 0) return "";
  return `${encoded.map((value) => decodeLabel(BigInt(value))).join(".")}.stark`;
}

export function domainLength(domain: string): number {
  const normalized = normalizeDomain(domain);
  if (!isRootDomain(normalized)) throw new Error("Pricing is available only for root .stark domains");
  return Array.from(normalized.slice(0, -6)).length;
}

export function assertDurationDays(days: number): number {
  if (!Number.isSafeInteger(days) || days < 1 || days > 65_535) {
    throw new Error("Duration must be between 1 and 65,535 days");
  }
  return days;
}

export function isDomainAvailable(expiry: string | number | bigint, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return BigInt(expiry) <= BigInt(nowSeconds);
}

export function spanCalldata(values: readonly (string | number | bigint)[]): string[] {
  return [values.length.toString(), ...values.map((value) => value.toString())];
}
