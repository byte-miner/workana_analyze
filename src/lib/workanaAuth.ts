import type { Page } from "playwright";
import { WORKANA_BASE } from "./config";

export async function loginToWorkana(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  const loginUrl = `${WORKANA_BASE}/login`;
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

  const emailSelector =
    'input[type="email"], input[name="email"], input[id*="email" i], #InputEmail';
  const passwordSelector =
    'input[type="password"], input[name="password"], input[id*="password" i], #InputPassword';

  await page.waitForSelector(emailSelector, { timeout: 20000 });
  await page.fill(emailSelector, email);
  await page.fill(passwordSelector, password);

  const submitSelector =
    'button[type="submit"], input[type="submit"], button[name="login"], form button.btn-primary';
  await page.click(submitSelector);

  await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const cookies = await page.context().cookies();
  const session = cookies.find((cookie) => cookie.name === "PHPSESSID")?.value;
  if (!session) {
    throw new Error("Workana login failed — check your email and password in Settings.");
  }

  return session;
}
