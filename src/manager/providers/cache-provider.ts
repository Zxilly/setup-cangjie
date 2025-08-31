import type { ObjectInfo } from "../api/gitcode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { getArchiveNameArch } from "../lib/sys";
import { SDKProvider } from "./base-provider";

export class CacheProvider extends SDKProvider {
  async isAvailable(channel: string, version: string, platform: string): Promise<boolean> {
    // Check if GitHub Actions cache is available
    if (!cache.isFeatureAvailable()) {
      return false;
    }

    // Check if we have a cached archive for this combination
    const cacheKey = this.getCacheKey(channel, version, platform);
    const cachedArchivePath = await this.getCachedArchivePath(cacheKey);

    return cachedArchivePath !== null && fs.existsSync(cachedArchivePath);
  }

  async getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo> {
    // Generate cache key based on channel, version, and platform
    const cacheKey = this.getCacheKey(channel, version, platform);
    const cachedArchivePath = await this.getCachedArchivePath(cacheKey);

    if (cachedArchivePath && fs.existsSync(cachedArchivePath)) {
      core.info(`Using cached archive: ${cachedArchivePath}`);
      return {
        name: `cached-${channel}-${version}`,
        sha256: "",
        size: 0,
        version,
        download: async (dest: string) => {
          // Copy cached file to destination
          if (dest !== cachedArchivePath) {
            fs.copyFileSync(cachedArchivePath, dest);
          }
          return dest;
        },
      };
    }

    // No cache available
    return Promise.reject(new Error("No cached archive available"));
  }

  async cacheArchive(archivePath: string, channel: string, version: string, platform: string): Promise<void> {
    if (!cache.isFeatureAvailable()) {
      core.debug("GitHub Actions cache not available, skipping archive cache");
      return;
    }

    const cacheKey = this.getCacheKey(channel, version, platform);
    const cacheDir = this.getCacheDir();
    const cachedArchivePath = path.join(cacheDir, `${cacheKey}.archive`);

    // Ensure cache directory exists
    fs.mkdirSync(cacheDir, { recursive: true });

    // Copy archive to cache location
    fs.copyFileSync(archivePath, cachedArchivePath);

    try {
      const cacheId = await cache.saveCache([cachedArchivePath], cacheKey);
      core.info(`Archive cached: ${cacheKey} with ID ${cacheId}`);
    }
    catch (error) {
      core.warning(`Failed to save archive cache: ${error}`);
    }
  }

  private async getCachedArchivePath(cacheKey: string): Promise<string | null> {
    if (!cache.isFeatureAvailable()) {
      return null;
    }

    const cacheDir = this.getCacheDir();
    const cachedArchivePath = path.join(cacheDir, `${cacheKey}.archive`);

    // Ensure cache directory exists
    fs.mkdirSync(cacheDir, { recursive: true });

    const cacheHit = await cache.restoreCache([cachedArchivePath], cacheKey);
    if (cacheHit && fs.existsSync(cachedArchivePath)) {
      core.info(`Cache hit: ${cacheHit}`);
      return cachedArchivePath;
    }

    return null;
  }

  private getCacheKey(channel: string, version: string, platform: string): string {
    return `cangjie-archive-${channel}-${version}-${platform}-${getArchiveNameArch()}`;
  }

  private getCacheDir(): string {
    const base = process.env.RUNNER_TEMP || process.env.TEMP || "/tmp";
    return path.join(base, "cangjie-cache");
  }
}
