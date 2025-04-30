import type { TomlPrimitive } from "smol-toml";
import { Buffer } from "node:buffer";
import * as cp from "node:child_process";
import { readFile } from "node:fs/promises";
import * as core from "@actions/core";
import * as glob from "@actions/glob";
import { parse } from "smol-toml";

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

export async function detectCangjieVersion(): Promise<string> {
  const globber = await glob.create("**/cjpm.toml");

  for await (const file of globber.globGenerator()) {
    const content = await readFile(file, { encoding: "utf-8" });

    const obj = parse(content);
    const pkg = obj.package;
    if (typeof pkg !== "object") {
      core.warning(`Invalid package object in ${file}`);
      continue;
    }

    const ver = (pkg as { [key: string]: TomlPrimitive })["cjc-version"];
    if (typeof ver === "string") {
      core.info(`Detected cjc version: ${ver}`);
      return ver;
    }
  }

  core.warning("No version detected, defaulting to latest");
  return "latest";
}
