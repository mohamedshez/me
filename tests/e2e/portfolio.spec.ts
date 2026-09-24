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
  await expect(page.locator(".directory-row")).toHaveCount(4);
  await page.getByRole("link", { name: "KASH.lv", exact: true }).click();
  for (const url of ["https://kash.lv", "https://dev.kash.lv", "https://admin.kash.lv", "https://admin.dev.kash.lv"]) await expect(page.locator(`.environment-grid a[href="${url}"]`)).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('a[href="https://www.youtube.com/@ShazeAn"]').first()).toBeAttached();
  await page.goto("/projects/this-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/route leads nowhere|couldn’t load/);
});
