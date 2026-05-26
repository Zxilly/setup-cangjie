import type { CjvEnvsetup } from "./cjv";
import * as cp from "node:child_process";
import path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as io from "@actions/io";

export function uniquePathEntries(entries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of entries) {
    if (!entry) {
      continue;
    }
    const key = process.platform === "win32" ? entry.toLowerCase() : entry;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  return out;
}

export function envsetupPathEntries(envsetup: CjvEnvsetup): string[] {
  const entries = [
    ...envsetup.env.path.prepend,
    ...envsetup.env.path.append,
  ];
  return uniquePathEntries(entries);
}

export function mergePathValue(prepend: string[], existing = ""): string {
  const entries = uniquePathEntries([
    ...prepend,
    ...existing.split(path.delimiter).filter(Boolean),
  ]);
  return entries.join(path.delimiter);
}

function addPathEntries(entries: string[]): void {
  // core.addPath prepends to the current process PATH, so reverse to preserve
  // the requested order for commands run later in this action.
  for (const entry of [...entries].reverse()) {
    core.info(`Adding to PATH: ${entry}`);
    core.addPath(entry);
  }
}

export function applyEnvsetup(envsetup: CjvEnvsetup): void {
  for (const [key, value] of Object.entries(envsetup.env.vars)) {
    core.info(`Setting ${key}`);
    core.exportVariable(key, value);
  }

  if (envsetup.env.library_path.key && envsetup.env.library_path.prepend.length > 0) {
    const key = envsetup.env.library_path.key;
    const value = mergePathValue(envsetup.env.library_path.prepend, process.env[key] ?? "");
    core.info(`Setting ${key}`);
    core.exportVariable(key, value);
  }

  addPathEntries(envsetupPathEntries(envsetup));
}

export async function test() {
  const which = await io.which("cjc");
  core.info(`Found cjc at ${which}`);

  const output = cp.execSync("cjc --version").toString();
  core.info(output);
}
