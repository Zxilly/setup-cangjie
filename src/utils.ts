import { Buffer } from "node:buffer";
import * as cp from "node:child_process";
import * as core from "@actions/core";

export function buildBasicAuthHeader(username: string, password: string) {
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export function printCommand(command: string) {
  const output = cp.execSync(command).toString();
  core.info(output);
}

// map all key to lower case
export function mapHeader(header: Record<string, string>) {
  const ret: Record<string, string> = {};
  for (const key in header) {
    ret[key.toLowerCase()] = header[key];
  }
  return ret;
}
