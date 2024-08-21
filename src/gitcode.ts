import * as http from "@actions/http-client";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";
import type { BlobRoot, GitLFSResponseRoot, TreeRoot, UserRoot } from "./interface";
import { getSDKFileSuffix, getTargetRepo } from "./sys";
import { buildBasicAuthHeader, mapHeader } from "./utils";

const ACCESS_TOKEN_NAME = "access_token";

function getAuthedUrl(token: string): (url: string) => string {
  return (url: string) => {
    return `${url}?${ACCESS_TOKEN_NAME}=${token}`;
  };
}

export interface ObjectInfo {
  name: string;
  sha256: string;
  size: number;
  download: () => Promise<string>;
}

export async function getGitLFSObject(token: string): Promise<ObjectInfo> {
  const client = new http.HttpClient("setup-cangjie");
  const auther = getAuthedUrl(token);

  // https://api.gitcode.com/api/v5/user
  core.debug("Fetching user");
  const user = (await client.getJson<UserRoot>(auther("https://api.gitcode.com/api/v5/user"))).result;
  if (!user) {
    throw new Error("Failed to fetch user");
  }
  // prepare for git lfs
  const login = user.login;

  // https://api.gitcode.com/api/v5/repos/{owner}/{repo}/git/trees/{sha}
  const repo = getTargetRepo();

  core.debug(`Fetching repo tree: ${repo}`);
  const url = auther(`https://api.gitcode.com/api/v5/repos/Cangjie/${repo}/git/trees/main`);
  const repoTree = (await client.getJson<TreeRoot>(url)).result;
  if (!repoTree) {
    throw new Error("Failed to fetch repo tree");
  }
  const suffix = getSDKFileSuffix();
  const targetFile = repoTree.tree.find(file => file.name.endsWith(suffix));
  if (!targetFile) {
    throw new Error(`Failed to find target file: ${suffix}`);
  }

  // https://api.gitcode.com/api/v5/repos/{owner}/{repo}/git/blobs/{sha}
  core.debug(`Fetching blob: ${targetFile.sha}`);
  const blobUrl = auther(`https://api.gitcode.com/api/v5/repos/Cangjie/${repo}/git/blobs/${targetFile.sha}`);
  const blob = (await client.getJson<BlobRoot>(blobUrl)).result;
  if (!blob) {
    throw new Error("Failed to fetch blob");
  }

  const content = atob(blob.content);

  const lines = content.split("\n");
  if (lines.length < 3) {
    throw new Error(`Unexpected content: ${content}`);
  }

  // request to git lfs
  const sha256 = lines[1].split(" ")[1].substring(7);
  const size = lines[2].split(" ")[1];

  core.info(`Fetching ${targetFile.name}`);
  core.info(`Sha256: ${sha256}`);
  core.info(`Size: ${size}`);

  return {
    name: targetFile.name,
    sha256,
    size: Number.parseInt(size),
    download: async (): Promise<string> => {
      const lfsUrl = `https://gitcode.com/Cangjie/${repo}.git/info/lfs/objects/batch`;

      core.debug(`Fetching lfs object: ${sha256}`);
      const payload
        = {
          operation: "download",
          transfers: ["basic"],
          ref: { name: "refs/heads/main" },
          objects: [
            {
              oid: sha256,
              size: Number.parseInt(size),
            },
          ],
          hash_algo: "sha256",
        };
      const lfsResult = (await client.postJson<GitLFSResponseRoot>(
        lfsUrl,
        payload,
        {
          "accept": "application/vnd.git-lfs+json",
          "content-type": "application/vnd.git-lfs+json",
          "authorization": buildBasicAuthHeader(login, token),
        },
      )).result;
      if (!lfsResult) {
        throw new Error("Failed to fetch lfs result");
      }

      const o = lfsResult.objects[0];
      const dl = o.actions.download;

      core.debug(`Downloading ${o.oid} from ${dl.href}`);
      return await tool.downloadTool(dl.href, undefined, undefined, mapHeader(dl.header));
    },
  };
}
