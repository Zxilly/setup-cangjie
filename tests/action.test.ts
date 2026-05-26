/* eslint-disable test/no-import-node-test */
import assert from "node:assert/strict";
import test from "node:test";
import { buildToolchainInput, extractInstalledVersion, looksLikeNightlyVersion, resolveRequestedToolchain } from "../src/action";

test("buildToolchainInput maps channel latest to cjv channel names", () => {
  assert.equal(buildToolchainInput("lts", "latest"), "lts");
  assert.equal(buildToolchainInput("sts", "latest"), "sts");
  assert.throws(() => buildToolchainInput("nightly", "latest"), /Nightly channel requires/);
});

test("buildToolchainInput maps explicit versions to channel-version names", () => {
  assert.equal(buildToolchainInput("lts", "1.0.0"), "lts-1.0.0");
  assert.equal(buildToolchainInput("sts", "1.1.0"), "sts-1.1.0");
  assert.equal(
    buildToolchainInput("nightly", "1.1.0-alpha.20260429010057"),
    "nightly-1.1.0-alpha.20260429010057",
  );
});

test("buildToolchainInput lets cjv resolve auto-detected release versions", () => {
  assert.equal(buildToolchainInput("lts", "1.0.5", true), "1.0.5");
  assert.equal(buildToolchainInput("nightly", "1.0.5", true), "1.0.5");
  assert.equal(
    buildToolchainInput("lts", "1.1.0-alpha.20260429010057", true),
    "nightly-1.1.0-alpha.20260429010057",
  );
});

test("buildToolchainInput rejects empty version and invalid channel", () => {
  assert.throws(() => buildToolchainInput("lts", ""), /Version input cannot be empty/);
  assert.throws(() => buildToolchainInput("foo", "1.0.0"), /Invalid channel input/);
});

test("resolveRequestedToolchain passes explicit versions straight through", async () => {
  assert.equal(await resolveRequestedToolchain("lts", "1.0.0"), "lts-1.0.0");
  assert.equal(await resolveRequestedToolchain("sts", "latest"), "sts");
  await assert.rejects(resolveRequestedToolchain("nightly", "latest"), /Nightly channel requires/);
});

test("looksLikeNightlyVersion detects nightly tag shape", () => {
  assert.equal(looksLikeNightlyVersion("1.1.0-alpha.20260429010057"), true);
  assert.equal(looksLikeNightlyVersion("1.1.0"), false);
});

test("extractInstalledVersion strips known channel prefixes", () => {
  assert.equal(extractInstalledVersion("lts-1.0.5"), "1.0.5");
  assert.equal(extractInstalledVersion("nightly-1.1.0-alpha.20260429010057"), "1.1.0-alpha.20260429010057");
});
