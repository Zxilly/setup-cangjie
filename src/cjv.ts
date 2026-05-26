import * as cp from "node:child_process";
import { chmod } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as tool from "@actions/tool-cache";

const CJV_REPO = "https://github.com/Zxilly/cjv";
const CJV_TOOL_NAME = "cjv";

export interface CjvAssetInfo {
  platform: string;
  arch: string;
  archiveName: string;
  binaryName: string;
  archiveType: "zip" | "tar";
}

export interface CjvEnvsetup {
  schema_version: 1;
  toolchain: {
    name: string;
    root: string;
    source: string;
    targets: string[];
    components: string[];
  };
  cjv: {
    home: string;
    bin: string;
  };
  env: {
    vars: Record<string, string>;
    path: {
      prepend: string[];
      append: string[];
    };
    library_path: {
      key: string | null;
      prepend: string[];
    };
  };
}

export function getCjvAssetInfo(platform = process.platform, arch = process.arch): CjvAssetInfo {
  let goArch: string;
  switch (arch) {
    case "x64":
      goArch = "amd64";
      break;
    case "arm64":
      goArch = "arm64";
      break;
    default:
      throw new Error(`Unsupported architecture for cjv: ${arch}`);
  }

  let goOS: string;
  let archiveType: "zip" | "tar";
  let binaryName = "cjv";
  switch (platform) {
    case "win32":
      if (goArch === "arm64") {
        throw new Error("cjv does not provide Windows ARM64 binaries");
      }
      goOS = "windows";
      archiveType = "zip";
      binaryName = "cjv.exe";
      break;
    case "linux":
      goOS = "linux";
      archiveType = "tar";
      break;
    case "darwin":
      goOS = "darwin";
      archiveType = "tar";
      break;
    default:
      throw new Error(`Unsupported platform for cjv: ${platform}`);
  }

  const suffix = archiveType === "zip" ? ".zip" : ".tar.gz";
  return {
    platform: goOS,
    arch: goArch,
    archiveName: `cjv_${goOS}_${goArch}${suffix}`,
    binaryName,
    archiveType,
  };
}

export function buildCjvDownloadUrl(version: string, platform = process.platform, arch = process.arch): string {
  const asset = getCjvAssetInfo(platform, arch);
  const normalized = (version || "latest").trim();
  const releasePath = normalized === "latest"
    ? "releases/latest/download"
    : `releases/download/${normalized}`;
  return `${CJV_REPO}/${releasePath}/${asset.archiveName}`;
}

function cacheVersion(version: string): string {
  return (version || "latest").trim();
}

export function defaultCjvHome(): string {
  return path.join(process.env.RUNNER_TEMP || os.tmpdir(), "setup-cangjie-cjv");
}

export function buildCjvProcessEnv(cjvHome: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    CJV_HOME: cjvHome,
    CJV_NO_PATH_SETUP: "1",
  };
}

export async function installCjv(version: string): Promise<string> {
  const asset = getCjvAssetInfo();
  const versionKey = cacheVersion(version);

  if (versionKey !== "latest") {
    const cached = tool.find(CJV_TOOL_NAME, versionKey, asset.arch);
    if (cached) {
      const cachedPath = path.join(cached, asset.binaryName);
      core.info(`Using cached cjv ${versionKey}: ${cachedPath}`);
      return cachedPath;
    }
  }

  const url = buildCjvDownloadUrl(versionKey);
  core.info(`Downloading cjv from ${url}`);
  const archivePath = await tool.downloadTool(url);
  const extractedPath = asset.archiveType === "zip"
    ? await tool.extractZip(archivePath)
    : await tool.extractTar(archivePath);

  const binaryPath = path.join(extractedPath, asset.binaryName);
  if (process.platform !== "win32") {
    await chmod(binaryPath, 0o755);
  }

  if (versionKey === "latest") {
    return binaryPath;
  }

  const cachedDir = await tool.cacheFile(binaryPath, asset.binaryName, CJV_TOOL_NAME, versionKey, asset.arch);
  return path.join(cachedDir, asset.binaryName);
}

export function runCjv(cjvPath: string, args: string[], env: NodeJS.ProcessEnv, captureStdout = false): string {
  core.info(`Running cjv ${args.join(" ")}`);
  const result = cp.spawnSync(cjvPath, args, {
    encoding: "utf-8",
    env,
    // When capturing (envsetup --json) we must pipe stdout to parse it, but
    // still stream stderr live so cjv warnings/errors are visible. Otherwise
    // inherit both so a long-running install streams progress to the log
    // instead of buffering everything until the process exits.
    stdio: captureStdout ? ["ignore", "pipe", "inherit"] : ["ignore", "inherit", "inherit"],
    windowsHide: true,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    // status is null when the process was terminated by a signal (e.g. OOM
    // kill or timeout); surface the signal instead of "exit code null".
    const reason = result.signal ? `signal ${result.signal}` : `exit code ${result.status}`;
    // stdout is only captured in captureStdout mode; otherwise it streamed
    // live to the log, so point the reader there instead of an empty detail.
    const detail = (result.stdout ?? "").trim();
    const suffix = detail ? `: ${detail}` : " (see the streamed cjv output above for details)";
    throw new Error(`cjv ${args.join(" ")} failed with ${reason}${suffix}`);
  }

  return result.stdout ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function parseCjvEnvsetupJSON(raw: string): CjvEnvsetup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  }
  catch (error: any) {
    throw new Error(`cjv envsetup --json did not return valid JSON. Use a cjv version that supports envsetup JSON. ${error.message}`);
  }

  const schemaError = "Unsupported cjv envsetup JSON schema. Use a cjv version that supports schema_version 1.";
  if (!isRecord(parsed) || parsed.schema_version !== 1) {
    throw new Error(schemaError);
  }
  const { toolchain, cjv, env } = parsed;
  if (!isRecord(toolchain) || typeof toolchain.name !== "string" || typeof toolchain.root !== "string") {
    throw new Error(schemaError);
  }
  if (!isRecord(cjv) || typeof cjv.bin !== "string") {
    throw new Error(schemaError);
  }
  // env.path/vars must be objects, not arrays/primitives — an array would pass
  // a bare truthy check and then silently produce an empty PATH downstream.
  if (!isRecord(env) || !isRecord(env.vars) || !isRecord(env.path)) {
    throw new Error(schemaError);
  }

  const obj = parsed as unknown as CjvEnvsetup;
  obj.toolchain.targets = toStringArray(obj.toolchain.targets);
  obj.toolchain.components = toStringArray(obj.toolchain.components);
  obj.env.path.prepend = toStringArray(obj.env.path.prepend);
  obj.env.path.append = toStringArray(obj.env.path.append);
  if (!isRecord(obj.env.library_path)) {
    obj.env.library_path = { key: null, prepend: [] };
  }
  obj.env.library_path.prepend = toStringArray(obj.env.library_path.prepend);
  // key must be a string (env var name) or null; coerce anything else to null
  // so a malformed value can never become an env var name downstream.
  if (typeof obj.env.library_path.key !== "string") {
    obj.env.library_path.key = null;
  }

  return obj;
}

export function readCjvEnvsetup(cjvPath: string, toolchain: string, target: string, env: NodeJS.ProcessEnv): CjvEnvsetup {
  const args = ["envsetup", "--json", `+${toolchain}`];
  if (target) {
    // Re-root the emitted environment at the installed cross-compile target SDK
    // so later steps build for the target instead of the host toolchain.
    args.push("--target", target);
  }
  const raw = runCjv(cjvPath, args, env, true);
  return parseCjvEnvsetupJSON(raw);
}
