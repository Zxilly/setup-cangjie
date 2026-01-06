import * as process from "node:process";
import { cacheArchive } from "./cache-utils";
import { CacheProvider } from "./providers/cache-provider";
import { JSONProvider } from "./providers/json-provider";

export interface ObjectInfo {
  name: string;
  sha256: string;
  size: number;
  download: (dest: string) => Promise<string>;
  version?: string;
}

export class SDKManager {
  private cacheProvider: CacheProvider;
  private jsonProvider: JSONProvider;

  constructor() {
    this.cacheProvider = new CacheProvider();
    this.jsonProvider = new JSONProvider();
  }

  async cacheArchive(archivePath: string, channel: string, version: string, platform: string): Promise<void> {
    await cacheArchive(archivePath, channel, version, platform);
  }

  async getObjectInfo(channel: string, version: string): Promise<ObjectInfo> {
    const platform = `${process.platform}-${process.arch}`;

    if (channel !== "lts" && channel !== "sts") {
      throw new Error(`Unsupported channel: ${channel}. Only 'lts' and 'sts' are supported.`);
    }

    const resolvedVersion = await this.jsonProvider.resolveVersion(channel, version);
    if (!resolvedVersion) {
      throw new Error(`Unsupported ${channel} version: ${version}`);
    }

    if (!await this.jsonProvider.isAvailable(channel, resolvedVersion, platform)) {
      throw new Error(`JSON provider not available for channel: ${channel}, version: ${resolvedVersion}, platform: ${platform}`);
    }

    if (await this.cacheProvider.isAvailable(channel, resolvedVersion, platform)) {
      const cachedInfo = await this.cacheProvider.getObjectInfo(channel, resolvedVersion, platform);
      return cachedInfo;
    }

    const objectInfo = await this.jsonProvider.getObjectInfo(channel, resolvedVersion, platform);
    return objectInfo;
  }
}
