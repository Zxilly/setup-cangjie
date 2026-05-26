/* eslint-disable test/no-import-node-test */
import assert from "node:assert/strict";
import test from "node:test";
import { buildCjvDownloadUrl, getCjvAssetInfo, parseCjvEnvsetupJSON } from "../src/cjv";

test("getCjvAssetInfo maps GitHub runner platforms to cjv release assets", () => {
  assert.deepEqual(getCjvAssetInfo("win32", "x64"), {
    platform: "windows",
    arch: "amd64",
    archiveName: "cjv_windows_amd64.zip",
    binaryName: "cjv.exe",
    archiveType: "zip",
  });

  assert.deepEqual(getCjvAssetInfo("linux", "arm64"), {
    platform: "linux",
    arch: "arm64",
    archiveName: "cjv_linux_arm64.tar.gz",
    binaryName: "cjv",
    archiveType: "tar",
  });
});

test("buildCjvDownloadUrl builds latest and pinned release URLs", () => {
  assert.equal(
    buildCjvDownloadUrl("latest", "linux", "x64"),
    "https://github.com/Zxilly/cjv/releases/latest/download/cjv_linux_amd64.tar.gz",
  );
  assert.equal(
    buildCjvDownloadUrl("v1.2.3", "win32", "x64"),
    "https://github.com/Zxilly/cjv/releases/download/v1.2.3/cjv_windows_amd64.zip",
  );
});

test("parseCjvEnvsetupJSON validates schema_version 1", () => {
  const parsed = parseCjvEnvsetupJSON(JSON.stringify({
    schema_version: 1,
    toolchain: {
      name: "lts-1.0.5",
      root: "/home/runner/.cjv/toolchains/lts-1.0.5",
      source: "argument",
    },
    cjv: {
      home: "/home/runner/.cjv",
      bin: "/home/runner/.cjv/bin",
    },
    env: {
      vars: {
        CANGJIE_HOME: "/home/runner/.cjv/toolchains/lts-1.0.5",
      },
      path: {
        prepend: ["/sdk/bin"],
      },
      library_path: {
        key: "LD_LIBRARY_PATH",
        prepend: ["/sdk/runtime/lib/linux_x86_64_cjnative"],
      },
    },
  }));

  assert.equal(parsed.toolchain.name, "lts-1.0.5");
  assert.deepEqual(parsed.toolchain.targets, []);
  assert.deepEqual(parsed.env.path.append, []);
});

test("parseCjvEnvsetupJSON rejects unsupported schemas", () => {
  assert.throws(() => parseCjvEnvsetupJSON("{}"), /Unsupported cjv envsetup JSON schema/);
  assert.throws(() => parseCjvEnvsetupJSON("not json"), /valid JSON/);
});
