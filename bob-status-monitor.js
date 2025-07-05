import { chromium } from 'playwright';
import { clickElementBySelector, fillInput, waitForElement, clickButtonWithText, delay } from './playwright-actions.js';

async function monitorBobStatus() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 50
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    let isOnline = false;
    let onlineStartTime = null;
    let totalOnlineTime = 0;
    let timesOnline = 0;
    let lastStatus = null;
    
    async function logStatus(status, duration = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            status: status,
            ...(duration !== null && { onlineFor: Math.floor(duration / 1000) }),
            timesOnline: timesOnline
        };
        
        console.log(JSON.stringify(logEntry, null, 2));
    }
    
    try {
        console.log('Navigating to localhost:5173...');
        await page.goto('http://localhost:5173');
        
        try {
          console.log('Authenticating...')
          await delay(1000);
          
          await clickButtonWithText(page, 'quick auth');
          await delay(1000);
          
          await fillInput(page, 'input', 'Bob');
          await delay(1000);
          
          await page.getByText('Bob').click();
          
          console.log('Authentication completed');
          
        } catch (authError) {
          console.log('Authentication failed:', authError.message)
        }
  

        console.log('Searching for Bob...');
        
        
      
        // Look for search input - try multiple common selectors
        const searchSelectors = [
            'input[type="search"]',
            'input[placeholder*="search" i]',
            'input[placeholder*="find" i]',
            '[role="searchbox"]',
            '.search input',
            '#search',
            'input[name="search"]'
        ];
        
        let searchFound = false;
        for (const selector of searchSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await fillInput(page, selector, 'Bob');
                await page.keyboard.press('Enter');
                searchFound = true;
                console.log(`Search performed using selector: ${selector}`);
                break;
            } catch (e) {
                continue;
            }
        }
        
        if (!searchFound) {
            // Try to find Bob directly in any list or chat interface
            console.log('No search input found, looking for Bob directly...');
            await page.waitForTimeout(1000);
        }
        
        // Look for Bob in various contexts (chat lists, user lists, etc.)
        const bobSelectors = [
            ':text("Bob")',
            '[data-name="Bob"]',
            '[data-user="Bob"]',
            '.user:has-text("Bob")',
            '.contact:has-text("Bob")',
            '.chat-item:has-text("Bob")',
            'li:has-text("Bob")',
            'div:has-text("Bob")',
            '[aria-label*="Bob"]'
        ];
        
        console.log('Looking for Bob in the interface...');
        let bobFound = false;
        
        for (const selector of bobSelectors) {
            try {
                const element = page.locator(selector).first();
                await element.waitFor({ timeout: 3000 });
                await element.click();
                console.log(`Found and clicked Bob using selector: ${selector}`);
                bobFound = true;
                break;
            } catch (e) {
                continue;
            }
        }
        
        if (!bobFound) {
            console.log('Could not find Bob. Checking page content...');
            const bodyText = await page.textContent('body');
            if (bodyText.includes('Bob')) {
                console.log('Bob found in page content, but could not locate clickable element');
                // Try clicking any element containing "Bob"
                try {
                    await page.getByText('Bob').first().click();
                    console.log('Clicked on first element containing "Bob"');
                    bobFound = true;
                } catch (e) {
                    console.log('Failed to click Bob element');
                }
            } else {
                console.log('Bob not found in page content. Available text:', bodyText.substring(0, 500));
            }
        }
        
        // Wait a bit for chat to load
        await page.waitForTimeout(2000);
        
        console.log('Starting status monitoring...');
        
        // Start monitoring loop
        while (true) {
            try {
                // Look for header element
                const headerSelectors = [
                    'header',
                    '.header',
                    '#header',
                    '[role="banner"]',
                    '.chat-header',
                    '.user-header',
                    '.conversation-header'
                ];
                
                let headerFound = false;
                let currentlyOnline = false;
                
                for (const headerSelector of headerSelectors) {
                    try {
                        const headerElement = await page.locator(headerSelector).first();
                        await headerElement.waitFor({ timeout: 1000 });
                        
                        const headerText = await headerElement.textContent();
                        
                        if (headerText && (headerText.toLowerCase().includes('online') || headerText.includes('Online'))) {
                            currentlyOnline = true;
                            headerFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // If no header found, search entire page for online status
                if (!headerFound) {
                    const pageText = await page.textContent('body');
                    currentlyOnline = pageText.toLowerCase().includes('online');
                }
                
                const now = Date.now();
                
                // Status change detection
                if (currentlyOnline && !isOnline) {
                    // Coming online
                    isOnline = true;
                    onlineStartTime = now;
                    timesOnline++;
                    await logStatus('online');
                    
                } else if (!currentlyOnline && isOnline) {
                    // Going offline
                    isOnline = false;
                    if (onlineStartTime) {
                        const sessionDuration = now - onlineStartTime;
                        totalOnlineTime += sessionDuration;
                        await logStatus('offline');
                    }
                    onlineStartTime = null;
                    
                } else if (currentlyOnline && isOnline && onlineStartTime) {
                    // Still online - update duration
                    const currentDuration = now - onlineStartTime;
                    await logStatus('online', currentDuration);
                }
                
                // Wait 2 seconds before next check
                await page.waitForTimeout(2000);
                
            } catch (error) {
                console.error('Error during monitoring:', error.message);
                await page.waitForTimeout(2000);
            }
        }
        
    } catch (error) {
        console.error('Failed to monitor Bob status:', error);
        
        // Take a screenshot for debugging
        try {
            await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
            console.log('Debug screenshot saved as debug-screenshot.png');
        } catch (screenshotError) {
            console.error('Could not take screenshot:', screenshotError);
        }
    } finally {
        // Don't close browser to keep monitoring
        // await browser.close();
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nMonitoring stopped by user');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nMonitoring terminated');
    process.exit(0);
});

// Start monitoring
console.log('Starting Bob status monitor...');
console.log('Press Ctrl+C to stop monitoring');
monitorBobStatus().catch(console.error);
