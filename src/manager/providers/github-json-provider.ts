import type { ObjectInfo } from "../api/gitcode";
import * as http from "@actions/http-client";
import * as tool from "@actions/tool-cache";
import { SDKProvider, type SDKConfigRoot } from "./base-provider";

export class GitHubJSONProvider extends SDKProvider {
  private config: SDKConfigRoot | null = null;
  private readonly configUrl: string;

  constructor(configUrl: string = "https://raw.githubusercontent.com/Zxilly/setup-cangjie/master/sdk-versions.json") {
    super();
    this.configUrl = configUrl;
  }

  private async loadConfig(): Promise<SDKConfigRoot> {
    if (this.config) {
      return this.config;
    }

    const client = new http.HttpClient("setup-cangjie");
    const response = await client.get(this.configUrl);
    const body = await response.readBody();
    
    if (response.message.statusCode !== 200) {
      throw new Error(`Failed to fetch SDK config from ${this.configUrl}: ${response.message.statusCode}`);
    }

    this.config = JSON.parse(body) as SDKConfigRoot;
    return this.config;
  }

  async getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo> {
    const config = await this.loadConfig();
    
    const channelConfig = config.channels[channel as keyof typeof config.channels];
    if (!channelConfig) {
      throw new Error(`Unsupported channel: ${channel}`);
    }

    if (version === "latest") {
      version = channelConfig.latest;
    }

    const versionConfig = channelConfig.versions[version];
    if (!versionConfig) {
      throw new Error(`Unsupported ${channel} version: ${version}`);
    }

    const platformConfig = versionConfig[platform];
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      name: platformConfig.name,
      sha256: platformConfig.sha256,
      size: 0,
      version,
      download: (dest: string) => {
        return tool.downloadTool(platformConfig.url, dest);
      },
    };
  }

  async getSupportedVersions(channel: string): Promise<string[]> {
    const config = await this.loadConfig();
    const channelConfig = config.channels[channel as keyof typeof config.channels];
    if (!channelConfig) {
      throw new Error(`Unsupported channel: ${channel}`);
    }
    return Object.keys(channelConfig.versions);
  }

  async getLatestVersion(channel: string): Promise<string> {
    const config = await this.loadConfig();
    const channelConfig = config.channels[channel as keyof typeof config.channels];
    if (!channelConfig) {
      throw new Error(`Unsupported channel: ${channel}`);
    }
    return channelConfig.latest;
  }
}