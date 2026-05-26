/* eslint-disable test/no-import-node-test */
import type { CjvEnvsetup } from "../src/cjv";
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { envsetupPathEntries, mergePathValue, uniquePathEntries } from "../src/path";

const envsetup: CjvEnvsetup = {
  schema_version: 1,
  toolchain: {
    name: "lts-1.0.5",
    root: "/cjv/toolchains/lts-1.0.5",
    source: "argument",
    targets: [],
    components: [],
  },
  cjv: {
    home: "/cjv",
    bin: "/cjv/bin",
  },
  env: {
    vars: {
      CANGJIE_HOME: "/cjv/toolchains/lts-1.0.5",
    },
    path: {
      prepend: ["/sdk/bin", "/sdk/tools/bin"],
      append: ["/home/runner/.cjpm/bin"],
    },
    library_path: {
      key: "LD_LIBRARY_PATH",
      prepend: ["/sdk/runtime/lib/linux_x86_64_cjnative"],
    },
  },
};

test("envsetupPathEntries returns direct SDK paths", () => {
  assert.deepEqual(envsetupPathEntries(envsetup), [
    "/sdk/bin",
    "/sdk/tools/bin",
    "/home/runner/.cjpm/bin",
  ]);
});

test("mergePathValue prepends unique library paths before existing paths", () => {
  assert.equal(
    mergePathValue(["/runtime", "/tools"], ["/usr/lib", "/runtime"].join(path.delimiter)),
    ["/runtime", "/tools", "/usr/lib"].join(path.delimiter),
  );
});

test("uniquePathEntries removes duplicates while preserving order", () => {
  assert.deepEqual(uniquePathEntries(["/a", "/b", "/a"]), ["/a", "/b"]);
});
