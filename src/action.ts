import * as core from "@actions/core";
import { useCacheOrDownload } from "./download";
import { getGitLFSObject } from "./gitcode";
import { configure, test } from "./path";

export async function action() {
  const token = core.getInput("token");
  if (!token) {
    core.setFailed("Missing token input");
    return;
  }

  try {
    const object = await getGitLFSObject(token);

    const dir = await useCacheOrDownload(object);

    configure(dir);
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
