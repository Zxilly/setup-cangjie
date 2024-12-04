import type { ObjectInfo } from "./gitcode";
import * as core from "@actions/core";
import { getSTSObjectInfo } from "./const";
import { useCacheOrDownload } from "./download";
import { getGitLFSObject } from "./gitcode";
import { configure, test } from "./path";

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

  try {
    let object: ObjectInfo;
    if (channel === "sts") {
      object = getSTSObjectInfo();
    }
    else {
      object = await getGitLFSObject(token);
    }

    const dir = await useCacheOrDownload(object);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
