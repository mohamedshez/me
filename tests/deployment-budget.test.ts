import test from "node:test";
import assert from "node:assert/strict";
import { checkDeploymentBudget } from "../scripts/deployment-budget.mjs";

const env = { VERCEL_TOKEN: "test-token", VERCEL_ORG_ID: "team_test" };
const response = (count: number, next: number | null = null) => async () =>
  new Response(JSON.stringify({ deployments: Array.from({ length: count }, () => ({ state: "ERROR" })), pagination: { next } }));

test("budget permits the 99th deployment and blocks the 100th, counting failed deployments", async () => {
  assert.equal(await checkDeploymentBudget(env, response(98)), 98);
  await assert.rejects(checkDeploymentBudget(env, response(99)), /budget reached/);
  await assert.rejects(checkDeploymentBudget(env, response(100)), /budget reached/);
});

test("budget covers the whole team and rolling 24 hours without preview/state exclusions", async () => {
  const now = Date.parse("2026-09-24T12:00:00Z");
  await checkDeploymentBudget(env, async (input: URL) => {
    assert.equal(input.origin, "https://api.vercel.com");
    assert.equal(input.searchParams.get("teamId"), "team_test");
    assert.equal(input.searchParams.get("since"), String(now - 86_400_000));
    assert.equal(input.searchParams.get("limit"), "100");
    for (const key of ["projectId", "target", "state"]) assert.equal(input.searchParams.has(key), false);
    return response(0)();
  }, now);
});

test("unknown deployment usage stops the release", async () => {
  await assert.rejects(checkDeploymentBudget({}, response(0)), /credentials/);
  await assert.rejects(checkDeploymentBudget(env, async () => new Response("", { status: 403 })), /403/);
  await assert.rejects(checkDeploymentBudget(env, async () => new Response("{}")), /malformed/);
  await assert.rejects(checkDeploymentBudget(env, response(20, 123)), /incomplete/);
  await assert.rejects(checkDeploymentBudget(env, async () => { throw new Error("network unavailable"); }), /network unavailable/);
});
