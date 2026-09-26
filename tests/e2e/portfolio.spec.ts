import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("portfolio routes render cleanly without excluded content", async ({ page, request }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/", "/about", "/projects", "/work/kash-lv", "/sitemap"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.content()).not.toMatch(/diaceutics|dxrx|the diagnostic network/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const api = await request.get("/api/projects");
  expect(api.status()).toBe(200);
  const data = await api.json();
  expect(data.repositories).toBeInstanceOf(Array);
  expect(JSON.stringify(data)).not.toMatch(/diaceutics|dxrx/i);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("https://www.shez.app/work/kash-lv");
  expect(errors).toEqual([]);
  await page.goto("/");
  const versionResponse = await request.get("/api/version");
  expect(versionResponse.status()).toBe(200);
  const build = await versionResponse.json();
  await expect(page.getByTestId("build-version")).toContainText(build.version);
  if (build.tagUrl) await expect(page.getByTestId("build-version").getByRole("link")).toHaveAttribute("href", build.tagUrl);
  expect(await page.content()).not.toContain('searchText');
  expect(await page.locator('.project-grid .project-card').count()).toBeLessThanOrEqual(3);
  await fs.mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: `artifacts/home-${info.project.name}.png`, fullPage: true });
  if (info.project.name === "mobile") await page.screenshot({ path: "artifacts/home-mobile-viewport.png" });
});

test("navigation, search, filters, environment links and theme work", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  const search = page.getByRole("searchbox", { name: "Search projects" });
  await search.fill("KASH");
  await expect(page.locator(".directory-row")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "KASH.lv", exact: true })).toBeVisible();
  await search.fill("");
  await page.getByRole("button", { name: "Live apps", exact: true }).click();
  await expect(page.locator(".directory-row")).toHaveCount(5);
  await page.getByRole("link", { name: "KASH.lv", exact: true }).click();
  for (const url of ["https://kash.lv", "https://dev.kash.lv", "https://admin.kash.lv", "https://admin.dev.kash.lv"]) await expect(page.locator(`.environment-grid a[href="${url}"]`)).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('a[href="https://www.youtube.com/@ShazeAn"]').first()).toBeAttached();
  await expect(page.locator('a[href="https://stackoverflow.com/users/6725458/shaze"]').first()).toBeAttached();
  await page.goto("/projects/this-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/route leads nowhere|couldn’t load/);
});


test("recruiters can see the portrait, broader skills, live portfolio and download a PDF", async ({ page, request }) => {
  await page.goto("/");
  const portrait = page.getByRole("img", { name: "Portrait of Mohamed Shez" });
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const cvLink = page.getByRole("link", { name: "Download CV (PDF)" }).first();
  await expect(cvLink).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await cvLink.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Mohamed-Shez-CV.pdf");
  const cv = await request.get("/cv/Mohamed-Shez-CV.pdf");
  expect(cv.status()).toBe(200);
  expect(cv.headers()["content-type"]).toContain("application/pdf");
  expect((await cv.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.goto("/about");
  for (const skill of ["Java", "Python", "C++", "Kotlin", "Spring Boot", "Django", "FastAPI", "Docker", "AWS", "Linux", "CI/CD", "Snowflake"]) {
    await expect(page.locator(".skills-section").getByText(skill, { exact: true })).toBeVisible();
  }
  await page.goto("/projects");
  await page.getByRole("button", { name: "Live apps", exact: true }).click();
  await expect(page.locator('.directory-row a[href="/work/shez-portfolio"]').first()).toBeVisible();
  await expect(page.locator('.directory-row a[href="/projects/me"]')).toHaveCount(0);
  await page.goto("/work/shez-portfolio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("shez.app");
});

test("copyright follows the calendar across New Year without a deployment", async ({ page }) => {
  await page.clock.install({ time: new Date(2030, 11, 31, 23, 59, 50) });
  await page.goto("/");
  const copyright = page.locator("footer").getByText(/© .*shez.app/);
  await expect(copyright).toHaveText("© 2030 shez.app. Crafted by Mohamed Shez, powered by AI.");
  await page.clock.fastForward(20_000);
  await expect(copyright).toHaveText("© 2031 shez.app. Crafted by Mohamed Shez, powered by AI.");
});

test("readable typography reflows at narrow widths and with enlarged text", async ({ page }) => {
  test.setTimeout(90000);
  for (const [width, rootSize] of [[320, 16], [768, 16], [1280, 32], [390, 32]]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/about", "/projects", "/work/kash-lv", "/sitemap"]) {
      await page.goto(route);
      await page.evaluate(size => { document.documentElement.style.fontSize = `${size}px`; }, rootSize);
      await page.evaluate(() => document.fonts.ready);
      const problems = await page.evaluate(() => {
        const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return [...document.body.querySelectorAll<HTMLElement>("*")].flatMap(element => {
          if (!element.checkVisibility() || element.closest(".sr-only, .skip-link, svg")) return [];
          const hasText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
          if (!hasText) return [];
          const size = parseFloat(getComputedStyle(element).fontSize);
          const rect = element.getBoundingClientRect();
          return size < rootSize * .875 - .1 || rect.right > innerWidth + 1 || rect.left < -1
            ? [`${element.className}: ${size}px, left ${rect.left}, right ${rect.right}`] : [];
        });
      });
      expect(problems, `${route}, viewport ${width}, root ${rootSize}`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow at ${width}/${rootSize}`).toBe(true);
      await expect(page.locator("footer p").first()).toHaveCSS("font-size", `${rootSize}px`);
    }
  }
});
