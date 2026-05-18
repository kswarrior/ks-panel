from playwright.sync_api import sync_playwright
import os
import subprocess
import time

def run_cuj(page):
    page.set_viewport_size({"width": 375, "height": 812}) # Mobile viewport

    page.goto("http://localhost:8080/auth")
    page.wait_for_timeout(1000)

    # Login
    page.get_by_placeholder("admin or admin@kspanel.com").fill("admin")
    page.get_by_placeholder("••••••••").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url("**/instances")

    # Check Settings (Mobile layout)
    page.goto("http://localhost:8080/settings")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/settings_mobile.png")

    # Check Nodes
    page.goto("http://localhost:8080/nodes")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/nodes_refined.png")

    # Check Users
    page.goto("http://localhost:8080/users")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/users_refined.png")

    # Check Tickets (Mobile)
    page.goto("http://localhost:8080/tickets")
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshots/tickets_mobile_list.png")

    # Select first ticket if exists
    tickets = page.locator(".cursor-pointer")
    if tickets.count() > 0:
        tickets.first.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/screenshots/tickets_mobile_chat.png")

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
