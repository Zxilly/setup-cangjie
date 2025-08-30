import type { ObjectInfo } from "../api/gitcode";

export interface SDKConfig {
  name: string;
  sha256: string;
  url: string;
}

export interface SDKVersionConfig {
  [platform: string]: SDKConfig;
}

export interface ChannelConfig {
  versions: Record<string, SDKVersionConfig>;
  latest: string;
}

export interface SDKConfigRoot {
  channels: {
    sts: ChannelConfig;
    lts: ChannelConfig;
  };
}

export abstract class SDKProvider {
  abstract getObjectInfo(channel: string, version: string, platform: string): Promise<ObjectInfo>;
}