import * as process from "node:process";
import * as core from "@actions/core";
import { cacheArchive } from "./cache-utils";
import { CacheProvider } from "./providers/cache-provider";
import { JSONProvider } from "./providers/json-provider";
import { NightlyProvider } from "./providers/nightly-provider";

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
  private nightlyProvider: NightlyProvider;

  constructor() {
    this.cacheProvider = new CacheProvider();
    this.jsonProvider = new JSONProvider();
    this.nightlyProvider = new NightlyProvider();
  }

  async cacheArchive(archivePath: string, channel: string, version: string, platform: string): Promise<void> {
    await cacheArchive(archivePath, channel, version, platform);
  }

  async resolveChannel(version: string): Promise<string> {
    const platform = `${process.platform}-${process.arch}`;

    // Try LTS first
    core.info(`Checking if version ${version} exists in LTS channel...`);
    const ltsVersion = await this.jsonProvider.resolveVersion("lts", version);
    if (ltsVersion && await this.jsonProvider.isAvailable("lts", ltsVersion, platform)) {
      core.info(`Found version ${version} in LTS channel`);
      return "lts";
    }
    core.info(`Version ${version} not found in LTS channel`);

    // Try STS
    core.info(`Checking if version ${version} exists in STS channel...`);
    const stsVersion = await this.jsonProvider.resolveVersion("sts", version);
    if (stsVersion && await this.jsonProvider.isAvailable("sts", stsVersion, platform)) {
      core.info(`Found version ${version} in STS channel`);
      return "sts";
    }
    core.info(`Version ${version} not found in STS channel`);

    // Try Nightly
    core.info(`Checking if version ${version} exists in Nightly channel...`);
    if (await this.nightlyProvider.isAvailable("nightly", version, platform)) {
      core.info(`Found version ${version} in Nightly channel`);
      return "nightly";
    }
    core.info(`Version ${version} not found in Nightly channel`);

    throw new Error(`Version ${version} not found in any channel (lts, sts, nightly)`);
  }

  async getObjectInfo(channel: string, version: string): Promise<ObjectInfo> {
    const platform = `${process.platform}-${process.arch}`;

    if (channel !== "lts" && channel !== "sts" && channel !== "nightly") {
      throw new Error(`Unsupported channel: ${channel}. Only 'lts', 'sts' and 'nightly' are supported.`);
    }

    if (channel === "nightly") {
      if (!await this.nightlyProvider.isAvailable(channel, version, platform)) {
        throw new Error(`Nightly version not available: ${version}`);
      }

      if (await this.cacheProvider.isAvailable(channel, version, platform)) {
        const cachedInfo = await this.cacheProvider.getObjectInfo(channel, version, platform);
        return cachedInfo;
      }

      const objectInfo = await this.nightlyProvider.getObjectInfo(channel, version, platform);
      return objectInfo;
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
