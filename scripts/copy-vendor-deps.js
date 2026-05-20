// Replaces symlinked vendor deps with real copies so Metro can resolve them.
// Metro does not follow symlinks outside the project root by default.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const MAP = {
  "bitcoinjs-lib": "vendor/bitcoinjs-lib",
  "thorify": "vendor/thorify",
  "react-native-fast-crypto": "vendor/fast-crypto",
};
for (const [pkg, vendorPath] of Object.entries(MAP)) {
  const dst = path.join(ROOT, "node_modules", pkg);
  const src = path.join(ROOT, vendorPath);
  if (!fs.existsSync(src)) {
    console.warn("copy-vendor-deps: missing", src, "(skip)");
    continue;
  }
  const stat = fs.lstatSync(dst).isSymbolicLink() ? "symlink" : "directory";
  if (stat === "symlink") {
    fs.unlinkSync(dst);
    execSync(`cp -R "${src}" "${dst}"`);
    console.log("copy-vendor-deps:", pkg, "(symlink -> copy)");
  }
}
