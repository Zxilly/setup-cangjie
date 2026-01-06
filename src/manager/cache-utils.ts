import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { getArchiveNameArch } from "./lib/sys";

export function getCacheKey(channel: string, version: string, platform: string): string {
  return `cangjie-archive-${channel}-${version}-${platform}-${getArchiveNameArch()}`;
}

export function getCacheDir(): string {
  const base = process.env.RUNNER_TEMP || process.env.TEMP || "/tmp";
  return path.join(base, "cangjie-cache");
}

export async function cacheArchive(archivePath: string, channel: string, version: string, platform: string): Promise<void> {
  if (!cache.isFeatureAvailable()) {
    core.debug("GitHub Actions cache not available, skipping archive cache");
    return;
  }

  // Verify source archive exists before attempting to cache
  if (!fs.existsSync(archivePath)) {
    core.warning(`Source archive does not exist, skipping cache: ${archivePath}`);
    return;
  }

  const cacheKey = getCacheKey(channel, version, platform);
  const cacheDir = getCacheDir();
  const cachedArchivePath = path.join(cacheDir, `${cacheKey}.archive`);

  core.debug(`Caching archive: ${archivePath} -> ${cachedArchivePath}`);

  // Ensure cache directory exists
  fs.mkdirSync(cacheDir, { recursive: true });

  // Copy archive to cache location
  fs.copyFileSync(archivePath, cachedArchivePath);

  // Verify copy succeeded before saving to cache
  if (!fs.existsSync(cachedArchivePath)) {
    core.warning(`Failed to copy archive to cache location: ${cachedArchivePath}`);
    return;
  }

  try {
    const cacheId = await cache.saveCache([cachedArchivePath], cacheKey);
    core.info(`Archive cached: ${cacheKey} with ID ${cacheId}`);
  }
  catch (error) {
    core.warning(`Failed to save archive cache: ${error}`);
  }
}
