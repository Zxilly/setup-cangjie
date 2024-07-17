import * as process from "node:process";

export function getArch() {
  switch (process.arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x64";
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }
}

export function getSuffix() {
  const platform = process.platform;
  switch (platform) {
    case "win32":
      return "windows_x64.zip";
    case "linux":
    case "darwin": {
      return `${platform}_${getArch()}.tar.gz`;
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function getTargetRepo() {
  switch (process.platform) {
    case "win32":
      return "CangjieSDK-Win-Beta";
    case "linux":
      return "CangjieSDK-Linux-Beta";
    case "darwin":
      return "CangjieSDK-Darwin";
  }
}
