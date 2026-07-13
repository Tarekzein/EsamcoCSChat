import { chromium } from 'playwright-core'
const SHOT_DIR = '/private/tmp/claude-501/-Users-amr-EsamcoCS-EsamcoCSfrontend/fa995809-75bf-49d8-b57a-40e0789533a0/scratchpad'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()

await page.goto('http://localhost:5173/login')
await page.fill('#login', 'agent2.sales@example.com')
await page.fill('#password', 'password')
await page.click('button[type="submit"]')
await page.waitForTimeout(3000)

await page.goto('http://localhost:5173/live-chat')
await page.waitForSelector('text=قائمة المحادثات', { timeout: 10000 })
await page.waitForTimeout(1500)

const preview31 = await page.locator('text=#31').locator('xpath=ancestor::button[1]').textContent()
console.log('Conversation #31 list entry:', preview31)

await page.screenshot({ path: `${SHOT_DIR}/preview-fix-check.png` })
await browser.close()
