import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Login
        await page.goto('http://localhost:8080/auth/login')
        await page.fill('input[name="user"]', 'admin')
        await page.fill('input[name="password"]', 'password')
        await page.click('button[type="submit"]')
        await page.wait_for_url('**/instances')

        # Go to Theme Studio
        await page.goto('http://localhost:8080/admin/settings/theme')
        await page.wait_for_load_state('networkidle')

        # Screenshot
        await page.screenshot(path='/home/jules/verification/theme_studio_final.png', full_page=True)

        # Click Create Architecture
        await page.click('button:has-text("Create Architecture")')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/theme_studio_editor.png', full_page=True)

        await browser.close()

asyncio.run(run())
