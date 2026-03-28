import { chmod, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import * as process from "node:process";
import * as core from "@actions/core";
import { stringify } from "smol-toml";

export async function configureRepoConfig(): Promise<void> {
  const token = core.getInput("repo-token");
  if (!token) {
    return;
  }

  core.setSecret(token);

  const config = {
    repository: {
      home: {
        token,
      },
    },
  };

  const tomlContent = stringify(config);

  const dir = path.join(homedir(), ".cjpm");
  await mkdir(dir, { recursive: true });

  const filePath = path.join(dir, "cangjie-repo.toml");
  await writeFile(filePath, tomlContent, { encoding: "utf-8" });

  if (process.platform !== "win32") {
    await chmod(filePath, 0o600);
  }

  core.info(`Generated cangjie-repo.toml at ${filePath}`);
}
