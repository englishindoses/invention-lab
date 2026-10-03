"""Visual shop checks using the locally installed Python Playwright package."""
from pathlib import Path
import subprocess
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
server = subprocess.Popen(['node', 'scripts/serve.cjs'], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
  with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe', headless=True)
    page = browser.new_page(viewport={'width': 1366, 'height': 768})
    browser_errors = []
    page.on('pageerror', lambda error: browser_errors.append(str(error)))
    page.goto('http://localhost:4173')
    page.locator('#register-name').fill('Shop Layout Check')
    page.locator('#register-password').fill('shop-check')
    page.locator('#register-submit').click()
    page.wait_for_selector('#register-status[data-state="granted"]')
    page.locator('#access-name').fill('Shop Layout Check')
    page.locator('#access-password').fill('shop-check')
    page.locator('#access-submit').click()
    page.wait_for_selector('body[data-view="lab"]')
    page.locator('nav [data-view="shop"]').click()
    for theme in ['cartoon', 'future', 'magic']:
      page.evaluate('(theme) => Lab.applyTheme(theme)', theme)
      for width, height in [(1366, 768), (1440, 900), (1920, 1080)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.wait_for_timeout(100)
        result = page.evaluate('''() => {
          const stage = document.querySelector('.shop-stage').getBoundingClientRect();
          const scaleX = innerWidth / 1672;
          const scaleY = innerHeight / 941;
          const slot = document.querySelector('[data-slot="display-01"]').getBoundingClientRect();
          const boxes = [...document.querySelectorAll('.shop-slot')].map(el => el.getBoundingClientRect());
          return {
            background: getComputedStyle(document.body).backgroundImage.includes(document.documentElement.dataset.theme === 'magic' ? 'magic-shop-v3.png' : document.documentElement.dataset.theme + '/shop-background.png'),
            cover: Math.abs(stage.left) < .1 && Math.abs(stage.top) < .1 && Math.abs(stage.right - innerWidth) < .1 && Math.abs(stage.bottom - innerHeight) < .1 && getComputedStyle(document.body).backgroundSize === '100% 100%',
            alignment: Math.abs(slot.left - 174 * scaleX) < 1 && Math.abs(slot.top - 170 * scaleY) < 1,
            slots: document.querySelectorAll('.shop-slot').length,
            labels: [...document.querySelectorAll('.shop-placeholder')].map(el => el.textContent).join(',') === '1,2,3,4A,4B,5,6,7,8,9,10A,10B,11,12,14,15A,15B,16,17,26,27,28,29',
            noOverlap: boxes.every((a, i) => boxes.slice(i + 1).every(b => Math.min(a.right, b.right) - Math.max(a.left, b.left) <= .1 || Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) <= .1)),
            noScroll: document.documentElement.scrollHeight === innerHeight
          };
        }''')
        assert result == {'background': True, 'cover': True, 'alignment': True, 'slots': 23, 'labels': True, 'noOverlap': True, 'noScroll': True}, (theme, width, height, result)
      (root / 'artifacts').mkdir(exist_ok=True)
      page.set_viewport_size({'width': 1366, 'height': 768})
      page.evaluate('''() => new Promise((resolve, reject) => { const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = getComputedStyle(document.body).backgroundImage.slice(5, -2); })''')
      page.screenshot(path=str(root / 'artifacts' / f'shop-{theme}.png'))
    page.set_viewport_size({'width': 1366, 'height': 768})
    (root / 'artifacts').mkdir(exist_ok=True)
    page.screenshot(path=str(root / 'artifacts' / 'magic-shop-full-page.png'))
    page.locator('nav [data-view="lab"]').click()
    assert page.locator('#view-lab').is_visible()
    # The sale panel, wallet and inventor funds must all fit without scrolling.
    for theme in ['cartoon', 'future', 'magic']:
      page.evaluate('(theme) => Lab.applyTheme(theme)', theme)
      for width, height in [(1366, 768), (1440, 900), (1920, 1080), (1366, 650)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.wait_for_timeout(100)
        layout = page.evaluate('''() => {
          const panel = document.querySelector('.sale-panel').getBoundingClientRect();
          const funds = document.querySelector('.lesson-funds').getBoundingClientRect();
          return { panelHeight: panel.height, panelBottom: panel.bottom, fundsBottom: funds.bottom, scrollHeight: document.documentElement.scrollHeight };
        }''')
        assert layout['panelHeight'] < 350, (theme, width, height, layout)
        assert layout['panelBottom'] <= height and layout['fundsBottom'] <= height and layout['scrollHeight'] <= height, (theme, width, height, layout)
      page.set_viewport_size({'width': 1366, 'height': 768})
      page.screenshot(path=str(root / 'artifacts' / f'compact-sale-panel-{theme}.png'))
    page.evaluate("Lab.applyTheme('cartoon')")
    # Check the customer's session budget through real game controls.
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('#customer-balance').inner_text() == '300'
    def prepare_sale(name):
      page.locator('#lever-0').click()
      page.locator('#lever-1').click()
      page.wait_for_timeout(150)
      page.locator('#invention-name').fill(name)
    prepare_sale('Budget invention one')
    page.locator('[data-price="50"]').click()
    page.wait_for_timeout(1200)
    assert page.locator('#customer-balance').inner_text() == '250'
    page.locator('#budget-settings').click()
    page.locator('#budget-limit').fill('500')
    page.locator('#budget-form button[type="submit"]').click()
    assert page.locator('#customer-balance').inner_text() == '450'
    page.reload()
    page.wait_for_selector('body[data-view="lab"]')
    page.locator('#budget-settings').click()
    assert page.locator('#budget-limit').input_value() == '500'
    page.locator('#close-budget').click()
    assert page.locator('#customer-balance').inner_text() == '450'
    page.locator('#budget-settings').click()
    page.locator('#budget-limit').fill('300')
    page.locator('#budget-form button[type="submit"]').click()
    assert page.locator('#customer-balance').inner_text() == '250'
    assert page.locator('#balance').inner_text() == '68'
    page.reload()
    page.wait_for_selector('body[data-view="lab"]')
    assert page.locator('#customer-balance').inner_text() == '250'
    assert page.locator('#balance').inner_text() == '68'
    page.locator('nav [data-view="shop"]').click()
    page.reload()
    page.wait_for_selector('body[data-view="shop"]')
    page.locator('nav [data-view="lab"]').click()
    assert page.locator('#customer-balance').inner_text() == '250'
    prepare_sale('Budget invention two')
    page.locator('[data-price="50"]').click()
    page.wait_for_timeout(1200)
    for index in range(4):
      prepare_sale(f'Budget invention {index + 3}')
      page.locator('[data-price="50"]').click()
      page.wait_for_timeout(1200)
    assert page.locator('#customer-balance').inner_text() == '0'
    prepare_sale('No budget left')
    for price in [10, 50, 100]:
      assert page.locator(f'[data-price="{price}"]').is_disabled()
    assert page.locator('[data-price="0"]').is_enabled()
    page.locator('[data-price="0"]').click()
    page.wait_for_timeout(1200)
    assert page.locator('#customer-balance').inner_text() == '0'
    for theme in ['cartoon', 'future', 'magic']:
      page.evaluate('(theme) => Lab.applyTheme(theme)', theme)
      box = page.locator('.customer-wallet').bounding_box()
      assert box['y'] + box['height'] <= 768, (theme, box)
      page.screenshot(path=str(root / 'artifacts' / f'customer-wallet-{theme}.png'))
    page.locator('#leave-lab').click()
    page.reload()
    page.wait_for_selector('body[data-view="home"]')
    page.locator('#access-name').fill('Shop Layout Check')
    page.locator('#access-password').fill('shop-check')
    page.locator('#access-submit').click()
    page.wait_for_selector('body[data-view="lab"]')
    assert page.locator('#customer-balance').inner_text() == '300'
    assert page.locator('#balance').inner_text() == '306'
    page.locator('#leave-lab').click()
    page.locator('#register-name').fill('Ann')
    page.locator('#register-password').fill('ann-check')
    page.locator('#register-submit').click()
    page.wait_for_selector('#register-status[data-state="granted"]')
    page.locator('#access-name').fill('Ann')
    page.locator('#access-password').fill('ann-check')
    page.locator('#access-submit').click()
    page.wait_for_selector('body[data-view="lab"]')
    page.locator('nav [data-view="shop"]').click()
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    assert page.locator('.shop-slot img').count() == 0
    page.reload()
    page.wait_for_selector('body[data-view="shop"]')
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    assert page.locator('.shop-slot img').count() == 0
    for image in page.locator('.shop-slot img').all():
      image.evaluate('(img) => img.decode()')
    page.screenshot(path=str(root / 'artifacts' / 'ann-shop.png'))
    page.locator('#leave-lab').click()
    page.locator('#access-name').fill('Shop Layout Check')
    page.locator('#access-password').fill('shop-check')
    page.locator('#access-submit').click()
    page.wait_for_selector('body[data-view="lab"]')
    page.locator('nav [data-view="shop"]').click()
    assert page.locator('.shop-slot img').count() == 0
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    original_progress = page.evaluate('localStorage.getItem("invention-lab-v1")')
    # Upload through the same controls used by teachers on GitHub Pages.
    page.locator('[data-slot="display-01"]').click()
    page.locator('#shop-item-name').fill('My Flying Lunchbox')
    page.locator('#shop-item-image').set_input_files(str(root / 'assets/images/shared/coin-bag.png'))
    page.locator('#shop-item-save').click()
    page.wait_for_selector('#shop-editor', state='hidden')
    page.wait_for_selector('[data-slot="display-01"].has-item')
    fitting_checked = page.evaluate('''async () => {
      const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#36b'; ctx.fillRect(40, 30, 32, 48);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'; ctx.fillRect(0, 0, 1, 1);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const prepared = await Lab.shopStorage.prepareImage(blob);
      const cropped = await createImageBitmap(prepared);
      const good = cropped.width === 32 && cropped.height === 48;
      cropped.close();
      const img = document.querySelector('[data-slot="display-01"] img');
      const box = img.getBoundingClientRect(); const shelf = img.parentElement.getBoundingClientRect();
      return good && getComputedStyle(img).objectFit === 'contain' && box.width <= shelf.width && box.height <= shelf.height;
    }''')
    assert fitting_checked, 'Transparent margins trimmed; image stays inside its shelf with preserved proportions'
    page.reload()
    page.wait_for_selector('body[data-view="shop"]')
    page.wait_for_selector('[data-slot="display-01"].has-item')
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    page.locator('[data-slot="display-01"]').click()
    page.locator('#shop-item-name').fill('Renamed Lunchbox')
    page.locator('#shop-item-image').set_input_files(str(root / 'assets/images/shared/customer-wallet.png'))
    page.locator('#shop-item-slot').select_option('display-10a')
    page.locator('#shop-item-save').click()
    page.wait_for_selector('#shop-editor', state='hidden')
    page.wait_for_selector('[data-slot="display-10a"].has-item')
    assert page.locator('[data-slot="display-01"] img').count() == 0
    page.locator('#shop-add').click()
    assert page.locator('#shop-item-slot option[value="display-10a"]').is_disabled()
    page.locator('#shop-editor-close').click()
    with page.expect_download() as download_event:
      page.locator('#shop-export').click()
    backup_path = root / 'artifacts' / 'shop-upload-backup.json'
    download_event.value.save_as(str(backup_path))
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    page.locator('[data-slot="display-10a"]').click()
    page.locator('#shop-item-remove').click()
    page.wait_for_selector('#shop-editor', state='hidden')
    assert page.locator('.shop-slot img').count() == 0
    page.reload()
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    assert page.locator('.shop-slot img').count() == 0
    page.locator('#shop-import').click()
    page.locator('#shop-backup-file').set_input_files(str(backup_path))
    page.locator('#shop-import-save').click()
    page.wait_for_selector('#shop-import-dialog', state='hidden')
    page.wait_for_selector('[data-slot="display-10a"].has-item')
    assert page.locator('[data-slot="display-10a"] img').get_attribute('alt') == 'Renamed Lunchbox'
    assert page.evaluate('localStorage.getItem("invention-lab-v1")') == original_progress
    # Invalid imports and failed transactions cannot destroy existing items.
    invalid_backup = root / 'artifacts' / 'invalid-shop-backup.json'
    invalid_backup.write_text('{"format":"invention-lab-shop","version":1,"items":[{"name":"Bad","slot":"display-99","page":1,"image":"https://example.com/image.png"}]}')
    page.locator('#shop-import').click()
    page.locator('#shop-backup-file').set_input_files(str(invalid_backup))
    page.locator('#shop-import-save').click()
    page.wait_for_function('document.querySelector("#shop-import-status").textContent.includes("invalid")')
    page.locator('#shop-import-close').click()
    assert page.locator('.shop-slot img').count() == 1
    page.evaluate('() => { window.originalShopSave = Lab.shopStorage.save; Lab.shopStorage.save = async () => { throw new Error("Simulated storage failure"); }; }')
    page.locator('[data-slot="display-10a"]').click()
    page.locator('#shop-item-remove').click()
    page.wait_for_function('document.querySelector("#shop-editor-status").textContent.includes("failure")')
    assert page.locator('.shop-slot img').count() == 1
    page.locator('#shop-editor-close').click()
    page.evaluate('() => { Lab.shopStorage.save = window.originalShopSave; }')
    # On a different page, the same shelf is independently available.
    page.locator('#shop-add').click()
    page.locator('#shop-item-name').fill('Second Page Invention')
    page.locator('#shop-item-image').set_input_files(str(root / 'assets/images/shared/customer-wallet.png'))
    page.locator('#shop-item-page').fill('2')
    page.locator('#shop-item-slot').select_option('display-10a')
    page.locator('#shop-item-save').click()
    page.wait_for_selector('#shop-editor', state='hidden')
    assert page.locator('#shop-page').inner_text() == 'Shelves 2 of 2'
    page.locator('#shop-previous').click()
    page.wait_for_selector('[data-slot="display-10a"].has-item')
    assert page.locator('[data-slot="display-10a"] img').get_attribute('alt') == 'Renamed Lunchbox'
    page.screenshot(path=str(root / 'artifacts' / 'shop-upload-controls.png'))
    page.locator('#leave-lab').click()
    page.locator('#access-name').fill('Ann')
    page.locator('#access-password').fill('ann-check')
    page.locator('#access-submit').click()
    page.wait_for_selector('body[data-view="lab"]')
    page.locator('nav [data-view="shop"]').click()
    page.wait_for_function('!document.querySelector("#shop-add").disabled')
    assert page.locator('.shop-slot img').count() == 0
    # A backup carries image bytes and works in an entirely separate browser save.
    with page.expect_download() as ann_download:
      page.locator('#shop-export').click()
    ann_backup_path = root / 'artifacts' / 'ann-shop-backup.json'
    ann_download.value.save_as(str(ann_backup_path))
    import json
    ann_backup = json.loads(ann_backup_path.read_text())
    assert len(ann_backup['items']) == 0
    assert all(item['image'].startswith('data:image/png;base64,') for item in ann_backup['items'])
    fresh = browser.new_page(viewport={'width': 1366, 'height': 768})
    fresh.goto('http://localhost:4173')
    fresh.locator('#register-name').fill('Backup Recipient')
    fresh.locator('#register-password').fill('backup-check')
    fresh.locator('#register-submit').click()
    fresh.wait_for_selector('#register-status[data-state="granted"]')
    fresh.locator('#access-name').fill('Backup Recipient')
    fresh.locator('#access-password').fill('backup-check')
    fresh.locator('#access-submit').click()
    fresh.wait_for_selector('body[data-view="lab"]')
    fresh.locator('nav [data-view="shop"]').click()
    fresh.wait_for_function('!document.querySelector("#shop-add").disabled')
    fresh.locator('#shop-import').click()
    fresh.locator('#shop-backup-file').set_input_files(str(backup_path))
    fresh.locator('#shop-import-save').click()
    fresh.wait_for_selector('#shop-import-dialog', state='hidden')
    fresh.wait_for_selector('[data-slot="display-10a"].has-item')
    assert fresh.locator('.shop-slot img').count() == 1
    assert fresh.locator('[data-slot="display-10a"] img').get_attribute('alt') == 'Renamed Lunchbox'
    # IndexedDB revision checks protect against a stale second tab overwriting a shop.
    conflict_checked = fresh.evaluate('''async () => {
      const data = JSON.parse(localStorage.getItem('invention-lab-v1'));
      const saved = await Lab.shopStorage.load(data.active);
      const results = await Promise.allSettled([
        Lab.shopStorage.save(data.active, saved.items, saved.revision),
        Lab.shopStorage.save(data.active, [], saved.revision)
      ]);
      const after = await Lab.shopStorage.load(data.active);
      return results[0].status === 'fulfilled' && results[1].status === 'rejected' && after.items.length === 1;
    }''')
    assert conflict_checked
    fresh.close()
    assert not browser_errors, browser_errors
    browser.close()
    print('PASS: shop layout and themes; lesson budgets and refresh; no built-in personal images; uploads, moves, removals, reload persistence, backups, invalid imports, save failures, extra pages, unchanged profile saves and user isolation.')
finally:
  server.terminate()
