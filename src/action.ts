import type { ObjectInfo } from "./manager/sdk-manager";
import * as core from "@actions/core";
import { getSDKManager } from "./const";
import { useCacheOrDownload } from "./manager/download";
import { configure, test } from "./path";
import { detectCangjieVersion } from "./utils";

export async function action() {
  let channel = core.getInput("channel");
  let version = core.getInput("version");
  const archivePath = core.getInput("archive-path");

  if (channel !== "lts" && channel !== "sts" && channel !== "nightly") {
    core.setFailed("Invalid channel input, must be 'lts', 'sts' or 'nightly'");
    return;
  }

  try {
    const sdkManager = getSDKManager();

    if (version === "auto") {
      const detectedVersion = await detectCangjieVersion();

      if (detectedVersion) {
        // If detected a specific version, try to resolve channel
        core.info(`Auto-detected version: ${detectedVersion}, resolving channel...`);
        version = detectedVersion;
        channel = await sdkManager.resolveChannel(detectedVersion);
        core.info(`Resolved channel: ${channel}`);
      }
      else {
        // No version detected, check if nightly before defaulting to latest
        if (channel === "nightly") {
          core.setFailed("Nightly channel requires a specific version, 'auto' without cjc-version in cjpm.toml is not supported");
          return;
        }
        core.info("No version detected, using latest");
        version = "latest";
      }
    }

    if (channel === "nightly" && version === "latest") {
      core.setFailed("Nightly channel requires a specific version, 'latest' is not supported");
      return;
    }

    const object: ObjectInfo = await sdkManager.getObjectInfo(channel, version);

    const dir = await useCacheOrDownload(object, archivePath);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
