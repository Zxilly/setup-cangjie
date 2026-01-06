import * as cp from "node:child_process";
import path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as io from "@actions/io";
import { parse as parseEnv } from "dotenv";
import { printCommand } from "./utils";

interface EnvChanges {
  path: string[];
  variables: Record<string, string>;
}

function getEnvSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      snapshot[key] = value;
    }
  }
  return snapshot;
}

function sourceEnvSetup(cjBase: string): Record<string, string> {
  const envSetupPath = path.join(cjBase, "envsetup.sh");
  core.info(`Sourcing ${envSetupPath}`);

  const output = cp.execSync(`bash -c 'source "${envSetupPath}" && env'`, {
    cwd: cjBase,
    encoding: "utf-8",
    env: process.env as Record<string, string>,
  });

  return parseEnv(output);
}

function diffEnv(before: Record<string, string>, after: Record<string, string>): EnvChanges {
  const changes: EnvChanges = {
    path: [],
    variables: {},
  };

  const pathKey = process.platform === "win32" ? "Path" : "PATH";
  const beforePath = before[pathKey] || "";
  const afterPath = after[pathKey] || "";

  if (afterPath !== beforePath) {
    const beforePaths = new Set(beforePath.split(path.delimiter).filter(p => p));
    const afterPaths = afterPath.split(path.delimiter).filter(p => p);

    for (const p of afterPaths) {
      if (!beforePaths.has(p)) {
        changes.path.push(p);
      }
    }
  }

  for (const [key, value] of Object.entries(after)) {
    if (key === pathKey || key === "PATH" || key === "Path") {
      continue;
    }
    if (before[key] !== value) {
      changes.variables[key] = value;
    }
  }

  return changes;
}

function applyChangesToGitHub(changes: EnvChanges): void {
  for (const p of changes.path) {
    core.info(`Adding to PATH: ${p}`);
    core.addPath(p);
  }

  for (const [key, value] of Object.entries(changes.variables)) {
    core.info(`Setting ${key}`);
    core.exportVariable(key, value);
  }
}

export function configure(dir: string) {
  core.info("Configuring environment");

  const cjBase = path.join(dir, "cangjie");

  const before = getEnvSnapshot();
  const after = sourceEnvSetup(cjBase);
  const changes = diffEnv(before, after);

  applyChangesToGitHub(changes);

  core.info("Environment configured");
}

export async function test() {
  const which = await io.which("cjc");
  core.info(`Found cjc at ${which}`);

  printCommand("cjc --version");
}
