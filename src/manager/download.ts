import type { ObjectInfo } from "./sdk-manager";
import * as path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
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

export async function useCacheOrDownload(obj: ObjectInfo, archivePath: string): Promise<string> {
  const version = obj.version ?? obj.sha256;

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

  // Extract the archive
  return await extractArchive(downloadedPath, version);
}
