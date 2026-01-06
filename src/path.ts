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
  let command: string;
  let envSetupPath: string;

  if (process.platform === "win32") {
    envSetupPath = path.join(cjBase, "envsetup.ps1");
    command = `powershell -NoProfile -ExecutionPolicy Bypass -Command ". '${envSetupPath}'; Get-ChildItem Env: | ForEach-Object { \\"$($_.Name)=$($_.Value)\\" }"`;
  }
  else {
    envSetupPath = path.join(cjBase, "envsetup.sh");
    command = `bash -c 'source "${envSetupPath}" && env'`;
  }

  core.info(`Sourcing ${envSetupPath}`);

  const output = cp.execSync(command, {
    cwd: cjBase,
    encoding: "utf-8",
    env: process.env as Record<string, string>,
  });

  return parseEnv(output);
}

// Environment variables that should be skipped in the variables diff loop
const IGNORED_ENV_VARS = new Set([
  // Path variables are handled separately above, skip them in the loop
  "PATH",
  "Path",
  // Shell internal variables that change naturally when sourcing scripts
  "PWD",
  "OLDPWD",
  "SHLVL",
  "_",
  "SHELL",
  "TERM",
  "COLUMNS",
  "LINES",
  "HOSTNAME",
  "HOST",
  "RANDOM",
  "SECONDS",
  // Prompt variables
  "PS1",
  "PS2",
  "PS3",
  "PS4",
  // Windows/PowerShell specific
  "PATHEXT",
  "PROMPT",
  "PSExecutionPolicyPreference",
  "PSModulePath",
  "COMSPEC",
  "__COMPAT_LAYER",
]);

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
    if (IGNORED_ENV_VARS.has(key)) {
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
