import BN from "bn.js";

const P = new BN(
  "800000000000011000000000000000000000000000000000000000000000001",
  16
);

export function feltToString(felt) {
  const newStrB = Buffer.from(felt.toString(16), "hex");
  return newStrB.toString();
}

export function stringToHex(str) {
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

export function scientificToString(num) {
  var nsign = Math.sign(num);
  //remove the sign
  num = Math.abs(num);
  //if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    var zero = "0",
      parts = String(num).toLowerCase().split("e"), //split into coeff and exponent
      e = parts.pop(), //store the exponential part
      l = Math.abs(e), //get the number of zeros
      sign = e / l,
      coeff_array = parts[0].split(".");
    if (sign === -1) {
      l = l - coeff_array[0].length;
      if (l < 0) {
        num =
          coeff_array[0].slice(0, l) +
          "." +
          coeff_array[0].slice(l) +
          (coeff_array.length === 2 ? coeff_array[1] : "");
      } else {
        num = zero + "." + new Array(l + 1).join(zero) + coeff_array.join("");
      }
    } else {
      var dec = coeff_array[1];
      if (dec) l = l - dec.length;
      if (l < 0) {
        num = coeff_array[0] + dec.slice(0, l) + "." + dec.slice(l);
      } else {
        num = coeff_array.join("") + new Array(l + 1).join(zero);
      }
    }
  }

  return nsign < 0 ? "-" + num : num;
}

export function stringDecimalToHex(decimal) {
  return new BN(decimal).toString(16);
}
