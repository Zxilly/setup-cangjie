import type {ObjectInfo} from "./gitcode";
import process from "node:process";
import * as tool from "@actions/tool-cache";

const BASE_URL = "https://cangjie-lang.cn/v1/files/auth/downLoad";

function getDownloader(url: string) {
  return async (dest: string) => {
    return await tool.downloadTool(url, dest);
  };
}

const STS_0_53_13: Record<string, ObjectInfo> = {
  "win32-x64": {
    name: "Cangjie-0.53.13-windows_x64.zip",
    sha256: "C25D2B50E0F5AAE54CBDAFE3BE24A84C9B1E27A243B573FDC585963E4DEDDC56",
    size: 328.84 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.13-windows_x64.zip&objectKey=6719f1e13af6947e3c6af326`),
    version: "0.53.13",
  },
  "darwin-arm64": {
    name: "Cangjie-0.53.13-darwin_aarch64.tar.gz",
    sha256: "93D0CBFBE318F6A714A37BBCC3707E0070E830F35B85C228E92D358F68CA28C6",
    size: 169.46 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.13-darwin_aarch64.tar.gz&objectKey=6719f1b33af6947e3c6af322`),
    version: "0.53.13",
  },
  "darwin-x64": {
    name: "Cangjie-0.53.13-darwin_x64.tar.gz",
    sha256: "CCE692D7E338F3547D283CD68FB29EDC8AB0747CAC7E6A7702452FABFAA6B918",
    size: 178.86 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.13-darwin_x64.tar.gz&objectKey=6719f1c13af6947e3c6af325`),
    version: "0.53.13",
  },
  "linux-arm64": {
    name: "Cangjie-0.53.13-linux_aarch64.tar.gz",
    sha256: "9B4027B6FB4DFFC34D98B26AAE30F51329A32EE423B7ADC1D35349AAEC74FF9A",
    size: 382.74 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.13-linux_aarch64.tar.gz&objectKey=6719f1ec3af6947e3c6af328`),
    version: "0.53.13",
  },
  "linux-x64": {
    name: "Cangjie-0.53.13-linux_x64.tar.gz",
    sha256: "B3C0087DB26005F6316767FD7CCBFC40F721CFD2D092F94BF39A621C7D91FBBB",
    size: 371.22 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.13-linux_x64.tar.gz&objectKey=6719f1eb3af6947e3c6af327`),
    version: "0.53.13",
  },
};

const STS_0_53_18: Record<string, ObjectInfo> = {
  "win32-x64": {
    name: "Cangjie-0.53.18-windows_x64.zip",
    sha256: "74080EFA705212C4E494A8C18D40293BED9CE3020EEC357C6A288FA6E6B4D379",
    size: 328.22 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.18-windows_x64.zip&objectKey=67a2c8a26a75297d1cdc1d4e`),
    version: "0.53.18",
  },
  "darwin-arm64": {
    name: "Cangjie-0.53.18-darwin_aarch64.tar.gz",
    sha256: "0044B6810EF78B19EC451EF0514A8D4DE1634AE36E4680746E89B329B381991E",
    size: 162.46 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.18-darwin_aarch64.tar.gz&objectKey=67a2c88e6a75297d1cdc1d4b`),
    version: "0.53.18",
  },
  "darwin-x64": {
    name: "Cangjie-0.53.18-darwin_x64.tar.gz",
    sha256: "2CE777C02C5C0C264CE6A2A1BBAF46ED981698C43CD967B096D2ECC116C29801",
    size: 182.13 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.18-darwin_x64.tar.gz&objectKey=67a2c8976a75297d1cdc1d4d`),
    version: "0.53.18",
  },
  "linux-arm64": {
    name: "Cangjie-0.53.18-linux_aarch64.tar.gz",
    sha256: "071ABDB83D9FFA6F070C6ABCC8D08FA1F8AC3F4381BAB64560D0399B3AF17EEE",
    size: 384.31 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.18-linux_aarch64.tar.gz&objectKey=67a2c8606a75297d1cdc1d48`),
    version: "0.53.18",
  },
  "linux-x64": {
    name: "Cangjie-0.53.18-linux_x64.tar.gz",
    sha256: "8A9EF6B3BA5C58696A1E23FAB8FF5DCA3E6BC8BACF2A0A894BBA4296C54C8DB1",
    size: 369.51 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}?nsId=142267&fileName=Cangjie-0.53.18-linux_x64.tar.gz&objectKey=67a2c8976a75297d1cdc1d4c`),
    version: "0.53.18",
  },
};

const STS_DOWNLOADS: Record<string, Record<string, ObjectInfo>> = {
  "0.53.13": STS_0_53_13,
  "0.53.18": STS_0_53_18,
};

export function getSTSObjectInfo(version: string) {
  if (version === "latest") {
    version = "0.53.18";
  }

  const versionInfo = STS_DOWNLOADS[version];
  if (!versionInfo) {
    throw new Error(`Unsupported STS version: ${version}`);
  }

  const info = versionInfo[`${process.platform}-${process.arch}`];
  if (!info) {
    throw new Error(`Unsupported platform: ${process.platform}-${process.arch}`);
  }
  return info;
}
