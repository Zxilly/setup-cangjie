import * as cp from "node:child_process";
import path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import * as io from "@actions/io";
import { getLLVMNameArch } from "./sys";
import { printCommand } from "./utils";

export function configure(dir: string) {
  core.info("Configuring environment");

  const cjBase = path.join(dir, "cangjie");
  core.exportVariable("CANGJIE_HOME", cjBase);

  switch (process.platform) {
    case "win32":
      configureWindows(cjBase);
      break;
    case "linux":
      configureLinux(cjBase);
      break;
    case "darwin":
      configureDarwin(cjBase);
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  core.info("Environment configured");
}

function ap(...args: string[]) {
  core.addPath(path.join(...args));
}

function configureWindows(dir: string) {
  ap(dir, "bin");
  ap(dir, "tools", "bin");
  ap(dir, "tools", "lib");
  ap(dir, "runtime", "lib", "windows_x86_64_llvm");
  ap(dir, "third_party", "llvm", "lldb", "lib");
  ap(process.env.USERPROFILE!, ".cjpm", "bin");
}

function configureLinux(dir: string) {
  ap(dir, "bin");
  ap(dir, "tools", "bin");
  ap(process.env.HOME!, ".cjpm", "bin");

  const ldPaths = [
    `${dir}/runtime/lib/linux_${getLLVMNameArch()}_llvm`,
    `${dir}/tools/lib`,
  ];
  if (process.env.LD_LIBRARY_PATH) {
    ldPaths.push(process.env.LD_LIBRARY_PATH);
  }
  const ldPath = ldPaths.join(path.delimiter);

  core.exportVariable("LD_LIBRARY_PATH", ldPath);
}

function configureDarwin(dir: string) {
  core.addPath(`${dir}/bin`);
  core.addPath(`${dir}/tools/bin`);
  core.addPath(`${process.env.HOME}/.cjpm/bin`);

  const ldPaths = [
    `${dir}/runtime/lib/darwin_${getLLVMNameArch()}_llvm`,
    `${dir}/tools/lib`,
  ];
  if (process.env.DYLD_LIBRARY_PATH) {
    ldPaths.push(process.env.DYLD_LIBRARY_PATH);
  }
  const ldPath = ldPaths.join(path.delimiter);

  core.exportVariable("DYLD_LIBRARY_PATH", ldPath);

  if (!process.env.SDKROOT) {
    const v = cp.execSync("xcrun --sdk macosx --show-sdk-path").toString();
    core.exportVariable("SDKROOT", v.trim());
  }

  cp.execSync(`xattr -dr com.apple.quarantine ${dir}/*`);
  cp.execSync(`codesign -s - -f --preserve-metadata=entitlements,requirements,flags,runtime ${dir}/third_party/llvm/bin/debugserver`);
}

export async function test() {
  const which = await io.which("cjc");
  core.info(`Found cjc at ${which}`);

  printCommand("cjc --version");
}
