"""Browser checks for the portfolio's navigation and project browsing.

Run with: python3 -m unittest discover -s tests -v
Requires Playwright and Chrome (or PORTFOLIO_BROWSER_CHANNEL=chromium).
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import re
from threading import Thread
import unittest

from playwright.sync_api import expect, sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class PortfolioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[1]
        cls.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), partial(QuietHandler, directory=str(root))
        )
        cls.server_thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            channel=os.environ.get("PORTFOLIO_BROWSER_CHANNEL", "chrome")
        )
        expect.set_options(timeout=3000)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join()

    def setUp(self):
        self.context = self.browser.new_context(
            viewport={"width": 1440, "height": 1000}, reduced_motion="reduce"
        )
        self.context.set_default_timeout(5000)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], "Unexpected browser JavaScript error")

    def visit(self, path):
        self.page.goto(self.url + path, wait_until="domcontentloaded")

    def test_homepage_project_opens_matching_detail(self):
        self.visit("/")
        self.page.get_by_role("link", name="View Tokyo Train Board", exact=True).click()
        expect(self.page).to_have_url(re.compile(r"/works\.html#trainboard$"))
        dialog = self.page.get_by_role("dialog", name="Tokyo Train Board", exact=True)
        expect(dialog).to_be_visible()
        expect(dialog.get_by_role("link", name="View on GitHub")).to_have_attribute(
            "href", "https://github.com/jaeggerjose/tokyo-train-board"
        )

    def test_project_index_and_escape_restore_focus(self):
        self.visit("/works.html")
        expect(self.page.locator("#project-list .project-row")).to_have_count(12)
        trigger = self.page.get_by_role(
            "button", name="SLURM Backfill Enhancement", exact=True
        )
        trigger.click()
        dialog = self.page.get_by_role("dialog", name="SLURM Backfill Enhancement")
        expect(dialog).to_be_visible()
        self.page.keyboard.press("Escape")
        expect(dialog).not_to_be_visible()
        expect(trigger).to_be_focused()
        expect(self.page).to_have_url(re.compile(r"/works\.html$"))

    def test_map_and_index_share_project_details(self):
        self.visit("/works.html")
        self.page.get_by_role("button", name="Map view", exact=True).click()
        expect(self.page.locator("#map-view")).to_be_visible()
        expect(self.page.locator("#project-list")).not_to_be_visible()
        pin = self.page.locator('.map-pin[data-pid="dicom"]')
        pin.click()
        dialog = self.page.get_by_role("dialog", name="DICOM → FHIR Converter")
        expect(dialog).to_be_visible()
        dialog.get_by_role("button", name="Close project").click()
        expect(pin).to_be_focused()
        self.page.get_by_role("button", name="List view", exact=True).click()
        expect(self.page.locator("#project-list")).to_be_visible()

    def test_project_fragment_opens_without_map(self):
        self.visit("/works.html#classroom")
        dialog = self.page.get_by_role("dialog", name="CGU Kubeflow LDAP Admin")
        expect(dialog).to_be_visible()
        expect(self.page.locator("#map-view")).not_to_be_visible()
        dialog.get_by_role("button", name="Close project").click()
        expect(dialog).not_to_be_visible()

    def test_direct_project_close_keeps_focus_in_view(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        for project_id in ("trainboard", "classroom", "dicom"):
            with self.subTest(project=project_id):
                self.visit(f"/works.html#{project_id}")
                dialog = self.page.get_by_role("dialog")
                expect(dialog).to_be_visible()
                self.page.keyboard.press("Escape")
                expect(dialog).not_to_be_visible()
                trigger = self.page.locator(
                    f'#project-list button[data-pid="{project_id}"]'
                )
                expect(trigger).to_be_focused()
                expect(trigger).to_be_in_viewport(ratio=1)

    def test_skip_link_preserves_map_view(self):
        self.visit("/works.html#map")
        self.page.evaluate("""() => {
            window.skipNavigation = new Promise(resolve => {
                window.addEventListener('hashchange', () => resolve(), {once: true});
            });
        }""")
        self.page.get_by_role("link", name="Skip to content").focus()
        self.page.keyboard.press("Enter")
        self.page.evaluate("() => window.skipNavigation")
        expect(self.page).to_have_url(re.compile(r"#works-main$"))
        expect(self.page.locator("#works-main")).to_be_focused()
        expect(self.page.locator("#map-view")).to_be_visible()
        expect(self.page.locator("#project-list")).not_to_be_visible()

    def test_mobile_menu_escape_restores_focus(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.visit("/")
        toggle = self.page.locator("#nav-menu")
        expect(toggle).to_have_attribute("aria-label", "Open menu")
        toggle.click()
        expect(toggle).to_have_attribute("aria-expanded", "true")
        expect(self.page.locator("#mobile-menu")).to_be_visible()
        self.assertTrue(self.page.locator("main").evaluate("el => el.inert"))
        self.page.keyboard.press("Escape")
        expect(toggle).to_have_attribute("aria-expanded", "false")
        expect(toggle).to_be_focused()
        self.assertFalse(self.page.locator("main").evaluate("el => el.inert"))

    def test_mobile_project_titles_fit_the_viewport(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.visit("/works.html")
        expect(self.page.locator("#project-list .project-row")).to_have_count(12)
        boxes = self.page.locator(".project-title").evaluate_all(
            "els => els.map(el => ({left: el.getBoundingClientRect().left, "
            "right: el.getBoundingClientRect().right}))"
        )
        self.assertTrue(all(b["left"] >= 0 and b["right"] <= 390 for b in boxes))
        self.assertLessEqual(
            self.page.evaluate("document.documentElement.scrollWidth"), 390
        )

    def test_theme_persists_between_pages(self):
        self.visit("/")
        self.page.get_by_role("button", name="Switch to dark theme", exact=True).click()
        expect(self.page.locator("html")).to_have_attribute("data-theme", "dark")
        self.visit("/works.html")
        expect(self.page.locator("html")).to_have_attribute("data-theme", "dark")
        self.page.get_by_role("button", name="Switch to light theme", exact=True).click()
        self.page.reload()
        expect(self.page.locator("html")).to_have_attribute("data-theme", "light")


if __name__ == "__main__":
    unittest.main()
