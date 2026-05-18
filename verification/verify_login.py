from playwright.sync_api import sync_playwright
import os
import subprocess
import time

def run_cuj(page):
    # Set window size to desktop
    page.set_viewport_size({"width": 1280, "height": 720})

    page.goto("http://localhost:8080/auth")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/login_page.png")

    # Try login
    page.get_by_placeholder("admin or admin@kspanel.com").fill("admin")
    page.get_by_placeholder("••••••••").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(5000) # Wait for potential redirects and state loads

    page.screenshot(path="verification/screenshots/instances.png")

    # Try to find Users link - it might be inside the sidebar
    users_link = page.get_by_role("link", name="Users")
    if users_link.is_visible():
        users_link.click()
        page.wait_for_timeout(3000)
        page.screenshot(path="verification/screenshots/users.png")

if __name__ == "__main__":
    # Start the app
    process = subprocess.Popen(["./kspanel"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(record_video_dir="verification/videos")
            page = context.new_page()
            run_cuj(page)
            context.close()
            browser.close()
    finally:
        process.terminate()
