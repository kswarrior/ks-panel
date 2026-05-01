import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 1600}) # Tall viewport

        async def login():
            await page.goto('http://localhost:8080/login')
            await page.fill('#username', 'admin')
            await page.fill('#password', 'adminpassword')
            await page.click('button[type="submit"]')
            await page.wait_for_url('**/instances')

        await login()

        # Navigate to General Settings
        await page.goto('http://localhost:8080/admin/settings')
        await page.wait_for_selector('text="General Settings"')

        # Take tall screenshot
        await page.screenshot(path='/home/jules/verification/sidebar_full.png', full_page=False)

        await browser.close()

asyncio.run(run())
