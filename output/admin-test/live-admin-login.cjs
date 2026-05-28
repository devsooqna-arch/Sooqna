const { chromium } = require("../../apps/web/node_modules/@playwright/test");

const base = "http://localhost:3000";
const email = "admin.test@sooqna.test";
const password = "AdminTest!2026";

(async () => {
  console.log("launching browser");
  const browser = await chromium.launch({ headless: false, slowMo: 650 });
  const context = await browser.newContext({
    viewport: { width: 1194, height: 768 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log("opening login");
  await page.goto(`${base}/login?next=%2Fadmin`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  if (!page.url().includes("/admin")) {
    console.log("filling credentials");
    await page.locator('input[name="email"]').waitFor({ state: "visible", timeout: 20000 });
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  }

  console.log("waiting for dashboard");
  await page.waitForURL(`${base}/admin`, { timeout: 30000 });
  await page.getByText("لوحة إدارة سوقنا").waitFor({ state: "visible", timeout: 30000 });
  await page.getByText("إجمالي المستخدمين").waitFor({ state: "visible", timeout: 30000 });
  console.log("dashboard ready - leaving browser open");

  await new Promise(() => {});
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  setTimeout(() => process.exit(1), 10000);
});
