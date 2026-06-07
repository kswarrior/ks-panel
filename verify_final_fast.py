import os
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Login
        page.goto("http://localhost:8080/auth/login")
        page.screenshot(path="/home/jules/verification/screenshots/login_before.png")
        page.fill('input[name="username"]', "admin")
        page.fill('input[name="password"]', "password")
        page.click('button[type="submit"]')

        page.wait_for_timeout(5000)
        page.screenshot(path="/home/jules/verification/screenshots/login_after.png")
        print(f"Current URL: {page.url}")

        # Take screenshots of key pages
        pages = ["dashboard", "instances", "nodes", "templates", "users", "roles", "tickets"]
        for p_name in pages:
            try:
                page.goto(f"http://localhost:8080/{p_name}")
                page.wait_for_timeout(2000) # Wait for animation/fetch
                page.screenshot(path=f"/home/jules/verification/screenshots/{p_name}_final.png")
                print(f"Screenshot taken: {p_name}_final.png")
            except Exception as e:
                print(f"Failed to capture {p_name}: {e}")

        browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    verify()
