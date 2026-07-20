const staticRoot = ".next/static";
const secret = process.env.STARKSCAN_API_KEY?.trim();
const forbidden = [
  "STARKSCAN_API_KEY",
  "api.starkscan.co",
  ["api", "starknet", "id"].join("."),
  ["rpc", "starknet", "id"].join("."),
  ["identicon", "starknet", "id"].join("."),
  ["verifier", "starknet", "id"].join("."),
  ["sales", "starknet", "id"].join("."),
  ["sepolia", "app", "starknet", "id"].join("."),
  ...(secret ? [secret] : []),
];
const violations: string[] = [];
const glob = new Bun.Glob("**/*.{js,json,css,map}");

for await (const file of glob.scan({ cwd: staticRoot, onlyFiles: true })) {
  const content = await Bun.file(`${staticRoot}/${file}`).text();
  for (const token of forbidden) {
    if (content.includes(token)) {
      violations.push(`${file}: contains server-only network configuration`);
      break;
    }
  }
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Client bundle secret check passed");
