import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    json(),
    commonjs(),
    typescript(),
    terser(),
    visualizer(),
  ],
  treeshake: {
    preset: "smallest",
  },
});
