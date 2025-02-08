import type { ObjectInfo } from "./gitcode";
import process from "node:process";
import * as tool from "@actions/tool-cache";

const BASE_URL = "https://cangjie-lang.cn";

function getDownloader(url: string) {
  return async () => {
    return await tool.downloadTool(url);
  };
}

const STS_DOWNLOADS: Record<string, ObjectInfo> = {
  "win32-x64": {
    name: "Cangjie-0.53.18-windows_x64.zip",
    sha256: "74080EFA705212C4E494A8C18D40293BED9CE3020EEC357C6A288FA6E6B4D379",
    size: 328.22 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.18-windows_x64.zip&objectKey=67a2c8a26a75297d1cdc1d4e`),
    version: "0.53.18",
  },
  "darwin-arm64": {
    name: "Cangjie-0.53.18-darwin_aarch64.tar.gz",
    sha256: "0044B6810EF78B19EC451EF0514A8D4DE1634AE36E4680746E89B329B381991E",
    size: 162.46 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.18-darwin_aarch64.tar.gz&objectKey=67a2c88e6a75297d1cdc1d4b`),
    version: "0.53.18",
  },
  "darwin-x64": {
    name: "Cangjie-0.53.18-darwin_x64.tar.gz",
    sha256: "2CE777C02C5C0C264CE6A2A1BBAF46ED981698C43CD967B096D2ECC116C29801",
    size: 182.13 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.18-darwin_x64.tar.gz&objectKey=67a2c8976a75297d1cdc1d4d`),
    version: "0.53.18",
  },
  "linux-arm64": {
    name: "Cangjie-0.53.18-linux_aarch64.tar.gz",
    sha256: "071ABDB83D9FFA6F070C6ABCC8D08FA1F8AC3F4381BAB64560D0399B3AF17EEE",
    size: 384.31 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.18-linux_aarch64.tar.gz&objectKey=67a2c8606a75297d1cdc1d48`),
    version: "0.53.18",
  },
  "linux-x64": {
    name: "Cangjie-0.53.18-linux_x64.tar.gz",
    sha256: "8A9EF6B3BA5C58696A1E23FAB8FF5DCA3E6BC8BACF2A0A894BBA4296C54C8DB1",
    size: 369.51 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.18-linux_x64.tar.gz&objectKey=67a2c8976a75297d1cdc1d4c`),
    version: "0.53.18",
  },
};

export function getSTSObjectInfo() {
  return STS_DOWNLOADS[`${process.platform}-${process.arch}`];
}
