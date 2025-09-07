import type { ObjectInfo } from "./base-provider";
import * as fs from "node:fs";
import * as path from "node:path";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { SDKProvider } from "./base-provider";
import { getCacheKey, getCacheDir, cacheArchive } from "../cache-utils";

export class CacheProvider extends SDKProvider {
  async isAvailable(channel: string, version: string, platform: string): Promise<boolean> {
    // Check if GitHub Actions cache is available
    if (!cache.isFeatureAvailable()) {
      return false;
    }

    // Check if we have a cached archive for this combination
    const cacheKey = getCacheKey(channel, version, platform);
    const cachedArchivePath = await this.getCachedArchivePath(cacheKey);

    return cachedArchivePath !== null && fs.existsSync(cachedArchivePath);
  }

  async getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo> {
    // Generate cache key based on channel, version, and platform
    const cacheKey = getCacheKey(channel, version, platform);
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

  private async getCachedArchivePath(cacheKey: string): Promise<string | null> {
    if (!cache.isFeatureAvailable()) {
      return null;
    }

    const cacheDir = getCacheDir();
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
}
