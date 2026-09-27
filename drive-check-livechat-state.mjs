import { chromium } from 'playwright-core'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const SHOT_DIR = '/private/tmp/claude-501/-Users-amr-EsamcoCS-EsamcoCSfrontend/fa995809-75bf-49d8-b57a-40e0789533a0/scratchpad'
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.goto(`${FRONTEND_URL}/login`)
await page.fill('#login', 'supervisor.customer-support@example.com')
await page.fill('#password', 'password')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)
await page.goto(`${FRONTEND_URL}/live-chat`)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${SHOT_DIR}/livechat-current-state.png`, fullPage: true })
const rows = await page.locator('div[class*="min-h-0"] button p.font-black').allTextContents().catch(() => [])
console.log('Visible conversation names:', JSON.stringify(rows))
await browser.close()
