import type { ObjectInfo } from "./api/gitcode";
import * as process from "node:process";
import { GitHubJSONProvider } from "./providers/github-json-provider";
import { GitLFSProvider } from "./providers/gitlfs-provider";

export class SDKManager {
  private githubProvider: GitHubJSONProvider;
  private gitlfsProvider: GitLFSProvider | null = null;

  constructor(githubConfigUrl?: string) {
    this.githubProvider = new GitHubJSONProvider(githubConfigUrl);
  }

  setGitLFSProvider(token: string): void {
    this.gitlfsProvider = new GitLFSProvider(token);
  }

  async getObjectInfo(channel: string, version: string): Promise<ObjectInfo> {
    const platform = `${process.platform}-${process.arch}`;
    
    if (channel === "canary") {
      if (!this.gitlfsProvider) {
        throw new Error("GitLFS provider not configured for canary channel");
      }
      return await this.gitlfsProvider.getObjectInfo(channel, version, platform);
    }

    return await this.githubProvider.getObjectInfo(channel, version, platform);
  }
}