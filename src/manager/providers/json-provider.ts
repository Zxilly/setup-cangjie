import type { ObjectInfo, SDKConfigRoot } from "./base-provider";
import * as process from "node:process";
import * as http from "@actions/http-client";
import * as tool from "@actions/tool-cache";
import { SDKProvider } from "./base-provider";
import { cacheArchive } from "../cache-utils";

export class JSONProvider extends SDKProvider {
  private config: SDKConfigRoot | null = null;
  private readonly configUrl: string = "https://raw.githubusercontent.com/Zxilly/setup-cangjie/master/sdk-versions.json";

  constructor() {
    super();
  }

  async resolveVersion(channel: string, version: string): Promise<string | null> {
    const config = await this.loadConfig();
    
    const channelConfig = config.channels[channel as keyof typeof config.channels];
    if (!channelConfig) {
      return null;
    }

    if (version === "latest") {
      return channelConfig.latest;
    }
    
    // Check if the version exists in the channel
    if (!channelConfig.versions[version]) {
      return null;
    }
    
    return version;
  }

  async isAvailable(channel: string, version: string, platform: string): Promise<boolean> {
    try {
      const config = await this.loadConfig();
      const resolvedVersion = await this.resolveVersion(channel, version);
      
      if (!resolvedVersion) {
        return false;
      }

      const channelConfig = config.channels[channel as keyof typeof config.channels];
      const versionConfig = channelConfig.versions[resolvedVersion];
      const platformConfig = versionConfig[platform];
      
      return platformConfig !== undefined;
    }
    catch {
      return false;
    }
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
    const resolvedVersion = await this.resolveVersion(channel, version);
    
    if (!resolvedVersion) {
      throw new Error(`Unsupported ${channel} version: ${version}`);
    }

    const channelConfig = config.channels[channel as keyof typeof config.channels];
    const versionConfig = channelConfig.versions[resolvedVersion];
    
    const platformConfig = versionConfig[platform];
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      name: platformConfig.name,
      sha256: platformConfig.sha256,
      size: 0,
      version: resolvedVersion,
      download: async (dest: string) => {
        const downloadedPath = await tool.downloadTool(platformConfig.url, dest);
        
        try {
          await cacheArchive(downloadedPath, channel, resolvedVersion, platform);
        } catch (error) {
          // Don't fail the download if caching fails, just log it
          console.warn(`Failed to cache archive: ${error}`);
        }
        
        return downloadedPath;
      },
    };
  }
}