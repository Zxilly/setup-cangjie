import type { ObjectInfo } from "./manager/api/gitcode";
import * as core from "@actions/core";
import { getSDKManager } from "./const";
import { useCacheOrDownload } from "./manager/download";
import { configure, test } from "./path";
import { detectCangjieVersion } from "./utils";

export async function action() {
  const channel = core.getInput("channel");
  if (channel !== "lts" && channel !== "sts" && channel !== "canary") {
    core.setFailed("Invalid channel input, must be 'lts', 'sts' or 'canary'");
    return;
  }

  const token = core.getInput("token");
  if (channel === "canary" && !token) {
    core.setFailed("Missing token input for canary channel");
    return;
  }

  let version = core.getInput("version");
  if (!version) {
    version = "latest";
  }
  if (version === "auto") {
    version = await detectCangjieVersion();
  }

  const toolCache = core.getBooleanInput("tool-cache");
  const archivePath = core.getInput("archive-path");

  try {
    const sdkManager = getSDKManager();

    if (channel === "canary") {
      sdkManager.setGitLFSProvider(token);
    }

    const object: ObjectInfo = await sdkManager.getObjectInfo(channel, version);

    const dir = await useCacheOrDownload(object, toolCache, archivePath);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
