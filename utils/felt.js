import BN from "bn.js";

const P = new BN(
  "800000000000011000000000000000000000000000000000000000000000001",
  16
);

export function feltToString(felt) {
  const newStrB = Buffer.from(felt.toString(16), "hex");
  return newStrB.toString();
}

export function stringToFelt(str) {
  if (!str) {
    return;
  }
  return "0x" + new Buffer.from(str).toString("hex");
}

export function toNegativeNumber(felt) {
  const added = felt.sub(P);
  return added.abs() < felt.abs() ? added : felt;
}

export function toFelt(number) {
  const output = new BN(number);
  if (output.isNeg()) return output.add(P);
  return output;
}

export function hexToFelt(number) {
  return new BN(number.slice(2), 16).toString(10);
}
