import type { ObjectInfo } from "../api/gitcode";
import { getGitLFSObject } from "../api/gitcode";
import { SDKProvider } from "./base-provider";

export class GitLFSProvider extends SDKProvider {
  private readonly token: string;

  constructor(token: string) {
    super();
    this.token = token;
  }

  async isAvailable(channel: string, _version: string, _platform: string): Promise<boolean> {
    // GitLFS provider is only available for canary channel and when token is provided
    return channel === "canary" && this.token.length > 0;
  }

  async getObjectInfo(channel: string, version: string, _platform: string): Promise<ObjectInfo> {
    if (channel !== "canary") {
      throw new Error(`GitLFS provider only supports canary channel, got: ${channel}`);
    }
    return await getGitLFSObject(this.token, version);
  }
}
