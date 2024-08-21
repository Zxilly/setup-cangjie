import * as process from "node:process";
import path from "node:path";
import * as core from "@actions/core";
import * as io from "@actions/io";
import { getArch } from "./sys";
import { printCommand } from "./utils";

export function configureEnv(dir: string) {
  core.info("Configuring environment");

  const cjBase = path.join(dir, "cangjie");
  core.exportVariable("CANGJIE_HOME", cjBase);

  switch (process.platform) {
    case "win32":
      configureWindowsEnv(cjBase);
      break;
    case "linux":
      configureLinuxEnv(cjBase);
      break;
    case "darwin":
      configureMacOSEnv(cjBase);
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  core.info("Environment configured");
}

function configureWindowsEnv(dir: string) {
  core.addPath(`${dir}\\bin`);
  core.addPath(`${dir}\\tools\\bin`);
  core.addPath(`${dir}\\tools\\lib`);
  core.addPath(`${dir}\\runtime\\lib\\windows_x86_64_llvm`);
  core.addPath(`${dir}\\third_party\\llvm\\lldb\\lib`);
  core.addPath(`${process.env.USERPROFILE}\\.cjpm\\bin`);
}

function configureLinuxEnv(dir: string) {
  core.addPath(`${dir}/bin`);
  core.addPath(`${dir}/tools/bin`);
  core.addPath(`${process.env.HOME}/.cjpm/bin`);

  const ldPaths = [
    `${dir}/runtime/lib/linux_${getArch()}_llvm`,
    `${dir}/tools/lib`,
  ];
  if (process.env.LD_LIBRARY_PATH) {
    ldPaths.push(process.env.LD_LIBRARY_PATH);
  }
  const ldPath = ldPaths.join(path.delimiter);

  core.exportVariable("LD_LIBRARY_PATH", ldPath);
}

function configureMacOSEnv(dir: string) {
  core.addPath(`${dir}/bin`);
  core.addPath(`${dir}/tools/bin`);
  core.addPath(`${process.env.HOME}/.cjpm/bin`);

  const ldPaths = [
    `${dir}/runtime/lib/darwin_${getArch()}_llvm`,
    `${dir}/tools/lib`,
  ];
  if (process.env.DYLD_LIBRARY_PATH) {
    ldPaths.push(process.env.DYLD_LIBRARY_PATH);
  }
  const ldPath = ldPaths.join(path.delimiter);

  core.exportVariable("DYLD_LIBRARY_PATH", ldPath);
}

export async function test() {
  const found = await io.findInPath("cjc");
  if (found.length === 0) {
    throw new Error("cjc not found");
  }
  core.info(`Found cjc at ${found}`);

  const which = await io.which("cjc");
  core.info(`Found cjc at ${which}`);

  printCommand("cjc --version");
}
