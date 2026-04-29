/* eslint-disable test/no-import-node-test */
import assert from "node:assert/strict";
import test from "node:test";
import { buildNightlySdkAssetName, parseSha256 } from "../src/manager/providers/nightly-provider";

const version = "1.1.0-alpha.20260429010057";

test("buildNightlySdkAssetName builds native and target asset names", () => {
  assert.equal(
    buildNightlySdkAssetName("win32", "x64", "", version),
    `cangjie-sdk-windows-x64-${version}.zip`,
  );
  assert.equal(
    buildNightlySdkAssetName("win32", "x64", "android", version),
    `cangjie-sdk-windows-x64-android-${version}.zip`,
  );
  assert.equal(
    buildNightlySdkAssetName("win32", "x64", "ohos", version),
    `cangjie-sdk-windows-x64-ohos-${version}.zip`,
  );
  assert.equal(
    buildNightlySdkAssetName("win32", "x64", "ohos-arm32", version),
    `cangjie-sdk-windows-x64-ohos-arm32-${version}.zip`,
  );
});

test("buildNightlySdkAssetName uses tarballs outside Windows", () => {
  assert.equal(
    buildNightlySdkAssetName("darwin", "arm64", "ios", version),
    `cangjie-sdk-mac-aarch64-ios-${version}.tar.gz`,
  );
  assert.equal(
    buildNightlySdkAssetName("linux", "x64", "ohos", version),
    `cangjie-sdk-linux-x64-ohos-${version}.tar.gz`,
  );
});

test("parseSha256 accepts only a raw 64 character hex digest", () => {
  const digest = "1dac654cc12301ffa1ac3bdcba6dfffcd31b9169553df657c1a12f9b585d0145";
  assert.equal(parseSha256(`${digest}\n`), digest);
  assert.equal(parseSha256(digest.toUpperCase()), digest);

  assert.equal(parseSha256("abc"), null);
  assert.equal(parseSha256(`${digest} cangjie-sdk.zip`), null);
  assert.equal(parseSha256("z".repeat(64)), null);
});
