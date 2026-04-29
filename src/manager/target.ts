const TARGET_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOST_TOOLCHAIN_PREFIX_RE = /^(?:win32-x64|darwin-(?:arm64|x64)|linux-(?:arm64|x64)|ohos-(?:arm64|x64))(?:-|$)/;

export function normalizeTarget(target: string | undefined): string {
  const normalized = (target ?? "").trim().toLowerCase().replaceAll("_", "-");
  if (normalized === "") {
    return "";
  }

  if (!TARGET_RE.test(normalized)) {
    throw new Error("Invalid target input, target must match /^[a-z0-9]+(?:-[a-z0-9]+)*$/");
  }

  if (HOST_TOOLCHAIN_PREFIX_RE.test(normalized)) {
    throw new Error("Invalid target input, provide a target suffix such as 'ohos', not a full toolchain key");
  }

  return normalized;
}

export function createToolchainKey(platform: string, arch: string, target: string): string {
  return target === "" ? `${platform}-${arch}` : `${platform}-${arch}-${target}`;
}
