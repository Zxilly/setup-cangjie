import type { ObjectInfo } from "./gitcode";
import path from "node:path";
import * as process from "node:process";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
import { getArchiveNameArch } from "./sys";
import { getRandomPath } from "./utils";

const toolName = "cangjie";

async function extractAndMovetoCache(p: string, ver: string, dest: string): Promise<string> {
  const extractor = process.platform === "win32" ? tool.extractZip : tool.extractTar;

  core.debug(`Extracting ${p}`);
  const extractedPath = await extractor(p);
  core.debug(`Extracted to ${extractedPath}`);

  core.debug(`Caching ${extractedPath}`);
  const cacheDir = await tool.cacheDir(extractedPath, toolName, ver, getArchiveNameArch());
  core.debug(`Cached to ${cacheDir}`);

  return cacheDir;
}

export async function useCacheOrDownload(obj: ObjectInfo, useToolCache: boolean, archivePath: string): Promise<string> {
  const version = obj.version ?? obj.sha256;

  const canSkipArchiveDownload = archivePath === "";
  if (canSkipArchiveDownload) {
    archivePath = getRandomPath();
  }

  const oldCacheDir = tool.find(toolName, version, getArchiveNameArch());
  if (oldCacheDir && !canSkipArchiveDownload) {
    // tool version found in cache
    return oldCacheDir;
  }

  const verName = [obj.version, obj.sha256].filter(Boolean).join("-");

  const cacheKey = `cangjie-sdk-${verName}-${process.platform}-${getArchiveNameArch()}`;
  const cacheArchiveKey = `cangjie-sdk-${verName}-${process.platform}-${getArchiveNameArch()}-archive`;

  const installTarget = getToolDir(version);

  async function downloadArchive(useCache: boolean): Promise<void> {
    if (useCache) {
      const oldArchiveFound = await cache.restoreCache(
        [archivePath],
        cacheArchiveKey,
      );
      if (oldArchiveFound) {
        core.info(`Cache hit for archive: ${cacheArchiveKey}`);
        return;
      }
    }

    await obj.download(archivePath);

    if (useCache) {
      await cache.saveCache([archivePath], cacheArchiveKey);
    }
  }

  if (!cache.isFeatureAvailable() || !useToolCache) {
    await downloadArchive(false);
    await extractAndMovetoCache(archivePath, version, installTarget);
    return installTarget;
  }
  if (!canSkipArchiveDownload) {
    await downloadArchive(true);
  }

  const oldKey = await cache.restoreCache([
    installTarget,
  ], cacheKey);

  if (!oldKey) {
    if (canSkipArchiveDownload) {
      await downloadArchive(true);
    }

    await extractAndMovetoCache(archivePath, version, installTarget);

    const cacheId = await cache.saveCache([installTarget], cacheKey);
    core.info(`Cache saved: ${cacheKey} with ID ${cacheId}`);
  }
  else {
    core.info(`Cache hit: ${oldKey}`);
  }

  return installTarget;
}

function getToolDir(ver: string): string {
  const base = process.env.RUNNER_TOOL_CACHE;
  if (!base) {
    throw new Error("RUNNER_TOOL_CACHE not set");
  }
  return path.join(
    base,
    toolName,
    ver,
    getArchiveNameArch(),
  );
}
