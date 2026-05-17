from playwright.sync_api import sync_playwright
import os
import subprocess
import time

def run_cuj(page):
    page.set_default_timeout(10000)

    # 1. Verify Security Headers
    response = page.goto("http://localhost:8080/auth")
    headers = response.headers
    print(f"X-Frame-Options: {headers.get('x-frame-options')}")
    print(f"X-Content-Type-Options: {headers.get('x-content-type-options')}")

    # 2. Login
    page.get_by_placeholder("admin or admin@kspanel.com").fill("admin")
    page.get_by_placeholder("••••••••").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url("**/instances")
    print(f"URL after login: {page.url}")

    # 3. Check for loading indicator
    # (Since we're fast, we might miss it, but let's see)

    # 4. Logout
    page.goto("http://localhost:8080/api/logout")
    page.wait_for_timeout(1000)

    # 5. Verify Redirection
    page.goto("http://localhost:8080/instances")
    page.wait_for_url("**/auth")
    print(f"URL after unauthorized access attempt: {page.url}")

if __name__ == "__main__":
    process = subprocess.Popen(["./kspanel"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd="panel-v3")
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            run_cuj(page)
            browser.close()
    finally:
        process.terminate()
