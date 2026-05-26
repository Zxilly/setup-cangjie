import * as core from "@actions/core";
import { buildCjvProcessEnv, defaultCjvHome, installCjv, readCjvEnvsetup, runCjv } from "./cjv";
import { normalizeTarget } from "./manager/target";
import { applyEnvsetup, test } from "./path";
import { configureRepoConfig } from "./repo-config";
import { detectCangjieVersion } from "./utils";

const CHANNELS = new Set(["lts", "sts", "nightly"]);
const NIGHTLY_VERSION_RE = /(?:^|-)alpha\.\d{14}(?:$|-)/;

export function looksLikeNightlyVersion(version: string): boolean {
  return NIGHTLY_VERSION_RE.test(version);
}

export function buildToolchainInput(channel: string, version: string, autoDetected = false): string {
  if (!CHANNELS.has(channel)) {
    throw new Error("Invalid channel input, must be 'lts', 'sts' or 'nightly'");
  }

  if (!version) {
    throw new Error("Version input cannot be empty");
  }

  if (version === "latest") {
    if (channel === "nightly") {
      throw new Error("Nightly channel requires a specific version, 'latest' is not supported");
    }
    return channel;
  }

  if (autoDetected) {
    return looksLikeNightlyVersion(version) ? `nightly-${version}` : version;
  }

  return `${channel}-${version}`;
}

export function extractInstalledVersion(toolchainName: string): string {
  for (const channel of CHANNELS) {
    const prefix = `${channel}-`;
    if (toolchainName.startsWith(prefix)) {
      return toolchainName.slice(prefix.length);
    }
  }
  return toolchainName;
}

export async function resolveRequestedToolchain(channel: string, version: string): Promise<string> {
  if (version === "auto") {
    const detectedVersion = await detectCangjieVersion();

    if (detectedVersion) {
      core.info(`Auto-detected version: ${detectedVersion}`);
      return buildToolchainInput(channel, detectedVersion, true);
    }

    if (channel === "nightly") {
      throw new Error("Nightly channel requires a specific version, 'auto' without cjc-version in cjpm.toml is not supported");
    }

    core.info("No version detected, using latest");
    return buildToolchainInput(channel, "latest");
  }

  return buildToolchainInput(channel, version);
}

export async function action() {
  let channel = core.getInput("channel");
  let version = core.getInput("version");
  const targetInput = core.getInput("target");
  const cjvVersion = core.getInput("cjv-version").trim() || "latest";

  channel = channel.trim().toLowerCase();
  version = version.trim().toLowerCase();

  try {
    const target = normalizeTarget(targetInput);
    const toolchain = await resolveRequestedToolchain(channel, version);
    const cjvPath = await installCjv(cjvVersion);
    const cjvHome = defaultCjvHome();
    const cjvEnv = buildCjvProcessEnv(cjvHome);

    const installArgs = ["install", toolchain];
    if (target) {
      installArgs.push("--target", target);
    }

    runCjv(cjvPath, installArgs, cjvEnv);

    const envsetup = readCjvEnvsetup(cjvPath, toolchain, target, cjvEnv);
    applyEnvsetup(envsetup);
    core.setOutput("version", extractInstalledVersion(envsetup.toolchain.name));

    await configureRepoConfig();
    await test();
  }
  catch (error: any) {
    core.setFailed(error.toString());
  }
}
