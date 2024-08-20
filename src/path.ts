import * as process from "node:process";
import * as core from "@actions/core";
import * as io from "@actions/io";
import { getArch } from "./sys";
import { printCommand } from "./utils";

export function configureEnv(dir: string) {
  core.info("Configuring environment");

  switch (process.platform) {
    case "win32":
      configureWindowsEnv(dir);
      break;
    case "linux":
      configureLinuxEnv(dir);
      break;
    case "darwin":
      configureMacOSEnv(dir);
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  core.info("Environment configured");
}

function configureWindowsEnv(dir: string) {
  // export CANGJIE_HOME=${script_dir}
  //
  // export PATH=${CANGJIE_HOME}/bin:${CANGJIE_HOME}/tools/bin:${CANGJIE_HOME}/tools/lib:${CANGJIE_HOME}/runtime/lib/windows_x86_64_llvm:${CANGJIE_HOME}/third_party/llvm/lldb/lib:$PATH:${USERPROFILE}/.cjpm/bin

  core.addPath(`${dir}\\bin`);
  core.addPath(`${dir}\\tools\\bin`);
  core.addPath(`${dir}\\tools\\lib`);
  core.addPath(`${dir}\\runtime\\lib\\windows_x86_64_llvm`);
  core.addPath(`${dir}\\third_party\\llvm\\lldb\\lib`);
  core.addPath(`${process.env.USERPROFILE}\\.cjpm\\bin`);
}

function configureLinuxEnv(dir: string) {
  // export CANGJIE_HOME=${script_dir}
  //
  // export PATH=${CANGJIE_HOME}/bin:${CANGJIE_HOME}/tools/bin:$PATH:${HOME}/.cjpm/bin
  // export LD_LIBRARY_PATH=${CANGJIE_HOME}/runtime/lib/linux_${hw_arch}_llvm:${CANGJIE_HOME}/tools/lib:${LD_LIBRARY_PATH}

  core.addPath(`${dir}/bin`);
  core.addPath(`${dir}/tools/bin`);
  core.addPath(`${process.env.HOME}/.cjpm/bin`);
  let ldPath = `${dir}/runtime/lib/linux_${getArch()}_llvm:${dir}/tools/lib`;
  if (process.env.LD_LIBRARY_PATH) {
    ldPath = `${ldPath}:${process.env.LD_LIBRARY_PATH}`;
  }
  core.exportVariable("LD_LIBRARY_PATH", ldPath);
}

function configureMacOSEnv(dir: string) {
  // export PATH=${CANGJIE_HOME}/bin:${CANGJIE_HOME}/tools/bin:$PATH:${HOME}/.cjpm/bin
  // export DYLD_LIBRARY_PATH=${CANGJIE_HOME}/runtime/lib/darwin_${hw_arch}_llvm:${CANGJIE_HOME}/tools/lib:${DYLD_LIBRARY_PATH}
  // export CANGJIE_HOME=${script_dir}

  core.addPath(`${dir}/bin`);
  core.addPath(`${dir}/tools/bin`);
  core.addPath(`${process.env.HOME}/.cjpm/bin`);
  let ldPath = `${dir}/runtime/lib/darwin_${getArch()}_llvm:${dir}/tools/lib`;
  if (process.env.DYLD_LIBRARY_PATH) {
    ldPath = `${ldPath}:${process.env.DYLD_LIBRARY_PATH}`;
  }

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
