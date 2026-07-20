const forbidden = [
  ["NEXT", "PUBLIC", ""].join("_"),
  ["api", "starknet", "id"].join("."),
  ["rpc", "starknet", "id"].join("."),
  ["identicon", "starknet", "id"].join("."),
  ["verifier", "starknet", "id"].join("."),
  ["sales", "starknet", "id"].join("."),
  ["sepolia", "app", "starknet", "id"].join("."),
  ["mongodb"].join(""),
  ["post", "hog"].join(""),
  ["next", "-", "axiom"].join(""),
  ["avnu", "gasless"].join("-"),
  ["anima", "-", "protocol"].join(""),
  ["twitter", "-", "api", "-", "sdk"].join(""),
];

const ignored = [
  ".git/",
  ".next/",
  ".context/",
  "node_modules/",
  "public/",
  "scripts/check-network-denylist.ts",
  "bun.lock",
];

const glob = new Bun.Glob("**/*");
const violations: string[] = [];

for await (const file of glob.scan({ cwd: ".", onlyFiles: true, dot: true })) {
  if (ignored.some((prefix) => file === prefix || file.startsWith(prefix))) continue;
  const basename = file.split("/").pop() ?? file;
  if (!/\.(?:ts|tsx|js|json|md|env|example)$/.test(file) && !basename.startsWith(".env")) {
    continue;
  }
  const content = (await Bun.file(file).text()).toLowerCase();
  for (const denied of forbidden) {
    if (content.includes(denied.toLowerCase())) {
      violations.push(`${file}: contains retired token "${denied}"`);
    }
  }
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Network and environment denylist passed");
