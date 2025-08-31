import type { ObjectInfo } from "./api/gitcode";
import * as process from "node:process";
import { CacheProvider } from "./providers/cache-provider";
import { GitHubJSONProvider } from "./providers/github-json-provider";
import { GitLFSProvider } from "./providers/gitlfs-provider";

export class SDKManager {
  private cacheProvider: CacheProvider;
  private githubProvider: GitHubJSONProvider;
  private gitlfsProvider: GitLFSProvider | null = null;

  constructor() {
    this.cacheProvider = new CacheProvider();
    this.githubProvider = new GitHubJSONProvider();
  }

  setGitLFSProvider(token: string): void {
    this.gitlfsProvider = new GitLFSProvider(token);
  }

  async getObjectInfo(channel: string, version: string): Promise<ObjectInfo> {
    const platform = `${process.platform}-${process.arch}`;

    // First try cache if available
    if (await this.cacheProvider.isAvailable(channel, version, platform)) {
      const cachedInfo = await this.cacheProvider.getObjectInfo(channel, version, platform);
      return cachedInfo;
    }

    // Then try appropriate provider based on channel
    let objectInfo: ObjectInfo;
    if (channel === "canary") {
      if (!this.gitlfsProvider || !await this.gitlfsProvider.isAvailable(channel, version, platform)) {
        throw new Error("GitLFS provider not available for canary channel");
      }
      objectInfo = await this.gitlfsProvider.getObjectInfo(channel, version, platform);
    }
    else {
      if (!await this.githubProvider.isAvailable(channel, version, platform)) {
        throw new Error(`GitHub provider not available for channel: ${channel}, version: ${version}, platform: ${platform}`);
      }
      objectInfo = await this.githubProvider.getObjectInfo(channel, version, platform);
    }

    // Cache the downloaded archive after successful download
    const originalDownload = objectInfo.download;
    objectInfo.download = async (dest: string) => {
      const downloadedPath = await originalDownload(dest);

      // Cache the archive file for future use
      await this.cacheProvider.cacheArchive(downloadedPath, channel, version, platform);

      return downloadedPath;
    };

    return objectInfo;
  }
}
