import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEPLOYMENT_LIMIT = 99;

/**
 * One bounded API page; no site runtime or client-side cost. Fail closed.
 * @param {Record<string, string | undefined>} env
 * @param {(url: URL, options: RequestInit) => Promise<Response>} fetcher
 * @param {number} now
 */
export async function checkDeploymentBudget(env = process.env, fetcher = fetch, now = Date.now()) {
  if (!env.VERCEL_TOKEN || !env.VERCEL_ORG_ID) throw new Error("Deployment budget requires Vercel team credentials.");
  const url = new URL("https://api.vercel.com/v7/deployments");
  url.searchParams.set("teamId", env.VERCEL_ORG_ID);
  url.searchParams.set("since", String(now - 86_400_000));
  url.searchParams.set("limit", "100");
  // No project, target, or state filter: include the team's previews and failures.
  const response = await fetcher(url, {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Cannot verify deployment budget (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data?.deployments) || !data.pagination || !("next" in data.pagination)) {
    throw new Error("Cannot verify deployment budget: malformed response.");
  }
  const count = data.deployments.length;
  if (count >= DEPLOYMENT_LIMIT) throw new Error("Deployment budget reached: 99 deployments per rolling 24 hours. Batch changes and release later.");
  if (data.pagination.next !== null) throw new Error("Cannot verify deployment budget: incomplete deployment history.");
  console.log(`Deployment budget: ${count}/${DEPLOYMENT_LIMIT} in the preceding 24 hours; one release allowed.`);
  return count;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkDeploymentBudget().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
