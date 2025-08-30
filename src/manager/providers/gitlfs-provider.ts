import type { ObjectInfo } from "../api/gitcode";
import { SDKProvider } from "./base-provider";
import { getGitLFSObject } from "../api/gitcode";

export class GitLFSProvider extends SDKProvider {
  private readonly token: string;

  constructor(token: string) {
    super();
    this.token = token;
  }

  async getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo> {
    if (channel !== "canary") {
      throw new Error(`GitLFS provider only supports canary channel, got: ${channel}`);
    }
    return await getGitLFSObject(this.token, version);
  }

  async getSupportedVersions(channel: string): Promise<string[]> {
    throw new Error("GitLFS provider does not support listing versions");
  }

  async getLatestVersion(channel: string): Promise<string> {
    return "latest";
  }
}