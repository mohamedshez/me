import test from "node:test";
import assert from "node:assert/strict";
import { nextReleaseVersion } from "../scripts/release-version.mjs";

test("first clean release follows legacy tags and respects package bumps", () => {
  assert.equal(nextReleaseVersion("1.0.1", ["v1.0.0-build.10.1"]), "v1.0.1");
  assert.equal(nextReleaseVersion("1.1.0", ["v1.0.9"]), "v1.1.0");
});
test("releases and retries skip every used tag even when package version stays unchanged", () => {
  const tags = ["v1.0.1", "v1.0.9", "v1.0.3", "v1.0.0-build.10.1"];
  assert.equal(nextReleaseVersion("1.0.1", tags), "v1.0.10");
  assert.equal(nextReleaseVersion("1.0.1", [...tags].reverse()), "v1.0.10");
  assert.equal(nextReleaseVersion("1.0.1", [...tags, "v1.0.10"]), "v1.0.11");
  assert.equal(nextReleaseVersion("1.0.1", ["v2.0.0"]), "v2.0.1");
});
test("unrelated tags do not affect allocation and malformed base versions fail", () => {
  assert.equal(nextReleaseVersion("1.0.1", ["latest", "v1.0.1-check.2.1"]), "v1.0.1");
  assert.throws(() => nextReleaseVersion("latest", []));
});
