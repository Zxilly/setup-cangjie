import type { ObjectInfo } from "./gitcode";
import path from "node:path";
import * as process from "node:process";
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
import { getArchiveNameArch } from "./sys";

const toolName = "cangjie";

async function extractAndMovetoCache(p: string, ver: string): Promise<string> {
  const extractor = process.platform === "win32" ? tool.extractZip : tool.extractTar;

  core.debug(`Extracting ${p}`);
  const extractedPath = await extractor(p);
  core.debug(`Extracted to ${extractedPath}`);

  core.debug(`Caching ${extractedPath}`);
  const cacheDir = await tool.cacheDir(extractedPath, toolName, ver, getArchiveNameArch());
  core.debug(`Cached to ${cacheDir}`);

  return cacheDir;
}

export async function useCacheOrDownload(obj: ObjectInfo): Promise<string> {
  const version = obj.sha256;

  const oldCacheDir = tool.find(toolName, version, getArchiveNameArch());
  if (oldCacheDir) {
    // tool version found in cache
    return oldCacheDir;
  }

  const cacheKey = `cangjie-sdk-${obj.sha256}-${process.platform}-${getArchiveNameArch()}`;

  const installTarget = getToolDir(version);

  async function downloadAndExtract() {
    const archivePath = await obj.download();
    const realInstall = await extractAndMovetoCache(archivePath, version);
    if (realInstall !== installTarget) {
      throw new Error(`Unexpected install target: ${realInstall}`);
    }
  }

  if (!cache.isFeatureAvailable()) {
    await downloadAndExtract();
  }
  else {
    const oldKey = await cache.restoreCache([
      installTarget,
    ], cacheKey);
    if (!oldKey) {
      await downloadAndExtract();
      const cacheId = await cache.saveCache([installTarget], cacheKey);
      core.info(`Cache saved: ${cacheKey} with ID ${cacheId}`);
    }
    else {
      core.info(`Cache hit: ${oldKey}`);
    }
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
