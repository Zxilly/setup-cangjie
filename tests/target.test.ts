/* eslint-disable test/no-import-node-test */
import assert from "node:assert/strict";
import test from "node:test";
import { createToolchainKey, normalizeTarget } from "../src/manager/target";

test("normalizeTarget normalizes optional target suffixes", () => {
  assert.equal(normalizeTarget(""), "");
  assert.equal(normalizeTarget("  OHOS_arm32  "), "ohos-arm32");
  assert.equal(normalizeTarget("Android"), "android");
});

test("normalizeTarget rejects invalid or full toolchain targets", () => {
  assert.throws(() => normalizeTarget("ohos/arm32"), /Invalid target/);
  assert.throws(() => normalizeTarget("win32-x64-ohos"), /target suffix/);
});

test("createToolchainKey appends target suffix to host platform key", () => {
  assert.equal(createToolchainKey("win32", "x64", ""), "win32-x64");
  assert.equal(createToolchainKey("win32", "x64", "ohos"), "win32-x64-ohos");
  assert.equal(createToolchainKey("linux", "arm64", "android"), "linux-arm64-android");
});
