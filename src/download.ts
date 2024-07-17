import * as process from "node:process";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
import type { LFSObject } from "./interface";
import { mapHeader } from "./utils";

const toolName = "cangjie";

async function downloadAndExtract(obj: LFSObject) {
  const dl = obj.actions.download;

  core.debug(`Downloading ${obj.oid} from ${dl.href}`);
  const downloadPath = await tool.downloadTool(dl.href, undefined, undefined, mapHeader(dl.header));
  const extractor = process.platform === "win32" ? tool.extractZip : tool.extractTar;

  core.debug(`Extracting ${downloadPath}`);
  const extractedPath = await extractor(downloadPath);
  core.debug(`Extracted to ${extractedPath}`);

  core.debug(`Caching ${extractedPath}`);
  const cacheDir = await tool.cacheDir(extractedPath, toolName, obj.oid);
  core.debug(`Cached to ${cacheDir}`);

  return cacheDir;
}

export async function useCacheOrDownload(obj: LFSObject) {
  const version = obj.oid;

  const oldCacheDir = tool.find(toolName, version);
  if (oldCacheDir) {
    // tool version found in cache
    return oldCacheDir;
  }

  return await downloadAndExtract(obj);
}
