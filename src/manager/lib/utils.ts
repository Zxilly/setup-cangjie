import { Buffer } from "node:buffer";
import * as path from "node:path";
import * as process from "node:process";

export function buildBasicAuthHeader(username: string, password: string) {
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export function mapHeader(header: Record<string, string>) {
  const ret: Record<string, string> = {};
  for (const key in header) {
    ret[key.toLowerCase()] = header[key];
  }
  return ret;
}

export function getRandomPath(): string {
  const tempDirectory = process.env.RUNNER_TEMP;
  if (!tempDirectory) {
    throw new Error("RUNNER_TEMP environment variable is not set");
  }

  return path.join(tempDirectory, crypto.randomUUID());
}
