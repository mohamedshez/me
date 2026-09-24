# Mohamed Shez · shez.app

Personal engineering portfolio built with **Next.js 16, React 19, TypeScript, Tailwind CSS 4, and the Node.js runtime**. Designed for Vercel. No Python service or database is needed.

## Run locally

```sh
npm ci
npm run dev
```

Production verification:

```sh
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

## Content and daily GitHub updates

- The complete public repository inventory comes from `api.github.com/users/mohamedshez/repos`, including pagination. New repositories, descriptions, technologies, links, archive status, forks, and push dates update automatically.
- Next.js Data Cache retains the normalized feed for **24 hours**. After it expires, the next request triggers revalidation. This is request-driven daily refresh, not a midnight job; an idle website makes no scheduled GitHub requests.
- A visible tab left open refreshes its server-rendered content once every 24 hours. There is no five-minute polling or refresh-on-focus.
- The homepage highlights the three most recently pushed non-fork, non-archived repositories within the last 180 days, excluding this portfolio repository. Dates are repository push dates, not claims about authorship or contributions.
- KASH remains the featured production project. Its source is private, so its approved public details and environment links are maintained explicitly.
- Add the `portfolio-hide` GitHub topic to a public repository to omit it on the next daily refresh.
- An upstream fork is labelled as a fork; its upstream homepage is not promoted as a personally owned live application.
- If GitHub is unavailable, approved application links remain usable. A previously successful cached response can remain available during revalidation. A fresh installation with no cached response shows an honest unavailable state rather than an invented repository snapshot.

### Personal-only content policy

The site describes Mohamed and his own work only. It does not ingest GitHub company, biography, organisation membership, LinkedIn content, employment history, or repository README text. Only owner-matched, explicitly public repository metadata is accepted. A server-side exclusion policy blocks restricted affiliations from names, descriptions, topics, languages, and destination links before rendering or API serialization. Private repositories are never queried or listed automatically.

Keep biographical copy, social links, and approved application descriptions in `src/content/portfolio.ts`. Changes merged to `main` are tested by GitHub Actions and accumulate until an explicit production release. No employer biography or affiliations should be added to the portfolio, SEO metadata, or project descriptions.

## Live applications

| Application | Live address | Public source |
| --- | --- | --- |
| KASH.lv | https://kash.lv | Private |
| OSINT | https://osint.shez.app | https://github.com/mohamedshez/worldosview |
| WorldviewOS | https://worldviewos.shez.app | https://github.com/mohamedshez/worldview-ui |
| shez.app | https://www.shez.app | https://github.com/mohamedshez/me |
| Todo | https://todo.shez.app | https://github.com/mohamedshez/todo-app-nextjs |

KASH also links to `dev.kash.lv`, `admin.kash.lv`, and `admin.dev.kash.lv`. These are destinations only; the portfolio does not proxy, authenticate to, or expose administration data.

## Deploy on Vercel

1. Create a **new** Vercel project named `shez-portfolio` for `mohamedshez/me` in the `shez-apps` team. Do not reuse the existing KASH project. Select Next.js, repository root, and Node.js 22. The workflow verifies the destination project name before building or deploying.
2. In GitHub **Settings → Secrets and variables → Actions**, add three repository secrets:
   - `VERCEL_TOKEN`: a Vercel deployment token scoped to the correct team.
   - `VERCEL_ORG_ID`: the Vercel team ID from the new project's settings.
   - `VERCEL_PROJECT_ID`: the **new portfolio project's** ID, never the KASH project ID.
   Keep tokens in the secrets UI; do not paste them into chat or commit them.
3. Merge the portfolio PR into `main`; this runs checks only. When a larger feature set is ready, open **Actions → Portfolio CI and deployment → Run workflow**, select **main**, enable **Release the accumulated changes to www.shez.app**, and run it once. The production job validates configuration, runs checks, builds once with Vercel, runs browser smoke tests, creates the GitHub build tag, and deploys that exact artifact using `--prebuilt --prod`. Before the secrets are configured, the job stops with a precise setup error.
4. `vercel.json` disables automatic Git deployments so there is one deployment path and production cannot bypass the test gate. Initial import/manual deployments are bootstrap operations; use the workflow for subsequent production releases.
5. Add `www.shez.app` and `shez.app` to the **new** project's domain settings, then apply Vercel's displayed DNS records. The canonical default is `https://www.shez.app`; redirect the apex to `www`, or change `SITE_URL` in the portfolio project if you prefer the apex as canonical. Leave all existing application subdomains with their current projects.
6. Optional: set server-only `GITHUB_TOKEN` in the portfolio Vercel project if public GitHub metadata needs a higher rate limit. No database or Python backend is needed.

## Versioning and CI/CD

- Every successful production workflow build gets a unique tag: `v<package-version>-build.<workflow-run>.<attempt>`, for example `v1.0.0-build.12.1`.
- The build generates `src/generated/build-info.json`; it is ignored by Git. The footer shows the exact version and links to its tagged source on GitHub. `/api/version` exposes only version, commit, build time, and tag URL.
- Tags are created **after tests pass and before deployment**, so failed tests never produce a release tag. A deployment failure may leave a valid tested-build tag; the tag alone does not claim the build went live. Rerunning the workflow increments the attempt and produces a new tag; old tags are never overwritten.
- `package.json` holds the human-controlled major/minor/patch version. Build numbering is automatic; there is no version-bump commit loop or changelog service.
- Pull requests run type checks, algorithm/content/version tests, a production-mode Next.js build, and desktop/mobile smoke tests. They use a `check` version and cannot create deployment tags or deploy. Local `npm run build` uses a `local` version and performs no GitHub writes.
- Pushes to `main` run checks only. Manual runs default to checks only. Only an explicit release run on `main` can deploy production; small fixes and features accumulate between releases. The Vercel CLI is pinned in the lockfile. The temporary GitHub Actions token gets `contents: write` only in the production job for tag creation.
- Production jobs are serialized. Automatic Git preview and production deployments remain disabled. Daily GitHub feed refresh uses the running application cache and creates **no deployments**.
- A budget guard checks all visible deployments in the Vercel team over the preceding **24 hours**, including failed and preview deployments, before building and immediately before tagging/deploying. It blocks at **99 existing deployments**, allowing at most the 99th through this workflow. API errors, missing credentials, malformed responses, and incomplete pagination stop the release. The token must have team-wide deployment visibility. This is a portfolio safeguard, not an account-wide lock: deployments made concurrently outside this workflow or deleted history cannot be controlled here. Keep routine releases far below this ceiling.
- To roll back, promote a previous known-good deployment in Vercel; its footer retains the matching build tag without rebuilding it.

Vercel preview environments instruct search engines not to index them. The live portfolio includes page metadata, breadcrumbs, `/sitemap`, `/sitemap.xml`, `robots.txt`, light/dark themes, keyboard navigation, a mobile menu, and a searchable project directory.

## Styling and performance

Tailwind CSS 4 runs through the official `@tailwindcss/postcss` plugin. The Blueprint components use Tailwind utilities and `@apply`; theme tokens are defined in `src/app/globals.css` with `@theme inline`. Custom CSS handles the drawing grids and typography details. No runtime Tailwind CDN is used.

The supplied Big O guide is retained in `docs/big-o-agent-guide.md` and required by `AGENTS.md`. See `docs/performance-audit.md` for measured boundaries and honest complexity costs. Repository filtering and normalization stay on the server. Only `/projects` receives the complete derived directory for interactive search, and it renders at most 24 entries per page. The homepage renders only three recent projects; about/detail routes receive no global repository array.

## Project structure

- `src/app`: page routes, metadata, and the sanitized `/api/projects` endpoint.
- `src/components`: Blueprint interface and interactive project browsing.
- `src/content/portfolio.ts`: approved personal content and application details.
- `src/lib/github.ts`: server-only paginated GitHub ingestion and daily cache.
- `src/lib/repositories.ts`: privacy boundary, safe links, and metadata normalization.
- `scripts/build-version.mjs`: deterministic CI build identities and local build stamps.
- `.github/workflows/verify.yml`: PR checks and tagged, tested production deployment.
- `tests`: content-policy, algorithm, version, and end-to-end browser checks.

GitHub: https://github.com/mohamedshez · YouTube: https://www.youtube.com/@ShazeAn

## Public profile and CV

The portrait in `public/images/mohamed-shez.jpg` is sourced from the owner's public GitHub avatar. Approved CV skills, education, courses, and interests are curated in `src/content/portfolio.ts` rather than automatically ingesting employment profiles. The homepage, About page, and contact section link to `public/cv/Mohamed-Shez-CV.pdf`, a public skills-and-projects CV prepared from the supplied CVs. The original CVs are not published: the public edition preserves the personal-only content policy. Update the curated content and public PDF together when skills or education change.
