import test from "node:test";
import assert from "node:assert/strict";
import { createBuildInfo } from "../scripts/build-version.mjs";

const commit = "a".repeat(40);
const date = new Date("2026-09-24T12:00:00Z");
const production = {
  GITHUB_ACTIONS: "true", GITHUB_SHA: commit, GITHUB_RUN_NUMBER: "12", GITHUB_RUN_ATTEMPT: "1",
  GITHUB_REPOSITORY: "mohamedshez/me", GITHUB_REF: "refs/heads/main", GITHUB_EVENT_NAME: "workflow_dispatch", PORTFOLIO_RELEASE: "true", PORTFOLIO_RELEASE_VERSION: "v1.0.1",
};

test("production uses the allocated semantic version for footer, API and tag", () => {
  const build = createBuildInfo("1.0.0", production, date);
  assert.equal(build.version, "v1.0.1");
  assert.equal(build.tag, build.version);
  assert.equal(build.commit, commit);
  assert.equal(build.tagUrl, `https://github.com/mohamedshez/me/tree/${build.version}`);
  assert.notEqual(createBuildInfo("1.0.0", { ...production, GITHUB_RUN_ATTEMPT: "2", PORTFOLIO_RELEASE_VERSION: "v1.0.2" }, date).version, build.version);
});

test("PR checks and local builds never claim an existing GitHub release tag", () => {
  const check = createBuildInfo("1.0.0", { ...production, GITHUB_EVENT_NAME: "pull_request" }, date);
  assert.equal(check.tag, null);
  assert.equal(check.tagUrl, null);
  assert.equal(check.version, "v1.0.0-check.12.1");
  const local = createBuildInfo("1.0.0", {}, date, commit);
  assert.equal(local.tagUrl, null);
  assert.match(local.version, /^v1\.0\.0-local\./);
  assert.equal(local.commit, commit);
  assert.notEqual(local.version, createBuildInfo("1.0.0", {}, new Date(date.getTime() + 1), commit).version);
});

test("build identity rejects malformed versions/CI metadata and never serializes environment secrets", () => {
  assert.throws(() => createBuildInfo("bad-version", {}, date));
  assert.throws(() => createBuildInfo("1.0.0", { ...production, GITHUB_RUN_NUMBER: "bad" }, date));
  assert.throws(() => createBuildInfo("1.0.0", { ...production, GITHUB_SHA: "bad" }, date));
  const build = createBuildInfo("1.0.0", { ...production, VERCEL_TOKEN: "secret-value", GITHUB_TOKEN: "secret-value" }, date);
  assert.ok(!JSON.stringify(build).includes("secret-value"));
});

test("main pushes and check-only dispatches do not claim production tags", () => {
  for (const env of [
    { ...production, GITHUB_EVENT_NAME: "push" },
    { ...production, PORTFOLIO_RELEASE: "false" },
    { ...production, GITHUB_REF: "refs/heads/feature" },
  ]) {
    const build = createBuildInfo("1.0.0", env, date);
    assert.equal(build.tag, null);
    assert.equal(build.tagUrl, null);
    assert.equal(build.version, "v1.0.0-check.12.1");
  }
});


test("production refuses unallocated or malformed release versions", () => {
  for (const version of [undefined, "v1.0.0-build.1.1", "latest", "1.0.1"]) {
    assert.throws(() => createBuildInfo("1.0.1", { ...production, PORTFOLIO_RELEASE_VERSION: version }, date));
  }
});
