import { expect, test } from "@playwright/test";

test("landing renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/سوقنا/);
});

test("public listings page renders", async ({ page }) => {
  await page.goto("/listings");
  await expect(page.getByRole("main")).toBeVisible();
});
