import * as process from "node:process";

export function getArchiveNameArch() {
  switch (process.arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x64";
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }
}

export function getArchiveSuffix() {
  if (process.platform === "win32") {
    return ".zip";
  }
  return ".tar.gz";
}

export function getTargetRepo() {
  switch (process.platform) {
    case "win32":
      return "CangjieSDK-Win-Beta";
    case "linux":
      return "CangjieSDK-Linux-Beta";
    case "darwin":
      return "CangjieSDK-Darwin";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}
