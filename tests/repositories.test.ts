import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRepositories, isExcluded, safePublicUrl, recentRepositories, CACHE_SECONDS } from "../src/lib/repositories";

const repo = (extra = {}) => ({ id: 1, name: "example", private: false, visibility: "public", owner: { login: "mohamedshez" }, description: "A useful application", pushed_at: "2026-09-20T00:00:00Z", ...extra });

test("new public repositories appear without a maintained inventory", () => {
  const data = normalizeRepositories([repo(), repo({ id: 2, name: "brand-new-app", pushed_at: "2026-09-23T00:00:00Z" })]);
  assert.deepEqual(data.map(r => r.name), ["brand-new-app", "example"]);
});
test("private, foreign-owned, hidden, and unclassified repositories fail closed", () => {
  const data = normalizeRepositories([repo({ private: true }), repo({ owner: { login: "another-owner" } }), repo({ visibility: undefined }), repo({ topics: ["portfolio-hide"] })]);
  assert.equal(data.length, 0);
});
test("excluded affiliations cannot leak through names, descriptions, topics, languages or links", () => {
  const term = "Diaceutics";
  for (const extra of [{ name: term }, { description: `Work at ${term}` }, { topics: [term] }, { language: term }, { homepage: `https://${term}.com` }]) assert.equal(normalizeRepositories([repo(extra)]).length, 0);
  assert.ok(isExcluded("D I A C E U T I C S"));
  assert.ok(isExcluded("Ｄｉａｃｅｕｔｉｃｓ"));
  assert.ok(isExcluded("DXRX"));
});
test("only approved repository fields survive serialization", () => {
  const result = normalizeRepositories([repo({ company: "Sensitive employer", bio: "Private biography", permissions: { admin: true }, secret: "not-for-publication", owner: { login: "mohamedshez", email: "private@example.com" } })]);
  const output = JSON.stringify(result);
  for (const forbidden of ["Sensitive employer", "Private biography", "permissions", "not-for-publication", "private@example.com"]) assert.ok(!output.includes(forbidden));
});
test("links reject unsafe schemes, embedded credentials, local destinations and excluded domains", () => {
  for (const value of ["javascript:alert(1)", "http://example.com", "https://user:pass@example.com", "https://localhost", "https://127.0.0.1", "https://[::1]", "https://diaceutics.com", "https://example.com/%64iaceutics"]) assert.equal(safePublicUrl(value), null);
  assert.equal(safePublicUrl("https://todo.shez.app"), "https://todo.shez.app/");
});
test("forks retain attribution and never promote upstream websites as owned live apps", () => {
  const [item] = normalizeRepositories([repo({ fork: true, homepage: "https://upstream.example.com" })]);
  assert.equal(item.fork, true);
  assert.equal(item.homepage, null);
});
test("recent highlights exclude forks, archived, stale work and the portfolio itself", () => {
  const items = normalizeRepositories([repo(), repo({ id: 2, name: "fork", fork: true }), repo({ id: 3, name: "archive", archived: true }), repo({ id: 4, name: "old", pushed_at: "2020-01-01T00:00:00Z" }), repo({ id: 5, name: "me" })]);
  assert.deepEqual(recentRepositories(items, new Date("2026-09-24")).map(r => r.name), ["example"]);
});
test("daily refresh interval is 24 hours", () => assert.equal(CACHE_SECONDS, 86400));
