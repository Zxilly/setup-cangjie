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
    name: "Cangjie-0.53.13-windows_x64.zip",
    sha256: "C25D2B50E0F5AAE54CBDAFE3BE24A84C9B1E27A243B573FDC585963E4DEDDC56",
    size: 328.84 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.13-windows_x64.zip&objectKey=6719f1e13af6947e3c6af326`),
    version: "0.53.13",
  },
  "darwin-arm64": {
    name: "Cangjie-0.53.13-darwin_aarch64.tar.gz",
    sha256: "93D0CBFBE318F6A714A37BBCC3707E0070E830F35B85C228E92D358F68CA28C6",
    size: 169.46 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.13-darwin_aarch64.tar.gz&objectKey=6719f1b33af6947e3c6af322`),
    version: "0.53.13",
  },
  "darwin-x64": {
    name: "Cangjie-0.53.13-darwin_x64.tar.gz",
    sha256: "CCE692D7E338F3547D283CD68FB29EDC8AB0747CAC7E6A7702452FABFAA6B918",
    size: 178.86 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.13-darwin_x64.tar.gz&objectKey=6719f1c13af6947e3c6af325`),
    version: "0.53.13",
  },
  "linux-arm64": {
    name: "Cangjie-0.53.13-linux_aarch64.tar.gz",
    sha256: "9B4027B6FB4DFFC34D98B26AAE30F51329A32EE423B7ADC1D35349AAEC74FF9A",
    size: 382.74 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.13-linux_aarch64.tar.gz&objectKey=6719f1ec3af6947e3c6af328`),
    version: "0.53.13",
  },
  "linux-x64": {
    name: "Cangjie-0.53.13-linux_x64.tar.gz",
    sha256: "B3C0087DB26005F6316767FD7CCBFC40F721CFD2D092F94BF39A621C7D91FBBB",
    size: 371.22 * 1024 * 1024,
    download: getDownloader(`${BASE_URL}/v1/files/auth/downLoad?nsId=142267&fileName=Cangjie-0.53.13-linux_x64.tar.gz&objectKey=6719f1eb3af6947e3c6af327`),
    version: "0.53.13",
  },
};

export function getSTSObjectInfo() {
  return STS_DOWNLOADS[`${process.platform}-${process.arch}`];
}
