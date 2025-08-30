import * as process from "node:process";

export function getLLVMNameArch() {
  switch (process.arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x86_64";
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }
}
