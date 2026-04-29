import type { ObjectInfo } from "./base-provider";
import * as http from "@actions/http-client";
import * as tool from "@actions/tool-cache";
import { SDKProvider } from "./base-provider";

type RuntimePlatform = "win32" | "darwin" | "linux";
type RuntimeArch = "x64" | "arm64";

interface ToolchainParts {
  platform: RuntimePlatform;
  arch: RuntimeArch;
  target: string;
}

const TOOLCHAIN_HOSTS: Array<{ key: string; platform: RuntimePlatform; arch: RuntimeArch }> = [
  { key: "win32-x64", platform: "win32", arch: "x64" },
  { key: "darwin-arm64", platform: "darwin", arch: "arm64" },
  { key: "darwin-x64", platform: "darwin", arch: "x64" },
  { key: "linux-arm64", platform: "linux", arch: "arm64" },
  { key: "linux-x64", platform: "linux", arch: "x64" },
];

const SHA256_RE = /^[a-f0-9]{64}$/i;

function getPlatformName(platform: RuntimePlatform): string {
  switch (platform) {
    case "win32":
      return "windows";
    case "darwin":
      return "mac";
    case "linux":
      return "linux";
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function getArchiveNameArch(arch: RuntimeArch): string {
  switch (arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x64";
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }
}

function getArchiveSuffix(platform: RuntimePlatform): string {
  return platform === "win32" ? ".zip" : ".tar.gz";
}

function parseToolchainKey(toolchainKey: string): ToolchainParts {
  for (const host of TOOLCHAIN_HOSTS) {
    if (toolchainKey === host.key || toolchainKey.startsWith(`${host.key}-`)) {
      return {
        platform: host.platform,
        arch: host.arch,
        target: toolchainKey === host.key ? "" : toolchainKey.slice(host.key.length + 1),
      };
    }
  }

  throw new Error(`Unsupported platform: ${toolchainKey}`);
}

export function buildNightlySdkAssetName(platform: RuntimePlatform, arch: RuntimeArch, target: string, version: string): string {
  const targetPart = target === "" ? "" : `-${target}`;
  return `cangjie-sdk-${getPlatformName(platform)}-${getArchiveNameArch(arch)}${targetPart}-${version}${getArchiveSuffix(platform)}`;
}

export function parseSha256(content: string): string | null {
  const digest = content.trim();
  return SHA256_RE.test(digest) ? digest.toLowerCase() : null;
}

export class NightlyProvider extends SDKProvider {
  private readonly baseUrl: string = "https://gitcode.com/Cangjie/nightly_build/releases/download";

  private getAssetInfo(version: string, platform: string): { name: string; url: string } {
    const toolchain = parseToolchainKey(platform);
    const name = buildNightlySdkAssetName(toolchain.platform, toolchain.arch, toolchain.target, version);
    return {
      name,
      url: `${this.baseUrl}/${version}/${name}`,
    };
  }

  async isAvailable(_channel: string, version: string, platform: string): Promise<boolean> {
    const client = new http.HttpClient("setup-cangjie", undefined, {
      allowRedirects: false,
    });

    try {
      const { url } = this.getAssetInfo(version, platform);
      const response = await client.get(url);
      const status = response.message.statusCode ?? 0;
      response.message.resume();
      return status === 302 || (status >= 200 && status < 300);
    }
    catch {
      return false;
    }
  }

  private async fetchSha256(url: string): Promise<string> {
    const client = new http.HttpClient("setup-cangjie");

    try {
      const response = await client.get(`${url}.sha256`);
      if (response.message.statusCode !== 200) {
        response.message.resume();
        return "";
      }

      return parseSha256(await response.readBody()) ?? "";
    }
    catch {
      return "";
    }
  }

  async getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo> {
    const { name, url } = this.getAssetInfo(version, platform);
    const sha256 = await this.fetchSha256(url);

    return {
      name,
      sha256,
      size: 0,
      version,
      cacheVersion: `${version}-${platform}`,
      archiveCache: {
        channel,
        version,
        platform,
      },
      download: async (dest: string) => await tool.downloadTool(url, dest),
    };
  }
}
