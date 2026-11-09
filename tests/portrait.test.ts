import test from "node:test";
import assert from "node:assert/strict";
import config from "../next.config";
import { AVATAR_HOST, AVATAR_PATH, AVATAR_URL, FALLBACK_PORTRAIT, portraitFromResponse } from "../src/lib/portrait";

const reply = (headers: Record<string, string>, ok = true) => ({ ok, headers: new Headers(headers) });
const etag = (value: string) => portraitFromResponse(reply({ "content-type": "image/jpeg", etag: value }))?.src;

test("a new avatar produces a new portrait URL", () => {
  const first = etag('"505bcde138216fe4848d1b878c25c3b7"');
  assert.equal(first, `${AVATAR_URL}&rev=505bcde138216fe4`);
  assert.notEqual(first, etag('"aaaabde138216fe4848d1b878c25c3b7"'));
});

test("the same avatar keeps a stable URL, including weak ETags", () => {
  assert.equal(etag('W/"505bcde1"'), etag('"505bcde1"'));
});

test("ETag text cannot inject URL syntax", () => {
  assert.equal(etag('"a&b=c/../d"'), `${AVATAR_URL}&rev=abcd`);
});

test("a missing ETag still shows the avatar", () => {
  assert.equal(portraitFromResponse(reply({ "content-type": "image/jpeg" }))?.src, AVATAR_URL);
});

test("failed or non-image responses are rejected", () => {
  assert.equal(portraitFromResponse(reply({ "content-type": "image/jpeg" }, false)), null);
  assert.equal(portraitFromResponse(reply({ "content-type": "text/html", etag: '"abc"' })), null);
  assert.equal(portraitFromResponse(reply({})), null);
});

test("the avatar source stays pinned to the owner's GitHub account", () => {
  assert.equal(AVATAR_URL, "https://avatars.githubusercontent.com/u/2903699?v=4");
  assert.deepEqual(config.images?.remotePatterns, [{ protocol: "https", hostname: AVATAR_HOST, pathname: AVATAR_PATH }]);
});

test("optimized portraits follow the 24-hour refresh window", () => {
  assert.equal(config.images?.minimumCacheTTL, 86400);
});

test("the offline fallback is a bundled local image", () => {
  assert.match(FALLBACK_PORTRAIT.src, /^\/images\//);
});
