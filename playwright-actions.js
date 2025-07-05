export async function showClickEffect(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clickIndicator = document.createElement('div');
      clickIndicator.style.cssText = `
        position: absolute;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 10px;
        height: 10px;
        background-color: rgba(255, 0, 0, 0.7);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 99999;
        animation: click-ripple 0.6s ease-out forwards;
      `;

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes click-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          100% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(clickIndicator);

      clickIndicator.addEventListener('animationend', () => {
        clickIndicator.remove();
        style.remove();
      });
    }
  }, selector);
}

export async function clickButtonWithText(page, text) {
  const buttonLocator = page.getByRole('button', { name: text });
  await buttonLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `button`);
  await buttonLocator.click();
}

export async function clickElementByAriaLabel(page, ariaLabel) {
  const elementLocator = page.getByLabel(ariaLabel);
  await elementLocator.waitFor({ state: 'visible', timeout: 15000 });
  const selector = `[aria-label="${ariaLabel}"]`;
  await showClickEffect(page, selector);
  await elementLocator.click();
}

export async function clickElementBySelector(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.click(selector);
}

export async function clickNthElement(page, selector, n) {
  const elements = page.locator(selector);
  const targetElement = elements.nth(n - 1);
  await targetElement.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await targetElement.click();
}

export async function clickLinkWithText(page, text) {
  const linkLocator = page.getByRole('link', { name: text });
  await linkLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `a`);
  await linkLocator.click();
}

export async function clickImageWithAlt(page, altText) {
  const selector = `img[alt="${altText}"]`;
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.click(selector);
}

export async function clickImageWithSrc(page, srcPattern) {
  const selector = `img[src*="${srcPattern}"]`;
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.click(selector);
}

export async function fillInput(page, selector, text) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.fill(selector, text);
}

export async function fillInputByPlaceholder(page, placeholder, text) {
  const inputLocator = page.getByPlaceholder(placeholder);
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `[placeholder="${placeholder}"]`);
  await inputLocator.fill(text);
}

export async function fillInputByLabel(page, label, text) {
  const inputLocator = page.getByLabel(label);
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `input`);
  await inputLocator.fill(text);
}

export async function typeInElement(page, selector, text, delay = 100) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.type(selector, text, { delay });
}

export async function pressKey(page, selector, key) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await page.press(selector, key);
}

export async function selectOption(page, selector, value) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.selectOption(selector, value);
}

export async function selectOptionByLabel(page, label, value) {
  const selectLocator = page.getByLabel(label);
  await selectLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `select`);
  await selectLocator.selectOption(value);
}

export async function checkBox(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.check(selector);
}

export async function uncheckBox(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.uncheck(selector);
}

export async function checkBoxByLabel(page, label) {
  const checkboxLocator = page.getByLabel(label);
  await checkboxLocator.waitFor({ state: 'visible', timeout: 15000 });
  await showClickEffect(page, `input[type="checkbox"]`);
  await checkboxLocator.check();
}

export async function hover(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await page.hover(selector);
}

export async function hoverByText(page, text) {
  const elementLocator = page.getByText(text);
  await elementLocator.waitFor({ state: 'visible', timeout: 15000 });
  await elementLocator.hover();
}

export async function doubleClick(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.dblclick(selector);
}

export async function rightClick(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.click(selector, { button: 'right' });
}

export async function scrollToElement(page, selector) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  await page.locator(selector).scrollIntoViewIfNeeded();
}

export async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

export async function scrollToTop(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
}

export async function waitForElement(page, selector, timeout = 15000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function waitForText(page, text, timeout = 15000) {
  await page.getByText(text).waitFor({ state: 'visible', timeout });
}

export async function waitForElementToDisappear(page, selector, timeout = 15000) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

export async function getText(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  return await page.textContent(selector);
}

export async function getValue(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  return await page.inputValue(selector);
}

export async function getAttribute(page, selector, attribute) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  return await page.getAttribute(selector, attribute);
}

export async function isVisible(page, selector) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function isEnabled(page, selector) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  return await page.isEnabled(selector);
}

export async function isChecked(page, selector) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  return await page.isChecked(selector);
}

export async function countElements(page, selector) {
  return await page.locator(selector).count();
}

export async function getElementsText(page, selector) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  return await page.locator(selector).allTextContents();
}

export async function takeScreenshot(page, path = 'screenshot.png') {
  await page.screenshot({ path, fullPage: true });
}

export async function takeElementScreenshot(page, selector, path = 'element-screenshot.png') {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await page.locator(selector).screenshot({ path });
}

export async function clearInput(page, selector) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await showClickEffect(page, selector);
  await page.fill(selector, '');
}

export async function uploadFile(page, selector, filePath) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
  await page.setInputFiles(selector, filePath);
}

export async function downloadFile(page, selector, downloadPath) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(selector)
  ]);
  await download.saveAs(downloadPath);
}

export async function switchToFrame(page, frameSelector) {
  const frame = page.frameLocator(frameSelector);
  return frame;
}

export async function acceptAlert(page) {
  page.on('dialog', dialog => dialog.accept());
}

export async function dismissAlert(page) {
  page.on('dialog', dialog => dialog.dismiss());
}

export async function handleAlert(page, text) {
  page.on('dialog', dialog => {
    dialog.accept(text);
  });
}

export async function reloadPage(page) {
  await page.reload();
}

export async function goBack(page) {
  await page.goBack();
}

export async function goForward(page) {
  await page.goForward();
}

export async function navigateTo(page, url) {
  await page.goto(url);
}

export async function delay(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

