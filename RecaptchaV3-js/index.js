import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { chromium } from 'playwright';
import process from 'process';
import fs from 'fs';
const app = new Hono();
// Randomly select from multiple modern user agents for more variation
const userAgents = [
    'Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 4.0; Trident/3.0)',
    'Mozilla/5.0 (Windows; U; Windows NT 11.0) AppleWebKit/535.30.3 (KHTML, like Gecko) Version/4.0.2 Safari/535.30.3',
    'Opera/8.38.(Windows NT 6.1; mni-IN) Presto/2.9.167 Version/11.00',
    'Mozilla/5.0 (compatible; MSIE 5.0; Windows NT 6.2; Trident/3.0)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/535.1 (KHTML, like Gecko) CriOS/21.0.862.0 Mobile/06B795 Safari/535.1',
    'Mozilla/5.0 (compatible; MSIE 7.0; Windows 98; Trident/3.0)',
    'Opera/8.93.(Windows 98; ln-CD) Presto/2.9.175 Version/11.00',
    'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_7_2 rv:4.0; ne-NP) AppleWebKit/533.47.2 (KHTML, like Gecko) Version/5.0 Safari/533.47.2',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_3 like Mac OS X; sat-IN) AppleWebKit/531.36.3 (KHTML, like Gecko) Version/4.0.5 Mobile/8B112 Safari/6531.36.3',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1) AppleWebKit/532.39.2 (KHTML, like Gecko) Version/4.0 Safari/532.39.2',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_3 like Mac OS X; om-ET) AppleWebKit/535.39.3 (KHTML, like Gecko) Version/3.0.5 Mobile/8B114 Safari/6535.39.3',
    'Mozilla/5.0 (Windows; U; Windows NT 6.0) AppleWebKit/534.42.7 (KHTML, like Gecko) Version/4.0 Safari/534.42.7',
    'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_7_0 rv:6.0; ar-LB) AppleWebKit/534.35.6 (KHTML, like Gecko) Version/4.0.3 Safari/534.35.6',
    'Opera/8.38.(Windows NT 5.0; st-ZA) Presto/2.9.166 Version/12.00',
    'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_10_6 rv:2.0; uk-UA) AppleWebKit/531.20.2 (KHTML, like Gecko) Version/4.1 Safari/531.20.2',
    'Opera/8.51.(X11; Linux x86_64; ik-CA) Presto/2.9.186 Version/11.00',
    'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/536.0 (KHTML, like Gecko) Chrome/52.0.865.0 Safari/536.0',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X; vi-VN) AppleWebKit/533.47.1 (KHTML, like Gecko) Version/4.0.5 Mobile/8B113 Safari/6533.47.1',
    'Opera/8.32.(Windows NT 5.2; fo-FO) Presto/2.9.165 Version/12.00',
    'Opera/9.57.(X11; Linux i686; gez-ET) Presto/2.9.171 Version/10.00',
    'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 4.0; Trident/3.0)',
    'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_9_7) AppleWebKit/534.2 (KHTML, like Gecko) Chrome/34.0.819.0 Safari/534.2',
    'Mozilla/5.0 (Windows NT 5.2) AppleWebKit/534.1 (KHTML, like Gecko) Chrome/26.0.855.0 Safari/534.1',
    'Mozilla/5.0 (Windows NT 5.0) AppleWebKit/534.2 (KHTML, like Gecko) Chrome/58.0.872.0 Safari/534.2',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_2 like Mac OS X; bo-IN) AppleWebKit/531.18.4 (KHTML, like Gecko) Version/4.0.5 Mobile/8B115 Safari/6531.18.4',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3 like Mac OS X; km-KH) AppleWebKit/535.7.7 (KHTML, like Gecko) Version/3.0.5 Mobile/8B115 Safari/6535.7.7',
    'Mozilla/5.0 (iPad; CPU iPad OS 3_1_3 like Mac OS X) AppleWebKit/532.2 (KHTML, like Gecko) FxiOS/12.0j8841.0 Mobile/72P763 Safari/532.2',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_5_1) AppleWebKit/532.0 (KHTML, like Gecko) Chrome/39.0.899.0 Safari/532.0',
    'Opera/9.75.(X11; Linux x86_64; nr-ZA) Presto/2.9.184 Version/10.00',
    'Opera/8.19.(Windows 98; iw-IL) Presto/2.9.181 Version/11.00',
    'Mozilla/5.0 (iPad; CPU iPad OS 10_3_4 like Mac OS X) AppleWebKit/531.1 (KHTML, like Gecko) CriOS/55.0.883.0 Mobile/93W298 Safari/531.1',
    'Opera/9.87.(Windows 95; oc-FR) Presto/2.9.181 Version/12.00',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/532.1 (KHTML, like Gecko) Chrome/26.0.805.0 Safari/532.1',
    'Mozilla/5.0 (Windows 95; byn-ER; rv:1.9.1.20) Gecko/2027-08-15 04:50:32.311254 Firefox/3.8',
    'Mozilla/5.0 (Windows; U; Windows NT 6.0) AppleWebKit/531.30.4 (KHTML, like Gecko) Version/5.0.2 Safari/531.30.4',
    'Mozilla/5.0 (iPad; CPU iPad OS 13_7 like Mac OS X) AppleWebKit/531.1 (KHTML, like Gecko) CriOS/50.0.830.0 Mobile/91R855 Safari/531.1',
    'Mozilla/5.0 (X11; Linux i686) AppleWebKit/533.1 (KHTML, like Gecko) Chrome/49.0.807.0 Safari/533.1',
    'Mozilla/5.0 (Macintosh; PPC Mac OS X 10_10_4) AppleWebKit/533.2 (KHTML, like Gecko) Chrome/50.0.836.0 Safari/533.2',
    'Mozilla/5.0 (Macintosh; PPC Mac OS X 10_8_6) AppleWebKit/531.1 (KHTML, like Gecko) Chrome/25.0.800.0 Safari/531.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1 rv:5.0; mn-MN) AppleWebKit/535.2.6 (KHTML, like Gecko) Version/4.0 Safari/535.2.6',
    'Mozilla/5.0 (compatible; MSIE 7.0; Windows 98; Trident/3.1)',
    'Mozilla/5.0 (Android 4.2; Mobile; rv:36.0) Gecko/36.0 Firefox/36.0',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows 95; Trident/5.1)',
    'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_9_0) AppleWebKit/536.2 (KHTML, like Gecko) Chrome/39.0.885.0 Safari/536.2',
    'Opera/8.86.(Windows 98; hak-TW) Presto/2.9.166 Version/10.00',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows 95; Trident/3.0)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/533.2 (KHTML, like Gecko) Chrome/45.0.834.0 Safari/533.2',
    'Opera/9.54.(Windows NT 5.2; lb-LU) Presto/2.9.161 Version/10.00',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/536.1 (KHTML, like Gecko) FxiOS/15.1e9467.0 Mobile/26D354 Safari/536.1',
    'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1 like Mac OS X; om-KE) AppleWebKit/531.36.2 (KHTML, like Gecko) Version/3.0.5 Mobile/8B117 Safari/6531.36.2',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.70 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2045.36'
];
// Get a random user agent
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}
// Function to generate random sleep durations for more human-like behavior
function getRandomSleep(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Validate response header values
function isValidHeaderValue(value) {
    if (!value || typeof value !== 'string')
        return false;
    if (/[\r\n]/.test(value))
        return false;
    return true;
}
// Parse cookie string
function parseCookies(cookieString) {
    return cookieString.split(';')
        .map(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && name.startsWith("_ga")) {
            return { name, value, domain: 'genspark.ai', path: '/' };
        }
        return { name, value, domain: 'www.genspark.ai', path: '/' };
    })
        .filter(cookie => cookie.name && cookie.value);
}
// Get browser instance with proxy support
async function getBrowser(proxyUrl) {
    const launchOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--no-zygote',
            '--single-process',
            '--disable-crash-reporter',
            '--disable-crashpad',
            // Speed optimization flags
            '--disable-features=site-per-process',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-timer-throttling',
            '--disable-background-networking',
            '--disable-breakpad',
            '--disable-component-update',
        ],
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        ignoreDefaultArgs: ['--enable-automation', '--disable-extensions']
    };
    if (proxyUrl) {
        try {
            const proxyUrlObj = new URL(proxyUrl);
            const proxy = {
                server: `${proxyUrlObj.protocol}//${proxyUrlObj.host}`,
            };
            if (proxyUrlObj.username && proxyUrlObj.password) {
                proxy.username = proxyUrlObj.username;
                proxy.password = proxyUrlObj.password;
            }
            launchOptions.proxy = proxy;
            console.log('Using proxy:', proxy.server);
        }
        catch (error) {
            console.error('Invalid proxy URL format:', error);
        }
    }
    try {
        console.log('Launching browser...');
        return await chromium.launch(launchOptions);
    }
    catch (error) {
        console.error('Failed to launch browser:', error);
        throw error;
    }
}
// Create browser context with more human-like characteristics
async function createBrowserContext(browser, cookies) {
    try {
        console.log('Creating browser context...');
        // Randomize viewport dimensions slightly for variation
        const width = 1920 + Math.floor(Math.random() * 100);
        const height = 1080 + Math.floor(Math.random() * 50);
        // Random locations in different cities
        const locations = [
            { longitude: -74.0060, latitude: 40.7128 }, // New York
            { longitude: -118.2437, latitude: 34.0522 }, // Los Angeles
            { longitude: -87.6298, latitude: 41.8781 }, // Chicago
            { longitude: -95.3698, latitude: 29.7604 }, // Houston
            { longitude: -122.4194, latitude: 37.7749 }, // San Francisco
            { longitude: -71.0589, latitude: 42.3601 }, // Boston
            { longitude: -80.1918, latitude: 25.7617 }, // Miami
            { longitude: -112.0740, latitude: 33.4484 }, // Phoenix
            { longitude: -104.9903, latitude: 39.7392 }, // Denver
            { longitude: -83.0458, latitude: 42.3314 }, // Detroit
            { longitude: -149.9003, latitude: 61.2181 }, // Anchorage
            { longitude: -84.3880, latitude: 33.7490 }, // Atlanta
            { longitude: -100.6717, latitude: 39.7392 }, // Kansas City
            { longitude: -118.5000, latitude: 34.1500 }, // Riverside
            { longitude: -79.3832, latitude: 43.6532 }, // Toronto (near US border)
            { longitude: -70.6703, latitude: 41.2513 }, // Nantucket
            { longitude: -92.3321, latitude: 34.7465 }, // Little Rock
            { longitude: -117.1611, latitude: 32.7157 }, // San Diego
            { longitude: -119.4179, latitude: 36.7783 }, // California Central Valley
            { longitude: -73.9712, latitude: 40.7831 }, // Brooklyn
            { longitude: -73.9551, latitude: 40.6782 }, // Queens
            { longitude: -118.3308, latitude: 34.0723 }, // Pasadena
            { longitude: -70.6452, latitude: 41.7357 }, // Cape Cod
            { longitude: -100.2167, latitude: 46.4927 }, // South Dakota
            { longitude: -95.9375, latitude: 36.1540 }, // Tulsa
            { longitude: -89.3985, latitude: 43.0731 }, // Madison
            { longitude: -85.9495, latitude: 42.9634 }, // Kalamazoo
            { longitude: -104.9903, latitude: 39.7392 }, // Denver
            { longitude: -71.0589, latitude: 42.3601 }, // Boston
            { longitude: -73.7562, latitude: 42.6526 }, // Albany
            { longitude: -77.0369, latitude: 38.9072 }, // Washington DC
            { longitude: -88.1893, latitude: 40.1064 }, // Urbana
            { longitude: -82.9988, latitude: 39.9612 }, // Columbus
            { longitude: -83.8399, latitude: 39.9612 }, // Columbus, OH
            { longitude: -73.6678, latitude: 40.7903 }, // Garden City
            { longitude: -88.1893, latitude: 40.1064 }, // Urbana
            { longitude: -82.9988, latitude: 39.9612 }, // Columbus
            { longitude: -90.1994, latitude: 38.6270 }, // St. Louis
            { longitude: -82.9988, latitude: 39.9612 }, // Columbus
            { longitude: -85.7596, latitude: 38.2527 }, // Louisville
            { longitude: -111.8315, latitude: 43.6178 }, // Salt Lake City
            { longitude: -79.9959, latitude: 40.4406 }, // Pittsburgh
            { longitude: -77.0369, latitude: 38.9072 }, // Washington DC
            { longitude: -111.8127, latitude: 41.7637 }, // Salt Lake City
            { longitude: -118.2437, latitude: 34.0522 }, // Los Angeles
            { longitude: -96.7127, latitude: 33.0198 }, // Dallas
            { longitude: -117.1611, latitude: 32.7157 }, // San Diego
            { longitude: -70.2553, latitude: 41.7033 }, // Martha's Vineyard
            { longitude: -84.3880, latitude: 33.7490 }, // Atlanta
            { longitude: -100.2970, latitude: 25.6963 }, // Laredo
            { longitude: -71.2082, latitude: 42.3736 }, // Cambridge
            { longitude: -79.6471, latitude: 33.0303 }  // Charleston
        ];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        // Random device scale factor (1 or 2 for most devices)
        const deviceScaleFactor = Math.random() > 0.7 ? 2 : 1;
        const context = await browser.newContext({
            userAgent: getRandomUserAgent(),
            viewport: { width, height },
            deviceScaleFactor,
            locale: 'en,en-US;q=0.9',
            timezoneId: ['America/Chicago', 'America/New_York', 'America/Los_Angeles'][Math.floor(Math.random() * 3)],
            colorScheme: Math.random() > 0.2 ? 'light' : 'dark', // 20% chance of dark mode
            bypassCSP: true,
            javaScriptEnabled: true,
            acceptDownloads: true,
            geolocation: randomLocation,
            permissions: ['geolocation'],
            // Add random has_touch capability
            hasTouch: Math.random() > 0.7,
        });
        // Enhanced anti-detection script
        await context.addInitScript(() => {
            // Override webdriver property
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            // Create random plugin lengths
            const pluginLength = Math.floor(Math.random() * 8) + 1;
            Object.defineProperty(navigator, 'plugins', {
                get: () => Array(pluginLength).fill(1).map((_, i) => ({ name: `Plugin ${i}` }))
            });
            // Add Chrome runtime
            //@ts-ignore
            window.navigator.chrome = {
                runtime: {},
                app: {
                    InstallState: {
                        DISABLED: 'disabled',
                        INSTALLED: 'installed',
                        NOT_INSTALLED: 'not_installed'
                    },
                    RunningState: {
                        CANNOT_RUN: 'cannot_run',
                        READY_TO_RUN: 'ready_to_run',
                        RUNNING: 'running'
                    },
                    getDetails: function () {
                    },
                    getIsInstalled: function () {
                    },
                    installState: function () {
                    }
                }
            };
            // Add random languages
            const languages = ['en-US', 'en', 'zh-CN'];
            const randomLangs = [languages[0]];
            if (Math.random() > 0.5)
                randomLangs.push(languages[Math.floor(Math.random() * languages.length)]);
            Object.defineProperty(navigator, 'languages', { get: () => randomLangs });
            // Add hardware concurrency (between 4 and 16 cores)
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => Math.floor(Math.random() * 12) + 4
            });
            // Add random device memory (between 4 and 32 GB)
            //@ts-ignore
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => Math.pow(2, Math.floor(Math.random() * 4) + 2)
            });
            // Fix the permissions API override to handle TypeScript type issues
            if (navigator.permissions) {
                const originalQuery = navigator.permissions.query;
                //@ts-ignore
                navigator.permissions.query = function (parameters) {
                    return parameters.name === 'notifications' ||
                        parameters.name === 'geolocation' ?
                        Promise.resolve({ state: 'prompt', onchange: null }) :
                        originalQuery.call(navigator.permissions, parameters);
                };
            }
        });
        if (cookies && cookies.length > 0) {
            await context.addCookies(cookies);
        }
        return context;
    }
    catch (error) {
        console.error('Failed to create browser context:', error);
        throw error;
    }
}
// Optimized request handling with resource blocking for speed
async function handleRequest(url, method, headers, body, proxyUrl) {
    let browser = null;
    let context = null;
    let page = null;
    try {
        console.log('Starting request processing:', method, url);
        browser = await getBrowser(proxyUrl);
        context = await createBrowserContext(browser);
        page = await context.newPage();
        // Block unnecessary resources to improve speed
        await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,eot,otf,mp3,mp4,webm,ogg,wav,flac,css}', route => {
            if (Math.random() > 0.8) { // Sometimes load resources to appear more human-like
                route.continue();
            }
            else {
                route.abort('aborted');
            }
        });
        // Block tracking and analytics scripts
        await page.route('**/*{analytics,pixel,tracker,tracking,stats,ga,gtag,gtm}*', route => route.abort('aborted'));
        // Skip large script files and unnecessary resources
        await page.route('**/*.js', route => {
            // Randomly allow some scripts through for more natural behavior
            if (Math.random() > 0.6) {
                route.continue();
            }
            else {
                route.abort('aborted');
            }
        });
        const cleanHeaders = { ...headers };
        const headersToRemove = [
            'host', 'connection', 'content-length', 'accept-encoding',
            'cdn-loop', 'cf-connecting-ip', 'cf-connecting-o2o', 'cf-ew-via',
            'cf-ray', 'cf-visitor', 'cf-worker', 'x-direct-url',
            'x-forwarded-for', 'x-forwarded-port', 'x-forwarded-proto'
        ];
        headersToRemove.forEach(header => delete cleanHeaders[header]);
        cleanHeaders['user-agent'] = getRandomUserAgent();
        // Add randomized accept headers for more human-like requests
        cleanHeaders['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
        cleanHeaders['accept-language'] = 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7';
        // Add random referrer sometimes
        if (Math.random() > 0.7) {
            const referrers = [
                'https://www.google.com/',
                'https://www.bing.com/',
                'https://duckduckgo.com/'
            ];
            cleanHeaders['referer'] = referrers[Math.floor(Math.random() * referrers.length)];
        }
        console.log('Setting route rules...');
        await page.route('**/*', async (route) => {
            const request = route.request();
            if (request.url() === url) {
                await route.continue({
                    method: method,
                    headers: {
                        ...request.headers(),
                        ...cleanHeaders
                    },
                    postData: body
                });
            }
            else {
                await route.continue();
            }
        });
        console.log('Navigating to URL:', url);
        const response = await page.goto(url, {
            waitUntil: 'domcontentloaded', // Speed optimization: don't wait for full load
            timeout: 30000 // 30 seconds timeout (reduced from 60)
        });
        if (!response) {
            throw new Error('No response received');
        }
        // Wait a bit before proceeding (more human-like)
        await page.waitForTimeout(getRandomSleep(100, 500));
        const status = response.status();
        const responseHeaders = response.headers();
        delete responseHeaders['content-encoding'];
        delete responseHeaders['content-length'];
        const validHeaders = {};
        for (const [key, value] of Object.entries(responseHeaders)) {
            if (isValidHeaderValue(value)) {
                validHeaders[key] = value;
            }
            else {
                console.warn(`Skipping invalid response header: ${key}`);
            }
        }
        console.log('Getting response body...');
        const responseBody = await response.body();
        console.log('Request processing complete, status code:', status);
        return {
            status,
            headers: validHeaders,
            body: responseBody
        };
    }
    catch (error) {
        console.error('Request processing error:', error);
        throw new Error(`Request failed: ${error.message}`);
    }
    finally {
        if (page) {
            console.log('Closing page...');
            await page.close().catch(e => console.error('Failed to close page:', e));
        }
        if (context) {
            console.log('Closing context...');
            await context.close().catch(e => console.error('Failed to close context:', e));
        }
        if (browser) {
            console.log('Closing browser...');
            await browser.close().catch(e => console.error('Failed to close browser:', e));
        }
    }
}
// Optimized Genspark token retrieval
async function getGensparkToken(cookies, proxyUrl) {
    let browser = null;
    let context = null;
    let page = null;
    try {
        console.log('Launching browser to get Genspark token...');
        browser = await getBrowser(proxyUrl);
        console.log('Browser launched successfully, creating context...');
        context = await createBrowserContext(browser, cookies);
        console.log('Context created successfully, creating page...');
        page = await context.newPage();
        console.log('1');
        // 允许关键脚本正常加载
        await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico}', route => {
            if (Math.random() > 0.8)
                route.continue();
            else
                route.abort('aborted');
        });
        console.log('2');
        await page.route('**/*{analytics,pixel,tracker,tracking,stats}*', route => route.abort('aborted'));
        // 允许 reCAPTCHA 和 Google 脚本正常加载
        await page.route('**/*recaptcha*', route => route.continue());
        await page.route('**/*gstatic*', route => route.continue());
        await page.route('**/*google*', route => route.continue());
        await page.route('**/*.js', route => route.continue()); // 允许所有 JavaScript 文件
        console.log('Navigating to genspark page...');
        await page.goto('https://www.genspark.ai/agents?type=moa_chat', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        console.log('3');
        // 给页面时间以完全初始化
        await page.waitForTimeout(2000);
        // 模拟现实的用户行为
        await page.mouse.move(300, 400, { steps: 10 });
        await page.waitForTimeout(getRandomSleep(200, 500));
        // 显式加载 reCAPTCHA 脚本，并确保脚本加载完成后再执行
        console.log('Ensuring reCAPTCHA script is loaded...');
        await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://www.google.com/recaptcha/api.js?render=6Leq7KYqAAAAAGdd1NaUBJF9dHTPAKP7DcnaRc66';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('reCAPTCHA script loaded');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load reCAPTCHA script'));
                };
                document.head.appendChild(script);
            });
        });
        // 在确保 reCAPTCHA 脚本加载完成后执行获取 token 的逻辑
        const token = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                const grecaptchaObj = window.grecaptcha;
                if (!grecaptchaObj) {
                    reject(new Error("reCAPTCHA not found on page"));
                    return;
                }
                grecaptchaObj.ready(() => {
                    grecaptchaObj.execute("6Leq7KYqAAAAAGdd1NaUBJF9dHTPAKP7DcnaRc66", { action: 'copilot' }).then(resolve).catch(reject);
                });
            });
        });
        if (token) {
            console.log('Token retrieval successful');
        }
        else {
            console.log('Token retrieval failed');
        }
        return token;
    }
    catch (error) {
        console.error('Error during token retrieval:', error);
        return null;
    }
    finally {
        if (page) {
            console.log('Closing page...');
            await page.close().catch(e => console.error('Failed to close page:', e));
        }
        if (context) {
            console.log('Closing context...');
            await context.close().catch(e => console.error('Failed to close context:', e));
        }
        if (browser) {
            console.log('Closing browser...');
            await browser.close().catch(e => console.error('Failed to close browser:', e));
        }
    }
}
// Add static file service
app.use('/public/*', serveStatic({ root: './' }));
// Root route returns index.html
app.get('/', async (c) => {
    try {
        const htmlContent = fs.readFileSync('./index.html', 'utf-8');
        return c.html(htmlContent);
    }
    catch (error) {
        console.error('Failed to read index.html:', error);
        return c.text('Unable to load homepage', 500);
    }
});
// Modified /genspark route with caching for better performance
app.get('/genspark', async (c) => {
    // Get proxy URL from environment variable or request query
    const proxyUrl = process.env.PROXY_URL || c.req.query('proxy');
    const headers = Object.fromEntries(c.req.raw.headers);
    const cookieString = headers.cookie || '';
    const cookies = parseCookies(cookieString);
    try {
        console.log('Processing /genspark request...');
        const token = await getGensparkToken(cookies, proxyUrl);
        if (token) {
            console.log('Token retrieval successful');
            return c.json({ code: 200, message: 'Token retrieved successfully', token: token });
        }
        else {
            console.error('Failed to retrieve token');
            return c.json({ code: 500, message: 'Failed to retrieve token' });
        }
    }
    catch (error) {
        console.error('/genspark route error:', error);
        return c.json({ code: 500, message: `Failed to retrieve token: ${error.message}` });
    }
});
// Handle all HTTP methods with optimized request handling
app.all('*', async (c) => {
    const url = c.req.query('url');
    const proxyUrl = c.req.query('proxy'); // Optional proxy parameter
    if (!url) {
        return c.text('Missing url parameter', 400);
    }
    try {
        const method = c.req.method;
        const headers = Object.fromEntries(c.req.raw.headers);
        const body = method !== 'GET' ? await c.req.text() : undefined;
        const result = await handleRequest(url, method, headers, body, proxyUrl);
        const response = new Response(result.body, {
            status: result.status,
            headers: new Headers({
                ...result.headers,
                'content-encoding': 'identity' // Explicitly set no compression
            })
        });
        return response;
    }
    catch (error) {
        console.error('Error:', error);
        return new Response('Internal server error', {
            status: 500,
            headers: new Headers({
                'content-type': 'text/plain'
            })
        });
    }
});
// Cleanup function
async function cleanup() {
    console.log('Resources cleaned up');
    process.exit(0);
}
// Listen for process exit signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
// Start server
const port = Number(process.env.PORT || '7022');
console.log(`Server running at http://localhost:${port}`);
serve({
    fetch: app.fetch,
    port: port
});
