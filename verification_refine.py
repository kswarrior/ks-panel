import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        async def login():
            await page.goto('http://localhost:8080/auth/login')
            await page.fill('input[name="user"]', 'admin')
            await page.fill('input[name="password"]', 'adminpassword')
            await page.click('button[type="submit"]')
            await page.wait_for_url('**/instances')

        await login()

        # Navigate to Settings
        await page.goto('http://localhost:8080/admin/settings')
        await page.wait_for_selector('h1:has-text("General Settings")')

        # Verify horizontal nav is gone
        horizontal_nav = await page.query_selector('.settings-nav-container')
        if horizontal_nav:
            print('Horizontal navigation still exists!')
        else:
            print('Horizontal navigation removed successfully.')

        # Click Settings in sidebar to open dropdown
        await page.click('button:has-text("Settings")')
        await asyncio.sleep(0.5)  # Animation

        # Take screenshot of sidebar with dropdown
        await page.screenshot(path='/home/jules/verification/sidebar_settings_refined.png')

        # Verify DASHBOARD is in the dropdown
        dashboard_link = await page.query_selector('a[href="/admin/settings/dashboard"]')
        if dashboard_link:
            print('DASHBOARD link found in sidebar.')
        else:
            print('DASHBOARD link NOT found in sidebar.')

        await browser.close()

asyncio.run(run())
