import type { ObjectInfo } from "./gitcode";
import * as core from "@actions/core";
import { getSTSObjectInfo } from "./const";
import { useCacheOrDownload } from "./download";
import { getGitLFSObject } from "./gitcode";
import { configure, test } from "./path";
import { detectCangjieVersion, getRandomPath } from "./utils";

export async function action() {
  const channel = core.getInput("channel");
  if (channel !== "sts" && channel !== "canary") {
    core.setFailed("Invalid channel input, must be 'sts' or 'canary'");
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
    let object: ObjectInfo;
    if (channel === "sts") {
      object = getSTSObjectInfo(version);
    }
    else {
      object = await getGitLFSObject(token, version);
    }

    const dir = await useCacheOrDownload(object, toolCache, archivePath);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
