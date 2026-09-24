import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * O(1) time/space: fixed metadata, no repository inventory or network access.
 * @param {string} packageVersion
 * @param {Record<string, string | undefined>} env
 * @param {Date} now
 * @param {string | null} localCommit
 */
export function createBuildInfo(packageVersion, env = process.env, now = new Date(), localCommit = null) {
  if (!/^\d+\.\d+\.\d+$/.test(packageVersion)) throw new Error("Use a major.minor.patch package version");
  const rawCommit = env.GITHUB_SHA || env.VERCEL_GIT_COMMIT_SHA || localCommit;
  const commit = typeof rawCommit === "string" && /^[a-f0-9]{40}$/i.test(rawCommit) ? rawCommit : null;
  const run = env.GITHUB_RUN_NUMBER;
  const attempt = env.GITHUB_RUN_ATTEMPT;
  const ci = env.GITHUB_ACTIONS === "true";
  if (ci && (!/^\d+$/.test(run ?? "") || !/^\d+$/.test(attempt ?? "") || !commit)) {
    throw new Error("GitHub build identity is missing or invalid");
  }
  const release = ci && env.GITHUB_REPOSITORY === "mohamedshez/me" &&
    env.GITHUB_REF === "refs/heads/main" && env.GITHUB_EVENT_NAME === "workflow_dispatch" && env.PORTFOLIO_RELEASE === "true";
  const suffix = ci ? `${release ? "build" : "check"}.${run}.${attempt}` : `local.${now.toISOString().replace(/\D/g, "")}`;
  const releaseVersion = env.PORTFOLIO_RELEASE_VERSION;
  if (release && !/^v\d+\.\d+\.\d+$/.test(releaseVersion ?? "")) {
    throw new Error("Production release requires an allocated semantic version");
  }
  const version = release && typeof releaseVersion === "string" ? releaseVersion : `v${packageVersion}-${suffix}`;
  return {
    version, commit, builtAt: now.toISOString(),
    // The release workflow creates this tag after tests and before deployment.
    tag: release ? version : null,
    tagUrl: release ? `https://github.com/mohamedshez/me/tree/${version}` : null,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  let commit = null;
  try { commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { /* A downloaded source archive may not have Git metadata. */ }
  const output = new URL("../src/generated/build-info.json", import.meta.url);
  mkdirSync(fileURLToPath(new URL(".", output)), { recursive: true });
  const info = createBuildInfo(version, process.env, new Date(), commit);
  writeFileSync(output, JSON.stringify(info, null, 2) + "\n");
  console.log(`Build version: ${info.version}`);
}
