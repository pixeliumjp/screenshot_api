import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';
import puppeteer from 'puppeteer';

export async function captureScreenshot(
	url = 'https://www.google.com/',
	width = 1200,
	height = 900,
	wait = 2000,
	full = false
) {
	if (!fs.existsSync('screenshot')) {
		fs.mkdirSync('screenshot');
	}

	let result;

	try {
		result = await getScreenshot(url, width, height, wait, full);
		await console.log(result);
		result = await imageOptimization();
		await console.log(result);
	} catch (err) {
		console.log(`Error: ${err.message}`);
	}
}

export async function getScreenshot(url, width, height, wait, full) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	const viewport_option = {
		width: width,
		height: height,
		deviceScaleFactor: 2,
	};

	let option = {
		path: 'screenshot/screenshot.png',
	};

	if (full === true) {
		option.fullPage = full;
	}

	await page.setViewport(viewport_option);
	await page.goto(url);
	// await page.waitForTimeout(1000);
	await page.waitForNetworkIdle();

	if (full === true) {
		// 下に99999px移動する
		await page.evaluate(() => {
			scroll(0, 99999);
		});
	}

	// await page.waitForTimeout(1000);
	await page.waitForNetworkIdle();

	await page.evaluate(() => {
		scroll(0, 0);
	});

	await page.screenshot(option);
	await browser.close();
	return 'screenshot complete!';
}

export async function imageOptimization() {
	await imagemin(['screenshot/*.png'], {
		destination: 'dest',
		plugins: [imageminPngquant({ quality: [0.65, 0.8] })],
	});
	return 'optimize complete!';
}
