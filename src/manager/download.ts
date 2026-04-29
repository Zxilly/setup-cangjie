import type { ObjectInfo } from "./sdk-manager";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
import { cacheArchive } from "./cache-utils";
import { getArchiveNameArch } from "./lib/sys";
import { getRandomPath } from "./lib/utils";

const toolName = "cangjie";

async function extractArchive(archivePath: string, version: string): Promise<string> {
  const extractor = process.platform === "win32" ? tool.extractZip : tool.extractTar;

  core.debug(`Extracting ${archivePath}`);
  const extractedPath = await extractor(archivePath);
  core.debug(`Extracted to ${extractedPath}`);

  core.debug(`Caching to tool cache: ${extractedPath}`);
  const cacheDir = await tool.cacheDir(extractedPath, toolName, version, getArchiveNameArch());
  core.debug(`Tool cached to ${cacheDir}`);

  return cacheDir;
}

async function calculateSha256(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function verifySha256(filePath: string, expectedSha256: string): Promise<void> {
  if (expectedSha256 === "") {
    return;
  }

  const actualSha256 = await calculateSha256(filePath);
  if (actualSha256.toLowerCase() !== expectedSha256.toLowerCase()) {
    throw new Error(`SHA256 mismatch for downloaded SDK: expected ${expectedSha256}, got ${actualSha256}`);
  }

  core.info(`Verified SDK SHA256: ${actualSha256}`);
}

export async function useCacheOrDownload(obj: ObjectInfo, archivePath: string): Promise<string> {
  const version = obj.cacheVersion ?? obj.version ?? obj.sha256;

  // If archive path is empty, generate a random path
  // Otherwise, resolve to absolute path to avoid working directory issues
  if (archivePath === "") {
    archivePath = getRandomPath();
  }
  else if (!path.isAbsolute(archivePath)) {
    archivePath = path.resolve(archivePath);
  }

  // Check if we already have a cached version in tool cache
  const cachedDir = tool.find(toolName, version, getArchiveNameArch());
  if (cachedDir) {
    core.info(`Using existing tool cache: ${cachedDir}`);
    return cachedDir;
  }

  // Download the archive
  core.info(`Downloading SDK: ${obj.name}`);
  const downloadedPath = await obj.download(archivePath);
  await verifySha256(downloadedPath, obj.sha256);

  if (obj.archiveCache) {
    try {
      await cacheArchive(downloadedPath, obj.archiveCache.channel, obj.archiveCache.version, obj.archiveCache.platform);
    }
    catch (error) {
      // Don't fail the download if caching fails, just log it
      console.warn(`Failed to cache archive: ${error}`);
    }
  }

  // Extract the archive
  return await extractArchive(downloadedPath, version);
}
