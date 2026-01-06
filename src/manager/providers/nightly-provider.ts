import type { ObjectInfo } from "./base-provider";
import * as process from "node:process";
import * as http from "@actions/http-client";
import * as tool from "@actions/tool-cache";
import { cacheArchive } from "../cache-utils";
import { getArchiveNameArch, getArchiveSuffix } from "../lib/sys";
import { SDKProvider } from "./base-provider";

export class NightlyProvider extends SDKProvider {
  private readonly baseUrl: string = "https://gitcode.com/Cangjie/nightly_build/releases/download";

  private getPlatformName(): string {
    switch (process.platform) {
      case "win32":
        return "windows";
      case "darwin":
        return "mac";
      case "linux":
        return "linux";
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  async isAvailable(_channel: string, version: string, _platform: string): Promise<boolean> {
    const probeUrl = `${this.baseUrl}/${version}/cangjie-docs-html-${version}.tar.gz`;

    const client = new http.HttpClient("setup-cangjie", undefined, {
      allowRedirects: false,
    });

    try {
      const response = await client.get(probeUrl);
      return response.message.statusCode === 302;
    }
    catch {
      return false;
    }
  }

  async getObjectInfo(_channel: string, version: string, _platform: string): Promise<ObjectInfo> {
    const platformName = this.getPlatformName();
    const archName = getArchiveNameArch();
    const ext = getArchiveSuffix();
    const fileName = `cangjie-sdk-${platformName}-${archName}-${version}${ext}`;
    const url = `${this.baseUrl}/${version}/${fileName}`;

    return {
      name: fileName,
      sha256: "",
      size: 0,
      version,
      download: async (dest: string) => {
        const downloadedPath = await tool.downloadTool(url, dest);

        try {
          await cacheArchive(downloadedPath, "nightly", version, `${process.platform}-${process.arch}`);
        }
        catch (error) {
          console.warn(`Failed to cache archive: ${error}`);
        }

        return downloadedPath;
      },
    };
  }
}
