from playwright.sync_api import sync_playwright
import os
import subprocess
import time

def run_cuj(page):
    # Set window size to desktop
    page.set_viewport_size({"width": 1280, "height": 720})

    page.goto("http://localhost:8080/auth")
    page.wait_for_timeout(1000)

    # Login
    page.get_by_placeholder("admin or admin@kspanel.com").fill("admin")
    page.get_by_placeholder("••••••••").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(2000)

    # Navigate to Nodes
    page.get_by_role("link", name="Nodes").click()
    page.wait_for_timeout(2000)

    # Check for nodes. If none, add one.
    if page.get_by_text("No nodes found").is_visible():
        page.get_by_role("button", name="Add Node").click()
        page.wait_for_timeout(500)
        page.get_by_placeholder("My Edge Server").fill("Test Node")
        page.get_by_placeholder("192.168.1.100").fill("localhost")
        page.get_by_role("button", name="Create Node").click()
        page.wait_for_timeout(2000)

    # Take screenshot of the node card without resource bars
    page.screenshot(path="verification/screenshots/nodes_updated.png")

    # Open menu
    page.locator("button:has(svg.lucide-more-vertical)").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/node_menu_updated.png")

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
