import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        async def login():
            await page.goto('http://localhost:8080/login')
            # The login form uses id="username" and id="password"
            await page.fill('#username', 'admin')
            await page.fill('#password', 'adminpassword')
            await page.click('button[type="submit"]')
            # Increase timeout just in case
            await page.wait_for_url('**/instances', timeout=60000)

        try:
            await login()
            print("Login successful.")
        except Exception as e:
            print(f"Login failed: {e}")
            await page.screenshot(path='/home/jules/verification/login_failed.png')
            await browser.close()
            return

        # Check Sidebar Sections (Categories)
        sections = ['Main', 'Administration', 'Resources', 'System', 'Settings']
        for section in sections:
            # We use a broader selector because the text might be in p or span
            if await page.query_selector(f'text="{section}"'):
                print(f'Category "{section}" found in sidebar.')
            else:
                print(f'Category "{section}" NOT found in sidebar.')

        # Check for specific pages/links
        links = [
            'User Management', 'Role Management', 'Global Alerts', 'Support Control',
            'Instance Registry', 'Template Editor', 'Network Nodes',
            'General Settings', 'Mail Configuration', 'Theme Customizer'
        ]
        for link in links:
            if await page.query_selector(f'text="{link}"'):
                print(f'Link "{link}" found in sidebar.')
            else:
                print(f'Link "{link}" NOT found in sidebar.')

        # Navigate to General Settings to verify consolidated resources
        await page.goto('http://localhost:8080/admin/settings')
        await page.wait_for_selector('h2:has-text("Default Instance Resources")')
        print('Consolidated resource settings found on General Settings page.')

        # Take screenshots
        await page.screenshot(path='/home/jules/verification/sidebar_final_v3.png')

        # Verify that DASHBOARD is gone from sidebar
        if await page.query_selector('text="DASHBOARD"'):
             print('DASHBOARD still found in sidebar (Unexpected).')
        else:
             print('DASHBOARD removed from sidebar.')

        await browser.close()

asyncio.run(run())
