import type { ObjectInfo } from "./manager/sdk-manager";
import * as core from "@actions/core";
import { getSDKManager } from "./const";
import { useCacheOrDownload } from "./manager/download";
import { configure, test } from "./path";
import { detectCangjieVersion } from "./utils";

export async function action() {
  const channel = core.getInput("channel");
  if (channel !== "lts" && channel !== "sts") {
    core.setFailed("Invalid channel input, must be 'lts' or 'sts'");
    return;
  }

  let version = core.getInput("version");
  if (!version) {
    version = "latest";
  }
  if (version === "auto") {
    version = await detectCangjieVersion();
  }

  const archivePath = core.getInput("archive-path");

  try {
    const sdkManager = getSDKManager();

    const object: ObjectInfo = await sdkManager.getObjectInfo(channel, version);

    const dir = await useCacheOrDownload(object, archivePath);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
