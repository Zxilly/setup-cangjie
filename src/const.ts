import { SDKManager } from "./manager";

const sdkManager = new SDKManager();

export function getSDKManager(): SDKManager {
  return sdkManager;
}
