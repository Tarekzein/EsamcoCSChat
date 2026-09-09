import { chromium } from 'playwright-core'

const SHOT_DIR = '/private/tmp/claude-501/-Users-amr-EsamcoCS-EsamcoCSfrontend/fa995809-75bf-49d8-b57a-40e0789533a0/scratchpad'
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()
page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()))
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message))
page.on('requestfailed', (req) => console.log('REQFAILED:', req.url(), req.failure()?.errorText))

await page.goto('http://localhost:5173/login')
await page.waitForTimeout(1000)
await page.screenshot({ path: `${SHOT_DIR}/login-page.png` })

await page.fill('#login', 'agent1.customer-support@example.com')
await page.fill('#password', 'password')
await page.click('button[type="submit"]')
await page.waitForTimeout(4000)
await page.screenshot({ path: `${SHOT_DIR}/login-after-submit.png` })
console.log('current url:', page.url())

await browser.close()
