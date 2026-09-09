import { chromium } from 'playwright-core'
const SHOT_DIR = '/private/tmp/claude-501/-Users-amr-EsamcoCS-EsamcoCSfrontend/fa995809-75bf-49d8-b57a-40e0789533a0/scratchpad'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()))

await page.goto('http://localhost:5173/login')
await page.fill('#login', 'supervisor.customer-support@example.com')
await page.fill('#password', 'password')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)

await page.goto('http://localhost:5173/live-chat')
await page.waitForTimeout(1500)

await page.locator('text=Dedup Test').first().click()
await page.waitForTimeout(1000)
await page.screenshot({ path: `${SHOT_DIR}/livechat-before-click.png` });

const nameButton = page.getByRole('button', { name: 'Dedup Test', exact: true });
const isClickable = await nameButton.count();
console.log('Clickable visitor-name button found:', isClickable > 0);

if (isClickable > 0) {
  await nameButton.click();
  await page.waitForTimeout(1500);
  console.log('URL after clicking name:', page.url());
  await page.screenshot({ path: `${SHOT_DIR}/livechat-to-customer.png`, fullPage: true });
}

console.log('console errors:', JSON.stringify(consoleErrors));
await browser.close();
