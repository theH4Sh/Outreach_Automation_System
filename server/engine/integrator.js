const { chromium } = require('playwright');
const { spawn } = require('child_process');
const sessionManager = require('./sessionManager')

const integrator = async (userId, profileName) => {
	const session = sessionManager.createSession(userId)

	const { display, vncPort } = session

	console.log("Created Browser Session: ", session)

	// Connection lifetime: 10 minutes
    const SESSION_TIMEOUT = 10 * 60 * 1000;

	// Start xvfb
	const xvfb = spawn('Xvfb', [
		`:${display}`,
		'-screen',
		'0',
		'1920x1080x24',
	])

	session.xvfb = xvfb

	xvfb.on('error', (err) => {
		console.error('Xvfb error:', err)
	})

	//allowing xvfb to start
	await new Promise(resolve => setTimeout(resolve, 1000))
	
	
	const env = { ...process.env };

	env.DISPLAY = `:${display}`;
	delete env.WAYLAND_DISPLAY;
	// Start x11vnc
	{/*const x11vnc = spawn(
		'x11vnc',
		[
			'-display',
			`:${display}`,
			'-forever',
			'-shared',
			'-rfbport',
			`${vncPort}`,
			'-nopw'
		],
		{ env }
	);

	session.x11vnc = x11vnc

	x11vnc.on('error', (err) => {
		console.error('x11vnc error:', err)
	})*/}

	const x11vnc = spawn('x11vnc', [
		'-display', `:${display}`,
		'-forever',
		'-shared',
		'-rfbport', String(vncPort),
		'-nopw'
	], { env });

	session.x11vnc = x11vnc;

	x11vnc.stdout.on('data', data => {
		console.log(`[x11vnc stdout] ${data.toString()}`);
	});

	x11vnc.stderr.on('data', data => {
		console.error(`[x11vnc stderr] ${data.toString()}`);
	});

	x11vnc.on('error', err => {
		console.error('[x11vnc spawn error]', err);
	});

	x11vnc.on('exit', (code, signal) => {
		console.log(`[x11vnc exited] code=${code} signal=${signal}`);
	});

	await new Promise(resolve => setTimeout(resolve, 1000))

	const net = require('net');

	await new Promise((resolve) => {
		const test = net.createConnection({
			host: '127.0.0.1',
			port: vncPort
		});

		test.on('connect', () => {
			console.log(`🔥 VNC PORT ${vncPort} IS CONNECTED`);
			test.destroy();
			resolve();
		});

		test.on('error', (err) => {
			console.error(`💀 VNC PORT ${vncPort} FAILED:`, err.message);
			resolve();
		});
	});

	// Start noVNC

	// const novnc = spawn('novnc', [
	// 	'--vnc',
	// 	`localhost:${vncPort}`,
	// 	'--listen',
	// 	`${webPort}`
	// ])

	// session.novnc = novnc

    // novnc.on('error', (err) => {
    //     console.error('noVNC error:', err);
    // });

    // await new Promise(resolve => setTimeout(resolve, 1000));

	try {
		const browser = await chromium.launchPersistentContext(
			`./profiles/${profileName}`,
			{
				headless: false,
				viewport: null,

				env: {
					...process.env,
					DISPLAY: `:${display}`,
					WAYLAND_DISPLAY: 'undefined'
				},

				args: [
					'--ozone-platform=x11',
					'--no-sandbox',
					'--disable-dev-shm-usage',
					'--disable-gpu'
				]
			}
		);

		session.browser = browser
		
		const page = await browser.newPage();

		page.setDefaultTimeout(0);
		page.setDefaultNavigationTimeout(0);

		await page.goto('https://www.instagram.com/');
		console.log('Page Title: ', await page.title());

		//// UNCOMMENT BELOW============================

		// const saveInfoBtn = page.locator('button:has-text("Save info")');

		// await saveInfoBtn.waitFor({ state: 'visible', timeout: 0 });
		// await saveInfoBtn.click();

		// console.log("Save info clicked");

		//================================================

		// await page.context().storageState({ path: 'pauth.json' });
		// console.log('Auth state saved successfully')

		//browser.close()

		// Automatically destroy ONLY the connection after 10 minutes
        setTimeout(async () => {
            console.log(`Connection timeout reached for ${profileName}`);
			await stopIntegration(userId)

            // try {
            //     await browser.close();
            // } catch (err) {
            //     console.error('Browser close error:', err);
            // }

            // if (!x11vnc.killed) {
            //     x11vnc.kill('SIGTERM');
            // }

            // if (!novnc.killed) {
            //     novnc.kill('SIGTERM');
            // }

            // if (!xvfb.killed) {
            //     xvfb.kill('SIGTERM');
            // }

            console.log(`Connection ended for ${profileName}`);
        }, SESSION_TIMEOUT);

		return {
			// url: `http://localhost:${webPort}/vnc.html?autoconnect=true&resize=scale`,
			sessionId: session.sessionId
		}
	} catch (error) {
		console.error('Integration failed:', error);
		throw error; // Rethrow the error to be caught by the controller's catchAsync
	}
};

const stopIntegration = async (userId) => {
    const session = sessionManager.getSession(userId);

    if (!session) {
        return false;
    }

    console.log(`Stopping integration for ${userId}`);

    await session.browser.close().catch(() => {});

    if (session.browser) {
        await session.browser.close().catch(() => {})
    }

    if (session.x11vnc && !session.x11vnc.killed) {
        session.x11vnc.kill('SIGTERM')
    }

    if (session.novnc && !session.novnc.killed) {
        session.novnc.kill('SIGTERM')
    }

    if (session.xvfb && !session.xvfb.killed) {
        session.xvfb.kill('SIGTERM')
    }

    sessionManager.deleteSession(userId)

    console.log(`Integration stopped for ${userId}`);

    return true;
};

module.exports = {
	integrator,
	stopIntegration
}