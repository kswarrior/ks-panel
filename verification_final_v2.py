import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        async def login():
            await page.goto('http://localhost:8080/login')
            await page.fill('input[name="user"]', 'admin')
            await page.fill('input[name="password"]', 'adminpassword')
            await page.click('button[type="submit"]')
            await page.wait_for_url('**/instances')

        await login()

        # Check Sidebar Sections
        sections = ['Main', 'Administration', 'Resources', 'System', 'Settings']
        for section in sections:
            if await page.query_selector(f'p:has-text("{section}")'):
                print(f'Section "{section}" found in sidebar.')
            else:
                print(f'Section "{section}" NOT found in sidebar.')

        # Check for renamed links
        links = [
            'User Management', 'Role Management', 'Global Alerts', 'Support Control',
            'Instance Registry', 'Template Editor', 'Network Nodes',
            'General Settings', 'Mail Configuration', 'Theme Customizer'
        ]
        for link in links:
            if await page.query_selector(f'span:has-text("{link}")'):
                print(f'Link "{link}" found in sidebar.')
            else:
                print(f'Link "{link}" NOT found in sidebar.')

        # Navigate to General Settings to verify consolidated resources
        await page.goto('http://localhost:8080/admin/settings')
        await page.wait_for_selector('h2:has-text("Default Instance Resources")')
        print('Consolidated resource settings found on General Settings page.')

        # Take screenshots
        await page.screenshot(path='/home/jules/verification/sidebar_final_v2.png')
        await page.goto('http://localhost:8080/admin/settings')
        await page.screenshot(path='/home/jules/verification/settings_consolidated.png')

        await browser.close()

asyncio.run(run())
